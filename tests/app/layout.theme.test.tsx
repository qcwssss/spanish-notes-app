import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import RootLayout from '@/app/layout';

vi.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}));

describe('RootLayout theme init', () => {
  it('injects theme init script into html', () => {
    const html = renderToString(
      <RootLayout>
        <div />
      </RootLayout>
    );

    expect(html).toContain('app-theme');
  });
});
