import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Timer, Zap } from 'lucide-react';

interface Question {
  sentence: string;     // "She ___ a teacher."
  options: string[];    // ["is", "am", "are"]
  correct: number;      // index of correct answer
}

const QUESTIONS: Question[] = [
  { sentence: 'I ___ a student.', options: ['am', 'is', 'are'], correct: 0 },
  { sentence: 'She ___ happy.', options: ['am', 'is', 'are'], correct: 1 },
  { sentence: 'They ___ friends.', options: ['am', 'is', 'are'], correct: 2 },
  { sentence: 'He ___ tall.', options: ['am', 'is', 'are'], correct: 1 },
  { sentence: 'We ___ at school.', options: ['am', 'is', 'are'], correct: 2 },
  { sentence: 'It ___ cold today.', options: ['am', 'is', 'are'], correct: 1 },
  { sentence: 'You ___ my friend.', options: ['am', 'is', 'are'], correct: 2 },
  { sentence: 'I ___ swim.', options: ['can', 'cans', 'am can'], correct: 0 },
  { sentence: 'She ___ dance well.', options: ['can', 'cans', 'is can'], correct: 0 },
  { sentence: 'I ___ got a cat.', options: ['has', 'have', 'am'], correct: 1 },
  { sentence: 'She ___ got blue eyes.', options: ['has', 'have', 'is'], correct: 0 },
  { sentence: 'He ___ football every day.', options: ['play', 'plays', 'playing'], correct: 1 },
  { sentence: 'They ___ to school.', options: ['goes', 'go', 'going'], correct: 1 },
  { sentence: 'She ___ reading now.', options: ['am', 'is', 'are'], correct: 1 },
  { sentence: 'We ___ playing.', options: ['am', 'is', 'are'], correct: 2 },
  { sentence: 'I ___ like milk.', options: ['don\'t', 'doesn\'t', 'isn\'t'], correct: 0 },
  { sentence: 'He ___ like fish.', options: ['don\'t', 'doesn\'t', 'isn\'t'], correct: 1 },
  { sentence: '___ you swim?', options: ['Can', 'Do', 'Are'], correct: 0 },
  { sentence: '___ she a teacher?', options: ['Am', 'Is', 'Are'], correct: 1 },
  { sentence: 'I ___ to the park yesterday.', options: ['go', 'went', 'goed'], correct: 1 },
  // have got / has got
  { sentence: 'We ___ got a big house.', options: ['have', 'has', 'am'], correct: 0 },
  { sentence: 'He ___ got a red bike.', options: ['have', 'has', 'is'], correct: 1 },
  { sentence: 'They ___ got two cats.', options: ['have', 'has', 'are'], correct: 0 },
  { sentence: 'It ___ got a long tail.', options: ['have', 'has', 'is'], correct: 1 },
  { sentence: 'You ___ got a nice hat.', options: ['have', 'has', 'are'], correct: 0 },
  { sentence: 'My mum ___ got brown eyes.', options: ['have', 'has', 'is'], correct: 1 },
  // there is / there are
  { sentence: 'There ___ a cat in the garden.', options: ['is', 'are', 'am'], correct: 0 },
  { sentence: 'There ___ three books on the desk.', options: ['is', 'are', 'has'], correct: 1 },
  { sentence: 'There ___ a lamp in my room.', options: ['is', 'are', 'have'], correct: 0 },
  { sentence: 'There ___ two dogs in the park.', options: ['is', 'are', 'has'], correct: 1 },
  { sentence: 'There ___ milk in the fridge.', options: ['is', 'are', 'am'], correct: 0 },
  { sentence: 'There ___ many toys in the box.', options: ['is', 'are', 'has'], correct: 1 },
  // plurals
  { sentence: 'Two ___ are on the table.', options: ['book', 'books', 'bookes'], correct: 1 },
  { sentence: 'I can see three ___.', options: ['cat', 'cats', 'cates'], correct: 1 },
  { sentence: 'She has got five ___.', options: ['doll', 'dolls', 'dolles'], correct: 1 },
  { sentence: 'There are four ___ in the room.', options: ['child', 'children', 'childs'], correct: 1 },
  // this / that / these / those
  { sentence: '___ is my pencil.', options: ['This', 'These', 'Those'], correct: 0 },
  { sentence: '___ are my toys.', options: ['This', 'These', 'That'], correct: 1 },
  { sentence: '___ is a big tree over there.', options: ['This', 'These', 'That'], correct: 2 },
  { sentence: '___ books are interesting.', options: ['That', 'These', 'This'], correct: 1 },
  // prepositions
  { sentence: 'The cat is ___ the table.', options: ['under', 'in', 'at'], correct: 0 },
  { sentence: 'The ball is ___ the box.', options: ['in', 'on', 'at'], correct: 0 },
  { sentence: 'The picture is ___ the wall.', options: ['in', 'on', 'under'], correct: 1 },
  { sentence: 'She is sitting ___ the desk.', options: ['on', 'at', 'in'], correct: 1 },
  // more tenses
  { sentence: 'She ___ TV now.', options: ['is watching', 'watches', 'watch'], correct: 0 },
  { sentence: 'They ___ to school yesterday.', options: ['go', 'went', 'goed'], correct: 1 },
  { sentence: 'He ___ breakfast every morning.', options: ['has', 'have', 'having'], correct: 0 },
  { sentence: 'We ___ playing football now.', options: ['is', 'are', 'am'], correct: 1 },
  { sentence: 'She ___ to the shop yesterday.', options: ['goes', 'went', 'goed'], correct: 1 },
  { sentence: 'I ___ reading a book now.', options: ['am', 'is', 'are'], correct: 0 },
  // negation
  { sentence: 'She ___ like fish.', options: ["don't", "doesn't", "isn't"], correct: 1 },
  { sentence: 'I ___ swim.', options: ["can't", "don't", "doesn't"], correct: 0 },
  { sentence: 'We ___ go to school on Sunday.', options: ["don't", "doesn't", "can't"], correct: 0 },
  { sentence: 'He ___ run very fast.', options: ["can't", "don't", "aren't"], correct: 0 },
  // misc
  { sentence: 'My favourite colour ___ blue.', options: ['is', 'are', 'am'], correct: 0 },
  { sentence: 'How ___ apples are there?', options: ['much', 'many', 'lot'], correct: 1 },
  { sentence: 'She ___ to school by bus.', options: ['go', 'goes', 'going'], correct: 1 },
  { sentence: '___ he like pizza?', options: ['Do', 'Does', 'Is'], correct: 1 },
  { sentence: 'I can ___ English.', options: ['speak', 'speaks', 'speaking'], correct: 0 },
  { sentence: 'The children ___ in the garden.', options: ['is', 'are', 'am'], correct: 1 },
];

