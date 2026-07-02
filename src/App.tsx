import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import FirmLayout from './components/layouts/FirmLayout';
import AdminLayout from './components/layouts/AdminLayout';
import { useAuth } from './lib/auth';
import type { Role } from './types';

import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import FirmPublicProfilePage from './pages/FirmPublicProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminOverviewPage from './pages/admin/AdminOverviewPage';
import AdminFirmsPage from './pages/admin/AdminFirmsPage';
import AdminToursPage from './pages/admin/AdminToursPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import FirmDashboardPage from './pages/firm/FirmDashboardPage';
import FirmBookingsPage from './pages/firm/FirmBookingsPage';
import FirmProfilePage from './pages/firm/FirmProfilePage';
import FirmDeparturesPage from './pages/firm/FirmDeparturesPage';
import TourFormPage from './pages/firm/TourFormPage';

// Guard a subtree by authentication and (optionally) role. Renders the nested
// routes via <Outlet/> once the session restore settles.
function RoleGuard({ role }: { role?: Role }) {
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16 text-majolica-400">{t('loading')}</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      {/* Public + traveller — marketplace layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<ToursPage />} />
        <Route path="/tours/:slug" element={<TourDetailPage />} />
        <Route path="/firms/:slug" element={<FirmPublicProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<RoleGuard role="USER" />}>
          <Route path="/bookings" element={<MyBookingsPage />} />
        </Route>
      </Route>

      {/* Firm — operator console */}
      <Route element={<RoleGuard role="FIRM" />}>
        <Route element={<FirmLayout />}>
          <Route path="/firm" element={<FirmDashboardPage />} />
          <Route path="/firm/bookings" element={<FirmBookingsPage />} />
          <Route path="/firm/profile" element={<FirmProfilePage />} />
          <Route path="/firm/tours/new" element={<TourFormPage />} />
          <Route path="/firm/tours/:id" element={<TourFormPage />} />
          <Route path="/firm/tours/:id/departures" element={<FirmDeparturesPage />} />
        </Route>
      </Route>

      {/* Admin — platform control room */}
      <Route element={<RoleGuard role="ADMIN" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminOverviewPage />} />
          <Route path="/admin/firms" element={<AdminFirmsPage />} />
          <Route path="/admin/tours" element={<AdminToursPage />} />
          <Route path="/admin/payments" element={<AdminPaymentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
