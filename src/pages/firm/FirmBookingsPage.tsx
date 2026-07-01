import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { t as pick, formatPrice, formatDate } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../../components/ui/primitives';
import StatusBadge from '../../components/StatusBadge';
import type { Booking, Locale } from '../../types';

export default function FirmBookingsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['firm-bookings'],
    queryFn: () => apiRequest<Booking[]>('/bookings/firm', { auth: true }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['firm-bookings'] });
    qc.invalidateQueries({ queryKey: ['notif-count'] });
  };

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'confirm' | 'decline' }) =>
      apiRequest(`/bookings/${id}/respond`, { method: 'POST', auth: true, body: { action } }),
    onSuccess: invalidate,
  });
  const complete = useMutation({
    mutationFn: (id: string) => apiRequest(`/bookings/${id}/complete`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });

  return (
    <div>
      <PageHeader title={t('incomingRequests')} subtitle={t('bookingsSubtitle')} />

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Card key={b.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-majolica-900">{pick(b.tour.title, locale)}</span>
                    <StatusBadge status={b.status} />
                    {b.payment && <StatusBadge status={b.payment.status} kind="payment" />}
                  </div>
                  <div className="mt-1 text-sm text-majolica-500">
                    {b.reference} · {b.user?.firstName ?? ''} {b.user?.email} · {formatDate(b.startDate, locale)} ·{' '}
                    {b.peopleCount} × · {formatPrice(b.totalPrice, b.currency, locale)}
                  </div>
                  {b.note && <p className="mt-1 text-sm italic text-majolica-600">"{b.note}"</p>}
                </div>
                <div className="flex gap-2">
                  {b.status === 'REQUESTED' && (
                    <>
                      <button
                        onClick={() => respond.mutate({ id: b.id, action: 'confirm' })}
                        disabled={respond.isPending}
                        className="rounded-lg bg-majolica-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-majolica-700 disabled:opacity-50"
                      >
                        {t('confirm')}
                      </button>
                      <button
                        onClick={() => respond.mutate({ id: b.id, action: 'decline' })}
                        disabled={respond.isPending}
                        className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50 disabled:opacity-50"
                      >
                        {t('decline')}
                      </button>
                    </>
                  )}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => complete.mutate(b.id)}
                      disabled={complete.isPending}
                      className="rounded-lg bg-majolica-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-majolica-700 disabled:opacity-50"
                    >
                      {t('complete')}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState icon="📩" title={t('noBookings')} />
      )}
    </div>
  );
}
