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

  it('keeps curly apostrophes', () => {
    const result = extractTargetText("C’est la vie (这就是生活)", 'fr');
    expect(result).toBe("C’est la vie");
  });

  it('keeps parenthesized target text for natural speech', () => {
    const result = extractTargetText('Hola (amigo)', 'es');
    expect(result).toBe('Hola (amigo)');
  });

  it('keeps quoted target text for natural speech', () => {
    const result = extractTargetText('Ella dijo "hola"', 'es');
    expect(result).toBe('Ella dijo "hola"');
  });

  it('returns empty string when no target language content', () => {
    const result = extractTargetText('我是一个好奇的人', 'es');
    expect(result).toBe('');
  });
});
