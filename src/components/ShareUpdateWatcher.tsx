'use client';

import { useCallback, useEffect, useState } from 'react';
import { useI18n } from '@/components/I18nProvider';

interface ShareUpdateWatcherProps {
  token: string;
  initialUpdatedAt: string;
}

export default function ShareUpdateWatcher({ token, initialUpdatedAt }: ShareUpdateWatcherProps) {
  const { t } = useI18n();
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  const checkVersion = useCallback(async () => {
    try {
      const response = await fetch(`/api/share/${encodeURIComponent(token)}/version`, {
        cache: 'no-store',
      });

      if (response.status === 404) {
        setIsUnavailable(true);
        setHasUpdate(false);
        return;
      }

      if (!response.ok) {
        // Transient API/network errors should not be treated as "share revoked".
        return;
      }

      const data = (await response.json()) as { updatedAt?: string };
      if (!data.updatedAt) {
        return;
      }

      setIsUnavailable(false);

      const initialTime = Date.parse(initialUpdatedAt);
      const latestTime = Date.parse(data.updatedAt);

      if (!Number.isNaN(initialTime) && !Number.isNaN(latestTime)) {
        if (latestTime > initialTime) {
          setHasUpdate(true);
        }
        return;
      }

      if (data.updatedAt !== initialUpdatedAt) {
        setHasUpdate(true);
      }
    } catch (error) {
      console.error('Failed to check shared note version:', error);
    }
  }, [initialUpdatedAt, token]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void checkVersion();
      }
    };

    const onFocus = () => void checkVersion();
    const onOnline = () => void checkVersion();
    const onPageShow = () => void checkVersion();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('pageshow', onPageShow);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [checkVersion]);

  if (!hasUpdate && !isUnavailable) {
    return null;
  }

  return (
    <div className="fixed left-1/2 top-4 z-40 -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 shadow-lg dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
        <span>{isUnavailable ? t('share.unavailableNow') : t('share.updatedHint')}</span>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-500"
        >
          {t('share.refresh')}
        </button>
      </div>
    </div>
  );
}
