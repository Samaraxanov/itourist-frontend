import { Link, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import Brand from './Brand';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';

// Marketplace (public + traveller) shell: top navbar + editorial footer.
export default function Layout() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const linkCls = 'text-sm font-medium text-majolica-700 hover:text-majolica-900';

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-majolica-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/"><Brand /></Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <>
                {user.role === 'USER' && <Link to="/bookings" className={linkCls}>{t('myBookings')}</Link>}
                <NotificationBell />
                <ProfileMenu />
              </>
            ) : (
              <>
                <Link to="/login" className={linkCls}>{t('login')}</Link>
                <Link to="/register" className="rounded-lg bg-ochre-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-ochre-600">
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

      <footer className="mt-16 border-t border-majolica-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-10 text-center">
          <Brand className="text-xl" />
          <p className="max-w-md text-sm text-majolica-400">{t('tagline')}</p>
          <p className="mt-2 text-xs text-majolica-300">🇺🇿 Uzbekistan · uz · ru · en</p>
        </div>
      </footer>
    </div>
  );
}
