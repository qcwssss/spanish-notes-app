'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { updateTargetLanguage } from '@/utils/profile/queries';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from '@/components/StorageIndicator';

interface SettingsFormProps {
  profile: UserProfile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(profile.target_language || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isLanguageLocked = profile.plan_type === 'free' && profile.target_language !== null;
  const characterLimit = getCharacterLimit(profile.plan_type);
  const usedCharacters = Math.floor(profile.storage_used / 2);

  const handleSave = async () => {
    if (!selectedLanguage) {
      alert('请选择一种语言');
      return;
    }

    setIsSaving(true);
    try {
      await updateTargetLanguage(selectedLanguage);
      alert('设置已保存');
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('保存失败，请稍后重试');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌍 学习语言
        </h2>

        <div>
          <label htmlFor="target-language" className="block text-sm text-slate-400 mb-2">
            目标语言
          </label>
          <select
            id="target-language"
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            disabled={isLanguageLocked}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">请选择语言</option>
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.flag} {language.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isLanguageLocked || !selectedLanguage}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isSaving ? '保存中...' : isLanguageLocked ? '已锁定' : '保存设置'}
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📊 存储使用情况
        </h2>

        <div className="space-y-2">
          <p className="text-sm text-slate-400">
            已用: {usedCharacters.toLocaleString()} / {characterLimit.toLocaleString()} 字符
          </p>
          <StorageIndicator used={usedCharacters} limit={characterLimit} />
        </div>
      </div>
    </div>
  );
}
