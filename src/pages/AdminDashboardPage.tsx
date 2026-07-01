import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../lib/api';
import { t as pick, formatPrice } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import type { AdminFirm, AdminStats, AdminTour, FirmStatus, Locale } from '../types';

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-majolica-100 bg-white p-4">
      <div className="text-2xl font-bold text-majolica-900">{value}</div>
      <div className="text-xs text-majolica-500">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();

  const stats = useQuery({ queryKey: ['admin-stats'], queryFn: () => apiRequest<AdminStats>('/admin/stats', { auth: true }) });
  const firms = useQuery({ queryKey: ['admin-firms'], queryFn: () => apiRequest<AdminFirm[]>('/admin/firms', { auth: true }) });
  const tours = useQuery({ queryKey: ['admin-tours'], queryFn: () => apiRequest<AdminTour[]>('/admin/tours', { auth: true }) });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-firms'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
    qc.invalidateQueries({ queryKey: ['admin-tours'] });
  };

  const verify = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FirmStatus }) =>
      apiRequest(`/admin/firms/${id}/verify`, { method: 'POST', auth: true, body: { status } }),
    onSuccess: invalidate,
  });
  const feature = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      apiRequest(`/admin/tours/${id}/feature`, { method: 'POST', auth: true, body: { days } }),
    onSuccess: invalidate,
  });
  const takeDown = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/tours/${id}/unpublish`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });

  const s = stats.data;
  const cur = 'UZS';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-majolica-900">{t('admin')}</h1>

      {/* Platform stats */}
      <h2 className="mt-6 mb-3 text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('platformStats')}</h2>
      {s && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label={t('users')} value={s.users} />
          <Stat label={t('totalTours')} value={`${s.tours.published}/${s.tours.total}`} />
          <Stat label={t('bookings')} value={Object.values(s.bookings).reduce((a, b) => a + (b ?? 0), 0)} />
          <Stat label={t('gross')} value={formatPrice(s.revenue.gross, cur, locale)} />
          <Stat label={t('commission')} value={formatPrice(s.revenue.commission, cur, locale)} />
          <Stat label={t('payouts')} value={formatPrice(s.revenue.payouts, cur, locale)} />
        </div>
      )}

      {/* Verification queue */}
      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('verificationQueue')}</h2>
      <div className="divide-y divide-majolica-100 rounded-xl border border-majolica-100 bg-white">
        {firms.data?.map((f) => (
          <div key={f.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-majolica-900">{f.name}</span>
                <StatusBadge status={f.status} kind="firm" />
              </div>
              <div className="text-sm text-majolica-500">
                {f.owner.email} · {f._count.tours} tours{f.licenseNo ? ` · lic ${f.licenseNo}` : ''}
              </div>
            </div>
            <div className="flex gap-2">
              {f.status !== 'VERIFIED' && (
                <button onClick={() => verify.mutate({ id: f.id, status: 'VERIFIED' })}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  {t('verify')}
                </button>
              )}
              {f.status !== 'SUSPENDED' && (
                <button onClick={() => verify.mutate({ id: f.id, status: 'SUSPENDED' })}
                  className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50">
                  {t('suspend')}
                </button>
              )}
              {f.status !== 'REJECTED' && (
                <button onClick={() => verify.mutate({ id: f.id, status: 'REJECTED' })}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  {t('reject')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tour moderation */}
      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('moderation')}</h2>
      <div className="divide-y divide-majolica-100 rounded-xl border border-majolica-100 bg-white">
        {tours.data?.map((tr) => (
          <div key={tr.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-majolica-900 truncate">{pick(tr.title, locale)}</span>
                {tr.featured && <span className="rounded bg-ochre-400/20 px-1.5 py-0.5 text-xs text-ochre-600">★ {t('featured')}</span>}
              </div>
              <div className="text-sm text-majolica-500">{tr.firm.name} · {tr.status} · {formatPrice(tr.priceFrom, tr.currency, locale)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => feature.mutate({ id: tr.id, days: tr.featured ? 0 : 30 })}
                className="rounded-lg border border-ochre-300 px-3 py-1.5 text-sm font-medium text-ochre-600 hover:bg-ochre-50">
                {tr.featured ? '★ ✓' : t('promote')}
              </button>
              {tr.status === 'PUBLISHED' && (
                <button onClick={() => takeDown.mutate(tr.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50">
                  {t('takeDown')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
