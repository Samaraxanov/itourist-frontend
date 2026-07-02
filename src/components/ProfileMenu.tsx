import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';

// Header profile chip (avatar + name) with a dropdown that holds the account
// links and logout. Replaces the standalone logout button.
export default function ProfileMenu() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.firm?.name || user.email.split('@')[0];
  const initial = (name || user.email).charAt(0).toUpperCase();

  // Where this role's "home" lives.
  const home =
    user.role === 'ADMIN' ? { to: '/admin', label: t('admin') }
    : user.role === 'FIRM' ? { to: '/firm', label: t('dashboard') }
    : { to: '/bookings', label: t('myBookings') };

  const Avatar = ({ size }: { size: string }) =>
    user.firm?.logoUrl ? (
      <img src={user.firm.logoUrl} alt="" className={`${size} shrink-0 rounded-full border border-majolica-100 object-cover`} />
    ) : (
      <span className={`${size} flex shrink-0 items-center justify-center rounded-full bg-majolica-600 text-sm font-semibold text-white`}>
        {initial}
      </span>
    );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-majolica-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar size="h-8 w-8" />
        <span className="hidden max-w-[10rem] truncate text-sm font-medium text-majolica-900 sm:block">{name}</span>
        <span className="hidden text-majolica-400 sm:block">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-xl border border-majolica-100 bg-white shadow-card">
            <div className="flex items-center gap-3 border-b border-majolica-100 p-3">
              <Avatar size="h-10 w-10" />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-majolica-900">{name}</div>
                <div className="truncate text-xs text-majolica-400">{user.email}</div>
              </div>
            </div>
            <div className="p-1">
              <Link to={home.to} onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-majolica-700 hover:bg-majolica-50">
                <span>📊</span> {home.label}
              </Link>
              {user.role === 'FIRM' && (
                <Link to="/firm/profile" onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-majolica-700 hover:bg-majolica-50">
                  <span>🏢</span> {t('firmProfile')}
                </Link>
              )}
              <button
                onClick={async () => { setOpen(false); await logout(); navigate('/'); }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ochre-600 hover:bg-ochre-400/10"
              >
                <span>↩</span> {t('logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
