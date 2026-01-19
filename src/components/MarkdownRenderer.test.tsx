import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MarkdownRenderer from './MarkdownRenderer';

describe('MarkdownRenderer', () => {
  it('renders markdown and triggers speak on target language blocks', () => {
    const handleSpeak = vi.fn();
    const content = '## Hola\n\nSoy una persona curiosa (我是一个好奇的人)\n\n我是中文';

    render(
      <MarkdownRenderer content={content} targetLanguage="es" onSpeak={handleSpeak} />
    );

    fireEvent.click(screen.getByText('Hola'));
    expect(handleSpeak).toHaveBeenCalledWith('Hola');

    fireEvent.click(screen.getByText(/Soy una persona curiosa/));
    expect(handleSpeak).toHaveBeenCalledWith('Soy una persona curiosa');

    fireEvent.click(screen.getByText('我是中文'));
    expect(handleSpeak).toHaveBeenCalledTimes(2);
  });
});
