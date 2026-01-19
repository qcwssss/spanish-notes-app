import { describe, it, expect } from 'vitest';
import { splitTextByLanguage } from '@/utils/language/splitter';

describe('splitTextByLanguage', () => {
  it('splits simple mixed text correctly', () => {
    // "Hola (" (Target), "你好" (Non-Target), ")" (Non-Target - pure punctuation)
    const segments = splitTextByLanguage('Hola (你好)', 'es');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ text: 'Hola (', isTarget: true });
    expect(segments[1]).toEqual({ text: '你好', isTarget: false });
    expect(segments[2]).toEqual({ text: ')', isTarget: false });
  });

  it('separates parens containing chinese', () => {
    // "Hola (" (T), "你好" (F), ") mundo" (T - merged because both are non-Chinese)
    const segments = splitTextByLanguage('Hola (你好) mundo', 'es');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ text: 'Hola (', isTarget: true });
    expect(segments[1]).toEqual({ text: '你好', isTarget: false });
    expect(segments[2]).toEqual({ text: ') mundo', isTarget: true });
  });

  it('handles text with target language at the end', () => {
    // "这是一个测试" (Non-Target), " Test" (Target, includes space)
    const segments = splitTextByLanguage('这是一个测试 Test', 'es');
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({ text: '这是一个测试', isTarget: false });
    expect(segments[1]).toEqual({ text: ' Test', isTarget: true });
  });

  it('keeps punctuation with target language', () => {
    // "Hola, mundo!" (Target)
    const segments = splitTextByLanguage('Hola, mundo!', 'es');
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({ text: 'Hola, mundo!', isTarget: true });
  });

  it('separates parens containing chinese', () => {
    // "Hola (" (T), "你好" (F), ") mundo" (T - merged because both are non-Chinese)
    const segments = splitTextByLanguage('Hola (你好) mundo', 'es');
    expect(segments).toHaveLength(3);
    expect(segments[0]).toEqual({ text: 'Hola (', isTarget: true });
    expect(segments[1]).toEqual({ text: '你好', isTarget: false });
    expect(segments[2]).toEqual({ text: ') mundo', isTarget: true });
  });

  it('treats pure punctuation as non-target if isolated', () => {
    // "..." -> Non-Target (because no target chars)
    const segments = splitTextByLanguage('...', 'es');
    expect(segments).toHaveLength(1);
    expect(segments[0].isTarget).toBe(false);
  });

  it('handles Chinese punctuation correctly', () => {
    // "Hola" (T) "（你好）" (F)
    const segments = splitTextByLanguage('Hola（你好）', 'es');
    expect(segments).toHaveLength(2);
    expect(segments[0]).toEqual({ text: 'Hola', isTarget: true });
    expect(segments[1]).toEqual({ text: '（你好）', isTarget: false });
  });
});
