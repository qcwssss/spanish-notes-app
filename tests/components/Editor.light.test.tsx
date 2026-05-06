import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Editor from '@/components/Editor';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import NotePlayer from '@/components/NotePlayer';
import { renderWithI18n } from '../utils/renderWithI18n';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock('@/components/ShareActions', () => ({
  default: () => null,
}));

vi.mock('@/components/ToastProvider', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

describe('Editor light mode', () => {
  it('uses light defaults for editor surface', () => {
    const { container } = renderWithI18n(
      <Editor
        note={{
          id: '1',
          title: 'Test',
          content: '',
          created_at: '',
          updated_at: '',
          user_id: '',
          folder_id: '',
          is_favorite: false,
        }}
        isActive={true}
        targetLanguage="es"
        initialEditMode={false}
      />
    );
    const surface = container.querySelector('[data-testid="editor-surface"]') as HTMLElement;

    expect(surface.className).toContain('bg-white');
    expect(surface.className).toContain('border-slate-200');
    expect(surface.className).toContain('text-slate-900');
    expect(surface.className).toContain('shadow-sm');
    expect(surface.className).toContain('dark:bg-slate-900');
  });

  it('uses light defaults for NotePlayer surface', () => {
    const { container } = renderWithI18n(
      <NotePlayer content="Hola" targetLanguage="es" />
    );

    const surface = container.firstElementChild as HTMLElement;

    expect(surface.className).toContain('bg-white');
    expect(surface.className).toContain('border-slate-200');
    expect(surface.className).toContain('text-slate-900');
    expect(surface.className).toContain('shadow-sm');
    expect(surface.className).toContain('dark:bg-slate-900/60');
  });

  it('applies light defaults to markdown blocks', () => {
    const { container, getByText } = render(
      <MarkdownRenderer
        content={`## Heading

Paragraph text

| A | B |
| - | - |
| 1 | 2 |`}
        targetLanguage="es"
        onSpeak={() => undefined}
      />
    );

    const heading = getByText('Heading').closest('h2');
    const paragraph = getByText('Paragraph text').closest('p');
    const tableWrapper = container.querySelector('div.overflow-x-auto');
    const tableHead = container.querySelector('thead');
    const tableCell = container.querySelector('td');

    expect(heading).not.toBeNull();
    expect(paragraph).not.toBeNull();
    expect(tableWrapper).not.toBeNull();
    expect(tableHead).not.toBeNull();
    expect(tableCell).not.toBeNull();

    expect(heading?.className).toContain('text-slate-900');
    expect(heading?.className).toContain('dark:text-slate-100');
    expect(paragraph?.className).toContain('text-slate-800');
    expect(paragraph?.className).toContain('dark:text-slate-200');
    expect(tableWrapper?.className).toContain('bg-white');
    expect(tableWrapper?.className).toContain('dark:bg-slate-900/40');
    // thead 现在是细腻的浅灰 + 大写小字标题（见 MarkdownRenderer 改动）
    expect(tableHead?.className).toContain('bg-slate-50');
    expect(tableHead?.className).toContain('text-slate-500');
    expect(tableHead?.className).toContain('uppercase');
    expect(tableCell?.className).toContain('text-slate-700');
    expect(tableCell?.className).toContain('dark:text-slate-200');
  });
});
