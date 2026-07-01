import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import type { Locale } from '../types';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const langs: Locale[] = ['uz', 'ru', 'en'];
  return (
    <div className="flex items-center gap-1 text-sm">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => {
            i18n.changeLanguage(l);
            localStorage.setItem('locale', l);
          }}
          className={`rounded px-2 py-1 uppercase transition ${
            i18n.language === l ? 'bg-majolica-600 text-white' : 'text-majolica-600 hover:bg-majolica-50'
          }`}
          aria-pressed={i18n.language === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-majolica-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="font-display text-2xl font-bold text-majolica-700">
            {t('brand')}
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <>
                {user.role === 'FIRM' && (
                  <Link to="/firm" className="text-sm font-medium text-majolica-700 hover:text-majolica-900">
                    {t('dashboard')}
                  </Link>
                )}
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="text-sm font-medium text-majolica-600 hover:text-majolica-900"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-majolica-700 hover:text-majolica-900">
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-ochre-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-ochre-600"
                >
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-majolica-100 py-8 text-center text-sm text-majolica-400">
        {t('brand')} — {t('tagline')}
      </footer>
    </div>
  );
}
