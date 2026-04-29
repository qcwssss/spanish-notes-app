import { useState, useCallback, useEffect } from 'react';
import { extractTargetText } from '@/utils/language/extractor';

export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
}

const DEFAULT_LANGUAGE = 'es';
const TTS_VOICE_STORAGE_KEY = 'ttsVoiceURI';
const LANGUAGE_VOICE_PREFIX: Record<string, string> = {
  es: 'es',
  fr: 'fr',
  de: 'de',
  en: 'en',
  pt: 'pt',
  it: 'it',
  nl: 'nl',
};
const LANGUAGE_FALLBACK: Record<string, string> = {
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  en: 'en-US',
  pt: 'pt-PT',
  it: 'it-IT',
  nl: 'nl-NL',
};

export const useTTS = (targetLanguage: string | null = DEFAULT_LANGUAGE) => {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  const languageKey = targetLanguage && LANGUAGE_VOICE_PREFIX[targetLanguage]
    ? targetLanguage
    : DEFAULT_LANGUAGE;
  const voicePrefix = LANGUAGE_VOICE_PREFIX[languageKey];
  const storageKey = `${TTS_VOICE_STORAGE_KEY}:${voicePrefix}`;

  // Initialize voices
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== 'undefined' && !!window.speechSynthesis);

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const filteredVoices = allVoices.filter(v => v.lang.startsWith(voicePrefix));

      const formattedVoices = filteredVoices.map(v => ({
        name: v.name,
        lang: v.lang,
        localService: v.localService,
        voiceURI: v.voiceURI
      }));

      setVoices(formattedVoices);

      const savedVoiceUri = window.localStorage.getItem(storageKey);
      const savedIndex = savedVoiceUri
        ? filteredVoices.findIndex((voice) => voice.voiceURI === savedVoiceUri)
        : -1;

      if (savedIndex !== -1) {
        setSelectedVoiceIndex(savedIndex);
        return;
      }

      const preferredLang = LANGUAGE_FALLBACK[languageKey];
      let bestIndex = filteredVoices.findIndex(v => v.lang === preferredLang && v.localService);

      if (bestIndex === -1) {
        bestIndex = filteredVoices.findIndex(v => v.lang === preferredLang);
      }

      if (bestIndex === -1) {
        bestIndex = filteredVoices.findIndex(v => v.localService);
      }

      if (bestIndex !== -1) {
        setSelectedVoiceIndex(bestIndex);
      }
    };

    loadVoices();
    
    // Chrome requires this event listener
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
    
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, [storageKey, voicePrefix]);

  useEffect(() => {
    if (typeof window === 'undefined' || voices.length === 0) {
      return;
    }

    const selectedVoice = voices[selectedVoiceIndex];

    if (selectedVoice) {
      window.localStorage.setItem(storageKey, selectedVoice.voiceURI);
    }
  }, [selectedVoiceIndex, voices, storageKey]);

  const speak = useCallback((text: string) => {
    if (!supported) return;

    const filteredText = extractTargetText(text, languageKey);

    if (!filteredText) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(filteredText);
    const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith(voicePrefix));

    if (availableVoices.length > 0) {
      utterance.voice = availableVoices[selectedVoiceIndex] || availableVoices[0];
    } else {
      utterance.lang = LANGUAGE_FALLBACK[languageKey] || LANGUAGE_FALLBACK[DEFAULT_LANGUAGE];
    }

    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported, selectedVoiceIndex, languageKey, voicePrefix]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [supported]);

  return {
    voices,
    selectedVoiceIndex,
    setSelectedVoiceIndex,
    speak,
    cancel,
    isSpeaking,
    supported
  };
};
