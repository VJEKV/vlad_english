import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { getSyllables } from '../../content/syllables';

interface Props {
  word: string;
  translation?: string;
  emoji?: string;
  size?: 'sm' | 'md' | 'lg';
  showButton?: boolean;
}

export default function SyllableWord({ word, translation, emoji, size = 'md', showButton = true }: Props) {
  const { speakWord } = useTTS();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(cleanWord);
  const isMultiSyllable = syllables.length > 1;

  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';
  const syllableGap = size === 'lg' ? 'gap-2' : size === 'md' ? 'gap-1.5' : 'gap-1';

  // Play syllable by syllable then whole word
  const playSyllables = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setDone(false);

    if (isMultiSyllable) {
      // Syllable by syllable
      for (let i = 0; i < syllables.length; i++) {
        setActiveIndex(i);
        await speakWord(syllables[i]);
        await new Promise(r => setTimeout(r, 400));
      }

      // Pause then whole word
      setActiveIndex(-1);
      await new Promise(r => setTimeout(r, 500));
    }

    // Whole word
    setActiveIndex(-2); // -2 = all green
    await speakWord(cleanWord);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
  }, [syllables, cleanWord, playing, isMultiSyllable, speakWord]);

  return (
    <div className="text-center">
      {/* Emoji */}
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'}>{emoji}</span>}

      {/* Syllable display */}
      <div className={`flex items-center justify-center ${syllableGap} my-3 flex-wrap`}>
        {syllables.map((syl, i) => {
          const isActive = activeIndex === i;
          const isAllGreen = activeIndex === -2;
          const isPast = activeIndex > i || isAllGreen;

          return (
            <span key={i} className="flex items-center">
              <motion.span
                animate={isActive ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`${textSize} font-bold word-display px-2 py-1 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-success text-white shadow-lg'
                    : isPast || done
                    ? 'text-success'
                    : 'text-gray-700'
                }`}
              >
                {syl}
              </motion.span>
              {/* Dot separator between syllables */}
              {i < syllables.length - 1 && (
                <span className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} text-gray-300 mx-0.5`}>·</span>
              )}
            </span>
          );
        })}
      </div>

      {/* Translation */}
      {translation && (
        <p className={`text-gray-500 ${size === 'lg' ? 'text-xl' : 'text-sm'} mb-3`}>{translation}</p>
      )}

      {/* Play button */}
      {showButton && (
        <button
          onClick={playSyllables}
          disabled={playing}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            playing
              ? 'bg-success/20 text-success'
              : done
              ? 'bg-success/10 text-success hover:bg-success/20'
              : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          {playing ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-success border-t-transparent rounded-full animate-spin" />
              {isMultiSyllable ? 'По слогам...' : 'Слушаю...'}
            </>
          ) : (
            <>
              <Volume2 size={15} />
              {isMultiSyllable
                ? done ? 'Ещё раз по слогам' : 'Читать по слогам'
                : done ? 'Ещё раз' : 'Послушать'}
            </>
          )}
        </button>
      )}
    </div>
  );
}
