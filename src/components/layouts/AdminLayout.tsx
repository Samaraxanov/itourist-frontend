import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../lib/auth';
import Brand from '../Brand';
import LanguageSwitcher from '../LanguageSwitcher';
import NotificationBell from '../NotificationBell';

// Platform control room: a deep-navy sidebar + light content canvas.
export default function AdminLayout() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const nav = [
    { to: '/admin', label: t('overview'), icon: '📈', end: true },
    { to: '/admin/firms', label: t('firms'), icon: '🏢' },
    { to: '/admin/tours', label: t('moderation'), icon: '🧭' },
    { to: '/admin/payments', label: t('payment'), icon: '💳' },
  ];

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-white/15 text-white' : 'text-majolica-200 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-sand">
      {/* Dark sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-majolica-950 px-4 py-5 text-white md:flex">
        <Link to="/admin" className="px-2">
          <Brand tone="dark" />
          <div className="text-xs font-medium uppercase tracking-widest text-ochre-400">{t('platformAdmin')}</div>
        </Link>

        <nav className="mt-8 flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={linkCls}>
              <span className="text-base">{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <Link to="/" className="mt-auto px-3 text-xs text-majolica-300 hover:text-white">← {t('brand')} ↗</Link>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-majolica-100 bg-white/80 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="md:hidden"><Brand className="text-xl" /></Link>
            <span className="hidden text-sm text-majolica-400 md:block">{t('admin')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-3 text-sm md:hidden">
              <NavLink to="/admin" end className="text-majolica-700">{t('overview')}</NavLink>
              <NavLink to="/admin/firms" className="text-majolica-700">{t('firms')}</NavLink>
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
