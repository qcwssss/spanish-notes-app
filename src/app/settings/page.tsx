import { redirect } from 'next/navigation';
import { getUserProfile } from '@/utils/profile/queries';
import SettingsForm from './SettingsForm';
import { getServerLocale } from '@/i18n/server';
import { createTranslator } from '@/i18n/translator';

export const runtime = 'edge';

export default async function SettingsPage() {
  const profile = await getUserProfile();
  const locale = await getServerLocale();
  const t = createTranslator(locale);

  if (!profile) {
    redirect('/');
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">⚠️ {t('settings.inactiveTitle')}</h1>
          <p className="text-slate-400">{t('settings.inactiveDescription')}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            {t('settings.backHome')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div>
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            ← {t('settings.backNotes')}
          </a>
          <h1 className="text-3xl font-bold mt-4">⚙️ {t('settings.title')}</h1>
        </div>

        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
