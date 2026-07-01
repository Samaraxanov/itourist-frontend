import type { ReactNode } from 'react';

// ---------- Shared UI primitives used across the role consoles ----------

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold text-majolica-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-majolica-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-majolica-100 bg-white shadow-card ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = 'majolica',
}: {
  label: string;
  value: ReactNode;
  icon?: string;
  hint?: string;
  accent?: 'majolica' | 'ochre';
}) {
  const ring =
    accent === 'ochre' ? 'bg-ochre-400/15 text-ochre-600' : 'bg-majolica-50 text-majolica-600';
  return (
    <div className="rounded-2xl border border-majolica-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2">
        {icon && <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-base ${ring}`}>{icon}</span>}
        <span className="text-xs font-medium uppercase tracking-wide text-majolica-400">{label}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-majolica-900">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-majolica-400">{hint}</div>}
    </div>
  );
}

// Horizontal breakdown bar for a set of labelled counts (e.g. bookings by status).
export function BreakdownBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-majolica-50">
        {segments.map((s) =>
          s.value > 0 ? (
            <div key={s.label} className={s.color} style={{ width: `${(s.value / total) * 100}%` }} title={`${s.label}: ${s.value}`} />
          ) : null
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-majolica-500">
        {segments.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.color}`} />
            {s.label} <span className="font-semibold text-majolica-800">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({ icon = '✦', title, hint }: { icon?: string; title: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-majolica-200 bg-white/50 py-16 text-center">
      <div className="text-3xl text-majolica-200">{icon}</div>
      <div className="mt-2 font-medium text-majolica-700">{title}</div>
      {hint && <div className="mt-1 text-sm text-majolica-400">{hint}</div>}
    </div>
  );
}
