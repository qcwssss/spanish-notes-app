import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { splitTextByLanguage } from '@/utils/language/splitter';

interface MarkdownRendererProps {
  content: string;
  targetLanguage: string | null | undefined;
  onSpeak: (text: string) => void;
}

const InteractiveText = ({ 
  text, 
  targetLanguage, 
  onSpeak 
}: { 
  text: string; 
  targetLanguage: string | null | undefined; 
  onSpeak: (text: string) => void 
}) => {
  const segments = useMemo(() => splitTextByLanguage(text, targetLanguage), [text, targetLanguage]);
  
  return (
    <>
      {segments.map((seg, i) => (
        <span
          key={i}
          className={seg.isTarget ? 'text-blue-400 hover:text-blue-300 cursor-pointer transition-colors' : undefined}
          onClick={seg.isTarget ? (e) => { e.stopPropagation(); onSpeak(seg.text); } : undefined}
        >
          {seg.text}
        </span>
      ))}
    </>
  );
};

function processChildren(
  children: React.ReactNode, 
  targetLanguage: string | null | undefined, 
  onSpeak: (text: string) => void
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === 'string') {
      return <InteractiveText text={child} targetLanguage={targetLanguage} onSpeak={onSpeak} />;
    }
    if (React.isValidElement(child)) {
      const props = child.props as { children?: React.ReactNode };
      if (props.children) {
        return React.cloneElement(child as React.ReactElement<any>, {
          children: processChildren(props.children, targetLanguage, onSpeak)
        });
      }
    }
    return child;
  });
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
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="text-slate-300">{processChildren(children, targetLanguage, onSpeak)}</p>,
        li: ({ children }) => <li className="text-slate-300">{processChildren(children, targetLanguage, onSpeak)}</li>,
        td: ({ children }) => <td className="px-4 py-3 text-slate-300">{processChildren(children, targetLanguage, onSpeak)}</td>,
        ...Object.fromEntries(
          Object.entries(HEADING_CONFIG).map(([tag, className]) => [
            tag,
            ({ children }: { children: React.ReactNode }) => (
              <div className={className}>{processChildren(children, targetLanguage, onSpeak)}</div>
            )
          ])
        ),
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
