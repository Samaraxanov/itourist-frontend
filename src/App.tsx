import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import { useAuth } from './lib/auth';
import type { Role } from './types';

import ToursPage from './pages/ToursPage';
import TourDetailPage from './pages/TourDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FirmDashboardPage from './pages/firm/FirmDashboardPage';
import TourFormPage from './pages/firm/TourFormPage';

// Guards a route by authentication and (optionally) role. Waits for the session
// restore to finish before deciding, so a page refresh doesn't bounce the user.
function ProtectedRoute({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-6xl px-4 py-16 text-majolica-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<ToursPage />} />
        <Route path="/tours/:slug" element={<TourDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Firm-only */}
        <Route path="/firm" element={<ProtectedRoute role="FIRM"><FirmDashboardPage /></ProtectedRoute>} />
        <Route path="/firm/tours/new" element={<ProtectedRoute role="FIRM"><TourFormPage /></ProtectedRoute>} />
        <Route path="/firm/tours/:id" element={<ProtectedRoute role="FIRM"><TourFormPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
