import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTTS } from '@/hooks/useTTS';

const voices = [
  { name: 'Voice A', lang: 'es-ES', localService: true, voiceURI: 'voice-a' },
  { name: 'Voice B', lang: 'es-MX', localService: true, voiceURI: 'voice-b' },
  { name: 'Voice C', lang: 'fr-FR', localService: true, voiceURI: 'voice-c' },
];

describe('useTTS', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.speechSynthesis = {
      getVoices: vi.fn(() => voices as unknown as SpeechSynthesisVoice[]),
      cancel: vi.fn(),
      speak: vi.fn(),
      onvoiceschanged: null,
    } as unknown as SpeechSynthesis;
    window.localStorage.clear();
    (global as { SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance }).SpeechSynthesisUtterance = function (
      this: SpeechSynthesisUtterance,
      text: string
    ) {
      this.text = text;
    } as unknown as typeof SpeechSynthesisUtterance;
  });

  it('uses stored voice selection when available', async () => {
    window.localStorage.setItem('ttsVoiceURI:es', 'voice-b');

    const { result } = renderHook(() => useTTS('es'));

    await waitFor(() => {
      expect(result.current.selectedVoiceIndex).toBe(1);
    });
  });

  it('persists voice selection changes', async () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');

    const { result } = renderHook(() => useTTS('es'));

    await waitFor(() => {
      expect(result.current.voices.length).toBe(2);
    });

    act(() => {
      result.current.setSelectedVoiceIndex(1);
    });

    expect(setItemSpy).toHaveBeenCalledWith('ttsVoiceURI:es', 'voice-b');
  });

  it('filters available voices based on target language', async () => {
    const { result } = renderHook(() => useTTS('fr'));

    await waitFor(() => {
      expect(result.current.voices.length).toBe(1);
    });

    expect(result.current.voices[0].lang).toBe('fr-FR');
  });

  it('skips speaking when no target language content', async () => {
    const { result } = renderHook(() => useTTS('es'));

    await waitFor(() => {
      expect(result.current.supported).toBe(true);
    });

    act(() => {
      result.current.speak('我是中文');
    });

    expect(window.speechSynthesis.speak).not.toHaveBeenCalled();
  });
});
