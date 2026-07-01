import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../lib/api';
import { t as pick } from '../lib/format';
import TourCard from '../components/TourCard';
import type { Locale, Lookup, Paginated, TourCard as TourCardType, TourFilters } from '../types';

function useLookups() {
  const regions = useQuery({ queryKey: ['regions'], queryFn: () => apiRequest<Lookup[]>('/meta/regions'), staleTime: Infinity });
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => apiRequest<Lookup[]>('/meta/categories'), staleTime: Infinity });
  return { regions: regions.data ?? [], categories: categories.data ?? [] };
}

function buildQuery(f: TourFilters): string {
  const p = new URLSearchParams();
  Object.entries(f).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) p.set(k, String(v));
  });
  return p.toString();
}

export default function ToursPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const { regions, categories } = useLookups();
  const [filters, setFilters] = useState<TourFilters>({ page: 1, pageSize: 12, sort: 'newest' });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tours', filters],
    queryFn: () => apiRequest<Paginated<TourCardType>>(`/tours?${buildQuery(filters)}`),
    placeholderData: keepPreviousData,
  });

  const update = (patch: Partial<TourFilters>) => setFilters((prev) => ({ ...prev, page: 1, ...patch }));

  return (
    <div>
      {/* Hero: a single strong statement, not a stat block */}
      <section className="bg-majolica-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight max-w-2xl">
            {t('tagline')}
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl">
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              defaultValue={filters.q}
              onChange={(e) => update({ q: e.target.value || undefined })}
              className="flex-1 rounded-lg border-0 px-4 py-3 text-majolica-900 placeholder:text-majolica-400 focus:ring-2 focus:ring-ochre-400"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <select
            value={filters.regionId ?? ''}
            onChange={(e) => update({ regionId: e.target.value || undefined })}
            className="rounded-lg border border-majolica-200 bg-white px-3 py-2 text-sm"
            aria-label={t('region')}
          >
            <option value="">{t('allRegions')}</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>{pick(r.name, locale)}</option>
            ))}
          </select>

          <select
            value={filters.categoryId ?? ''}
            onChange={(e) => update({ categoryId: e.target.value || undefined })}
            className="rounded-lg border border-majolica-200 bg-white px-3 py-2 text-sm"
            aria-label={t('category')}
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{pick(c.name, locale)}</option>
            ))}
          </select>

          <select
            value={filters.sort}
            onChange={(e) => update({ sort: e.target.value as TourFilters['sort'] })}
            className="ml-auto rounded-lg border border-majolica-200 bg-white px-3 py-2 text-sm"
            aria-label={t('sort')}
          >
            <option value="newest">{t('newest')}</option>
            <option value="price_asc">{t('priceLow')}</option>
            <option value="price_desc">{t('priceHigh')}</option>
            <option value="rating">{t('topRated')}</option>
          </select>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-majolica-50" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-12 text-center text-majolica-600">Couldn’t load tours. Please retry.</p>
        ) : data && data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.items.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>

            {data.pagination.totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                {Array.from({ length: data.pagination.totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setFilters((p) => ({ ...p, page }))}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        page === data.pagination.page
                          ? 'bg-majolica-600 text-white'
                          : 'bg-white border border-majolica-200 text-majolica-700 hover:bg-majolica-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <p className="py-12 text-center text-majolica-600">{t('noResults')}</p>
        )}
      </div>
    </div>
  );
}
