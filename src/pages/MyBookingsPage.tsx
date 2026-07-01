import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../lib/api';
import { t as pick, formatPrice, formatDate } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import StarRating from '../components/StarRating';
import type { Booking, Locale, PaymentSummary } from '../types';

export default function MyBookingsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => apiRequest<Booking[]>('/bookings/mine', { auth: true }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['my-bookings'] });
    qc.invalidateQueries({ queryKey: ['notif-count'] });
  };

  // Pay = create the invoice, then complete the mock provider checkout (authorize).
  const pay = useMutation({
    mutationFn: async (bookingId: string) => {
      const payment = await apiRequest<PaymentSummary>('/payments', {
        method: 'POST', auth: true, body: { bookingId, provider: 'MOCK' },
      });
      return apiRequest(`/payments/${payment.id}/mock-checkout`, { method: 'POST', auth: true });
    },
    onSuccess: invalidate,
  });

  const cancel = useMutation({
    mutationFn: (bookingId: string) => apiRequest(`/bookings/${bookingId}/cancel`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-majolica-900 mb-6">{t('myBookings')}</h1>

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-majolica-100 bg-white p-4">
              <div className="flex items-start gap-4">
                {b.tour.images?.[0] && (
                  <img src={b.tour.images[0]} alt="" className="h-16 w-24 rounded-lg object-cover bg-majolica-50" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/tours/${b.tour.slug}`} className="font-medium text-majolica-900 hover:underline truncate">
                      {pick(b.tour.title, locale)}
                    </Link>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-1 text-sm text-majolica-500">
                    {b.reference} · {formatDate(b.startDate, locale)} · {b.peopleCount} × ·{' '}
                    {formatPrice(b.totalPrice, b.currency, locale)}
                  </div>
                  {b.firmResponse && <p className="mt-1 text-sm italic text-majolica-600">"{b.firmResponse}"</p>}
                  {b.payment && (
                    <div className="mt-1 text-xs text-majolica-400">
                      {t('paymentStatus')}: <StatusBadge status={b.payment.status} kind="payment" />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-majolica-50 pt-3">
                {b.status === 'CONFIRMED' && (!b.payment || ['PENDING', 'CANCELLED', 'FAILED'].includes(b.payment.status)) && (
                  <button
                    onClick={() => pay.mutate(b.id)}
                    disabled={pay.isPending}
                    className="rounded-lg bg-ochre-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-ochre-600 disabled:opacity-50"
                  >
                    {t('payNow')}
                  </button>
                )}
                {(b.status === 'REQUESTED' || b.status === 'CONFIRMED') && (
                  <button
                    onClick={() => cancel.mutate(b.id)}
                    disabled={cancel.isPending}
                    className="rounded-lg border border-majolica-200 px-4 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50 disabled:opacity-50"
                  >
                    {t('cancelBooking')}
                  </button>
                )}
                {b.status === 'COMPLETED' && !b.review && <ReviewForm bookingId={b.id} onDone={invalidate} />}
                {b.review && (
                  <span className="text-sm text-majolica-500">
                    {t('rating')}: <StarRating value={b.review.rating} />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-majolica-600">{t('noBookings')}</p>
      )}
    </div>
  );
}

function ReviewForm({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = useMutation({
    mutationFn: () => apiRequest('/reviews', { method: 'POST', auth: true, body: { bookingId, rating, comment: comment || undefined } }),
    onSuccess: () => { setOpen(false); onDone(); },
  });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg bg-majolica-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-majolica-700">
        {t('leaveReview')}
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg bg-majolica-50 p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-majolica-700">{t('rating')}:</span>
        <StarRating value={rating} onChange={setRating} size="text-xl" />
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder={t('comment')}
        className="mt-2 w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm"
      />
      {submit.isError && <p className="text-xs text-ochre-600">Could not submit review.</p>}
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => submit.mutate()}
          disabled={submit.isPending}
          className="rounded-lg bg-majolica-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-majolica-700 disabled:opacity-50"
        >
          {t('submit')}
        </button>
        <button onClick={() => setOpen(false)} className="rounded-lg px-3 py-1.5 text-sm text-majolica-500 hover:bg-majolica-100">
          {t('cancel')}
        </button>
      </div>
    </div>
  );
}
