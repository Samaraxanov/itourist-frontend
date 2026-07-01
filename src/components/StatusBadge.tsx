import { useTranslation } from 'react-i18next';

// Colour-coded status pill for booking, payment, and firm statuses. The label is
// looked up from i18n (keys like `statusCONFIRMED`, `paymentCAPTURED`).
const COLORS: Record<string, string> = {
  // Booking
  REQUESTED: 'bg-ochre-400/20 text-ochre-600',
  CONFIRMED: 'bg-majolica-100 text-majolica-700',
  DECLINED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-majolica-50 text-majolica-400',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  // Firm
  PENDING: 'bg-ochre-400/20 text-ochre-600',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  // Payment
  AUTHORIZED: 'bg-majolica-100 text-majolica-700',
  CAPTURED: 'bg-emerald-100 text-emerald-700',
  REFUNDED: 'bg-ochre-400/20 text-ochre-600',
  FAILED: 'bg-red-100 text-red-700',
};

export default function StatusBadge({ status, kind = 'booking' }: { status: string; kind?: 'booking' | 'payment' | 'firm' }) {
  const { t } = useTranslation();
  const label =
    kind === 'payment' ? t(`payment${status}`, { defaultValue: status }) : t(`status${status}`, { defaultValue: status });
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${COLORS[status] ?? 'bg-majolica-50 text-majolica-500'}`}>
      {label}
    </span>
  );
}
