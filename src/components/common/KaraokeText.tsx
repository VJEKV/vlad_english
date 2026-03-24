import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface Props {
  sentence: string;
  translation?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export default function KaraokeText({ sentence, translation, onComplete }: Props) {
  const { speakWord, speakSentence } = useTTS();
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const words = sentence.split(/\s+/);

  const playKaraoke = useCallback(async () => {
    if (playing) return;
    setPlaying(true);
    setDone(false);

    // Word by word with highlight
    for (let i = 0; i < words.length; i++) {
      setActiveIndex(i);
      const cleanWord = words[i].replace(/[.,!?;:'"()]/g, '');
      if (cleanWord) {
        await speakWord(cleanWord);
        await new Promise(r => setTimeout(r, 300));
      }
    }

    // Pause then full sentence
    setActiveIndex(-1);
    await new Promise(r => setTimeout(r, 500));

    // Highlight all for full sentence
    setActiveIndex(-2); // -2 = all highlighted
    await speakSentence(sentence);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
    onComplete?.();
  }, [words, sentence, speakWord, speakSentence, playing, onComplete]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      {/* Sentence with karaoke highlight */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 mb-3 min-h-[40px] items-center">
        {words.map((word, i) => {
          const isActive = activeIndex === i;
          const isAllActive = activeIndex === -2;
          const isPast = activeIndex > i || isAllActive;

          return (
            <motion.span
              key={i}
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              className={`text-xl font-bold transition-colors duration-200 px-1 py-0.5 rounded ${
                isActive
                  ? 'bg-success text-white shadow-md'
                  : isPast
                  ? 'text-success'
                  : done
                  ? 'text-success/70'
                  : 'text-gray-700'
              }`}
            >
              {word}
            </motion.span>
          );
        })}
      </div>

      {/* Translation */}
      {translation && (
        <p className="text-sm text-gray-400 mb-3">{translation}</p>
      )}

      {/* Play button */}
      <button
        onClick={playKaraoke}
        disabled={playing}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors ${
          playing
            ? 'bg-success/20 text-success cursor-not-allowed'
            : done
            ? 'bg-success/10 text-success hover:bg-success/20'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {playing ? (
          <>
            <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
            Читаю...
          </>
        ) : done ? (
          <>
            <Volume2 size={16} /> Послушать ещё раз
          </>
        ) : (
          <>
            <Play size={16} /> Читать по словам
          </>
        )}
      </button>
    </div>
  );
}
