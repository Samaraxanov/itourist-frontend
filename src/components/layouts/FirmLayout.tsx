import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import Brand from '../Brand';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBell from '../NotificationBell';

// Operator console shell: a light left sidebar + a canvas content area.
export default function FirmLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: '/firm', label: t('overview'), icon: '📊', end: true },
    { to: '/firm/bookings', label: t('bookings'), icon: '📩' },
    { to: '/firm/tours/new', label: t('addTour'), icon: '➕' },
    { to: '/firm/profile', label: t('profile'), icon: '🏢' },
  ];

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-majolica-600 text-white shadow-soft' : 'text-majolica-700 hover:bg-majolica-50'
    }`;

  const status = user?.firm?.status;

  return (
    <div className="flex min-h-screen bg-sand">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-majolica-100 bg-white px-4 py-5 md:flex">
        <Link to="/firm" className="px-2">
          <Brand />
          <div className="text-xs font-medium uppercase tracking-widest text-ochre-500">{t('operatorTag')}</div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-xl border border-majolica-100 bg-sand/60 p-3">
          <div className="flex items-center gap-2">
            {user?.firm?.logoUrl ? (
              <img src={user.firm.logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full border border-majolica-100 object-cover" />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-majolica-100 text-sm font-semibold text-majolica-600">
                {(user?.firm?.name ?? '?').charAt(0).toUpperCase()}
              </span>
            )}
            <div className="truncate text-sm font-semibold text-majolica-900">{user?.firm?.name ?? t('yourFirm')}</div>
          </div>
          <div className="mt-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              status === 'VERIFIED' ? 'bg-majolica-100 text-majolica-700' : 'bg-ochre-400/20 text-ochre-600'
            }`}>
              {status === 'VERIFIED' ? `✓ ${t('firmVERIFIED')}` : status ? t(`firm${status}`) : ''}
            </span>
          </div>
          <Link to="/" className="mt-3 block text-xs text-majolica-500 hover:underline">← {t('brand')} ↗</Link>
        </div>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-majolica-100 bg-white/80 px-4 backdrop-blur md:px-8">
          {/* Mobile brand / nav */}
          <div className="flex items-center gap-3 md:hidden">
            <Link to="/firm"><Brand className="text-xl" /></Link>
          </div>
          <div className="hidden text-sm text-majolica-400 md:block">{t('dashboard')}</div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <NavMobile />
            </div>
            <LanguageSwitcher />
            <NotificationBell />
            <button onClick={async () => { await logout(); navigate('/'); }}
              className="text-sm font-medium text-majolica-600 hover:text-majolica-900">
              {t('logout')}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-8 md:py-8 animate-fade-up">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// Small dropdown of the same nav for mobile.
function NavMobile() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 text-sm">
      <NavLink to="/firm" end className="text-majolica-700">{t('overview')}</NavLink>
      <NavLink to="/firm/bookings" className="text-majolica-700">{t('bookings')}</NavLink>
    </div>
  );
}
