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
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(cleanWord);
  const isMultiSyllable = syllables.length > 1;

  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  // Click on individual syllable — pronounce THAT SYLLABLE via gpt-4o-mini-tts
  const onSyllableClick = useCallback(async (syl: string, idx: number) => {
    if (playing) return;
    setActiveIndex(idx);
    await speakSyllable(syl, cleanWord);
    setTimeout(() => setActiveIndex(-1), 500);
  }, [playing, speakSyllable, cleanWord]);

  // "По слогам" — animate through all syllables with audio for each
  const playSyllables = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setDone(false);

    if (isMultiSyllable) {
      for (let i = 0; i < syllables.length; i++) {
        setActiveIndex(i);
        await speakSyllable(syllables[i], cleanWord);
        await new Promise(r => setTimeout(r, syllableDelay));
      }
      setActiveIndex(-1);
      await new Promise(r => setTimeout(r, 400));
    }

    // Whole word
    setActiveIndex(-2);
    await speakWord(cleanWord);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
  }, [syllables, cleanWord, playing, isMultiSyllable, speakWord, speakSyllable, syllableDelay]);

  // "Целиком"
  const playWhole = useCallback(async () => {
    if (playing) return;
    setActiveIndex(-2);
    await speakWord(cleanWord);
    setActiveIndex(-1);
  }, [playing, speakWord, cleanWord]);

  return (
    <div className="text-center">
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'} role="img">{emoji}</span>}

      {/* Syllables — each clickable */}
      <div className="flex items-center justify-center gap-1 my-3 flex-wrap">
        {syllables.map((syl, i) => {
          const isActive = activeIndex === i;
          const isAllGreen = activeIndex === -2;
          const isPast = activeIndex > i || isAllGreen;

          return (
            <span key={i} className="flex items-center">
              <motion.button
                onClick={() => isMultiSyllable ? onSyllableClick(syl, i) : playWhole()}
                animate={isActive ? { scale: 1.3, y: -8 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`${textSize} font-bold word-display px-3 py-1 rounded-lg transition-colors duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-success text-white shadow-lg'
                    : isPast || done
                    ? 'text-success hover:bg-success/10'
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
        })}
      </div>

      {translation && (
        <p className={`text-gray-500 ${size === 'lg' ? 'text-xl' : 'text-base'} mb-3`}>{translation}</p>
      )}

      {/* Buttons — ALWAYS show both */}
      {showButton && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={playSyllables} disabled={playing}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
              playing ? 'bg-success/20 text-success' : 'bg-primary text-white hover:bg-primary/90'
            }`}>
            {playing ? (
              <><div className="w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin" /> {isMultiSyllable ? 'По слогам...' : 'Медленно...'}</>
            ) : (
              <><BookOpen size={14} /> {isMultiSyllable ? 'По слогам' : 'Медленно'}</>
            )}
          </button>
          <button onClick={playWhole}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm bg-secondary text-white hover:bg-secondary/90">
            <Volume2 size={14} /> Целиком
          </button>
        </div>
      )}
    </div>
  );
}
