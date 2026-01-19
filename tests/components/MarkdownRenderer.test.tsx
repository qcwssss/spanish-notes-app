import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownRenderer from '@/components/MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders markdown and triggers speak on target language segments', () => {
    const handleSpeak = vi.fn();
    const content = '## Hola\n\nSoy una persona curiosa (我是一个好奇的人)\n\n我是中文';

    render(
      <MarkdownRenderer content={content} targetLanguage="es" onSpeak={handleSpeak} />
    );

    // Hola is a target segment
    fireEvent.click(screen.getByText('Hola'));
    expect(handleSpeak).toHaveBeenCalledWith('Hola');

    // "Soy una persona curiosa " is a target segment.
    fireEvent.click(screen.getByText(/Soy una persona curiosa/));
    expect(handleSpeak).toHaveBeenCalledWith(expect.stringContaining('Soy una persona curiosa'));

    // "我是中文" is non-target
    const chineseText = screen.getByText('我是中文');
    fireEvent.click(chineseText);
    
    // "我是一个好奇的人" is non-target (middle part of the sentence)
    const mixedChinese = screen.getByText('我是一个好奇的人');
    fireEvent.click(mixedChinese);

    // Should still be 2 calls (Hola + Soy...)
    expect(handleSpeak).toHaveBeenCalledTimes(2);
  });
});
