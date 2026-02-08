import { NextResponse } from 'next/server';
import { getShareVersionByToken } from '@/utils/shares/queries';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const version = await getShareVersionByToken(token);
  if (!version) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(version, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
