import { ROUTES } from '@/constants';

export function resolveSafeNext(raw: string | string[] | null | undefined) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return ROUTES.app;
  }

  const parsed = new URL(raw, 'http://localhost');
  const safePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  const allowedPaths = [ROUTES.app, ROUTES.settings, ROUTES.favorites];
  const isAllowed = allowedPaths.some((path) => parsed.pathname === path || parsed.pathname.startsWith(`${path}/`));

  if (!isAllowed) {
    return ROUTES.app;
  }

  return safePath;
}
