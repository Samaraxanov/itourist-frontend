import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import ImageUploader from '../../components/ImageUploader';
import TourCardView from '../../components/TourCard';
import { PageHeader, Card } from '../../components/ui/primitives';
import type { Locale, Lookup, Multilingual, TourCard as TourCardType } from '../../types';

interface FormState {
  title: Multilingual;
  summary: Multilingual;
  description: Multilingual;
  priceFrom: number;
  currency: 'UZS' | 'USD' | 'EUR';
  durationDays: number;
  maxGroupSize: string;
  regionId: string;
  categoryId: string;
  languages: Locale[];
  images: string[];
}

const empty: FormState = {
  title: {}, summary: {}, description: {},
  priceFrom: 0, currency: 'UZS', durationDays: 1, maxGroupSize: '',
  regionId: '', categoryId: '', languages: ['uz', 'ru', 'en'], images: [],
};

export default function TourFormPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user } = useAuth();
  const { id } = useParams();
  const isEdit = Boolean(id && id !== 'new');
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState('');

  const regions = useQuery({ queryKey: ['regions'], queryFn: () => apiRequest<Lookup[]>('/meta/regions') });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => apiRequest<Lookup[]>('/meta/categories') });

  // Prefill on edit by finding the tour in the firm's own list (covers drafts too).
  const mine = useQuery({
    queryKey: ['firm-tours'],
    queryFn: () => apiRequest<(TourCardType & { description?: Multilingual; maxGroupSize?: number | null })[]>('/tours/mine', { auth: true }),
    enabled: isEdit,
  });
  useEffect(() => {
    if (!isEdit || !mine.data) return;
    const tour = mine.data.find((x) => x.id === id);
    if (!tour) return;
    setForm({
      title: tour.title ?? {},
      summary: tour.summary ?? {},
      description: tour.description ?? {},
      priceFrom: tour.priceFrom,
      currency: tour.currency,
      durationDays: tour.durationDays,
      maxGroupSize: tour.maxGroupSize ? String(tour.maxGroupSize) : '',
      regionId: tour.region?.id ?? '',
      categoryId: tour.category?.id ?? '',
      languages: tour.languages ?? ['uz', 'ru', 'en'],
      images: tour.images ?? [],
    });
  }, [isEdit, mine.data, id]);

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        title: form.title,
        summary: form.summary,
        description: form.description,
        priceFrom: form.priceFrom,
        currency: form.currency,
        durationDays: form.durationDays,
        maxGroupSize: form.maxGroupSize ? Number(form.maxGroupSize) : undefined,
        regionId: form.regionId || undefined,
        categoryId: form.categoryId || undefined,
        languages: form.languages,
        images: form.images,
      };
      return isEdit
        ? apiRequest(`/tours/${id}`, { method: 'PATCH', auth: true, body: payload })
        : apiRequest('/tours', { method: 'POST', auth: true, body: payload });
    },
    onSuccess: () => navigate('/firm'),
    onError: (e: Error) => setError(e.message),
  });

  const setML = (field: 'title' | 'summary' | 'description', loc: Locale, value: string) =>
    setForm((f) => ({ ...f, [field]: { ...f[field], [loc]: value } }));

  const langs: Locale[] = ['uz', 'ru', 'en'];

  // Live preview: build a card-shaped object from the current form values.
  const region = regions.data?.find((r) => r.id === form.regionId);
  const category = categories.data?.find((c) => c.id === form.categoryId);
  const hasTitle = Boolean(form.title.uz || form.title.ru || form.title.en);
  const previewTour: TourCardType = {
    id: 'preview',
    slug: 'preview',
    title: hasTitle ? form.title : { [locale]: t('addTour') } as Multilingual,
    summary: form.summary,
    priceFrom: form.priceFrom || 0,
    currency: form.currency,
    durationDays: form.durationDays,
    durationHours: null,
    images: form.images,
    ratingAvg: 0,
    ratingCount: 0,
    languages: form.languages,
    region: region ? { id: region.id, slug: region.slug, name: region.name } : null,
    category: category ? { id: category.id, slug: category.slug, name: category.name } : null,
    firm: user?.firm ? { id: user.firm.id, name: user.firm.name, slug: user.firm.slug } : undefined,
  };

  return (
    <div>
      <PageHeader title={isEdit ? t('editTour') : t('addTour')} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card className="space-y-6 p-6">
          <fieldset>
            <legend className="text-sm font-medium text-majolica-700 mb-2">Title</legend>
            {langs.map((l) => (
              <input key={l} placeholder={`Title (${l.toUpperCase()})`} value={form.title[l] ?? ''}
                onChange={(e) => setML('title', l, e.target.value)}
                className="mb-2 w-full rounded-lg border border-majolica-200 px-3 py-2" />
            ))}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-majolica-700 mb-2">Short summary</legend>
            {langs.map((l) => (
              <input key={l} placeholder={`Summary (${l.toUpperCase()})`} value={form.summary[l] ?? ''}
                onChange={(e) => setML('summary', l, e.target.value)}
                className="mb-2 w-full rounded-lg border border-majolica-200 px-3 py-2" />
            ))}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-medium text-majolica-700 mb-2">Description</legend>
            {langs.map((l) => (
              <textarea key={l} rows={2} placeholder={`Description (${l.toUpperCase()})`} value={form.description[l] ?? ''}
                onChange={(e) => setML('description', l, e.target.value)}
                className="mb-2 w-full rounded-lg border border-majolica-200 px-3 py-2" />
            ))}
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-majolica-700">
              Price (minor units)
              <input type="number" value={form.priceFrom}
                onChange={(e) => setForm((f) => ({ ...f, priceFrom: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
            </label>
            <label className="text-sm text-majolica-700">
              Currency
              <select value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value as FormState['currency'] }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2">
                <option>UZS</option><option>USD</option><option>EUR</option>
              </select>
            </label>
            <label className="text-sm text-majolica-700">
              Duration (days)
              <input type="number" min={1} value={form.durationDays}
                onChange={(e) => setForm((f) => ({ ...f, durationDays: Number(e.target.value) }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
            </label>
            <label className="text-sm text-majolica-700">
              Max group size
              <input type="number" min={1} value={form.maxGroupSize}
                onChange={(e) => setForm((f) => ({ ...f, maxGroupSize: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" placeholder="—" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm text-majolica-700">
              {t('region')}
              <select value={form.regionId} onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2">
                <option value="">—</option>
                {regions.data?.map((r) => <option key={r.id} value={r.id}>{r.name.en}</option>)}
              </select>
            </label>
            <label className="text-sm text-majolica-700">
              {t('category')}
              <select value={form.categoryId} onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2">
                <option value="">—</option>
                {categories.data?.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}
              </select>
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-majolica-700">{t('images')}</span>
            <div className="mt-2">
              <ImageUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} />
            </div>
          </div>

          {error && <p className="text-sm text-ochre-600">{error}</p>}

          <button onClick={() => save.mutate()} disabled={save.isPending}
            className="rounded-lg bg-majolica-600 px-6 py-2.5 font-semibold text-white hover:bg-majolica-700 disabled:opacity-50">
            {t('save')}
          </button>
        </Card>

        {/* Live preview */}
        <div className="lg:sticky lg:top-24">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-majolica-400">
            <span className="h-1.5 w-1.5 rounded-full bg-ochre-500" /> Preview
          </div>
          <div className="pointer-events-none select-none">
            <TourCardView tour={previewTour} />
          </div>
          <p className="mt-3 text-xs text-majolica-400">
            This is how travellers will see your tour card. It updates as you type.
          </p>
        </div>
      </div>
    </div>
  );
}
