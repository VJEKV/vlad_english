import { useCallback, useRef, useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type TTSSpeed = 'slow' | 'normal' | 'fast';

// Edge TTS rate strings for each speed
const EDGE_RATES: Record<TTSSpeed, { letter: string; word: string; sentence: string }> = {
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

// Check if running in Electron with edge-tts support
function hasEdgeTTS(): boolean {
  return !!(window.electronAPI?.tts);
}

// Play mp3 file from path (Electron only)
function playFile(filePath: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // Convert file path to file:// URL for audio element
    const url = `file://${filePath}`;
    const audio = new Audio(url);
    audio.volume = volume;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error('Audio playback failed'));
    audio.play().catch(reject);
  });
}

// Web Speech API fallback
function speakWebAPI(text: string, lang: string, rate: number, volume: number): Promise<void> {
  return new Promise((resolve) => {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
    u.rate = rate;
    u.pitch = lang === 'en' ? 1.05 : 1.0;
    u.volume = volume;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function useTTS() {
  const speakingRef = useRef(false);
  const speed = useSettingsStore((s) => s.ttsSpeed) as TTSSpeed || 'slow';
  const volume = useSettingsStore((s) => s.volume);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  // Core speak function — tries edge-tts first, falls back to Web Speech
  const speak = useCallback(async (text: string, lang: 'en' | 'ru', speedKey: 'letter' | 'word' | 'sentence'): Promise<void> => {
    if (speakingRef.current) stop();
    speakingRef.current = true;

    try {
      if (hasEdgeTTS()) {
        const rate = EDGE_RATES[speed][speedKey];
        const filePath = await window.electronAPI!.tts.speak(text, lang, rate);
        if (filePath) {
          await playFile(filePath, volume);
          speakingRef.current = false;
          return;
        }
      }
    } catch (e) {
      console.warn('Edge TTS failed, falling back to Web Speech:', e);
    }

    // Fallback: Web Speech API
    const rate = WEB_RATES[speed][speedKey];
    await speakWebAPI(text, lang, rate, volume);
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
