import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { t as pick, formatPrice } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../../components/ui/primitives';
import StatusBadge from '../../components/StatusBadge';
import type { Currency, Multilingual, Locale, PaymentStatus, PaymentProvider } from '../../types';

interface AdminPayment {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  currency: Currency;
  createdAt: string;
  booking: { reference: string; tour: { title: Multilingual; firm: { name: string } } };
}

export default function AdminPaymentsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => apiRequest<AdminPayment[]>('/admin/payments', { auth: true }),
  });

  return (
    <div>
      <PageHeader title={t('payment')} subtitle={`${payments?.length ?? 0} ${t('results')}`} />

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : !payments || payments.length === 0 ? (
        <EmptyState icon="💳" title="No payments yet" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-majolica-100 text-left text-xs uppercase tracking-wide text-majolica-400">
                <th className="px-4 py-3 font-medium">Ref</th>
                <th className="px-4 py-3 font-medium">Tour / Firm</th>
                <th className="px-4 py-3 font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('gross')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('commission')}</th>
                <th className="px-4 py-3 text-right font-medium">{t('payouts')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-majolica-50">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-majolica-50/40">
                  <td className="px-4 py-3 font-mono text-xs text-majolica-500">{p.booking.reference}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-majolica-900">{pick(p.booking.tour.title, locale)}</div>
                    <div className="text-xs text-majolica-400">{p.booking.tour.firm.name} · {p.provider}</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} kind="payment" /></td>
                  <td className="px-4 py-3 text-right text-majolica-700">{formatPrice(p.amount, p.currency, locale)}</td>
                  <td className="px-4 py-3 text-right text-ochre-600">{formatPrice(p.commissionAmount, p.currency, locale)}</td>
                  <td className="px-4 py-3 text-right font-medium text-majolica-700">{formatPrice(p.netAmount, p.currency, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
