'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, LANGUAGES } from '@/types/profile';
import { updateTargetLanguage } from '@/utils/profile/queries';
import { getCharacterLimit } from '@/utils/storage/limits';
import StorageIndicator from '@/components/StorageIndicator';
import { useI18n } from '@/components/I18nProvider';
import { LOCALE_LABELS, type Locale } from '@/i18n/config';

interface SettingsFormProps {
  profile: UserProfile;
}

export default function SettingsForm({ profile }: SettingsFormProps) {
  const { locale, setLocale, t } = useI18n();
  const [selectedLanguage, setSelectedLanguage] = useState(profile.target_language || '');
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isLanguageLocked = profile.plan_type === 'free' && profile.target_language !== null;
  const characterLimit = getCharacterLimit(profile.plan_type);
  const usedCharacters = Math.floor(profile.storage_used / 2);

  const handleSave = async () => {
    if (!selectedLanguage) {
      alert(t('settings.selectLanguageAlert'));
      return;
    }

    setIsSaving(true);
    try {
      await updateTargetLanguage(selectedLanguage);
      alert(t('settings.saveSuccessAlert'));
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(t('settings.saveFailedAlert'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div
        data-testid="settings-card"
        className="bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-xl p-6 space-y-4"
      >
        <h2 className="text-xl font-semibold flex items-center gap-2">
          👤 {t('settings.accountTitle')}
        </h2>
        <div className="text-slate-700 dark:text-slate-300">
          <span className="text-slate-600 dark:text-slate-400 text-sm block mb-1">{t('settings.emailLabel')}</span>
          <span className="font-medium">{profile.email}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌐 {t('settings.interfaceLanguageTitle')}
        </h2>

        <div>
          <label
            htmlFor="interface-language"
            className="block text-sm text-slate-600 dark:text-slate-400 mb-2"
          >
            {t('settings.interfaceLanguageLabel')}
          </label>
          <select
            id="interface-language"
            value={locale}
            onChange={(event) => setLocale(event.target.value as Locale)}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
          >
            {Object.entries(LOCALE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🌍 {t('settings.learningLanguageTitle')}
        </h2>

        <div>
          <label
            htmlFor="target-language"
            className="block text-sm text-slate-600 dark:text-slate-400 mb-2"
          >
            {t('settings.targetLanguageLabel')}
          </label>
          <select
            id="target-language"
            value={selectedLanguage}
            onChange={(event) => setSelectedLanguage(event.target.value)}
            disabled={isLanguageLocked}
            className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100"
          >
            <option value="">{t('settings.targetLanguagePlaceholder')}</option>
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
          {isSaving ? t('settings.savingSettings') : isLanguageLocked ? t('settings.locked') : t('settings.saveSettings')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          📊 {t('settings.storageTitle')}
        </h2>

        <div className="space-y-2">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('settings.storageUsed', {
              used: usedCharacters.toLocaleString(),
              limit: characterLimit.toLocaleString(),
            })}
          </p>
          <StorageIndicator used={usedCharacters} limit={characterLimit} />
        </div>
      </div>
    </div>
  );
}
