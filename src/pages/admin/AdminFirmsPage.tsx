import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { formatDate } from '../../lib/format';
import { PageHeader, Card, EmptyState } from '../../components/ui/primitives';
import StatusBadge from '../../components/StatusBadge';
import type { AdminFirm, FirmStatus, Locale } from '../../types';

const FILTERS: (FirmStatus | 'ALL')[] = ['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'];

export default function AdminFirmsPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();
  const [filter, setFilter] = useState<FirmStatus | 'ALL'>('ALL');

  const { data: firms, isLoading } = useQuery({
    queryKey: ['admin-firms'],
    queryFn: () => apiRequest<AdminFirm[]>('/admin/firms', { auth: true }),
  });

  const verify = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FirmStatus }) =>
      apiRequest(`/admin/firms/${id}/verify`, { method: 'POST', auth: true, body: { status } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-firms'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const shown = (firms ?? []).filter((f) => filter === 'ALL' || f.status === filter);

  return (
    <div>
      <PageHeader title={t('verificationQueue')} subtitle={`${firms?.length ?? 0} ${t('firms').toLowerCase()}`} />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-majolica-900 text-white' : 'bg-white text-majolica-600 border border-majolica-100 hover:bg-majolica-50'
            }`}>
            {f === 'ALL' ? 'All' : f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : shown.length === 0 ? (
        <EmptyState icon="🏢" title={t('noFirms')} />
      ) : (
        <div className="space-y-3">
          {shown.map((f) => (
            <Card key={f.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-majolica-50 text-lg text-majolica-500">🏢</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-majolica-900">{f.name}</span>
                  <StatusBadge status={f.status} kind="firm" />
                </div>
                <div className="text-sm text-majolica-500">
                  {f.owner.email} · {f._count.tours} tours{f.licenseNo ? ` · lic ${f.licenseNo}` : ''} · {formatDate(f.createdAt, locale)}
                </div>
              </div>
              <div className="flex gap-2">
                {f.status !== 'VERIFIED' && (
                  <button onClick={() => verify.mutate({ id: f.id, status: 'VERIFIED' })}
                    className="rounded-lg bg-majolica-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-majolica-700">
                    {t('verify')}
                  </button>
                )}
                {f.status !== 'SUSPENDED' && (
                  <button onClick={() => verify.mutate({ id: f.id, status: 'SUSPENDED' })}
                    className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm font-medium text-majolica-700 hover:bg-majolica-50">
                    {t('suspend')}
                  </button>
                )}
                {f.status !== 'REJECTED' && (
                  <button onClick={() => verify.mutate({ id: f.id, status: 'REJECTED' })}
                    className="rounded-lg border border-ochre-300 px-3 py-1.5 text-sm font-medium text-ochre-600 hover:bg-ochre-400/10">
                    {t('reject')}
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
