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
    <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-xl p-6 min-h-[500px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
        <h2 className="text-xl font-semibold text-slate-100">Practice Mode</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-400">Voice:</label>
          <select 
            value={selectedVoiceIndex}
            onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
            className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