interface Props {
  timeLimit?: number;
  onComplete: (score: number) => void;
}

export default function GrammarBattle({ timeLimit = 60, onComplete }: Props) {
  const [questions] = useState(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled;
  });
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setGameOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleAnswer = (index: number) => {
    if (feedback || gameOver) return;
    const q = questions[current % questions.length];
    const isCorrect = index === q.correct;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      setFeedback(null);
      setCurrent((c) => c + 1);
    }, 800);
  };

  if (gameOver) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <h3 className="text-4xl font-display text-primary mb-4">Время вышло!</h3>
        <div className="flex items-center justify-center gap-2 text-3xl font-bold mb-6">
          <Zap size={32} className="text-warning" />
          {score} правильных
        </div>
        <button
          onClick={() => onComplete(score)}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg"
        >
          Готово
        </button>
      </motion.div>
    );
  }

  const q = questions[current % questions.length];

  return (
    <div className="flex flex-col items-center">
      {/* Timer + Score */}
      <div className="flex items-center gap-8 mb-6">
        <div className="flex items-center gap-2 text-xl">
          <Timer size={22} className={timeLeft <= 10 ? 'text-error' : 'text-gray-400'} />
          <span className={`font-bold ${timeLeft <= 10 ? 'text-error' : ''}`}>{timeLeft}с</span>
        </div>
        <div className="flex items-center gap-2 text-xl">
          <Zap size={22} className="text-warning" />
          <span className="font-bold">{score}</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 max-w-md w-full text-center">
        <p className="text-2xl font-bold">{q.sentence}</p>
      </div>

      {/* Options */}
      <div className="flex gap-3">
        {q.options.map((opt, i) => {
          let style = 'bg-white border-2 border-gray-200 hover:border-primary text-gray-800';
          if (feedback && i === q.correct) style = 'bg-success text-white border-2 border-success';
          else if (feedback === 'wrong' && i !== q.correct) style = 'bg-gray-100 text-gray-400 border-2 border-gray-100';

          return (
            <motion.button
              key={opt}
              onClick={() => handleAnswer(i)}
              whileTap={{ scale: 0.95 }}
              className={`px-8 py-4 rounded-xl text-xl font-bold transition-colors ${style}`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
