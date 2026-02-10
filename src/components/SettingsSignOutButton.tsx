'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/utils/supabase/client';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';
import { ROUTES } from '@/constants';

export default function SettingsSignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();
  const { t } = useI18n();
  const { toast } = useToast();

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    try {
      const supabase = createBrowserClient();
      await supabase.auth.signOut();
      router.push(ROUTES.home);
      router.refresh();
    } catch (error) {
      console.error('Sign out failed:', error);
      toast({
        title: t('toast.error'),
        description: t('auth.signOutFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isSigningOut}
      aria-busy={isSigningOut}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
    >
      {t('auth.signOut')}
    </button>
  );
}
