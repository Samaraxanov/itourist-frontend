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
  const [adding, setAdding] = useState(false);

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
      <PageHeader
        title={t('verificationQueue')}
        subtitle={`${firms?.length ?? 0} ${t('firms').toLowerCase()}`}
        actions={
          <button
            onClick={() => setAdding((v) => !v)}
            className="rounded-lg bg-ochre-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ochre-600"
          >
            {adding ? t('cancel') : `+ ${t('addFirm')}`}
          </button>
        }
      />

      {adding && <AddFirmForm onDone={() => setAdding(false)} />}

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

function AddFirmForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [form, setForm] = useState({ email: '', firmName: '', password: '', phone: '', licenseNo: '', status: 'VERIFIED' as 'VERIFIED' | 'PENDING' });
  const [created, setCreated] = useState<{ email: string; tempPassword?: string } | null>(null);

  const create = useMutation({
    mutationFn: () =>
      apiRequest<{ firm: { id: string }; tempPassword?: string }>('/admin/firms', {
        method: 'POST',
        auth: true,
        body: {
          email: form.email,
          firmName: form.firmName,
          password: form.password || undefined,
          phone: form.phone || undefined,
          licenseNo: form.licenseNo || undefined,
          status: form.status,
        },
      }),
    onSuccess: (res) => {
      setCreated({ email: form.email, tempPassword: res.tempPassword });
      setForm({ email: '', firmName: '', password: '', phone: '', licenseNo: '', status: 'VERIFIED' });
      qc.invalidateQueries({ queryKey: ['admin-firms'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const input = 'w-full rounded-lg border border-majolica-200 px-3 py-2 text-sm';

  return (
    <Card className="mb-5 p-5">
      {created && (
        <div className="mb-4 rounded-lg bg-majolica-50 p-3 text-sm">
          <div className="font-medium text-majolica-900">{t('firmCreated')}</div>
          <div className="mt-1 text-majolica-700">{t('email')}: <span className="font-mono">{created.email}</span></div>
          {created.tempPassword && (
            <div className="text-majolica-700">
              {t('tempPasswordLabel')}: <span className="font-mono font-semibold text-ochre-600">{created.tempPassword}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-majolica-700">
          {t('firmName')}
          <input value={form.firmName} onChange={(e) => set({ firmName: e.target.value })} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm text-majolica-700">
          {t('ownerEmail')}
          <input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm text-majolica-700">
          {t('password')} <span className="font-normal text-majolica-400">({t('optional').replace('.', '')})</span>
          <input type="text" value={form.password} onChange={(e) => set({ password: e.target.value })}
            placeholder={t('autoPasswordHint')} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm text-majolica-700">
          {t('phoneField')}
          <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm text-majolica-700">
          {t('licenseNoField')}
          <input value={form.licenseNo} onChange={(e) => set({ licenseNo: e.target.value })} className={`mt-1 ${input}`} />
        </label>
        <label className="text-sm text-majolica-700">
          {t('status')}
          <select value={form.status} onChange={(e) => set({ status: e.target.value as 'VERIFIED' | 'PENDING' })} className={`mt-1 ${input}`}>
            <option value="VERIFIED">VERIFIED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </label>
      </div>

      {create.isError && <p className="mt-3 text-sm text-ochre-600">{(create.error as Error).message}</p>}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending || !form.email || form.firmName.length < 2}
          className="rounded-lg bg-majolica-600 px-5 py-2 text-sm font-semibold text-white hover:bg-majolica-700 disabled:opacity-50"
        >
          {t('create')}
        </button>
        <button onClick={onDone} className="rounded-lg px-4 py-2 text-sm text-majolica-500 hover:bg-majolica-50">
          {t('cancel')}
        </button>
      </div>
    </Card>
  );
}
