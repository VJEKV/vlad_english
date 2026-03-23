import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '../hooks/useTTS';

interface WriteTask {
  ru: string;
  en: string;
  hint: string;
}

const TASKS: WriteTask[] = [
  // Grade 2 easy (10)
  { ru: 'У меня есть кот.', en: 'I have a cat.', hint: 'I ___ a ___.' },
  { ru: 'Собака большая.', en: 'The dog is big.', hint: 'The ___ ___ ___.' },
  { ru: 'Я умею бегать.', en: 'I can run.', hint: 'I ___ ___.' },
  { ru: 'Она счастливая.', en: 'She is happy.', hint: 'She ___ ___.' },
  { ru: 'Холодно.', en: 'It is cold.', hint: 'It ___ ___.' },
  { ru: 'Я люблю молоко.', en: 'I like milk.', hint: 'I ___ ___.' },
  { ru: 'Мяч красный.', en: 'The ball is red.', hint: 'The ___ ___ ___.' },
  { ru: 'Он умеет плавать.', en: 'He can swim.', hint: 'He ___ ___.' },
  { ru: 'Мне восемь лет.', en: 'I am eight.', hint: 'I ___ ___.' },
  { ru: 'Мой кот чёрный.', en: 'My cat is black.', hint: 'My ___ ___ ___.' },
  // Grade 2-3 medium (10)
  { ru: 'У меня голубые глаза.', en: 'I have got blue eyes.', hint: 'I ___ ___ ___ eyes.' },
  { ru: 'Она умеет танцевать и петь.', en: 'She can dance and sing.', hint: 'She ___ ___ and ___.' },
  { ru: 'Кот под столом.', en: 'The cat is under the table.', hint: 'The cat ___ ___ the ___.' },
  { ru: 'Я не люблю рыбу.', en: "I don't like fish.", hint: "I ___ like ___." },
  { ru: 'На парте стоит лампа.', en: 'There is a lamp on the desk.', hint: 'There ___ a ___ on the ___.' },
  { ru: 'Моя мама на кухне.', en: 'My mum is in the kitchen.', hint: 'My ___ ___ in the ___.' },
  { ru: 'У него большая собака.', en: 'He has got a big dog.', hint: 'He ___ ___ a ___ dog.' },
  { ru: 'Мы ходим в школу каждый день.', en: 'We go to school every day.', hint: 'We ___ to ___ every ___.' },
  { ru: 'Ты умеешь кататься на велосипеде?', en: 'Can you ride a bike?', hint: '___ you ___ a ___?' },
  { ru: 'Я люблю мороженое и торт.', en: 'I like ice cream and cake.', hint: 'I ___ ___ ___ and ___.' },
  // Grade 3 (10)
  { ru: 'Мой любимый предмет — английский.', en: 'My favourite subject is English.', hint: 'My ___ ___ is ___.' },
  { ru: 'В моём доме две спальни.', en: 'There are two bedrooms in my house.', hint: 'There ___ two ___ in my ___.' },
  { ru: 'На ней красная футболка.', en: 'She is wearing a red T-shirt.', hint: 'She ___ ___ a red ___.' },
  { ru: 'Я обычно встаю в семь часов.', en: 'I usually get up at seven o\'clock.', hint: 'I ___ get ___ at seven ___.' },
  { ru: 'Слон большой и сильный.', en: 'The elephant is big and strong.', hint: 'The ___ is ___ and ___.' },
  { ru: 'Мы не ходим в школу в воскресенье.', en: "We don't go to school on Sunday.", hint: "We ___ go to ___ on ___." },
  { ru: 'Он всегда завтракает утром.', en: 'He always has breakfast in the morning.', hint: 'He ___ has ___ in the ___.' },
  { ru: 'У моего хомяка короткая коричневая шёрстка.', en: 'My hamster has got short brown fur.', hint: 'My ___ has ___ short ___ fur.' },
  { ru: 'Который час? Половина четвёртого.', en: 'What time is it? It is half past three.', hint: 'What ___ is ___? It is ___ past ___.' },
  { ru: 'Ей нравится играть с друзьями.', en: 'She likes playing with her friends.', hint: 'She ___ ___ with her ___.' },
];

export default function WritingPage() {
  const { speakSentence } = useTTS();
  const [round, setRound] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correct, setCorrect] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const total = TASKS.length;
  const task = TASKS[round];

  const normalize = (s: string) => s.toLowerCase().replace(/[.,!?']/g, '').trim().replace(/\s+/g, ' ');

  const handleCheck = () => {
    if (!input.trim()) return;
    const isCorrect = normalize(input) === normalize(task.en);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setCorrect((c) => c + 1);
      speakSentence(task.en);
    }

    setTimeout(() => {
      setFeedback(null);
      setInput('');
      setShowHint(false);
      if (round + 1 >= total) {
        setDone(true);
      } else {
        setRound((r) => r + 1);
      }
    }, 2000);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center py-8">
        <h2 className="text-4xl font-display text-primary mb-4">Готово!</h2>
        <p className="text-2xl font-bold mb-6">{correct} из {total} предложений верно</p>
        <button
          onClick={() => { setRound(0); setCorrect(0); setDone(false); }}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg"
        >
          Ещё раз
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-2">Письмо</h2>
      <p className="text-gray-400 mb-6">Переведи предложение на английский</p>

      <div className="flex flex-col items-center max-w-lg mx-auto">
        <p className="text-lg text-gray-500 mb-2">{round + 1} из {total}</p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div className="bg-accent rounded-full h-2 transition-all" style={{ width: `${((round + 1) / total) * 100}%` }} />
        </div>

        {/* Russian sentence */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 w-full text-center">
          <p className="text-2xl font-bold">{task.ru}</p>
        </div>

        {/* Hint */}
        {showHint && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 mb-4 text-lg font-mono"
          >
            {task.hint}
          </motion.p>
        )}

        {/* Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Напиши по-английски..."
          autoFocus
          className={`w-full text-xl p-4 rounded-xl border-2 outline-none transition-colors mb-4 ${
            feedback === 'correct' ? 'border-success bg-success/10'
            : feedback === 'wrong' ? 'border-error bg-error/10'
            : 'border-gray-200 focus:border-primary'
          }`}
        />

        <div className="flex gap-3">
          {!feedback && (
            <>
              <button
                onClick={() => setShowHint(true)}
                className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
              >
                Подсказка
              </button>
              <button
                onClick={handleCheck}
                disabled={!input.trim()}
                className="px-8 py-3 bg-success text-white rounded-xl font-bold disabled:opacity-40"
              >
                Проверить
              </button>
            </>
          )}
        </div>

        {feedback && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-4">
            {feedback === 'correct' ? (
              <p className="text-2xl font-bold text-success">Правильно! 🎉</p>
            ) : (
              <div>
                <p className="text-xl font-bold text-error mb-2">Правильный ответ:</p>
                <p className="text-2xl font-bold text-gray-800">{task.en}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
