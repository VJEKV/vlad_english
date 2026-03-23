import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ArrowLeft, Check, X } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { shuffle } from '../content/phonicsLessons';

interface ListenQuestion {
  word: string;
  ru: string;
  options: string[];
  correctIndex: number;
}

const WORD_POOL = [
  // body parts
  { word: 'head', ru: 'голова' }, { word: 'arm', ru: 'рука' }, { word: 'leg', ru: 'нога' },
  { word: 'hand', ru: 'кисть' }, { word: 'foot', ru: 'ступня' }, { word: 'eye', ru: 'глаз' },
  { word: 'ear', ru: 'ухо' }, { word: 'nose', ru: 'нос' }, { word: 'mouth', ru: 'рот' },
  // animals
  { word: 'cat', ru: 'кот' }, { word: 'dog', ru: 'собака' }, { word: 'fish', ru: 'рыба' },
  { word: 'bird', ru: 'птица' }, { word: 'frog', ru: 'лягушка' }, { word: 'horse', ru: 'лошадь' },
  { word: 'elephant', ru: 'слон' }, { word: 'monkey', ru: 'обезьяна' }, { word: 'lion', ru: 'лев' },
  { word: 'rabbit', ru: 'кролик' }, { word: 'hamster', ru: 'хомяк' },
  // toys
  { word: 'ball', ru: 'мяч' }, { word: 'doll', ru: 'кукла' }, { word: 'car', ru: 'машина' },
  { word: 'bike', ru: 'велосипед' }, { word: 'train', ru: 'поезд' }, { word: 'boat', ru: 'лодка' },
  { word: 'kite', ru: 'воздушный змей' }, { word: 'robot', ru: 'робот' },
  // food
  { word: 'cake', ru: 'торт' }, { word: 'pizza', ru: 'пицца' }, { word: 'milk', ru: 'молоко' },
  { word: 'juice', ru: 'сок' }, { word: 'apple', ru: 'яблоко' }, { word: 'banana', ru: 'банан' },
  { word: 'chocolate', ru: 'шоколад' }, { word: 'egg', ru: 'яйцо' }, { word: 'bread', ru: 'хлеб' },
  { word: 'cheese', ru: 'сыр' },
  // rooms
  { word: 'kitchen', ru: 'кухня' }, { word: 'bedroom', ru: 'спальня' },
  { word: 'bathroom', ru: 'ванная' }, { word: 'garden', ru: 'сад' },
  // clothes
  { word: 'hat', ru: 'шляпа' }, { word: 'coat', ru: 'пальто' }, { word: 'shoes', ru: 'туфли' },
  { word: 'boots', ru: 'сапоги' }, { word: 'dress', ru: 'платье' }, { word: 'shorts', ru: 'шорты' },
  // weather
  { word: 'sunny', ru: 'солнечный' }, { word: 'cold', ru: 'холодный' }, { word: 'hot', ru: 'жаркий' },
  { word: 'windy', ru: 'ветреный' }, { word: 'rainy', ru: 'дождливый' },
  // school
  { word: 'pencil', ru: 'карандаш' }, { word: 'ruler', ru: 'линейка' }, { word: 'book', ru: 'книга' },
  { word: 'desk', ru: 'парта' }, { word: 'teacher', ru: 'учитель' },
  // actions
  { word: 'run', ru: 'бегать' }, { word: 'jump', ru: 'прыгать' }, { word: 'swim', ru: 'плавать' },
  { word: 'dance', ru: 'танцевать' }, { word: 'sing', ru: 'петь' }, { word: 'fly', ru: 'летать' },
  { word: 'read', ru: 'читать' }, { word: 'write', ru: 'писать' }, { word: 'draw', ru: 'рисовать' },
  { word: 'cook', ru: 'готовить' }, { word: 'eat', ru: 'есть' }, { word: 'drink', ru: 'пить' },
  { word: 'sleep', ru: 'спать' }, { word: 'play', ru: 'играть' },
  // adjectives
  { word: 'big', ru: 'большой' }, { word: 'small', ru: 'маленький' },
  { word: 'happy', ru: 'счастливый' }, { word: 'sad', ru: 'грустный' },
  { word: 'tall', ru: 'высокий' }, { word: 'short', ru: 'короткий' },
  { word: 'old', ru: 'старый' }, { word: 'new', ru: 'новый' },
  { word: 'funny', ru: 'смешной' }, { word: 'clever', ru: 'умный' }, { word: 'strong', ru: 'сильный' },
  // colors
  { word: 'red', ru: 'красный' }, { word: 'blue', ru: 'синий' }, { word: 'green', ru: 'зелёный' },
  { word: 'yellow', ru: 'жёлтый' }, { word: 'black', ru: 'чёрный' }, { word: 'white', ru: 'белый' },
  { word: 'brown', ru: 'коричневый' }, { word: 'pink', ru: 'розовый' },
];

