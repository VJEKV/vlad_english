import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';

const WORDS = [
  { en: 'cat', ru: 'кот' }, { en: 'dog', ru: 'собака' }, { en: 'fish', ru: 'рыба' },
  { en: 'bird', ru: 'птица' }, { en: 'frog', ru: 'лягушка' }, { en: 'horse', ru: 'лошадь' },
  { en: 'lion', ru: 'лев' }, { en: 'rabbit', ru: 'кролик' }, { en: 'monkey', ru: 'обезьяна' },
  { en: 'elephant', ru: 'слон' }, { en: 'head', ru: 'голова' }, { en: 'hand', ru: 'кисть' },
  { en: 'ball', ru: 'мяч' }, { en: 'doll', ru: 'кукла' }, { en: 'bike', ru: 'велосипед' },
  { en: 'train', ru: 'поезд' }, { en: 'boat', ru: 'лодка' }, { en: 'robot', ru: 'робот' },
  { en: 'cake', ru: 'торт' }, { en: 'milk', ru: 'молоко' }, { en: 'juice', ru: 'сок' },
  { en: 'apple', ru: 'яблоко' }, { en: 'banana', ru: 'банан' }, { en: 'bread', ru: 'хлеб' },
  { en: 'cheese', ru: 'сыр' }, { en: 'pizza', ru: 'пицца' }, { en: 'book', ru: 'книга' },
  { en: 'hat', ru: 'шляпа' }, { en: 'coat', ru: 'пальто' }, { en: 'shoes', ru: 'туфли' },
  { en: 'sun', ru: 'солнце' }, { en: 'tree', ru: 'дерево' }, { en: 'rain', ru: 'дождь' },
  { en: 'snow', ru: 'снег' }, { en: 'moon', ru: 'луна' }, { en: 'star', ru: 'звезда' },
  { en: 'home', ru: 'дом' }, { en: 'table', ru: 'стол' }, { en: 'chair', ru: 'стул' },
  { en: 'door', ru: 'дверь' },
];

const TOTAL_WORDS = 15;
const FALL_DURATION = 8; // seconds

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function WordRace({ onComplete }: { onComplete: (score: number) => void }) {
  const [queue, setQueue] = useState<typeof WORDS>(() => shuffle(WORDS).slice(0, TOTAL_WORDS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'miss' | null>(null);
  const [finished, setFinished] = useState(false);
  const [falling, setFalling] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = queue[currentIndex] || null;

  const advance = useCallback((wasCorrect: boolean) => {
    clearTimeout(timerRef.current);
    setFeedback(wasCorrect ? 'correct' : 'miss');
    setFalling(false);

    setTimeout(() => {
      setFeedback(null);
      setInput('');
      const next = currentIndex + 1;
      if (next >= TOTAL_WORDS) {
        setFinished(true);
      } else {
        setCurrentIndex(next);
        setFalling(true);
      }
    }, 800);
  }, [currentIndex]);

  // Timer for each word falling
  useEffect(() => {
    if (finished || !currentWord || !falling) return;
    timerRef.current = setTimeout(() => {
      advance(false);
    }, FALL_DURATION * 1000);
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, finished, falling, advance, currentWord]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [currentIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWord || feedback) return;
    const clean = input.trim().toLowerCase();
    if (clean === currentWord.ru.toLowerCase()) {
      setScore((s) => s + 1);
      advance(true);
    }
  };

  if (finished) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Trophy size={64} className="mx-auto text-warning mb-4" />
        <h3 className="text-2xl font-display text-primary mb-2">Word Race - Финиш!</h3>
        <p className="text-lg text-gray-600 mb-6">
          Ты перевёл <span className="font-bold text-primary">{score}</span> из {TOTAL_WORDS} слов!
        </p>
        <button
          onClick={() => onComplete(score)}
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
          Слово {currentIndex + 1} / {TOTAL_WORDS}
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Trophy size={16} />
          {score}
        </div>
      </div>

      {/* Falling area */}
      <div className="relative bg-gradient-to-b from-blue-50 to-orange-50 rounded-2xl h-80 overflow-hidden mb-4 border border-gray-100">
        {/* Danger zone at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-red-100/60 border-t-2 border-dashed border-red-300" />

        <AnimatePresence mode="wait">
          {currentWord && falling && (
            <motion.div
              key={currentIndex}
              initial={{ y: 0 }}
              animate={{ y: 'calc(100% - 60px)' }}
              transition={{ duration: FALL_DURATION, ease: 'linear' }}
              className="absolute top-4 left-1/2 -translate-x-1/2"
            >
              <div className="bg-white shadow-lg rounded-2xl px-8 py-4 text-center border-2 border-primary/20">
                <p className="text-3xl font-display text-primary">{currentWord.en}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className={`text-6xl font-bold ${feedback === 'correct' ? 'text-green-500' : 'text-red-400'}`}>
                {feedback === 'correct' ? '+1' : 'Miss!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введи перевод на русском..."
          disabled={!!feedback}
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none text-lg transition-colors disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!!feedback || !input.trim()}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          OK
        </button>
      </form>
    </div>
  );
}
