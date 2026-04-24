import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';
import { createServerClient } from '@/utils/supabase/server';

export default async function RootPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(ROUTES.app);
  }

  redirect(`${ROUTES.authSignIn}?next=%2Fapp`);
}
