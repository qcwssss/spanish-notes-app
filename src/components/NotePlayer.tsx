'use client';

import { useTTS } from '../hooks/useTTS';
import MarkdownRenderer from './MarkdownRenderer';

interface NotePlayerProps {
  content: string;
  targetLanguage: string | null;
}

export default function NotePlayer({ content, targetLanguage }: NotePlayerProps) {
  const { voices, selectedVoiceIndex, setSelectedVoiceIndex, speak } = useTTS(targetLanguage);

  const handleSpeak = (text: string) => {
    speak(text);
  };

  return (
    <div className="bg-white backdrop-blur-md md:border md:border-slate-200 md:rounded-xl p-0 md:p-6 min-h-[500px] text-slate-900 md:shadow-sm dark:bg-slate-900/60 dark:md:border-slate-700 dark:text-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-200 pb-4 dark:border-slate-700">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Practice Mode</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-400">Voice:</label>
          <select 
            value={selectedVoiceIndex}
            onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
            className="bg-white text-slate-700 text-sm rounded-lg px-3 py-1 border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:focus-visible:ring-offset-slate-900"
          >
            {voices.map((voice, idx) => (
              <option key={voice.voiceURI} value={idx}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <MarkdownRenderer content={content} targetLanguage={targetLanguage} onSpeak={handleSpeak} />
      </div>
    </div>
  );
}
