import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t as pick, formatPrice, durationLabel } from '../lib/format';
import type { Locale, Multilingual } from '../types';

interface TourDetail {
  id: string;
  slug: string;
  title: Multilingual;
  summary?: Multilingual;
  description?: Multilingual;
  priceFrom: number;
  currency: 'UZS' | 'USD' | 'EUR';
  durationDays: number;
  durationHours?: number | null;
  maxGroupSize?: number | null;
  languages: Locale[];
  images: string[];
  region?: { name: Multilingual } | null;
  firm?: { id: string; name: string; slug: string; phone?: string | null } | null;
  reviews: { id: string; rating: number; comment?: string; user: { firstName?: string | null } }[];
}

export default function TourDetailPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: tour, isLoading } = useQuery({
    queryKey: ['tour', slug],
    queryFn: () => apiRequest<TourDetail>(`/tours/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-majolica-400">Loading…</div>;
  if (!tour) return <div className="mx-auto max-w-4xl px-4 py-16">Tour not found.</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {tour.images[0] && (
        <img src={tour.images[0]} alt="" className="mb-6 aspect-[16/7] w-full rounded-2xl object-cover" />
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tour.region && (
            <span className="text-sm font-medium text-ochre-600">{pick(tour.region.name, locale)}</span>
          )}
          <h1 className="font-display text-3xl font-bold text-majolica-900 mt-1">{pick(tour.title, locale)}</h1>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-majolica-600">
            <span>⏱ {durationLabel(tour.durationDays, tour.durationHours, locale)}</span>
            {tour.maxGroupSize && <span>👥 max {tour.maxGroupSize}</span>}
            <span>🗣 {tour.languages.map((l) => l.toUpperCase()).join(', ')}</span>
          </div>

          {tour.description && (
            <p className="mt-6 whitespace-pre-line leading-relaxed text-majolica-700">
              {pick(tour.description, locale)}
            </p>
          )}

          {tour.firm && (
            <div className="mt-8 rounded-xl border border-majolica-100 bg-white p-4">
              <div className="text-xs text-majolica-400">Tour operator</div>
              <div className="font-semibold text-majolica-900">{tour.firm.name}</div>
              {tour.firm.phone && <div className="text-sm text-majolica-600">{tour.firm.phone}</div>}
            </div>
          )}

          {tour.reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-majolica-900 mb-3">Reviews</h2>
              <div className="space-y-3">
                {tour.reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-majolica-100 bg-white p-3">
                    <div className="text-ochre-600 text-sm">{'★'.repeat(r.rating)}</div>
                    {r.comment && <p className="text-sm text-majolica-700 mt-1">{r.comment}</p>}
                    <div className="text-xs text-majolica-400 mt-1">{r.user.firstName ?? 'Traveller'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking box */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl border border-majolica-100 bg-white p-5 shadow-sm">
            <div className="text-sm text-majolica-400">{t('from')}</div>
            <div className="font-display text-2xl font-bold text-majolica-900">
              {formatPrice(tour.priceFrom, tour.currency, locale)}
            </div>
            <p className="mt-1 text-xs text-majolica-400">per person</p>

            {user ? (
              <BookingForm tourId={tour.id} maxGroup={tour.maxGroupSize} />
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="mt-4 w-full rounded-lg bg-ochre-500 py-3 font-semibold text-white hover:bg-ochre-600"
              >
                {t('login')} → {t('book')}
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function BookingForm({ tourId, maxGroup }: { tourId: string; maxGroup?: number | null }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    startDate: '',
    peopleCount: 1,
    contactName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    contactPhone: '',
    contactEmail: user?.email ?? '',
    note: '',
  });

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest('/bookings', {
        method: 'POST',
        auth: true,
        body: { tourId, ...form, startDate: new Date(form.startDate).toISOString() },
      }),
  });

  if (mutation.isSuccess) {
    return (
      <div className="mt-4 rounded-lg bg-majolica-50 p-4 text-sm text-majolica-700">
        Request sent. The tour operator will confirm your booking soon.
      </div>
    );
  }

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="mt-4 space-y-2">
      <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" />
      <input type="number" min={1} max={maxGroup ?? 50} value={form.peopleCount}
        onChange={(e) => set('peopleCount', Number(e.target.value))}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder="People" />
      <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder="Full name" />
      <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder="Phone" />
      <textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={2}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder="Note (optional)" />

      {mutation.isError && <p className="text-xs text-red-600">Could not send request. Check the fields.</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !form.startDate || !form.contactName || !form.contactPhone}
        className="w-full rounded-lg bg-ochre-500 py-3 font-semibold text-white hover:bg-ochre-600 disabled:opacity-50"
      >
        {t('book')}
      </button>
    </div>
  );
}
