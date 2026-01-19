import React from 'react';
import { segmentText } from '@/utils/language/segmenter';

interface TextSplitterProps {
  text: string;
  targetLanguage: string | null | undefined;
  onSpeak: (text: string) => void;
}

const InteractiveSpan: React.FC<{ text: string; onSpeak: () => void }> = ({ text, onSpeak }) => {
  return (
    <span
      className="cursor-pointer hover:text-blue-300 hover:bg-slate-700/50 rounded px-0.5 transition-colors select-none"
      onClick={(e) => {
        // Prevent default browser behavior and stop propagation
        e.preventDefault();
        e.stopPropagation();
        onSpeak();
      }}
    >
      {text}
    </span>
  );
};

export default function TextSplitter({ text, targetLanguage, onSpeak }: TextSplitterProps) {
  const segments = React.useMemo(() => {
    return segmentText(text, targetLanguage);
  }, [text, targetLanguage]);

  return (
    <>
      {segments.map((seg, index) => {
        if (seg.type === 'target') {
          return (
            <InteractiveSpan 
              key={`${index}-${seg.text.substring(0, 5)}`} 
              text={seg.text} 
              onSpeak={() => onSpeak(seg.text)} 
            />
          );
        }
        return <span key={index}>{seg.text}</span>;
      })}
    </>
  );
}
