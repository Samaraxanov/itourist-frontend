import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Card } from '../components/ui/primitives';

// Shown to a signed-in user (typically via Telegram) who isn't a firm yet.
// Creates the firm and upgrades their role, then refreshes the session so
// firm-only areas unlock.
export default function FirmRegisterPage() {
  const { t } = useTranslation();
  const { user, telegramLogin, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [firmName, setFirmName] = useState('');
  const [error, setError] = useState('');

  // Already a firm/admin? Send them home.
  if (user?.role === 'FIRM') return <Navigate to="/firm" replace />;
  if (user?.role === 'ADMIN') return <Navigate to="/admin" replace />;

  const submit = useMutation({
    mutationFn: async () => {
      await apiRequest('/firms/register', { method: 'POST', auth: true, body: { firmName } });
      // Role changed to FIRM — mint a fresh session so the access token carries it.
      try { await telegramLogin(); } catch { await refreshUser(); }
    },
    onSuccess: () => navigate('/firm'),
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed'),
  });

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-majolica-900">{t('registerAsFirm')}</h1>
      <p className="mt-1 text-sm text-majolica-500">{t('overviewSubtitle')}</p>
      <Card className="mt-6 space-y-4 p-6">
        <label className="block text-sm text-majolica-700">
          {t('firmName')}
          <input value={firmName} onChange={(e) => setFirmName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        </label>
        {error && <p className="text-sm text-ochre-600">{error}</p>}
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending || firmName.trim().length < 2}
          className="w-full rounded-lg bg-majolica-600 py-2.5 font-semibold text-white hover:bg-majolica-700 disabled:opacity-50"
        >
          {t('register')}
        </button>
      </Card>
    </div>
  );
}
