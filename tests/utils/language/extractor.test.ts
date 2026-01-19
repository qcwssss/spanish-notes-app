import { describe, it, expect } from 'vitest';
import { extractTargetText } from '@/utils/language/extractor';

describe('extractTargetText', () => {
  it('keeps Spanish text and strips Chinese', () => {
    const result = extractTargetText('Soy una persona curiosa (我是一个好奇的人)', 'es');
    expect(result).toBe('Soy una persona curiosa');
  });

  it('keeps French accents and strips non-target characters', () => {
    const result = extractTargetText("Je m'appelle Léa（我叫乐雅）", 'fr');
    expect(result).toBe("Je m'appelle Léa");
  });

  it('returns empty string when no target language content', () => {
    const result = extractTargetText('我是一个好奇的人', 'es');
    expect(result).toBe('');
  });
});
