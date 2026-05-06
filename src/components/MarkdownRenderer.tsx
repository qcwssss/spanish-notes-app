import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TextSplitter from './TextSplitter';

interface MarkdownRendererProps {
  content: string;
  targetLanguage: string | null | undefined;
  onSpeak: (text: string) => void;
}

// Recursively traverse React children to find text nodes and replace them with TextSplitter
function renderWithInteractivity(
  children: React.ReactNode, 
  targetLanguage: string | null | undefined,
  onSpeak: (text: string) => void
): React.ReactNode {
  if (typeof children === 'string') {
    return (
      <TextSplitter 
        text={children} 
        targetLanguage={targetLanguage} 
        onSpeak={onSpeak} 
      />
    );
  }

  if (Array.isArray(children)) {
    return React.Children.map(children, (child) => 
      renderWithInteractivity(child, targetLanguage, onSpeak)
    );
  }

  if (React.isValidElement<{ children?: React.ReactNode }>(children)) {
    return React.cloneElement(children, {
      ...children.props,
      children: renderWithInteractivity(children.props.children, targetLanguage, onSpeak)
    });
  }

  return children;
}

// Wrapper for block-level elements to apply interactivity to their textual content
const createInteractiveBlock = (
  Tag: React.ElementType, 
  baseClassName: string,
  targetLanguage: string | null | undefined,
  onSpeak: (text: string) => void
) => {
  return function InteractiveBlock({ children, ...props }: any) {
    return (
      <Tag className={baseClassName} {...props}>
        {renderWithInteractivity(children, targetLanguage, onSpeak)}
      </Tag>
    );
  };
};

const HEADING_CONFIG: Record<string, string> = {
  h1: 'text-2xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-4 first:mt-0',
  h2: 'text-xl font-semibold text-slate-900 dark:text-slate-100 mt-5 mb-3 first:mt-0',
  h3: 'text-lg font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2 first:mt-0',
  h4: 'text-base font-semibold text-slate-900 dark:text-slate-100 mt-3 mb-2 first:mt-0',
  h5: 'text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2 mb-1 first:mt-0',
  h6: 'text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 mb-1 uppercase tracking-wide first:mt-0',
};

export default function MarkdownRenderer({ content, targetLanguage, onSpeak }: MarkdownRendererProps) {
  const components: any = {
    p: createInteractiveBlock('p', 'text-slate-800 dark:text-slate-200 mb-4 leading-relaxed', targetLanguage, onSpeak),
    li: createInteractiveBlock('li', 'text-slate-800 dark:text-slate-200 mb-1.5', targetLanguage, onSpeak),
    td: createInteractiveBlock('td', 'px-4 py-3.5 text-slate-700 dark:text-slate-200', targetLanguage, onSpeak),
    
    // Structure elements that don't need text splitting themselves but contain it
    ul: ({ children }: any) => <ul className="list-disc pl-6 space-y-2 text-slate-800 dark:text-slate-200 mb-4">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal pl-6 space-y-2 text-slate-800 dark:text-slate-200 mb-4">{children}</ol>,
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-[3px] border-slate-400 pl-4 py-2 my-4 text-slate-600 italic bg-slate-50/80 rounded-r-lg dark:border-slate-500 dark:text-slate-300 dark:bg-slate-800/30">
        {renderWithInteractivity(children, targetLanguage, onSpeak)}
      </blockquote>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white my-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
        <table className="w-full text-sm text-left">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700">{children}</thead>,
    tbody: ({ children }: any) => <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">{children}</tbody>,
    tr: ({ children }: any) => <tr className="hover:bg-slate-50/80 transition-colors even:bg-slate-50/40 dark:hover:bg-slate-800/40 dark:even:bg-slate-800/20">{children}</tr>,
    th: ({ children }: any) => <th className="px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-800/60 dark:text-slate-400">{children}</th>,
    
    // Inline elements usually just pass through, but we want to ensure their text is also split
    strong: ({ children }: any) => <strong className="font-bold text-slate-900 dark:text-slate-200">{renderWithInteractivity(children, targetLanguage, onSpeak)}</strong>,
    em: ({ children }: any) => <em className="italic text-slate-600 dark:text-slate-400">{renderWithInteractivity(children, targetLanguage, onSpeak)}</em>,
    del: ({ children }: any) => <del className="line-through opacity-70">{renderWithInteractivity(children, targetLanguage, onSpeak)}</del>,
  };

  // Add headings
  Object.entries(HEADING_CONFIG).forEach(([tag, className]) => {
    components[tag] = createInteractiveBlock(tag as React.ElementType, className, targetLanguage, onSpeak);
  });

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
