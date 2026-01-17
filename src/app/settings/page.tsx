import { redirect } from 'next/navigation';
import { getUserProfile } from '@/utils/profile/queries';
import SettingsForm from './SettingsForm';

export const runtime = 'edge';

export default async function SettingsPage() {
  const profile = await getUserProfile();

  if (!profile) {
    redirect('/');
  }

  if (!profile.is_active) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">⚠️ 账户未激活</h1>
          <p className="text-slate-400">请先激活账户才能访问设置</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-2xl mx-auto p-8 space-y-8">
        <div>
          <a
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
          >
            ← 返回笔记
          </a>
          <h1 className="text-3xl font-bold mt-4">⚙️ 账户设置</h1>
        </div>

        <SettingsForm profile={profile} />
      </div>
    </div>
  );
}
