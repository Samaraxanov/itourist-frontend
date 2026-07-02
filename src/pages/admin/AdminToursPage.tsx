import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { t as pick, formatPrice } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../../components/ui/primitives';
import type { AdminTour, Locale } from '../../types';

export default function AdminToursPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();

  const { data: tours, isLoading } = useQuery({
    queryKey: ['admin-tours'],
    queryFn: () => apiRequest<AdminTour[]>('/admin/tours', { auth: true }),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin-tours'] });
    qc.invalidateQueries({ queryKey: ['admin-stats'] });
  };
  const feature = useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) =>
      apiRequest(`/admin/tours/${id}/feature`, { method: 'POST', auth: true, body: { days } }),
    onSuccess: invalidate,
  });
  const takeDown = useMutation({
    mutationFn: (id: string) => apiRequest(`/admin/tours/${id}/unpublish`, { method: 'POST', auth: true }),
    onSuccess: invalidate,
  });

  return (
    <div>
      <PageHeader title={t('moderation')} subtitle={`${tours?.length ?? 0} ${t('allTours').toLowerCase()}`} />

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : !tours || tours.length === 0 ? (
        <EmptyState icon="🧭" title={t('noToursYet')} />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-majolica-100">
            {tours.map((tr) => (
              <div key={tr.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-majolica-900 truncate">{pick(tr.title, locale)}</span>
                    {tr.featured && <span className="rounded-full bg-ochre-400/20 px-2 py-0.5 text-xs font-medium text-ochre-600">★ {t('featured')}</span>}
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      tr.status === 'PUBLISHED' ? 'bg-majolica-100 text-majolica-700' : 'bg-majolica-50 text-majolica-400'
                    }`}>{t(`tour${tr.status}`, { defaultValue: tr.status })}</span>
                  </div>
                  <div className="text-sm text-majolica-500">
                    {tr.firm.name} · {formatPrice(tr.priceFrom, tr.currency, locale)}
                    {tr.ratingCount > 0 ? ` · ★ ${tr.ratingAvg} (${tr.ratingCount})` : ''}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => feature.mutate({ id: tr.id, days: tr.featured ? 0 : 30 })}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                      tr.featured ? 'border-ochre-400 bg-ochre-400/10 text-ochre-600' : 'border-ochre-300 text-ochre-600 hover:bg-ochre-50'
                    }`}>
                    {tr.featured ? `★ ${t('active')}` : t('promote')}
                  </button>
                  {tr.status === 'PUBLISHED' && (
                    <button onClick={() => takeDown.mutate(tr.id)}
                      className="rounded-lg border border-ochre-300 px-3 py-1.5 text-sm font-medium text-ochre-600 hover:bg-ochre-400/10">
                      {t('takeDown')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
