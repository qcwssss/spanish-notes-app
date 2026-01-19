import { useState, useCallback, useEffect } from 'react';

export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
}

const TTS_VOICE_STORAGE_KEY = 'ttsVoiceURI';

export const useTTS = () => {
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  // Initialize voices
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== 'undefined' && !!window.speechSynthesis);

    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return;
    }

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      // Filter for Spanish voices
      const spanishVoices = allVoices.filter(v => v.lang.startsWith('es'));
      
      const formattedVoices = spanishVoices.map(v => ({
        name: v.name,
        lang: v.lang,
        localService: v.localService,
        voiceURI: v.voiceURI
      }));

      setVoices(formattedVoices);

      const savedVoiceUri = window.localStorage.getItem(TTS_VOICE_STORAGE_KEY);
      const savedIndex = savedVoiceUri
        ? spanishVoices.findIndex((voice) => voice.voiceURI === savedVoiceUri)
        : -1;

      if (savedIndex !== -1) {
        setSelectedVoiceIndex(savedIndex);
        return;
      }

      // Auto-select best voice (Monica, Google, or MX)
      const bestIndex = spanishVoices.findIndex(v => 
        v.name.includes('Monica') || 
        v.name.includes('Google') || 
        v.lang === 'es-MX'
      );
      
      if (bestIndex !== -1) {
        setSelectedVoiceIndex(bestIndex);
      }
    };

    loadVoices();
    
    // Chrome requires this event listener
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || voices.length === 0) {
      return;
    }

    const selectedVoice = voices[selectedVoiceIndex];

    if (selectedVoice) {
      window.localStorage.setItem(TTS_VOICE_STORAGE_KEY, selectedVoice.voiceURI);
    }
  }, [selectedVoiceIndex, voices]);

  const speak = useCallback((text: string) => {
    if (!supported) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const availableVoices = window.speechSynthesis.getVoices().filter(v => v.lang.startsWith('es'));
    
    if (availableVoices.length > 0) {
      utterance.voice = availableVoices[selectedVoiceIndex] || availableVoices[0];
    } else {
      utterance.lang = 'es-ES'; // Fallback
    }
    
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [supported, selectedVoiceIndex]);

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
