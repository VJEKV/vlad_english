import { useCallback, useRef } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export type TTSSpeed = 'slow' | 'normal' | 'fast';

const RATES: Record<TTSSpeed, { letter: string; word: string; sentence: string }> = {
  slow:   { letter: '-50%', word: '-30%', sentence: '-15%' },
  normal: { letter: '-20%', word: '+0%',  sentence: '+0%' },
  fast:   { letter: '+0%',  word: '+15%', sentence: '+20%' },
};

// Play audio from URL (tts:// custom protocol or data URL)
function playAudioUrl(url: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.onended = () => resolve();
    audio.onerror = (e) => { console.warn('[TTS] playback error:', url.slice(0, 30), e); reject(new Error('playback error')); };
    audio.play().catch((e) => { console.warn('[TTS] play() rejected:', e); reject(e); });
  });
}

// Web Speech API — last resort fallback (works offline, sounds robotic)
function webSpeech(text: string, lang: string, rate: number, vol: number): Promise<void> {
  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
      u.rate = rate;
      u.volume = vol;
      const t = setTimeout(() => resolve(), Math.max(2000, text.length * 150));
      u.onend = () => { clearTimeout(t); resolve(); };
      u.onerror = () => { clearTimeout(t); resolve(); };
      speechSynthesis.speak(u);
    } catch { resolve(); }
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

  // Main speak function: Electron TTS → Web Speech fallback
  const speak = useCallback(async (text: string, lang: 'en' | 'ru', rateKey: 'letter' | 'word' | 'sentence'): Promise<void> => {
    if (!text?.trim()) return;
    if (speakingRef.current) stop();
    speakingRef.current = true;

    const rate = RATES[speed][rateKey];

    // Try Electron TTS (OpenAI Nova / Edge-TTS → base64 data URL)
    if (window.electronAPI?.tts) {
      try {
        const audioUrl = await window.electronAPI.tts.speak(text, lang, rate);
        if (audioUrl) {
          await playAudioUrl(audioUrl, volume);
          speakingRef.current = false;
          return;
        }
      } catch (e) {
        console.warn('[TTS] Electron failed:', e);
      }
    }

    // Fallback: Web Speech API
    const webRate = rateKey === 'letter' ? 0.4 : rateKey === 'word' ? 0.6 : 0.8;
    await webSpeech(text, lang, webRate, volume);
    speakingRef.current = false;
  }, [stop, speed, volume]);

  const speakLetter = useCallback((l: string) => speak(l, 'en', 'letter'), [speak]);
  const speakWord = useCallback((w: string) => speak(w, 'en', 'word'), [speak]);
  const speakSentence = useCallback((s: string) => speak(s, 'en', 'sentence'), [speak]);
  const speakRu = useCallback((s: string) => speak(s, 'ru', 'sentence'), [speak]);

  // Syllable: same as word but will be cached from pregeneration
  const speakSyllable = useCallback((s: string) => speak(s, 'en', 'word'), [speak]);

  const spellWord = useCallback(async (word: string) => {
    stop();
    for (const ch of word.toLowerCase()) {
      if (ch === ' ') continue;
      await speakLetter(ch);
      await new Promise((r) => setTimeout(r, 500));
    }
    await new Promise((r) => setTimeout(r, 400));
    await speakWord(word);
  }, [stop, speakLetter, speakWord]);

  return { speakLetter, speakWord, speakSentence, speakRu, speakSyllable, spellWord, stop, speaking: speakingRef };
}
