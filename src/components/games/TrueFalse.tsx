import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Check, X } from 'lucide-react';
import { lookupWord, WORD_DICT } from '../common/WordCard';

// Build a pool of simple words (single-word, no articles/prepositions)
const WORD_POOL = Object.entries(WORD_DICT)
  .filter(([key, val]) => {
    // Only single words, skip very short ones and grammar words
    if (key.includes(' ') || key.includes("'") || key.length < 2) return false;
    // Skip articles, prepositions, pronouns
    const skip = ['the', 'a', 'an', 'in', 'on', 'under', 'behind', 'between', 'at', 'to', 'for',
      'with', 'of', 'from', 'about', 'is', 'am', 'are', 'was', 'were', 'do', 'does',
      'my', 'your', 'his', 'her', 'our', 'their', 'this', 'that', 'here', 'there',
      'now', 'too', 'very', 'lots', 'yes', 'no', 'he', 'she', 'it', 'we', 'they', 'you',
      'and', 'but', 'or', 'not', 'can', 'have', 'has', 'got', 'what', 'where', 'who',
      'how', 'why', 'when', 'near', 'I'];
    return !skip.includes(key);
  })
  .map(([en, { ru, emoji }]) => ({ en, ru, emoji }));

const TOTAL_ROUNDS = 15;
const TIME_PER_QUESTION = 5; // seconds

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  en: string;
  emoji: string;
  shownRu: string;
  isCorrect: boolean;
}

function generateRounds(): Round[] {
  const shuffled = shuffle(WORD_POOL);
  const rounds: Round[] = [];

  for (let i = 0; i < TOTAL_ROUNDS && i < shuffled.length; i++) {
    const word = shuffled[i];
    const correct = Math.random() < 0.5;

    if (correct) {
      rounds.push({ en: word.en, emoji: word.emoji, shownRu: word.ru, isCorrect: true });
    } else {
      // Pick a different word's translation
      let wrongIdx: number;
      do {
        wrongIdx = Math.floor(Math.random() * shuffled.length);
      } while (wrongIdx === i || shuffled[wrongIdx].ru === word.ru);
      rounds.push({ en: word.en, emoji: word.emoji, shownRu: shuffled[wrongIdx].ru, isCorrect: false });
    }
  }

  return rounds;
}

export default function TrueFalse({ onComplete }: { onComplete: (score: number, total: number) => void }) {
  const [rounds] = useState<Round[]>(() => generateRounds());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const currentRound = rounds[currentIndex] || null;

  const advance = useCallback((wasCorrect: boolean, isTimeout = false) => {
    clearInterval(timerRef.current);
    setFeedback(isTimeout ? 'timeout' : wasCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      const next = currentIndex + 1;
      if (next >= TOTAL_ROUNDS) {
        setFinished(true);
      } else {
        setCurrentIndex(next);
        setTimeLeft(TIME_PER_QUESTION);
      }
    }, 1000);
  }, [currentIndex]);

  // Countdown timer
  useEffect(() => {
    if (finished || feedback) return;
    setTimeLeft(TIME_PER_QUESTION);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          advance(false, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentIndex, finished, feedback, advance]);

  const handleAnswer = (playerSaysTrue: boolean) => {
    if (feedback || !currentRound) return;
    const correct = playerSaysTrue === currentRound.isCorrect;
    if (correct) setScore((s) => s + 1);
    advance(correct);
  };

  if (finished) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Trophy size={64} className="mx-auto text-warning mb-4" />
        <h3 className="text-2xl font-display text-primary mb-2">True or False - Результат!</h3>
        <p className="text-lg text-gray-600 mb-6">
          <span className="font-bold text-primary">{score}</span> из {TOTAL_ROUNDS} правильных ответов!
        </p>
        <button
          onClick={() => onComplete(score, TOTAL_ROUNDS)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Готово
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          Вопрос {currentIndex + 1} / {TOTAL_ROUNDS}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Trophy size={16} />
          {score}
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
        <motion.div
          key={currentIndex}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: TIME_PER_QUESTION, ease: 'linear' }}
          className={`h-full rounded-full ${timeLeft > 2 ? 'bg-primary' : 'bg-red-400'}`}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        {currentRound && (
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl shadow-md p-8 text-center mb-6 border border-gray-100"
          >
            <p className="text-6xl mb-4">{currentRound.emoji}</p>
            <p className="text-3xl font-display text-primary mb-2">{currentRound.en}</p>
            <p className="text-xl text-gray-600">= {currentRound.shownRu} ?</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-center mb-4 font-bold text-lg ${
              feedback === 'correct' ? 'text-green-500' : 'text-red-400'
            }`}
          >
            {feedback === 'correct' && 'Правильно!'}
            {feedback === 'wrong' && `Неправильно! "${currentRound?.en}" = ${rounds[currentIndex]?.isCorrect ? currentRound?.shownRu : WORD_DICT[currentRound?.en || '']?.ru || '?'}`}
            {feedback === 'timeout' && 'Время вышло!'}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(true)}
          disabled={!!feedback}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-50 text-green-600 rounded-2xl font-bold text-lg border-2 border-green-200 hover:bg-green-100 hover:border-green-400 transition-colors disabled:opacity-50"
        >
          <Check size={24} />
          Правда
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={!!feedback}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-50 text-red-500 rounded-2xl font-bold text-lg border-2 border-red-200 hover:bg-red-100 hover:border-red-400 transition-colors disabled:opacity-50"
        >
          <X size={24} />
          Ложь
        </button>
      </div>
    </div>
  );
}
