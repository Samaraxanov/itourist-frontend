import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { PageHeader, StatCard, Card, BreakdownBar } from '../../components/ui/primitives';
import type { AdminStats, Locale } from '../../types';

export default function AdminOverviewPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { data: s } = useQuery({ queryKey: ['admin-stats'], queryFn: () => apiRequest<AdminStats>('/admin/stats', { auth: true }) });

  const cur = 'UZS';
  const bk = s?.bookings ?? {};
  const pendingFirms = s?.firms?.PENDING ?? 0;

  return (
    <div>
      <PageHeader title={t('overview')} subtitle={t('adminSubtitle')} />

      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatCard label={t('users')} value={s.users} icon="👥" />
            <StatCard label={t('firms')} value={`${s.firms.VERIFIED ?? 0}/${Object.values(s.firms).reduce((a, b) => a + (b ?? 0), 0)}`} icon="🏢" hint={`${pendingFirms} ${t('pendingReview').toLowerCase()}`} accent={pendingFirms ? 'ochre' : 'majolica'} />
            <StatCard label={t('totalTours')} value={`${s.tours.published}/${s.tours.total}`} icon="🧭" />
            <StatCard label={t('bookings')} value={Object.values(bk).reduce((a, b) => a + (b ?? 0), 0)} icon="📩" />
            <StatCard label={t('gross')} value={formatPrice(s.revenue.gross, cur, locale)} icon="💰" accent="ochre" />
            <StatCard label={t('commission')} value={formatPrice(s.revenue.commission, cur, locale)} icon="🏦" accent="ochre" />
            <StatCard label={t('payouts')} value={formatPrice(s.revenue.payouts, cur, locale)} icon="💳" />
            <StatCard label={t('paid')} value={s.revenue.capturedCount} icon="✓" accent="ochre" />
          </div>

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
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-majolica-500">{t('firms')}</h3>
              <BreakdownBar
                segments={[
                  { label: t('verify'), value: s.firms.VERIFIED ?? 0, color: 'bg-majolica-700' },
                  { label: t('pendingReview'), value: s.firms.PENDING ?? 0, color: 'bg-ochre-400' },
                  { label: t('suspend'), value: (s.firms.SUSPENDED ?? 0) + (s.firms.REJECTED ?? 0), color: 'bg-majolica-200' },
                ]}
              />
              {pendingFirms > 0 && (
                <Link to="/admin/firms" className="mt-4 inline-block text-sm font-medium text-majolica-600 hover:underline">
                  {pendingFirms} {t('pendingReview').toLowerCase()} → {t('verificationQueue')}
                </Link>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
