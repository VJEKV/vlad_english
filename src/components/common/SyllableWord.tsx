import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, BookOpen } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getSyllables } from '../../content/syllables';

interface Props {
  word: string;
  translation?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
}

export default function SyllableWord({ word, translation, emoji, size = 'md', showButton = true }: Props) {
  const { speakWord, speakSyllable } = useTTS();
  const syllableDelay = useSettingsStore((s) => s.syllableDelay);
  // Default mode: whole word
  const [mode, setMode] = useState<'whole' | 'syllables'>('whole');
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(cleanWord);
  const isMultiSyllable = syllables.length > 1;
  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  // Click syllable → pronounce that syllable
  const onSyllableClick = useCallback(async (syl: string, idx: number) => {
    if (playing) return;
    setActiveIndex(idx);
    await speakSyllable(syl, cleanWord);
    setTimeout(() => setActiveIndex(-1), 400);
  }, [playing, speakSyllable, cleanWord]);

  // "По слогам" button — switch mode + animate + play
  const handleSyllableMode = useCallback(async () => {
    setMode('syllables');
    if (playing) return;
    setPlaying(true);

    if (isMultiSyllable) {
      for (let i = 0; i < syllables.length; i++) {
        setActiveIndex(i);
        await speakSyllable(syllables[i], cleanWord);
        await new Promise(r => setTimeout(r, syllableDelay));
      }
      setActiveIndex(-1);
      await new Promise(r => setTimeout(r, 300));
    }

    // Whole word at end
    setActiveIndex(-2);
    await speakWord(cleanWord);
    setActiveIndex(-1);
    setPlaying(false);
  }, [syllables, cleanWord, playing, isMultiSyllable, speakWord, speakSyllable, syllableDelay]);

  // "Целиком" button — switch mode + play whole word
  const handleWholeMode = useCallback(async () => {
    setMode('whole');
    if (playing) return;
    setPlaying(true);
    setActiveIndex(-2);
    await speakWord(cleanWord);
    setActiveIndex(-1);
    setPlaying(false);
  }, [playing, speakWord, cleanWord]);

  return (
    <div className="text-center">
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'} role="img">{emoji}</span>}

      {/* Word display — depends on mode */}
      <div className="flex items-center justify-center gap-1 my-3 flex-wrap">
        {mode === 'whole' ? (
          // WHOLE MODE: single word, clickable
          <motion.button
            onClick={handleWholeMode}
            animate={activeIndex === -2 ? { scale: 1.1 } : { scale: 1 }}
            className={`${textSize} font-bold word-display px-3 py-1 rounded-lg cursor-pointer transition-colors ${
              activeIndex === -2 ? 'text-success' : 'text-gray-700 hover:text-primary'
            }`}
          >
            {cleanWord}
          </motion.button>
        ) : (
          // SYLLABLE MODE: split with dots, each clickable
          syllables.map((syl, i) => {
            const isActive = activeIndex === i;
            const isAllGreen = activeIndex === -2;
            const isPast = activeIndex > i || isAllGreen;

            return (
              <span key={i} className="flex items-center">
                <motion.button
                  onClick={() => onSyllableClick(syl, i)}
                  animate={isActive ? { scale: 1.3, y: -8 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`${textSize} font-bold word-display px-3 py-1 rounded-lg cursor-pointer transition-colors duration-300 ${
                    isActive
                      ? 'bg-success text-white shadow-lg'
                      : isPast
                      ? 'text-success'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {syl}
                </motion.button>
                {i < syllables.length - 1 && (
                  <span className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} text-gray-300 mx-0.5`}>·</span>
                )}
              </span>
            );
          })
        )}
      </div>

      {translation && (
        <p className={`text-gray-500 ${size === 'lg' ? 'text-xl' : 'text-base'} mb-3`}>{translation}</p>
      )}

      {/* Two buttons: По слогам + Целиком */}
      {showButton && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={handleSyllableMode} disabled={playing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              mode === 'syllables' && !playing
                ? 'bg-primary text-white'
                : playing && mode === 'syllables'
                ? 'bg-success/20 text-success'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {playing && mode === 'syllables' ? (
              <><div className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" /> По слогам...</>
            ) : (
              <><BookOpen size={14} /> По слогам</>
            )}
          </button>
          <button onClick={handleWholeMode} disabled={playing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              mode === 'whole' && !playing
                ? 'bg-secondary text-white'
                : playing && mode === 'whole'
                ? 'bg-success/20 text-success'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            <Volume2 size={14} /> Целиком
          </button>
        </div>
      )}
    </div>
  );
}
