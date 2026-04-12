import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, BookOpen } from 'lucide-react';
import { getSyllables } from '../../content/syllables';
import { playWord, playSyllable, stopAudio } from '../../audio/player';
import { useTTS } from '../../hooks/useTTS';
import { useSettingsStore } from '../../store/useSettingsStore';

interface Props {
  word: string;
  translation?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays a word with syllable mode toggle.
 * Default: whole word. Click "По слогам" → shows syllables with animation.
 * Uses pre-generated mp3 files (instant playback).
 * Falls back to TTS API if mp3 not found.
 */
export default function SyllableDisplay({ word, translation, emoji, size = 'lg' }: Props) {
  const { speakWord, speakSyllable } = useTTS();
  const syllableDelay = useSettingsStore(s => s.syllableDelay);
  const [mode, setMode] = useState<'whole' | 'syllables'>('whole');
  const [activeIdx, setActiveIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);

  const clean = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(clean);
  const isMulti = syllables.length > 1;
  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  // Play word from local mp3, fallback to API
  const playWordAudio = useCallback(async (w: string) => {
    try { await playWord(w); } catch { await speakWord(w); }
  }, [speakWord]);

  // Play syllable from local mp3, fallback to API
  const playSylAudio = useCallback(async (syl: string, fullWord: string) => {
    try { await playSyllable(syl, fullWord); } catch { await speakSyllable(syl, fullWord); }
  }, [speakSyllable]);

  // Click syllable → play just that syllable
  const onSylClick = useCallback(async (syl: string, idx: number) => {
    if (playing) return;
    setActiveIdx(idx);
    await playSylAudio(syl, clean);
    setTimeout(() => setActiveIdx(-1), 400);
  }, [playing, playSylAudio, clean]);

  // "По слогам" button
  const handleSyllableMode = useCallback(async () => {
    setMode('syllables');
    if (playing) { stopAudio(); setPlaying(false); setActiveIdx(-1); return; }
    setPlaying(true);
    if (isMulti) {
      for (let i = 0; i < syllables.length; i++) {
        setActiveIdx(i);
        await playSylAudio(syllables[i], clean);
        await new Promise(r => setTimeout(r, syllableDelay));
      }
      setActiveIdx(-1);
      await new Promise(r => setTimeout(r, 300));
    }
    setActiveIdx(-2); // all green
    await playWordAudio(clean);
    setActiveIdx(-1);
    setPlaying(false);
  }, [syllables, clean, playing, isMulti, playWordAudio, playSylAudio, syllableDelay]);

  // "Целиком" button
  const handleWholeMode = useCallback(async () => {
    setMode('whole');
    if (playing) { stopAudio(); setPlaying(false); setActiveIdx(-1); return; }
    setPlaying(true);
    setActiveIdx(-2);
    await playWordAudio(clean);
    setActiveIdx(-1);
    setPlaying(false);
  }, [playing, playWordAudio, clean]);

  return (
    <div className="text-center">
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'} role="img">{emoji}</span>}

      {/* Word display */}
      <div className="flex items-center justify-center gap-1 my-3 flex-wrap">
        {mode === 'whole' ? (
          <button onClick={handleWholeMode}
            className={`${textSize} font-bold word-display px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeIdx === -2 ? 'text-success' : 'text-gray-700 hover:text-primary'
            }`}>
            {clean}
          </button>
        ) : (
          syllables.map((syl, i) => (
            <span key={i} className="flex items-center">
              <motion.button
                onClick={() => isMulti ? onSylClick(syl, i) : handleWholeMode()}
                animate={activeIdx === i ? { scale: 1.3, y: -8 } : activeIdx === -2 ? { scale: 1.05 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`${textSize} font-bold word-display px-3 py-1 rounded-lg cursor-pointer transition-colors duration-300 ${
                  activeIdx === i ? 'bg-success text-white shadow-lg'
                  : activeIdx === -2 || activeIdx > i ? 'text-success'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}>
                {syl}
              </motion.button>
              {i < syllables.length - 1 && <span className="text-3xl text-gray-300 mx-0.5">·</span>}
            </span>
          ))
        )}
      </div>

      {translation && <p className={`text-gray-500 ${size === 'lg' ? 'text-xl' : 'text-base'} mb-3`}>{translation}</p>}

      {/* Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={handleSyllableMode} disabled={playing && mode !== 'syllables'}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            mode === 'syllables' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          {playing && mode === 'syllables'
            ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />По слогам</>
            : <><BookOpen size={14} className="inline mr-1" />По слогам</>}
        </button>
        <button onClick={handleWholeMode} disabled={playing && mode !== 'whole'}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            mode === 'whole' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}>
          <Volume2 size={14} className="inline mr-1" />Целиком
        </button>
      </div>
    </div>
  );
}
