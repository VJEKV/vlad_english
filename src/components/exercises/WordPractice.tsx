import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X, RotateCcw } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { shuffle } from '../../content/phonicsLessons';

interface WordData {
  word: string;
  ru: string;
  emoji: string;
}

interface Props {
  words: WordData[];
  onComplete: (correct: number, total: number) => void;
}

// Exercise: see emoji + Russian, pick the correct English word from options
export default function WordPractice({ words, onComplete }: Props) {
  const { speakWord, spellWord } = useTTS();
  const [round, setRound] = useState(0);
  const [target, setTarget] = useState<WordData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const total = Math.min(words.length, 6);

  useEffect(() => {
    if (round >= total) return;
    const t = words[round];
    setTarget(t);
    setSelected(null);
    setShowResult(false);

    const wrong = shuffle(words.filter((w) => w.word !== t.word).map((w) => w.word)).slice(0, 2);
    setOptions(shuffle([t.word, ...wrong]));
  }, [round, total, words]);

  const handleSelect = (word: string) => {
    if (showResult) return;
    setSelected(word);
    setShowResult(true);

    const isCorrect = word === target?.word;
    if (isCorrect) setCorrect((c) => c + 1);

    // Speak the correct word
    speakWord(target!.word);

    setTimeout(() => {
      if (round + 1 >= total) {
        onComplete(correct + (isCorrect ? 1 : 0), total);
      } else {
        setRound((r) => r + 1);
      }
    }, 2000);
  };

  if (!target) return null;

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-2">
        Слово {round + 1} из {total}
      </p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-secondary rounded-full h-2 transition-all"
          style={{ width: `${((round + 1) / total) * 100}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-700 mb-6">
        Выбери правильное слово
      </h3>

      {/* Target: emoji + russian */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8 text-center">
        <span className="text-7xl block mb-3">{target.emoji}</span>
        <p className="text-2xl text-gray-600 font-bold">{target.ru}</p>
      </div>

      {/* Word options */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        {options.map((word) => {
          let style = 'bg-white border-2 border-gray-200 hover:border-primary text-gray-800';
          if (showResult && word === target.word) {
            style = 'bg-success border-2 border-success text-white';
          } else if (showResult && word === selected && word !== target.word) {
            style = 'bg-error border-2 border-error text-white';
          }

          return (
            <motion.button
              key={word}
              onClick={() => handleSelect(word)}
              whileHover={!showResult ? { scale: 1.02 } : {}}
              whileTap={!showResult ? { scale: 0.98 } : {}}
              className={`p-4 rounded-xl text-2xl font-bold transition-colors shadow-sm word-display ${style}`}
            >
              {word}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-3"
        >
          {selected === target.word ? (
            <p className="text-2xl font-bold text-success">Молодец! 🌟</p>
          ) : (
            <div className="text-center">
              <p className="text-xl font-bold text-error mb-1">Неправильно</p>
              <p className="text-lg text-gray-500">
                Правильный ответ: <span className="font-bold text-gray-800">{target.word}</span>
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
