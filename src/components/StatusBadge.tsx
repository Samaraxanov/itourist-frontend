import { useTranslation } from 'react-i18next';

// Colour-coded status pill using only the brand palette:
//   orange = pending / needs attention · blue = active/positive · muted = terminal.
const COLORS: Record<string, string> = {
  // pending / attention (orange)
  REQUESTED: 'bg-ochre-400/15 text-ochre-600',
  PENDING: 'bg-ochre-400/15 text-ochre-600',
  REFUNDED: 'bg-ochre-400/15 text-ochre-600',
  // active (blue tint)
  CONFIRMED: 'bg-majolica-100 text-majolica-700',
  AUTHORIZED: 'bg-majolica-100 text-majolica-700',
  // success (solid blue)
  COMPLETED: 'bg-majolica-600 text-white',
  VERIFIED: 'bg-majolica-600 text-white',
  CAPTURED: 'bg-majolica-600 text-white',
  // terminal / negative (muted neutral)
  DECLINED: 'bg-majolica-50 text-majolica-400',
  CANCELLED: 'bg-majolica-50 text-majolica-400',
  REJECTED: 'bg-majolica-50 text-majolica-400',
  SUSPENDED: 'bg-majolica-50 text-majolica-400',
  FAILED: 'bg-majolica-50 text-majolica-400',
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
