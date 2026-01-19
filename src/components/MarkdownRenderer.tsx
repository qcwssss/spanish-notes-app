import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { extractTargetText } from '@/utils/language/extractor';

interface MarkdownRendererProps {
  content: string;
  targetLanguage: string | null | undefined;
  onSpeak: (text: string) => void;
}

function getTextFromChildren(children: React.ReactNode): string {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(getTextFromChildren).join('');
  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return getTextFromChildren(children.props.children);
  }
  return '';
}

function createClickableComponent<TagProps extends { className?: string }>(
  Tag: React.ElementType,
  targetLanguage: string | null | undefined,
  onSpeak: (text: string) => void,
  baseClassName?: string
) {
  return function ClickableTag(props: TagProps & { children?: React.ReactNode }) {
    const text = getTextFromChildren(props.children);
    const filtered = extractTargetText(text, targetLanguage);
    const clickable = Boolean(filtered);
    const className = [
      baseClassName,
      props.className,
      clickable ? 'cursor-pointer hover:text-blue-300 transition-colors' : undefined,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <Tag
        {...props}
        className={className}
        onClick={clickable ? () => onSpeak(filtered) : undefined}
      />
    );
  };
}

const HEADING_CONFIG: Record<string, string> = {
  h1: 'text-2xl font-bold text-slate-100',
  h2: 'text-xl font-semibold text-slate-100',
  h3: 'text-lg font-semibold text-slate-100',
  h4: 'text-base font-semibold text-slate-100',
  h5: 'text-sm font-semibold text-slate-100',
  h6: 'text-sm font-semibold text-slate-100',
};

export default function MarkdownRenderer({ content, targetLanguage, onSpeak }: MarkdownRendererProps) {
  const headingComponents = Object.fromEntries(
    Object.entries(HEADING_CONFIG).map(([tag, className]) => [
      tag,
      createClickableComponent(tag, targetLanguage, onSpeak, className),
    ])
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...headingComponents,
        p: createClickableComponent('p', targetLanguage, onSpeak, 'text-slate-300'),
        li: createClickableComponent('li', targetLanguage, onSpeak, 'text-slate-300'),
        td: createClickableComponent('td', targetLanguage, onSpeak, 'px-4 py-3 text-slate-300'),
        ul: ({ children }) => <ul className="list-disc pl-6 space-y-2 text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 text-slate-300">{children}</ol>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-slate-600 pl-4 text-slate-400">{children}</blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-hidden rounded-lg border border-slate-700">
            <table className="w-full text-sm text-left">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-slate-800 text-slate-400">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-slate-700 bg-slate-900/30">{children}</tbody>,
        tr: ({ children }) => <tr className="hover:bg-slate-800/50">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-2 font-medium">{children}</th>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
