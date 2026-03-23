import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Delete } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { shuffle } from '../../content/phonicsLessons';

interface Props {
  words: { word: string; ru: string; emoji: string }[];
  onComplete: (correct: number, total: number) => void;
}

// Exercise: hear a word, build it from letter tiles
export default function SpellExercise({ words, onComplete }: Props) {
  const { speakWord, spellWord } = useTTS();
  const [round, setRound] = useState(0);
  const [tiles, setTiles] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [correct, setCorrect] = useState(0);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const total = Math.min(words.length, 5);
  const target = words[round];

  useEffect(() => {
    if (round >= total) return;
    const w = words[round].word;
    // Letters of the word + 2 random extra letters
    const extras = 'abcdefghijklmnopqrstuvwxyz'
      .split('')
      .filter((l) => !w.includes(l));
    const extra = shuffle(extras).slice(0, 2);
    setTiles(shuffle([...w.split(''), ...extra]));
    setAnswer([]);
    setShowResult(null);
    setTimeout(() => speakWord(w), 400);
  }, [round, total, words, speakWord]);

  const handleTileClick = (letter: string, index: number) => {
    if (showResult) return;
    setAnswer([...answer, letter]);
    setTiles(tiles.filter((_, i) => i !== index));
  };

  const handleAnswerClick = (index: number) => {
    if (showResult) return;
    const letter = answer[index];
    setTiles([...tiles, letter]);
    setAnswer(answer.filter((_, i) => i !== index));
  };

  const handleCheck = () => {
    const word = answer.join('');
    const isCorrect = word === target.word;
    setShowResult(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrect((c) => c + 1);
      speakWord(target.word);
    }

    setTimeout(() => {
      if (round + 1 >= total) {
        onComplete(correct + (isCorrect ? 1 : 0), total);
      } else {
        setRound((r) => r + 1);
      }
    }, 2000);
  };

  const handleClear = () => {
    if (showResult) return;
    setTiles(shuffle([...tiles, ...answer]));
    setAnswer([]);
  };

  if (round >= total) return null;

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-2">
        Слово {round + 1} из {total}
      </p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-accent rounded-full h-2 transition-all"
          style={{ width: `${((round + 1) / total) * 100}%` }}
        />
      </div>

      <h3 className="text-2xl font-bold text-gray-700 mb-4">
        Собери слово из букв
      </h3>

      {/* Hint: emoji + listen */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-5xl">{target.emoji}</span>
        <button
          onClick={() => speakWord(target.word)}
          className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Volume2 size={28} />
        </button>
        <span className="text-xl text-gray-400">{target.ru}</span>
      </div>

      {/* Answer slots */}
      <div className="flex gap-2 mb-6 min-h-[72px]">
        {answer.length === 0 ? (
          <div className="flex gap-2">
            {target.word.split('').map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300"
              />
            ))}
          </div>
        ) : (
          answer.map((letter, i) => (
            <motion.button
              key={`${letter}-${i}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => handleAnswerClick(i)}
              className={`w-14 h-14 rounded-xl text-2xl font-bold shadow-sm transition-colors ${
                showResult === 'correct'
                  ? 'bg-success text-white'
                  : showResult === 'wrong'
                  ? 'bg-error text-white'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              {letter.toUpperCase()}
            </motion.button>
          ))
        )}
      </div>

      {/* Letter tiles */}
      <div className="flex gap-2 mb-8 flex-wrap justify-center">
        {tiles.map((letter, i) => (
          <motion.button
            key={`${letter}-${i}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleTileClick(letter, i)}
            className="w-14 h-14 rounded-xl bg-white border-2 border-gray-200 text-2xl font-bold text-gray-700 shadow-sm hover:border-primary transition-colors"
          >
            {letter.toUpperCase()}
          </motion.button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!showResult && (
          <>
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              <Delete size={18} /> Сброс
            </button>
            <button
              onClick={handleCheck}
              disabled={answer.length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-success text-white rounded-xl font-bold hover:bg-success/90 transition-colors disabled:opacity-40"
            >
              Проверить
            </button>
          </>
        )}
      </div>

      {/* Feedback */}
      {showResult && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-2xl font-bold ${
            showResult === 'correct' ? 'text-success' : 'text-error'
          }`}
        >
          {showResult === 'correct'
            ? 'Правильно! 🎉'
            : `Правильный ответ: ${target.word}`}
        </motion.p>
      )}
    </div>
  );
}
