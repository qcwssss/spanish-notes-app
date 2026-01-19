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
      className="cursor-pointer text-sky-300/90 hover:text-sky-100 hover:bg-sky-500/20 decoration-sky-500/30 hover:decoration-sky-500/50 underline decoration-dashed underline-offset-4 rounded px-1 -mx-1 transition-all duration-200"
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
              key={index} 
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
