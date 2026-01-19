import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTTS } from './useTTS';

const voices = [
  { name: 'Voice A', lang: 'es-ES', localService: true, voiceURI: 'voice-a' },
  { name: 'Voice B', lang: 'es-MX', localService: true, voiceURI: 'voice-b' },
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
  });

  it('uses stored voice selection when available', async () => {
    window.localStorage.setItem('ttsVoiceURI', 'voice-b');

    const { result } = renderHook(() => useTTS());

    await waitFor(() => {
      expect(result.current.selectedVoiceIndex).toBe(1);
    });
  });

  it('persists voice selection changes', async () => {
    const setItemSpy = vi.spyOn(window.localStorage.__proto__, 'setItem');

    const { result } = renderHook(() => useTTS());

    await waitFor(() => {
      expect(result.current.voices.length).toBe(2);
    });

    act(() => {
      result.current.setSelectedVoiceIndex(1);
    });

    expect(setItemSpy).toHaveBeenCalledWith('ttsVoiceURI', 'voice-b');
  });
});
