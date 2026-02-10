'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';

interface GoogleSignInButtonProps {
  label: string;
  className?: string;
}

export default function GoogleSignInButton({ label, className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useI18n();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      toast({
        title: t('toast.error'),
        description: t('auth.signInFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={className}
      aria-busy={isLoading}
    >
      {label}
    </button>
  );
}
