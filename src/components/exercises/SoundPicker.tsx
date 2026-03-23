import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { shuffle } from '../../content/phonicsLessons';
import type { LetterData } from '../../content/phonicsLessons';
import { ALPHABET_DATA } from '../../content/phonicsLessons';

interface Props {
  letters: LetterData[];
  rounds?: number;
  onComplete: (correct: number, total: number) => void;
}

export default function SoundPicker({ letters, rounds = 5, onComplete }: Props) {
  const { speakLetter, speakWord } = useTTS();
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<LetterData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (round >= rounds) return;
    const t = letters[round % letters.length];
    setTarget(t);
    setSelected(null);
    setShowResult(false);

    // Create 3 options: 1 correct + 2 wrong
    const wrong = shuffle(
      ALPHABET_DATA.filter((l) => l.letter !== t.letter).map((l) => l.letter)
    ).slice(0, 2);
    setOptions(shuffle([t.letter, ...wrong]));

    // Auto-play sound
    setTimeout(() => speakLetter(t.letter), 500);
  }, [round, rounds, letters, speakLetter]);

  const handleSelect = (letter: string) => {
    if (showResult) return;
    setSelected(letter);
    setShowResult(true);

    const isCorrect = letter === target?.letter;
    if (isCorrect) setCorrect((c) => c + 1);

    // Show result, then next
    setTimeout(() => {
      if (round + 1 >= rounds) {
        onComplete(correct + (isCorrect ? 1 : 0), rounds);
      } else {
        setRound((r) => r + 1);
      }
    }, 1500);
  };

  if (!target) return null;

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-2">
        Вопрос {round + 1} из {rounds}
      </p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-primary rounded-full h-2 transition-all"
          style={{ width: `${((round + 1) / rounds) * 100}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-700 mb-6">
        Послушай звук и выбери букву
      </h3>

      {/* Play sound button */}
      <button
        onClick={() => speakLetter(target.letter)}
        className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center mb-10 shadow-lg hover:bg-primary/90 transition-colors"
      >
        <Volume2 size={48} />
      </button>

      {/* Options */}
      <div className="flex gap-5">
        {options.map((letter) => {
          let bg = 'bg-white hover:bg-gray-50 border-2 border-gray-200';
          if (showResult && letter === target.letter) {
            bg = 'bg-success text-white border-2 border-success';
          } else if (showResult && letter === selected && letter !== target.letter) {
            bg = 'bg-error text-white border-2 border-error';
          }

          return (
            <motion.button
              key={letter}
              onClick={() => handleSelect(letter)}
              whileHover={!showResult ? { scale: 1.05 } : {}}
              whileTap={!showResult ? { scale: 0.95 } : {}}
              className={`w-24 h-24 rounded-2xl text-5xl font-bold transition-colors shadow-sm ${bg}`}
            >
              {letter.toUpperCase()}
              {showResult && letter === target.letter && (
                <Check size={20} className="mx-auto mt-1" />
              )}
              {showResult && letter === selected && letter !== target.letter && (
                <X size={20} className="mx-auto mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Result feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          {selected === target.letter ? (
            <p className="text-2xl font-bold text-success">Правильно! 🎉</p>
          ) : (
            <p className="text-2xl font-bold text-error">
              Это буква {target.letter.toUpperCase()} — {target.word}
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
