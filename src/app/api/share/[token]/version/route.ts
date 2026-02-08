import { NextResponse } from 'next/server';
import { getShareVersionByToken, getSharedNoteByToken } from '@/utils/shares/queries';

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  const version = await getShareVersionByToken(token);
  if (!version) {
    // Fallback: if lightweight version RPC is missing/misaligned in current DB,
    // use shared note lookup to avoid false "unavailable" alerts in watcher.
    const shared = await getSharedNoteByToken(token);
    if (shared) {
      return NextResponse.json(
        { updatedAt: shared.updatedAt },
        {
          headers: {
            'Cache-Control': 'no-store',
          },
        }
      );
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(version, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
