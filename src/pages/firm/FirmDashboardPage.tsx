import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { t as pick, formatPrice } from '../../lib/format';
import type { Locale, TourCard } from '../../types';

export default function FirmDashboardPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: tours, isLoading } = useQuery({
    queryKey: ['firm-tours'],
    queryFn: () => apiRequest<TourCard[]>('/tours/mine', { auth: true }),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      apiRequest(`/tours/${id}/publish`, { method: 'POST', auth: true, body: { publish } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['firm-tours'] }),
  });

  const notVerified = user?.firm && user.firm.status !== 'VERIFIED';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-majolica-900">{t('myTours')}</h1>
        <Link to="/firm/tours/new" className="rounded-lg bg-ochre-500 px-4 py-2 font-semibold text-white hover:bg-ochre-600">
          {t('addTour')}
        </Link>
      </div>

      {notVerified && (
        <div className="mt-4 rounded-lg bg-ochre-400/15 border border-ochre-400 p-3 text-sm text-ochre-600">
          Your firm is <strong>{user?.firm?.status.toLowerCase()}</strong>. You can create tours as drafts,
          but publishing is enabled only after an admin verifies your firm.
        </div>
      )}

      {isLoading ? (
        <p className="mt-8 text-majolica-400">Loading…</p>
      ) : tours && tours.length > 0 ? (
        <div className="mt-6 divide-y divide-majolica-100 rounded-xl border border-majolica-100 bg-white">
          {tours.map((tour) => (
            <div key={tour.id} className="flex items-center gap-4 p-4">
              <img src={tour.images[0]} alt="" className="h-14 w-20 rounded object-cover bg-majolica-50" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-majolica-900 truncate">{pick(tour.title, locale)}</div>
                <div className="text-sm text-majolica-500">{formatPrice(tour.priceFrom, tour.currency, locale)}</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                tour.status === 'PUBLISHED' ? 'bg-majolica-100 text-majolica-700' : 'bg-majolica-50 text-majolica-400'
              }`}>
                {tour.status === 'PUBLISHED' ? t('published') : t('draft')}
              </span>
              <Link to={`/firm/tours/${tour.id}`} className="text-sm text-majolica-600 hover:underline">{t('save')}…</Link>
              <button
                onClick={() => publishMutation.mutate({ id: tour.id, publish: tour.status !== 'PUBLISHED' })}
                disabled={publishMutation.isPending || (notVerified && tour.status !== 'PUBLISHED')}
                className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50 disabled:opacity-40"
              >
                {tour.status === 'PUBLISHED' ? t('unpublish') : t('publish')}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-majolica-600">No tours yet. Create your first one.</p>
      )}
    </div>
  );
}
