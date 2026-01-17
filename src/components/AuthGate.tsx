'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/utils/supabase/client';

export default function AuthGate() {
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
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 text-slate-100 shadow-xl">
        <h1 className="text-2xl font-bold">请使用 Google 登录</h1>
        <p className="mt-2 text-slate-400">登录后即可使用笔记功能</p>
        <button
          onClick={handleLogin}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
        >
          使用 Google 登录
        </button>
      </div>
    </div>
  );
}
