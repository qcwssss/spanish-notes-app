'use client';

import React from 'react';
import { useAudioParser } from '../hooks/useAudioParser';
import { useTTS } from '../hooks/useTTS';

export default function NotePlayer({ content }: { content: string }) {
  const parsedContent = useAudioParser(content);
  const { voices, selectedVoiceIndex, setSelectedVoiceIndex, speak } = useTTS();

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
        {parsedContent.map((block, idx) => {
          if (block.type === 'heading') {
            return (
              <div 
                key={idx}
                onClick={() => handleSpeak(block.content as string)}
                className="cursor-pointer group flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500/10 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  ▶
                </div>
                <h3 className="text-lg font-medium text-slate-200 group-hover:text-blue-300">
                  {block.content as string}
                </h3>
              </div>
            );
          }

          if (block.type === 'text-block') {
            const data = block.content as { spanish: string, chinese: string };
            return (
              <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                <p 
                  onClick={() => handleSpeak(data.spanish)}
                  className="text-lg text-slate-200 mb-1 cursor-pointer hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  <span className="opacity-50 text-sm">🇪🇸</span> {data.spanish}
                </p>
                <p className="text-sm text-slate-500 pl-7">
                  {data.chinese}
                </p>
              </div>
            );
          }

          if (block.type === 'table') {
            const data = block.content as { headers: string[], rows: string[][] };
            return (
              <div key={idx} className="overflow-hidden rounded-lg border border-slate-700">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-800 text-slate-400">
                    <tr>
                      {data.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-4 py-2 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700 bg-slate-900/30">
                    {data.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-800/50">
                        {row.map((cell, cIdx) => (
                          <td 
                            key={cIdx} 
                            className={`px-4 py-3 ${cIdx === 0 ? 'cursor-pointer text-blue-300 hover:text-blue-400 font-medium' : 'text-slate-300'}`}
                            onClick={() => cIdx === 0 && handleSpeak(cell)}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          return <p key={idx} className="text-slate-500">{block.content as string}</p>;
        })}
      </div>
    </div>
  );
}
