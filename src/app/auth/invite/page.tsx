import { redirect } from 'next/navigation';
import InviteEmailSignupForm from '@/components/InviteEmailSignupForm';
import { createServerClient } from '@/utils/supabase/server';
import { ROUTES } from '@/constants';

interface InvitePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function resolveInviteEmail(raw: string | string[] | undefined) {
  if (typeof raw !== 'string') {
    return '';
  }

  return raw.trim().toLowerCase();
}

export default async function InviteSignupPage({ searchParams }: InvitePageProps) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ROUTES.app);
  }

  const params = await searchParams;
  const initialEmail = resolveInviteEmail(params.email);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center justify-center">
        <InviteEmailSignupForm initialEmail={initialEmail} />
      </div>
    </main>
  );
}
