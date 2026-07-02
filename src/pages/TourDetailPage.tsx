import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from '../lib/auth';
import { t as pick, formatPrice, formatDate, durationLabel } from '../lib/format';
import StarRating from '../components/StarRating';
import type { Departure, Locale, Multilingual, Review } from '../types';

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
  departures: Departure[];
  reviews: Review[];
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

  if (isLoading) return <div className="mx-auto max-w-4xl px-4 py-16 text-majolica-400">{t('loading')}</div>;
  if (!tour) return <div className="mx-auto max-w-4xl px-4 py-16">{t('tourNotFound')}</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Gallery images={tour.images} />
      <div className="h-6" />

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
            <Link to={`/firms/${tour.firm.slug}`} className="mt-8 block rounded-xl border border-majolica-100 bg-white p-4 hover:border-majolica-300">
              <div className="text-xs text-majolica-400">{t('operator')}</div>
              <div className="font-semibold text-majolica-900">{tour.firm.name}</div>
              {tour.firm.phone && <div className="text-sm text-majolica-600">{tour.firm.phone}</div>}
            </Link>
          )}

          {tour.reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-xl font-semibold text-majolica-900 mb-3">{t('reviews')}</h2>
              <div className="space-y-3">
                {tour.reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-majolica-100 bg-white p-3">
                    <StarRating value={r.rating} />
                    {r.comment && <p className="text-sm text-majolica-700 mt-1">{r.comment}</p>}
                    <div className="text-xs text-majolica-400 mt-1">{r.user.firstName ?? 'Traveller'}</div>
                    {r.firmReply && (
                      <div className="mt-2 rounded bg-majolica-50 p-2 text-sm text-majolica-600">
                        <span className="font-medium">{t('reviewFirmReply')}: </span>{r.firmReply}
                      </div>
                    )}
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
            <p className="mt-1 text-xs text-majolica-400">{t('perPerson')}</p>

            {user && user.role !== 'USER' ? (
              <p className="mt-4 text-sm text-majolica-400">{t('loginToBook')}</p>
            ) : user ? (
              <BookingForm tour={tour} />
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

// Image gallery: a large hero image + a thumbnail strip to switch it.
function Gallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="flex aspect-[16/7] w-full items-center justify-center rounded-2xl bg-majolica-50 text-4xl text-majolica-200">✦</div>;
  }
  return (
    <div>
      <img src={images[active]} alt="" className="aspect-[16/7] w-full rounded-2xl object-cover shadow-card" />
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? 'border-ochre-500' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingForm({ tour }: { tour: TourDetail }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user } = useAuth();
  const departures = tour.departures ?? [];

  const [departureId, setDepartureId] = useState<string>(departures[0]?.id ?? '');
  const [form, setForm] = useState({
    startDate: '',
    peopleCount: 1,
    contactName: [user?.firstName, user?.lastName].filter(Boolean).join(' '),
    contactPhone: '',
    contactEmail: user?.email ?? '',
    note: '',
  });

  const usingOpenDate = departureId === '';

  const mutation = useMutation({
    mutationFn: () =>
      apiRequest('/bookings', {
        method: 'POST',
        auth: true,
        body: {
          tourId: tour.id,
          ...(usingOpenDate
            ? { startDate: new Date(form.startDate).toISOString() }
            : { departureId }),
          peopleCount: form.peopleCount,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail,
          note: form.note || undefined,
        },
      }),
  });

  if (mutation.isSuccess) {
    return (
      <div className="mt-4 rounded-lg bg-majolica-50 p-4 text-sm text-majolica-700">
        {t('requestSent')}
      </div>
    );
  }

  const set = (k: keyof typeof form, v: string | number) => setForm((f) => ({ ...f, [k]: v }));
  const selectedDep = departures.find((d) => d.id === departureId);
  const maxSeats = selectedDep ? selectedDep.capacity - selectedDep.seatsBooked : tour.maxGroupSize ?? 50;

  return (
    <div className="mt-4 space-y-2">
      {departures.length > 0 && (
        <select
          value={departureId}
          onChange={(e) => setDepartureId(e.target.value)}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm"
          aria-label={t('selectDeparture')}
        >
          {departures.map((d) => (
            <option key={d.id} value={d.id}>
              {formatDate(d.startDate, locale)} — {t('seatsLeft', { n: d.capacity - d.seatsBooked })}
              {d.instantConfirm ? ` · ${t('instant')}` : ''}
            </option>
          ))}
          <option value="">{t('openDate')}</option>
        </select>
      )}

      {usingOpenDate && (
        <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
          className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" />
      )}

      <input type="number" min={1} max={maxSeats} value={form.peopleCount}
        onChange={(e) => set('peopleCount', Number(e.target.value))}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder={t('people')} />
      <input value={form.contactName} onChange={(e) => set('contactName', e.target.value)}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder={t('fullName')} />
      <input value={form.contactPhone} onChange={(e) => set('contactPhone', e.target.value)}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder={t('phoneField')} />
      <textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={2}
        className="w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm" placeholder={t('noteOptional')} />

      {mutation.isError && <p className="text-xs text-ochre-600">{t('couldNotSend')}</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || (usingOpenDate && !form.startDate) || !form.contactName || !form.contactPhone}
        className="w-full rounded-lg bg-ochre-500 py-3 font-semibold text-white hover:bg-ochre-600 disabled:opacity-50"
      >
        {t('book')}
      </button>
    </div>
  );
}
