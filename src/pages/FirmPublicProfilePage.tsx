import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../lib/api';
import { t as pick } from '../lib/format';
import TourCard from '../components/TourCard';
import type { FirmProfile, Locale } from '../types';

export default function FirmPublicProfilePage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;

  const { data: firm, isLoading } = useQuery({
    queryKey: ['firm', slug],
    queryFn: () => apiRequest<FirmProfile>(`/firms/${slug}`),
    enabled: !!slug,
  });

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-16 text-majolica-400">{t('loading')}</div>;
  if (!firm) return <div className="mx-auto max-w-5xl px-4 py-16">{t('firmNotFound')}</div>;

  return (
    <div>
      {firm.coverUrl && <img src={firm.coverUrl} alt="" className="h-48 w-full object-cover" />}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-4">
          {firm.logoUrl && <img src={firm.logoUrl} alt="" className="h-16 w-16 rounded-full object-cover border border-majolica-100" />}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl font-bold text-majolica-900">{firm.name}</h1>
              {firm.status === 'VERIFIED' && (
                <span className="rounded-full bg-majolica-100 px-2 py-0.5 text-xs font-medium text-majolica-700">✓ {t('firmVERIFIED')}</span>
              )}
            </div>
            {firm.description && <p className="mt-1 text-majolica-600">{pick(firm.description, locale)}</p>}
            <div className="mt-1 text-sm text-majolica-400">
              {[firm.phone, firm.website, firm.address].filter(Boolean).join(' · ')}
            </div>
          </div>
        </div>

        <h2 className="mt-8 mb-4 font-display text-xl font-semibold text-majolica-900">{t('myTours')}</h2>
        {firm.tours.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {firm.tours.map((tour) => (
              <TourCard key={tour.id} tour={{ ...tour, firm: { id: firm.id, name: firm.name, slug: firm.slug } }} />
            ))}
          </div>
        ) : (
          <p className="text-majolica-600">{t('noResults')}</p>
        )}
      </div>
    </div>
  );
}
