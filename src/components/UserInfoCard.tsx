'use client';

import { useState } from 'react';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from './StorageIndicator';
import ActivationDialog from './ActivationDialog';
import Link from 'next/link';
import { Moon, Sun } from 'lucide-react';
import { ThemePreference } from '@/utils/theme';

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
  return (
    <button
      onClick={onToggle}
      className={`items-center justify-center rounded-lg transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${className || ''}`}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
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
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  if (!profile.is_active) {
    return (
      <>
        <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <span>⚠️</span>
            <span>账户未激活</span>
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
            🔓 输入激活码
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
          <span className="text-slate-500 dark:text-slate-500">({profile.plan_type === 'free' ? 'Free' : 'Pro'})</span>
        </div>
      )}

      <StorageIndicator used={usedCharacters} limit={characterLimit} />

      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className="block flex-1 rounded-lg bg-white px-4 py-2 text-center text-sm text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          ⚙️ Settings
        </Link>
        <ThemeToggle 
          theme={theme} 
          onToggle={onToggleTheme} 
          className="flex h-[38px] w-[38px] bg-white shadow-sm hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700" 
        />
      </div>
    </div>
  );
}
