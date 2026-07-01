import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { apiRequest } from '../lib/api';
import type { NotificationItem } from '../types';

// Bell with an unread badge and a dropdown list. Polls the unread count so new
// notifications appear without a manual refresh.
export default function NotificationBell() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const count = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => apiRequest<{ count: number }>('/notifications/unread-count', { auth: true }),
    refetchInterval: 30_000,
  });

  const list = useQuery({
    queryKey: ['notifs'],
    queryFn: () => apiRequest<NotificationItem[]>('/notifications', { auth: true }),
    enabled: open,
  });

  const markAll = useMutation({
    mutationFn: () => apiRequest('/notifications/read-all', { method: 'POST', auth: true }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notif-count'] });
      qc.invalidateQueries({ queryKey: ['notifs'] });
    },
  });

  const unread = count.data?.count ?? 0;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-majolica-700 hover:bg-majolica-50"
        aria-label={t('notifications')}
      >
        <span className="text-lg">🔔</span>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ochre-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-majolica-100 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-majolica-100 px-4 py-2">
              <span className="text-sm font-semibold text-majolica-900">{t('notifications')}</span>
              {unread > 0 && (
                <button onClick={() => markAll.mutate()} className="text-xs text-majolica-600 hover:underline">
                  {t('markAllRead')}
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {list.data && list.data.length > 0 ? (
                list.data.map((n) => (
                  <div key={n.id} className={`border-b border-majolica-50 px-4 py-3 ${n.readAt ? '' : 'bg-majolica-50/50'}`}>
                    <div className="text-sm font-medium text-majolica-900">{n.title}</div>
                    <div className="text-xs text-majolica-600">{n.body}</div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-sm text-majolica-400">{t('noNotifications')}</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
