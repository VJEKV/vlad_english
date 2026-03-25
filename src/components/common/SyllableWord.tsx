import { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
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
  const { speakWord } = useTTS();
  const syllableDelay = useSettingsStore((s) => s.syllableDelay);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const cleanWord = word.replace(/[.,!?;:'"()]/g, '');
  const syllables = getSyllables(cleanWord);
  const isMultiSyllable = syllables.length > 1;

  const textSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  // Syllable reading: visual highlight step by step + whole word audio
  const playSyllables = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setDone(false);

    if (isMultiSyllable) {
      // Step 1: Visual highlight of each syllable (no audio per syllable!)
      for (let i = 0; i < syllables.length; i++) {
        setActiveIndex(i);
        await new Promise(r => setTimeout(r, syllableDelay));
      }
      // Brief pause after visual walkthrough
      setActiveIndex(-1);
      await new Promise(r => setTimeout(r, 300));
    }

    // Step 2: Whole word — SLOW (quality TTS via OpenAI/edge-tts)
    setActiveIndex(-2); // all green
    await speakWord(cleanWord);

    // Step 3: Brief pause then normal speed
    await new Promise(r => setTimeout(r, 400));
    setActiveIndex(-2);
    await speakWord(cleanWord);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
  }, [syllables, cleanWord, playing, isMultiSyllable, speakWord, syllableDelay]);

  // Click on word = just speak it (no syllable animation)
  const quickSpeak = useCallback(() => {
    if (!playing) speakWord(cleanWord);
  }, [playing, speakWord, cleanWord]);

  return (
    <div className="text-center">
      {emoji && <span className={size === 'lg' ? 'text-6xl' : 'text-4xl'} role="img">{emoji}</span>}

      {/* Syllable display — click to hear whole word */}
      <div className="flex items-center justify-center gap-1 my-3 flex-wrap cursor-pointer" onClick={quickSpeak}>
        {syllables.map((syl, i) => {
          const isActive = activeIndex === i;
          const isAllGreen = activeIndex === -2;
          const isPast = activeIndex > i || isAllGreen;

          return (
            <span key={i} className="flex items-center">
              <motion.span
                animate={isActive ? { scale: 1.3, y: -8 } : { scale: 1, y: 0 }}
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

      {showButton && isMultiSyllable && (
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
              {done ? 'Ещё раз' : 'По слогам'}
            </>
          )}
        </button>
      )}

      {showButton && !isMultiSyllable && (
        <button onClick={quickSpeak}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90">
          <Volume2 size={15} /> Послушать
        </button>
      )}
    </div>
  );
}
