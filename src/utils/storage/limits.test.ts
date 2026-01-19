import { describe, it, expect } from 'vitest';
import { getStorageLimit, formatCharacterCount, getCharacterLimit } from './limits';

describe('Storage Limits', () => {
  it('should return correct storage limit for free plan', () => {
    expect(getStorageLimit('free')).toBe(300000);
  });

  it('should return correct storage limit for pro plan', () => {
    expect(getStorageLimit('pro_plan')).toBe(10000000);
  });

  it('should default to free limit for unknown plan', () => {
    expect(getStorageLimit('unknown')).toBe(300000);
  });
});

describe('Format Character Count', () => {
  it('should format small numbers without suffix', () => {
    expect(formatCharacterCount(500)).toBe('500');
  });

  it('should format thousands with k suffix', () => {
    expect(formatCharacterCount(25000)).toBe('25k');
  });

  it('should format large numbers with k suffix', () => {
    expect(formatCharacterCount(150000)).toBe('150k');
  });
});

describe('Get Character Limit', () => {
  it('should convert bytes to approximate character count', () => {
    expect(getCharacterLimit('free')).toBe(150000); // 300000 / 2
  });
});
