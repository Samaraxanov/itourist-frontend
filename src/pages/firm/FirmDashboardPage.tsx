import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { t as pick, formatPrice, formatDate } from '../../lib/format';
import { PageHeader, StatCard, Card, BreakdownBar, EmptyState } from '../../components/ui/primitives';
import StatusBadge from '../../components/StatusBadge';
import type { FirmAnalytics, Locale, TourCard } from '../../types';

export default function FirmDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: analytics } = useQuery({
    queryKey: ['firm-analytics'],
    queryFn: () => apiRequest<FirmAnalytics>('/firms/me/analytics', { auth: true }),
  });
  const { data: tours, isLoading } = useQuery({
    queryKey: ['firm-tours'],
    queryFn: () => apiRequest<TourCard[]>('/tours/mine', { auth: true }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      apiRequest(`/tours/${id}/publish`, { method: 'POST', auth: true, body: { publish } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['firm-tours'] }),
  });

  const notVerified = Boolean(user?.firm && user.firm.status !== 'VERIFIED');
  const cur = analytics?.recentBookings?.[0]?.currency ?? 'UZS';
  const bk = analytics?.bookings ?? {};

  return (
    <div>
      <PageHeader
        title={`${t('welcomeBack')}, ${user?.firm?.name ?? ''}`}
        subtitle={t('overviewSubtitle')}
        actions={
          <Link to="/firm/tours/new" className="rounded-lg bg-ochre-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ochre-600">
            + {t('addTour')}
          </Link>
        }
      />

      {notVerified && (
        <div className="mb-5 rounded-xl border border-ochre-400 bg-ochre-400/10 p-4 text-sm text-ochre-700">
          Your firm is <strong>{user?.firm?.status.toLowerCase()}</strong>. You can build tours as drafts, but
          publishing unlocks once an admin verifies your firm.
        </div>
      )}

      {/* KPI cards */}
      {analytics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label={t('totalTours')} value={`${analytics.tours.published}/${analytics.tours.total}`} icon="🧭" />
          <StatCard label={t('totalBookings')} value={Object.values(bk).reduce((a, b) => a + (b ?? 0), 0)} icon="📩" />
          <StatCard label={t('departures')} value={analytics.upcomingDepartures} icon="🗓️" />
          <StatCard label={t('payouts')} value={formatPrice(analytics.revenue.payouts, cur, locale)} icon="💳" accent="ochre" />
          <StatCard label={t('avgRating')} value={analytics.rating.count > 0 ? `★ ${analytics.rating.avg}` : '—'} icon="⭐" accent="ochre" hint={`${analytics.rating.count} ${t('reviews').toLowerCase()}`} />
        </div>
      )}

      {/* Breakdown + recent */}
      {analytics && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('bookings')}</h3>
            <BreakdownBar
              segments={[
                { label: t('statusREQUESTED'), value: bk.REQUESTED ?? 0, color: 'bg-ochre-400' },
                { label: t('statusCONFIRMED'), value: bk.CONFIRMED ?? 0, color: 'bg-majolica-500' },
                { label: t('statusCOMPLETED'), value: bk.COMPLETED ?? 0, color: 'bg-majolica-700' },
                { label: t('statusCANCELLED'), value: (bk.CANCELLED ?? 0) + (bk.DECLINED ?? 0), color: 'bg-majolica-200' },
              ]}
            />
          </Card>
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('recent')}</h3>
              <Link to="/firm/bookings" className="text-sm text-majolica-600 hover:underline">{t('viewAll')}</Link>
            </div>
            <div className="space-y-2">
              {analytics.recentBookings.length === 0 && <p className="text-sm text-majolica-400">{t('noBookings')}</p>}
              {analytics.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-majolica-700">{pick(b.tour.title, locale)}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={b.status} />
                    <span className="text-majolica-400">{formatDate(b.createdAt, locale)}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Tours */}
      <h2 className="mt-8 mb-3 font-display text-lg font-semibold text-majolica-900">{t('myTours')}</h2>
      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : tours && tours.length > 0 ? (
        <Card className="divide-y divide-majolica-100">
          {tours.map((tour) => (
            <div key={tour.id} className="flex flex-wrap items-center gap-4 p-4">
              {tour.images[0]
                ? <img src={tour.images[0]} alt="" className="h-14 w-20 rounded-lg object-cover bg-majolica-50" />
                : <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-majolica-50 text-majolica-200">✦</div>}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-majolica-900 truncate">{pick(tour.title, locale)}</div>
                <div className="text-sm text-majolica-500">{formatPrice(tour.priceFrom, tour.currency, locale)}</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                tour.status === 'PUBLISHED' ? 'bg-majolica-100 text-majolica-700' : 'bg-majolica-50 text-majolica-400'
              }`}>
                {tour.status === 'PUBLISHED' ? t('published') : t('draft')}
              </span>
              <Link to={`/firm/tours/${tour.id}/departures`} className="text-sm text-majolica-600 hover:underline">{t('departures')}</Link>
              <Link to={`/firm/tours/${tour.id}`} className="text-sm text-majolica-600 hover:underline">{t('editTour')}</Link>
              <button
                onClick={() => publishMutation.mutate({ id: tour.id, publish: tour.status !== 'PUBLISHED' })}
                disabled={publishMutation.isPending || (notVerified && tour.status !== 'PUBLISHED')}
                className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50 disabled:opacity-40"
              >
                {tour.status === 'PUBLISHED' ? t('unpublish') : t('publish')}
              </button>
            </div>
          ))}
        </Card>
      ) : (
        <EmptyState icon="🧭" title={t('noToursYet')} hint={t('createFirstTour')} />
      )}
    </div>
  );
}
