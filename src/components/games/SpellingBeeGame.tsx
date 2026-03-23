import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Check, X, Delete } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

const WORDS = [
  // animals
  { word: 'cat', ru: 'кот' }, { word: 'dog', ru: 'собака' }, { word: 'fish', ru: 'рыба' },
  { word: 'bird', ru: 'птица' }, { word: 'frog', ru: 'лягушка' }, { word: 'horse', ru: 'лошадь' },
  { word: 'lion', ru: 'лев' }, { word: 'rabbit', ru: 'кролик' }, { word: 'hamster', ru: 'хомяк' },
  { word: 'monkey', ru: 'обезьяна' }, { word: 'elephant', ru: 'слон' },
  // body
  { word: 'head', ru: 'голова' }, { word: 'hand', ru: 'кисть' }, { word: 'foot', ru: 'ступня' },
  { word: 'nose', ru: 'нос' }, { word: 'mouth', ru: 'рот' }, { word: 'ear', ru: 'ухо' },
  // toys & objects
  { word: 'ball', ru: 'мяч' }, { word: 'doll', ru: 'кукла' }, { word: 'bike', ru: 'велосипед' },
  { word: 'train', ru: 'поезд' }, { word: 'boat', ru: 'лодка' }, { word: 'kite', ru: 'воздушный змей' },
  { word: 'robot', ru: 'робот' },
  // food
  { word: 'cake', ru: 'торт' }, { word: 'milk', ru: 'молоко' }, { word: 'juice', ru: 'сок' },
  { word: 'apple', ru: 'яблоко' }, { word: 'banana', ru: 'банан' }, { word: 'bread', ru: 'хлеб' },
  { word: 'cheese', ru: 'сыр' }, { word: 'pizza', ru: 'пицца' }, { word: 'egg', ru: 'яйцо' },
  { word: 'chocolate', ru: 'шоколад' },
  // home & school
  { word: 'home', ru: 'дом' }, { word: 'kitchen', ru: 'кухня' }, { word: 'bedroom', ru: 'спальня' },
  { word: 'garden', ru: 'сад' }, { word: 'book', ru: 'книга' }, { word: 'pencil', ru: 'карандаш' },
  { word: 'ruler', ru: 'линейка' }, { word: 'desk', ru: 'парта' }, { word: 'teacher', ru: 'учитель' },
  // clothes
  { word: 'hat', ru: 'шляпа' }, { word: 'coat', ru: 'пальто' }, { word: 'shoes', ru: 'туфли' },
  { word: 'boots', ru: 'сапоги' }, { word: 'dress', ru: 'платье' },
  // actions
  { word: 'run', ru: 'бегать' }, { word: 'jump', ru: 'прыгать' }, { word: 'swim', ru: 'плавать' },
  { word: 'dance', ru: 'танцевать' }, { word: 'sing', ru: 'петь' }, { word: 'read', ru: 'читать' },
  { word: 'write', ru: 'писать' }, { word: 'draw', ru: 'рисовать' }, { word: 'cook', ru: 'готовить' },
  { word: 'sleep', ru: 'спать' }, { word: 'play', ru: 'играть' }, { word: 'fly', ru: 'летать' },
  // adjectives
  { word: 'big', ru: 'большой' }, { word: 'small', ru: 'маленький' }, { word: 'happy', ru: 'счастливый' },
  { word: 'funny', ru: 'смешной' }, { word: 'clever', ru: 'умный' }, { word: 'strong', ru: 'сильный' },
  // colors
  { word: 'red', ru: 'красный' }, { word: 'blue', ru: 'синий' }, { word: 'green', ru: 'зелёный' },
  { word: 'yellow', ru: 'жёлтый' }, { word: 'black', ru: 'чёрный' }, { word: 'white', ru: 'белый' },
  { word: 'brown', ru: 'коричневый' }, { word: 'pink', ru: 'розовый' },
  // weather & misc
  { word: 'sun', ru: 'солнце' }, { word: 'tree', ru: 'дерево' }, { word: 'pen', ru: 'ручка' },
];

interface Props {
  onComplete: (correct: number, total: number) => void;
}

export default function SpellingBeeGame({ onComplete }: Props) {
  const { speakWord } = useTTS();
  const [words] = useState(() => [...WORDS].sort(() => Math.random() - 0.5).slice(0, 8));
  const [round, setRound] = useState(0);
  const [input, setInput] = useState('');
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => {
    if (round < words.length) {
      setTimeout(() => speakWord(words[round].word), 400);
    }
  }, [round, words, speakWord]);

  const handleCheck = () => {
    if (!input.trim()) return;
    const isCorrect = input.trim().toLowerCase() === words[round].word;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setCorrect((c) => c + 1);

    setTimeout(() => {
      setFeedback(null);
      setInput('');
      if (round + 1 >= words.length) {
        onComplete(correct + (isCorrect ? 1 : 0), words.length);
      } else {
        setRound((r) => r + 1);
      }
    }, 1500);
  };

  if (round >= words.length) return null;
  const w = words[round];

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-2">Слово {round + 1} из {words.length}</p>
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
        <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${((round + 1) / words.length) * 100}%` }} />
      </div>

      <h3 className="text-2xl font-bold text-gray-700 mb-2">Послушай и напиши слово</h3>
      <p className="text-gray-400 mb-6">Подсказка: {w.ru}</p>

      <button
        onClick={() => speakWord(w.word)}
        className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center mb-8 shadow-lg hover:bg-primary/90"
      >
        <Volume2 size={40} />
      </button>

      <div className="flex items-center gap-3 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Напиши слово..."
          autoFocus
          className={`text-3xl font-bold text-center p-4 rounded-xl border-2 w-64 word-display outline-none transition-colors ${
            feedback === 'correct'
              ? 'border-success bg-success/10'
              : feedback === 'wrong'
              ? 'border-error bg-error/10'
              : 'border-gray-200 focus:border-primary'
          }`}
        />
      </div>

      {!feedback && (
        <button
          onClick={handleCheck}
          disabled={!input.trim()}
          className="px-8 py-3 bg-success text-white rounded-xl font-bold text-lg disabled:opacity-40"
        >
          Проверить
        </button>
      )}

      {feedback && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          {feedback === 'correct' ? (
            <p className="text-2xl font-bold text-success">Правильно! 🎉</p>
          ) : (
            <div>
              <p className="text-xl font-bold text-error mb-1">Неправильно</p>
              <p className="text-2xl font-bold text-gray-800 word-display">{w.word}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
