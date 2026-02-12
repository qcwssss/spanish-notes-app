'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { useI18n } from '@/components/I18nProvider';

export default function AuthGate() {
  const { t } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient();

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setIsAuthenticated(Boolean(data.session));
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated !== false) {
    return null;
  }

  const handleLogin = async () => {
    const supabase = createBrowserClient();
    const next = `${window.location.pathname}${window.location.search}`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 backdrop-blur-sm dark:bg-black/60">
      <div
        data-testid="auth-card"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <h1 className="text-2xl font-bold">{t('auth.title')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{t('auth.subtitle')}</p>
        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
        >
          {t('auth.button')}
        </button>
      </div>
    </div>
  );
}
