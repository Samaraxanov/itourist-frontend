import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../../lib/api';
import { formatDate } from '../../lib/format';
import StatusBadge from '../../components/StatusBadge';
import type { Departure, Locale } from '../../types';

export default function FirmDeparturesPage() {
  const { id: tourId } = useParams();
  const { t, i18n } = useTranslation();
  const locale = i18n.language as Locale;
  const qc = useQueryClient();

  const { data: departures, isLoading } = useQuery({
    queryKey: ['firm-departures', tourId],
    queryFn: () => apiRequest<Departure[]>(`/departures/tour/${tourId}`, { auth: true }),
    enabled: !!tourId,
  });

  const [form, setForm] = useState({ startDate: '', capacity: 10, priceOverride: '', instantConfirm: false });
  const invalidate = () => qc.invalidateQueries({ queryKey: ['firm-departures', tourId] });

  const create = useMutation({
    mutationFn: () =>
      apiRequest('/departures', {
        method: 'POST',
        auth: true,
        body: {
          tourId,
          startDate: new Date(form.startDate).toISOString(),
          capacity: form.capacity,
          priceOverride: form.priceOverride ? Number(form.priceOverride) : undefined,
          instantConfirm: form.instantConfirm,
        },
      }),
    onSuccess: () => {
      setForm({ startDate: '', capacity: 10, priceOverride: '', instantConfirm: false });
      invalidate();
    },
  });

  const cancel = useMutation({
    mutationFn: (id: string) => apiRequest(`/departures/${id}`, { method: 'DELETE', auth: true }),
    onSuccess: invalidate,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="font-display text-2xl font-bold text-majolica-900">{t('manageDepartures')}</h1>
        <Link to="/firm" className="text-sm text-majolica-600 hover:underline">← {t('dashboard')}</Link>
      </div>

      {/* Add departure */}
      <div className="mb-6 rounded-xl border border-majolica-100 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-majolica-700">
            {t('startDate')}
            <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
          </label>
          <label className="text-sm text-majolica-700">
            {t('capacity')}
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))}
              className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" />
          </label>
          <label className="text-sm text-majolica-700">
            {t('priceOverride')}
            <input type="number" min={0} value={form.priceOverride} onChange={(e) => setForm((f) => ({ ...f, priceOverride: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-majolica-200 px-3 py-2" placeholder="—" />
          </label>
          <label className="flex items-center gap-2 self-end text-sm text-majolica-700">
            <input type="checkbox" checked={form.instantConfirm} onChange={(e) => setForm((f) => ({ ...f, instantConfirm: e.target.checked }))} />
            {t('instantConfirm')}
          </label>
        </div>
        <button
          onClick={() => create.mutate()}
          disabled={create.isPending || !form.startDate}
          className="mt-3 rounded-lg bg-ochre-500 px-4 py-2 text-sm font-semibold text-white hover:bg-ochre-600 disabled:opacity-50"
        >
          + {t('addDeparture')}
        </button>
      </div>

      {isLoading ? (
        <p className="text-majolica-400">{t('loading')}</p>
      ) : departures && departures.length > 0 ? (
        <div className="divide-y divide-majolica-100 rounded-xl border border-majolica-100 bg-white">
          {departures.map((d) => (
            <div key={d.id} className="flex items-center gap-3 p-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 font-medium text-majolica-900">
                  {formatDate(d.startDate, locale)}
                  {d.status && d.status !== 'OPEN' && <StatusBadge status={d.status === 'CANCELLED' ? 'CANCELLED' : 'CONFIRMED'} />}
                  {d.instantConfirm && <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700">{t('instant')}</span>}
                </div>
                <div className="text-sm text-majolica-500">
                  {d.seatsBooked}/{d.capacity} · {d._count?.bookings ?? 0} bookings
                </div>
              </div>
              {d.status !== 'CANCELLED' && (
                <button
                  onClick={() => cancel.mutate(d.id)}
                  disabled={cancel.isPending}
                  className="rounded-lg border border-majolica-200 px-3 py-1.5 text-sm text-majolica-700 hover:bg-majolica-50 disabled:opacity-50"
                >
                  {t('cancel')}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-majolica-600">No departures yet.</p>
      )}
    </div>
  );
}
