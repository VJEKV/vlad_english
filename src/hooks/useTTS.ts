import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type TTSSpeed = 'slow' | 'normal' | 'fast';

// Rate strings for Electron TTS (edge-tts / OpenAI)
const TTS_RATES: Record<TTSSpeed, { letter: string; word: string; sentence: string }> = {
  slow:   { letter: '-50%', word: '-40%', sentence: '-25%' },
  normal: { letter: '-20%', word: '-10%', sentence: '+0%' },
  fast:   { letter: '+0%', word: '+10%', sentence: '+20%' },
};

// Web Speech API fallback rates
const WEB_RATES: Record<TTSSpeed, { letter: number; word: number; sentence: number }> = {
  slow:   { letter: 0.3, word: 0.45, sentence: 0.6 },
  normal: { letter: 0.5, word: 0.65, sentence: 0.8 },
  fast:   { letter: 0.7, word: 0.85, sentence: 1.0 },
};

// Play audio from data URL (base64) or file path
function playAudio(dataUrl: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(dataUrl);
    audio.volume = volume;
    audio.onended = () => resolve();
    audio.onerror = (e) => {
      console.warn('Audio playback failed:', e);
      reject(new Error('Audio playback failed'));
    };
    audio.play().catch((e) => {
      console.warn('Audio play() rejected:', e);
      reject(e);
    });
  });
}

// Web Speech API fallback (works without internet)
function speakWebAPI(text: string, lang: string, rate: number, volume: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
      u.rate = rate;
      u.pitch = lang === 'en' ? 1.05 : 1.0;
      u.volume = volume;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      // Timeout safety — if speech doesn't start in 3s, resolve anyway
      const timeout = setTimeout(() => resolve(), Math.max(3000, text.length * 200));
      u.onend = () => { clearTimeout(timeout); resolve(); };
      u.onerror = () => { clearTimeout(timeout); resolve(); };
      speechSynthesis.speak(u);
    } catch {
      resolve();
    }
  });
}

export function useTTS() {
  const speakingRef = useRef(false);
  const speed = useSettingsStore((s) => s.ttsSpeed) as TTSSpeed || 'slow';
  const volume = useSettingsStore((s) => s.volume);

  const stop = useCallback(() => {
    try { speechSynthesis.cancel(); } catch {}
    speakingRef.current = false;
  }, []);

  const speak = useCallback(async (text: string, lang: 'en' | 'ru', speedKey: 'letter' | 'word' | 'sentence'): Promise<void> => {
    if (!text || !text.trim()) return;
    if (speakingRef.current) stop();
    speakingRef.current = true;

    // Try 1: Electron TTS (OpenAI or edge-tts via main process → returns data URL)
    if (window.electronAPI?.tts) {
      try {
        const rate = TTS_RATES[speed][speedKey];
        const dataUrl = await window.electronAPI.tts.speak(text, lang, rate);
        if (dataUrl) {
          try {
            await playAudio(dataUrl, volume);
            speakingRef.current = false;
            return;
          } catch (playErr) {
            console.warn('Audio playback failed, trying Web Speech:', playErr);
          }
        }
      } catch (e) {
        console.warn('Electron TTS failed:', e);
      }
    }

    // Try 2: Web Speech API (always available as fallback)
    try {
      const rate = WEB_RATES[speed][speedKey];
      await speakWebAPI(text, lang, rate, volume);
    } catch {}

    speakingRef.current = false;
  }, [stop, speed, volume]);

  const speakLetter = useCallback((letter: string) => speak(letter, 'en', 'letter'), [speak]);
  const speakWord = useCallback((word: string) => speak(word, 'en', 'word'), [speak]);
  const speakSentence = useCallback((text: string) => speak(text, 'en', 'sentence'), [speak]);
  const speakRu = useCallback((text: string) => speak(text, 'ru', 'sentence'), [speak]);

  const spellWord = useCallback(async (word: string) => {
    stop();
    for (const letter of word.toLowerCase()) {
      if (letter === ' ') continue;
      await speakLetter(letter);
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 400));
    await speakWord(word);
  }, [stop, speakLetter, speakWord]);

  return { speakLetter, speakWord, speakSentence, speakRu, spellWord, stop, speaking: speakingRef };
}
