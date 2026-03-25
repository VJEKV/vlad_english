import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
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
  const { speakWord, speakSyllable } = useTTS();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(cleanWord);
  const isMultiSyllable = syllables.length > 1;

  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  const playSyllables = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setDone(false);

    if (isMultiSyllable) {
      // Syllable by syllable — fast Web Speech API
      for (let i = 0; i < syllables.length; i++) {
        setActiveIndex(i);
        await speakSyllable(syllables[i]);
        await new Promise(r => setTimeout(r, 500));
      }

      setActiveIndex(-1);
      await new Promise(r => setTimeout(r, 600));
    }

    // Whole word — high quality TTS (OpenAI/edge-tts)
    setActiveIndex(-2);
    await speakWord(cleanWord);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
  }, [syllables, cleanWord, playing, isMultiSyllable, speakWord, speakSyllable]);

  return (
    <div className="text-center">
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'} role="img">{emoji}</span>}

      {/* Syllable display */}
      <div className="flex items-center justify-center gap-1 my-3 flex-wrap">
        {syllables.map((syl, i) => {
          const isActive = activeIndex === i;
          const isAllGreen = activeIndex === -2;
          const isPast = activeIndex > i || isAllGreen;

          return (
            <span key={i} className="flex items-center">
              <motion.span
                animate={isActive ? { scale: 1.25, y: -6 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className={`${textSize} font-bold word-display px-2 py-1 rounded-lg transition-colors duration-300 ${
                  isActive
                    ? 'bg-success text-white shadow-lg'
                    : isPast || done
                    ? 'text-success'
                    : 'text-gray-700'
                }`}
              >
                {syl}
              </motion.span>
              {i < syllables.length - 1 && (
                <span className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} text-gray-300 mx-1`}>·</span>
              )}
            </span>
          );
        })}
      </div>

      {translation && (
        <p className={`text-gray-500 ${size === 'lg' ? 'text-xl' : 'text-sm'} mb-3`}>{translation}</p>
      )}

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
              По слогам...
            </>
          ) : (
            <>
              <Volume2 size={15} />
              {isMultiSyllable
                ? done ? 'Ещё раз' : 'Читать по слогам'
                : done ? 'Ещё раз' : 'Послушать'}
            </>
          )}
        </button>
      )}
    </div>
  );
}
