'use client';

import { useState } from 'react';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from './StorageIndicator';
import ActivationDialog from './ActivationDialog';
import Link from 'next/link';

interface UserInfoCardProps {
  profile: UserProfile;
}

export default function UserInfoCard({ profile }: UserInfoCardProps) {
  const [showActivationDialog, setShowActivationDialog] = useState(false);

  if (!profile.is_active) {
    return (
      <>
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-300">👤</span>
            <span className="text-slate-400 truncate">{profile.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-yellow-400">
            <span>⚠️</span>
            <span>账户未激活</span>
          </div>

          <button
            onClick={() => setShowActivationDialog(true)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-sm"
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
    <div className="p-4 border-t border-slate-700 bg-slate-900/50 space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-300">👤</span>
        <span className="text-slate-400 truncate">{profile.email}</span>
      </div>
      
      {language && (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span>{language.flag}</span>
          <span>{language.name}</span>
          <span className="text-slate-500">({profile.plan_type === 'free' ? 'Free' : 'Pro'})</span>
        </div>
      )}

      <StorageIndicator used={usedCharacters} limit={characterLimit} />

      <Link
        href="/settings"
        className="block w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors text-center text-sm"
      >
        ⚙️ Settings
      </Link>
    </div>
  );
}
