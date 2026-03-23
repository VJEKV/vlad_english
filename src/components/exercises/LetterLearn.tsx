import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import type { LetterData } from '../../content/phonicsLessons';

interface Props {
  letters: LetterData[];
  onComplete: () => void;
}

export default function LetterLearn({ letters, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const { speakLetter, speakWord } = useTTS();
  const letter = letters[current];

  // Is this a single letter (a, b, c) or a pattern (sh, th, a_e, ee, ar)?
  const isPattern = letter.letter.length > 1;

  const handleListen = async () => {
    if (isPattern) {
      // For patterns: speak the example word slowly
      await speakWord(letter.word);
    } else {
      // For single letters: speak the letter sound, then word
      await speakLetter(letter.letter);
      await new Promise((r) => setTimeout(r, 500));
      await speakWord(letter.word);
    }
  };

  const handleNext = () => {
    if (current < letters.length - 1) {
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  // Format pattern for display: "a_e" → "a · e", "sh" → "SH", "ee" → "EE"
  const formatPattern = (pat: string) => {
    if (pat.includes('_')) {
      const parts = pat.split('_');
      return parts.map(p => p.toUpperCase()).join(' _ ');
    }
    return pat.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-2">
        {isPattern ? 'Правило' : 'Буква'} {current + 1} из {letters.length}
      </p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
        <div className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${((current + 1) / letters.length) * 100}%` }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${letter.letter}-${current}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="flex flex-col items-center"
        >
          {isPattern ? (
            // === PATTERN VIEW (sh, th, a_e, ee, ar, etc.) ===
            <>
              {/* Pattern display */}
              <div className="bg-white rounded-2xl shadow-md p-6 mb-4 text-center min-w-[280px]">
                <p className="text-6xl font-bold text-primary font-display mb-2">
                  {formatPattern(letter.letter)}
                </p>
                <p className="text-xl text-gray-400">{letter.sound}</p>
              </div>

              {/* Listen button */}
              <button onClick={handleListen}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-xl font-bold hover:bg-primary/90 mb-6 shadow-lg">
                <Volume2 size={28} /> Послушай
              </button>

              {/* Word card with pattern highlighted */}
              <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 mb-6 min-w-[280px]">
                <span className="text-5xl">{letter.emoji}</span>
                <div>
                  <button onClick={() => speakWord(letter.word)}
                    className="text-3xl font-bold text-gray-800 hover:text-primary word-display">
                    {highlightPattern(letter.word, letter.letter)}
                  </button>
                  <p className="text-lg text-gray-400">{letter.wordRu}</p>
                </div>
              </div>

              {/* Magic E explanation for a_e, i_e, etc. */}
              {letter.letter.includes('_') && (
                <div className="bg-yellow-50 rounded-xl p-4 mb-6 max-w-sm text-center">
                  <p className="text-sm text-gray-600">
                    ✨ <b>Magic E</b> — буква E в конце слова не читается,
                    но делает гласную <b>{letter.letter.split('_')[0].toUpperCase()}</b> длинной!
                  </p>
                </div>
              )}
            </>
          ) : (
            // === SINGLE LETTER VIEW (a, b, c, etc.) ===
            <>
              <div className="flex items-center gap-6 mb-6">
                <span className="text-[120px] font-bold text-primary leading-none font-display">
                  {letter.letter.toUpperCase()}
                </span>
                <span className="text-[80px] font-bold text-primary/50 leading-none font-display">
                  {letter.letter}
                </span>
              </div>

              <p className="text-2xl text-gray-400 mb-6">{letter.sound}</p>

              <button onClick={handleListen}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl text-xl font-bold hover:bg-primary/90 mb-8 shadow-lg">
                <Volume2 size={28} /> Послушай
              </button>

              <div className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 mb-8">
                <span className="text-6xl">{letter.emoji}</span>
                <div>
                  <button onClick={() => speakWord(letter.word)}
                    className="text-3xl font-bold text-gray-800 hover:text-primary word-display">
                    {letter.word}
                  </button>
                  <p className="text-lg text-gray-400">{letter.wordRu}</p>
                </div>
              </div>
            </>
          )}

          <button onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-success text-white rounded-2xl text-lg font-bold hover:bg-success/90">
            {current < letters.length - 1 ? 'Дальше' : 'Готово!'}
            <ChevronRight size={22} />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Highlight the pattern in the word with color
function highlightPattern(word: string, pattern: string): React.ReactNode {
  if (pattern.includes('_')) {
    // Magic E pattern: a_e in cake → c[a]k[e]
    const vowel = pattern.split('_')[0];
    const chars = word.split('');
    const vowelIdx = chars.findIndex(c => c.toLowerCase() === vowel);
    const eIdx = chars.length - 1; // E is always last

    return (
      <span>
        {chars.map((c, i) => {
          if (i === vowelIdx || (i === eIdx && c.toLowerCase() === 'e')) {
            return <span key={i} className="text-primary">{c}</span>;
          }
          return <span key={i}>{c}</span>;
        })}
      </span>
    );
  }

  // Digraph/blend: highlight the pattern in word
  const lower = word.toLowerCase();
  const idx = lower.indexOf(pattern.toLowerCase());
  if (idx >= 0) {
    return (
      <span>
        {word.slice(0, idx)}
        <span className="text-primary">{word.slice(idx, idx + pattern.length)}</span>
        {word.slice(idx + pattern.length)}
      </span>
    );
  }

  return word;
}
