import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TourCard as TourCardType, Locale } from '../types';
import { t as pick, formatPrice, durationLabel } from '../lib/format';

export default function TourCard({ tour }: { tour: TourCardType }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.language as Locale;
  const cover = tour.images[0];

  return (
    <Link
      to={`/tours/${tour.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-majolica-100 bg-white transition hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-majolica-600"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-majolica-50">
        {cover ? (
          <img
            src={cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-majolica-200">✦</div>
        )}
        {tour.region && (
          <span className="absolute left-3 top-3 rounded-full bg-majolica-900/80 px-2.5 py-1 text-xs font-medium text-white">
            {pick(tour.region.name, locale)}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold leading-snug text-majolica-900 line-clamp-2">
          {pick(tour.title, locale)}
        </h3>
        {tour.summary && (
          <p className="mt-1 text-sm text-majolica-600 line-clamp-2">{pick(tour.summary, locale)}</p>
        )}

        <div className="mt-3 flex items-center gap-3 text-xs text-majolica-400">
          <span>{durationLabel(tour.durationDays, tour.durationHours, locale)}</span>
          {tour.ratingCount > 0 && (
            <span className="text-ochre-600">★ {tour.ratingAvg.toFixed(1)} ({tour.ratingCount})</span>
          )}
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <span className="text-xs text-majolica-400">{t('from')}</span>
            <div className="font-semibold text-majolica-900">
              {formatPrice(tour.priceFrom, tour.currency, locale)}
            </div>
          </div>
          {tour.firm && <span className="text-xs text-majolica-400">{tour.firm.name}</span>}
        </div>
      </div>
    </Link>
  );
}
