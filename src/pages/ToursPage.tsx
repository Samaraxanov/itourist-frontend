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
  const hasFilters = Boolean(filters.q || filters.regionId || filters.categoryId);
  const items = data?.items ?? [];
  // Featured band only on the unfiltered first page.
  const featured = !hasFilters && filters.page === 1 ? items.filter((x) => x.featured) : [];
  const rest = featured.length ? items.filter((x) => !x.featured) : items;

  return (
    <div>
      {/* Hero — brand blue #0C73FE */}
      <section className="relative overflow-hidden bg-majolica-600 text-white">
        <div className="absolute inset-0 bg-hero-grid [background-size:22px_22px] opacity-60" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-majolica-100">
            🇺🇿 Uzbekistan
          </span>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight md:text-5xl">
            {t('tagline')}
          </h1>
          <div className="mt-8 flex max-w-xl gap-3">
            <input
              type="search"
              placeholder={t('searchPlaceholder')}
              defaultValue={filters.q}
              onChange={(e) => update({ q: e.target.value || undefined })}
              className="flex-1 rounded-xl border-0 px-4 py-3.5 text-majolica-900 shadow-card placeholder:text-majolica-400 focus:ring-2 focus:ring-ochre-400"
            />
          </div>

          {/* Region quick chips */}
          {regions.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {regions.slice(0, 6).map((r) => (
                <button
                  key={r.id}
                  onClick={() => update({ regionId: filters.regionId === r.id ? undefined : r.id })}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    filters.regionId === r.id ? 'bg-ochre-500 text-white' : 'bg-white/10 text-majolica-100 hover:bg-white/20'
                  }`}
                >
                  {pick(r.name, locale)}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Category chips + sort */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => update({ categoryId: undefined })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              !filters.categoryId ? 'bg-majolica-900 text-white' : 'border border-majolica-100 bg-white text-majolica-600 hover:bg-majolica-50'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ categoryId: filters.categoryId === c.id ? undefined : c.id })}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                filters.categoryId === c.id ? 'bg-majolica-900 text-white' : 'border border-majolica-100 bg-white text-majolica-600 hover:bg-majolica-50'
              }`}
            >
              {c.icon} {pick(c.name, locale)}
            </button>
          ))}

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
          {hasFilters && (
            <button
              onClick={() => setFilters({ page: 1, pageSize: 12, sort: 'newest' })}
              className="rounded-lg px-3 py-2 text-sm text-majolica-500 hover:bg-majolica-50"
            >
              ✕ {t('clearFilters')}
            </button>
          )}
        </div>

        {/* Featured band */}
        {featured.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold text-majolica-900">
              <span className="text-ochre-500">★</span> {t('featuredTours')}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>
          </section>
        )}

        {/* All results */}
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-semibold text-majolica-900">
            {hasFilters ? t('search') : t('allTours')}
          </h2>
          {data && <span className="text-sm text-majolica-400">{data.pagination.total} {t('results')}</span>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-xl bg-majolica-50" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-12 text-center text-majolica-600">Couldn’t load tours. Please retry.</p>
        ) : rest.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((tour) => <TourCard key={tour.id} tour={tour} />)}
            </div>

            {data && data.pagination.totalPages > 1 && (
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
                          : 'border border-majolica-200 bg-white text-majolica-700 hover:bg-majolica-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : featured.length === 0 ? (
          <p className="py-12 text-center text-majolica-600">{t('noResults')}</p>
        ) : null}
      </div>
    </div>
  );
}
