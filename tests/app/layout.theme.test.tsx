import { describe, expect, it } from 'vitest';
import { getThemeInitScript } from '@/utils/theme';

describe('RootLayout theme init', () => {
  it('injects theme init script into html', () => {
    const script = getThemeInitScript();
    expect(script).toContain('app-theme');
  });
});
