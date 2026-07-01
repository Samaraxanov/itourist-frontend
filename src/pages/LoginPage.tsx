import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { ApiError } from '../lib/api';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-2xl font-bold text-majolica-900">{t('login')}</h1>
      <div className="mt-6 space-y-3">
        <input type="email" placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        <input type="password" placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2.5" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full rounded-lg bg-majolica-600 py-2.5 font-semibold text-white hover:bg-majolica-700 disabled:opacity-50">
          {t('login')}
        </button>
      </div>
      <p className="mt-4 text-sm text-majolica-600">
        {t('register')}? <Link to="/register" className="text-majolica-700 underline">{t('register')}</Link>
      </p>
    </div>
  );
}
