'use client';

import { useState } from 'react';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from './StorageIndicator';
import ActivationDialog from './ActivationDialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Link2, Moon, Sun, LogOut } from 'lucide-react';
import { createBrowserClient } from '@/utils/supabase/client';
import { ThemePreference } from '@/utils/theme';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ToastProvider';
import { ROUTES } from '@/constants';

interface UserInfoCardProps {
  profile: UserProfile;
  theme: ThemePreference;
  onToggleTheme: () => void;
}

interface ThemeToggleProps {
  theme: ThemePreference;
  onToggle: () => void;
  className?: string;
}

function ThemeToggle({ theme, onToggle, className }: ThemeToggleProps) {
  const { t } = useI18n();
  const title = theme === 'dark' ? t('profile.switchToLight') : t('profile.switchToDark');
  return (
    <button
      onClick={onToggle}
      className={`items-center justify-center rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${className || ''}`}
      title={title}
      aria-label={t('profile.toggleTheme')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-slate-500 hover:text-slate-900 dark:text-slate-200" />
      ) : (
        <Moon className="h-4 w-4 text-slate-500 hover:text-slate-900 dark:text-slate-700 dark:hover:text-slate-100" />
      )}
    </button>
  );
}

export default function UserInfoCard({ profile, theme, onToggleTheme }: UserInfoCardProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    } catch {
      toast({
        title: t('toast.error'),
        description: t('auth.signOutFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!profile.is_active) {
    return (
      <>
        <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <span>⚠️</span>
            <span>{t('profile.inactive')}</span>
            <ThemeToggle 
              theme={theme} 
              onToggle={onToggleTheme} 
              className="ml-auto flex h-7 w-7"
            />
          </div>

          <button
            onClick={() => setShowActivationDialog(true)}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500"
          >
            🔓 {t('profile.activate')}
          </button>
        </div>

        <ActivationDialog 
          open={showActivationDialog} 
          onOpenChange={setShowActivationDialog}
        />
      </>
    );
  }

  const language = LANGUAGES.find(l => l.code === profile.target_language);
  const characterLimit = getCharacterLimit(profile.plan_type);
  const usedCharacters = Math.floor(profile.storage_used / 2);

  return (
    <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100">
      {language && (
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span>{language.flag}</span>
          <span>{language.name}</span>
          <span className="text-slate-500 dark:text-slate-500">({profile.plan_type === 'free' ? t('profile.planFree') : t('profile.planPro')})</span>
          <Link
            href={ROUTES.settingsSharedLinks}
            className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            aria-label={t('share.manageEntry')}
            title={t('share.manageEntry')}
          >
            <Link2 className="h-4 w-4" />
          </Link>
        </div>
      )}

      <StorageIndicator used={usedCharacters} limit={characterLimit} />

      <div className="flex items-center gap-2">
        <Link
          href={ROUTES.settings}
          className="block flex-1 rounded-lg bg-white px-4 py-2 text-center text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          ⚙️ {t('profile.settings')}
        </Link>
        <ThemeToggle 
          theme={theme} 
          onToggle={onToggleTheme} 
          className="flex h-[38px] w-[38px] bg-white shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700" 
        />
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
          title={t('auth.signOut')}
          aria-label={t('auth.signOut')}
          aria-busy={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
