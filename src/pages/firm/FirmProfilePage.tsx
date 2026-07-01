import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import ImageUploader from '../../components/ImageUploader';
import type { FirmProfile, Locale } from '../../types';

// Firm self-service profile editor. Loads the firm's public profile by slug
// (from the auth context) and PATCHes /firms/me/profile.
export default function FirmProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '', phone: '', website: '', address: '', licenseNo: '',
    description: { uz: '', ru: '', en: '' } as Record<Locale, string>,
    logoUrl: '' as string,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.firm?.slug) return;
    apiRequest<FirmProfile>(`/firms/${user.firm.slug}`).then((f) =>
      setForm({
        name: f.name ?? '',
        phone: f.phone ?? '',
        website: f.website ?? '',
        address: f.address ?? '',
        licenseNo: '',
        description: { uz: f.description?.uz ?? '', ru: f.description?.ru ?? '', en: f.description?.en ?? '' },
        logoUrl: f.logoUrl ?? '',
      })
    );
  }, [user?.firm?.slug]);

  const save = useMutation({
    mutationFn: () =>
      apiRequest('/firms/me/profile', {
        method: 'PATCH',
        auth: true,
        body: {
          name: form.name || undefined,
          phone: form.phone || undefined,
          website: form.website || undefined,
          address: form.address || undefined,
          licenseNo: form.licenseNo || undefined,
          logoUrl: form.logoUrl || undefined,
          description: form.description,
        },
      }),
    onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000); },
  });

  const langs: Locale[] = ['uz', 'ru', 'en'];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="font-display text-2xl font-bold text-majolica-900">{t('firmProfile')}</h1>
        <Link to="/firm" className="text-sm text-majolica-600 hover:underline">← {t('dashboard')}</Link>
      </div>

      <div className="space-y-4">
        <label className="block text-sm text-majolica-700">
          {t('firmName')}
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
        </label>

        <fieldset>
          <legend className="text-sm font-medium text-majolica-700 mb-1">Description</legend>
          {langs.map((l) => (
            <input key={l} placeholder={`(${l.toUpperCase()})`} value={form.description[l]}
              onChange={(e) => setForm((f) => ({ ...f, description: { ...f.description, [l]: e.target.value } }))}
              className="mb-2 w-full rounded-lg border border-majolica-200 px-3 py-2" />
          ))}
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm text-majolica-700">
            Phone
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
          </label>
          <label className="block text-sm text-majolica-700">
            Website
            <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://" className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
          </label>
        </div>

        <label className="block text-sm text-majolica-700">
          Address
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
        </label>

        <label className="block text-sm text-majolica-700">
          License No.
          <input value={form.licenseNo} onChange={(e) => setForm((f) => ({ ...f, licenseNo: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
        </label>

        <div>
          <span className="text-sm font-medium text-majolica-700">Logo</span>
          <div className="mt-1">
            <ImageUploader images={form.logoUrl ? [form.logoUrl] : []} onChange={(urls) => setForm((f) => ({ ...f, logoUrl: urls[urls.length - 1] ?? '' }))} />
          </div>
        </div>

        {save.isError && <p className="text-sm text-red-600">Could not save.</p>}
        <div className="flex items-center gap-3">
          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="rounded-lg bg-majolica-600 px-6 py-2.5 font-semibold text-white hover:bg-majolica-700 disabled:opacity-50">
            {t('save')}
          </button>
          {saved && <span className="text-sm text-emerald-600">✓ {t('save')}</span>}
        </div>
      </div>
    </div>
  );
}
