'use client';

import { useTTS } from '../hooks/useTTS';
import MarkdownRenderer from './MarkdownRenderer';
import { useI18n } from '@/components/I18nProvider';
import { Headphones, ChevronDown } from 'lucide-react';

interface NotePlayerProps {
  content: string;
  targetLanguage: string | null;
}

export default function NotePlayer({ content, targetLanguage }: NotePlayerProps) {
  const { t } = useI18n();
  const { voices, selectedVoiceIndex, setSelectedVoiceIndex, speak } = useTTS(targetLanguage);

  const handleSpeak = (text: string) => {
    speak(text);
  };

  return (
    <div className="bg-white backdrop-blur-md md:border md:border-slate-200 md:rounded-2xl p-4 md:p-6 min-h-[500px] text-slate-900 md:shadow-sm dark:bg-slate-900/60 dark:md:border-slate-700 dark:text-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4 dark:border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Headphones className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{t('notePlayer.title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{t('notePlayer.voice')}</label>
          <div className="relative">
            <select
              value={selectedVoiceIndex}
              onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
              className="appearance-none bg-slate-50 text-slate-700 text-xs rounded-lg pl-3 pr-8 py-1.5 border border-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-1 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 cursor-pointer max-w-[160px]"
            >
              {voices.map((voice, idx) => (
                <option key={voice.voiceURI} value={idx}>
                  {voice.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 dark:text-slate-500" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        <MarkdownRenderer content={content} targetLanguage={targetLanguage} onSpeak={handleSpeak} />
      </div>
    </div>
  );
}
