'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';

interface GoogleSignInButtonProps {
  label: string;
  className?: string;
}

export default function GoogleSignInButton({ label, className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    const supabase = createBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    setIsLoading(false);
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