function generateQuestions(): ListenQuestion[] {
  const shuffled = shuffle(WORD_POOL).slice(0, 10);
  return shuffled.map((target) => {
    const wrong = shuffle(WORD_POOL.filter((w) => w.word !== target.word)).slice(0, 2);
    const options = shuffle([target, ...wrong]);
    return {
      word: target.word,
      ru: target.ru,
      options: options.map((o) => o.ru),
      correctIndex: options.findIndex((o) => o.word === target.word),
    };
  });
}

export default function ListeningPage() {
  const { speakWord } = useTTS();
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<ListenQuestion[]>([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const start = () => {
    setQuestions(generateQuestions());
    setStarted(true);
    setRound(0);
    setCorrect(0);
    setDone(false);
  };

  useEffect(() => {
    if (started && round < questions.length) {
      setTimeout(() => speakWord(questions[round].word), 400);
    }
  }, [round, started, questions, speakWord]);

  if (!started || done) {
    return (
      <div>
        <h2 className="text-3xl font-display text-primary mb-2">Аудирование</h2>
        <p className="text-gray-400 mb-6">Послушай слово и выбери правильный перевод</p>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 text-center mb-6 max-w-sm mx-auto"
          >
            <p className="text-4xl mb-4">{correct >= 8 ? '🎉' : correct >= 5 ? '👍' : '💪'}</p>
            <p className="text-2xl font-bold">{correct} из {questions.length}</p>
            <p className="text-gray-400 mt-2">правильных ответов</p>
          </motion.div>
        )}

        <div className="flex justify-center">
          <button
            onClick={start}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary/90"
          >
            {done ? 'Ещё раз' : 'Начать'}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[round];

  const handleAnswer = (index: number) => {
    if (feedback !== null) return;
    setFeedback(index);
    if (index === q.correctIndex) setCorrect((c) => c + 1);

    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= questions.length) {
        setDone(true);
      } else {
        setRound((r) => r + 1);
      }
    }, 1200);
  };

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-6">Аудирование</h2>

      <div className="flex flex-col items-center">
        <p className="text-lg text-gray-500 mb-2">{round + 1} из {questions.length}</p>
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-info rounded-full h-2 transition-all" style={{ width: `${((round + 1) / questions.length) * 100}%` }} />
        </div>

        <h3 className="text-2xl font-bold text-gray-700 mb-6">Послушай и выбери перевод</h3>

        <button
          onClick={() => speakWord(q.word)}
          className="w-24 h-24 rounded-full bg-info text-white flex items-center justify-center mb-10 shadow-lg hover:bg-info/90"
        >
          <Volume2 size={48} />
        </button>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {q.options.map((opt, i) => {
            let style = 'bg-white border-2 border-gray-200 hover:border-info text-gray-800';
            if (feedback !== null && i === q.correctIndex) style = 'bg-success border-2 border-success text-white';
            else if (feedback === i && i !== q.correctIndex) style = 'bg-error border-2 border-error text-white';

            return (
              <motion.button
                key={i}
                onClick={() => handleAnswer(i)}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl text-xl font-bold transition-colors ${style}`}
              >
                {opt}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
