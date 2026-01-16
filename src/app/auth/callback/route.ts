import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  const supabase = await createServerClient();
  await supabase.auth.getUser();
  return NextResponse.redirect(new URL('/', request.url));
}
