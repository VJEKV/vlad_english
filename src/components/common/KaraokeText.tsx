import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Play, Square } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { useSettingsStore } from '../../store/useSettingsStore';

interface Props {
  sentence: string;
  translation?: string;
  onComplete?: () => void;
  large?: boolean;  // enlarged text for reading mode
}

export default function KaraokeText({ sentence, translation, onComplete, large }: Props) {
  const { speakSentence, stop: stopTTS } = useTTS();
  const syllableDelay = useSettingsStore((s) => s.syllableDelay);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  const words = sentence.split(/\s+/);
  const textSize = large ? 'text-2xl' : 'text-lg';

  const playKaraoke = useCallback(async () => {
    if (playing) { stopTTS(); setPlaying(false); setActiveIndex(-1); return; }
    setPlaying(true);
    setDone(false);

    // Step 1: Visual highlight word by word (no per-word audio!)
    for (let i = 0; i < words.length; i++) {
      setActiveIndex(i);
      await new Promise(r => setTimeout(r, syllableDelay));
    }

    // Step 2: All green + full sentence audio (quality TTS)
    setActiveIndex(-2);
    await speakSentence(sentence);

    setActiveIndex(-1);
    setPlaying(false);
    setDone(true);
    onComplete?.();
  }, [words, sentence, speakSentence, stopTTS, playing, onComplete, syllableDelay]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      {/* Sentence with karaoke highlight */}
      <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2 min-h-[32px] items-center">
        {words.map((word, i) => {
          const isActive = activeIndex === i;
          const isAllActive = activeIndex === -2;
          const isPast = activeIndex > i || isAllActive;

          return (
            <motion.span
              key={i}
              animate={isActive ? { scale: large ? 1.15 : 1.1 } : { scale: 1 }}
              className={`${textSize} font-bold transition-colors duration-200 px-1 py-0.5 rounded ${
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

      {translation && <p className="text-sm text-gray-400 mb-2">{translation}</p>}

      <button
        onClick={playKaraoke}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-colors ${
          playing
            ? 'bg-error/10 text-error'
            : done
            ? 'bg-success/10 text-success hover:bg-success/20'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {playing ? <><Square size={12} /> Стоп</> : done ? <><Volume2 size={12} /> Ещё раз</> : <><Play size={12} /> Читать</>}
      </button>
    </div>
  );
}
