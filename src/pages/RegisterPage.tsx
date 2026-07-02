import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { ApiError } from '../lib/api';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', asFirm: false, firmName: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate(form.asFirm ? '/firm' : '/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-majolica-900">{t('register')}</h1>
      <div className="mt-6 space-y-3">
        <input placeholder={t('email')} type="email" value={form.email}
          onChange={(e) => set({ email: e.target.value })}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        <input placeholder={t('password')} type="password" value={form.password}
          onChange={(e) => set({ password: e.target.value })}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        <input placeholder={t('firstName')} value={form.firstName}
          onChange={(e) => set({ firstName: e.target.value })}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />

        <label className="flex items-center gap-2 text-sm text-majolica-700">
          <input type="checkbox" checked={form.asFirm} onChange={(e) => set({ asFirm: e.target.checked })} />
          {t('registerAsFirm')}
        </label>

        {form.asFirm && (
          <input placeholder={t('firmName')} value={form.firmName}
            onChange={(e) => set({ firmName: e.target.value })}
            className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        )}

        {error && <p className="text-sm text-ochre-600">{error}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full rounded-lg bg-ochre-500 py-2.5 font-semibold text-white hover:bg-ochre-600 disabled:opacity-50">
          {t('register')}
        </button>
      </div>
      <p className="mt-4 text-sm text-majolica-600">
        <Link to="/login" className="text-majolica-700 underline">{t('login')}</Link>
      </p>
    </div>
  );
}
