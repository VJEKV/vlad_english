import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Volume2, RotateCcw, Check, X, Star, Box } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { useWordStore } from '../store/useWordStore';
import { shuffle } from '../content/phonicsLessons';

export default function ReviewPage() {
  const { speakWord } = useTTS();
  const { getDue, getWordStats, review, words: allWords } = useWordStore();
  const [dueWords, setDueWords] = useState(getDue());
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const stats = getWordStats();

  const allWordsList = useMemo(() => Object.values(allWords), [allWords]);

  useEffect(() => {
    setDueWords(getDue());
  }, [allWords]);

  useEffect(() => {
    if (round < dueWords.length) {
      const w = dueWords[round];
      const wrong = shuffle(allWordsList.filter(x => x.word !== w.word).map(x => x.translation)).slice(0, 2);
      setOptions(shuffle([w.translation, ...wrong]));
      setFeedback(null);
      setSelectedAnswer(null);
    }
  }, [round, dueWords.length]);

  // No words learned yet
  if (stats.total === 0) {
    return (
      <div>
        <h2 className="text-3xl font-display text-primary mb-2">Повторение слов</h2>
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-auto mt-8">
          <p className="text-5xl mb-4">📚</p>
          <p className="text-xl font-bold text-gray-700 mb-2">Пока нет слов для повторения</p>
          <p className="text-gray-400">Пройди уроки в Spotlight — слова автоматически добавятся сюда</p>
        </div>
      </div>
    );
  }

  // All reviewed for today
  if (dueWords.length === 0 || round >= dueWords.length) {
    return (
      <div>
        <h2 className="text-3xl font-display text-primary mb-6">Повторение слов</h2>

        {sessionTotal > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 rounded-2xl p-6 mb-6 text-center max-w-md mx-auto">
            <p className="text-4xl mb-2">🎉</p>
            <p className="text-xl font-bold text-success">Сессия завершена!</p>
            <p className="text-lg">{sessionCorrect} из {sessionTotal} правильно</p>
          </motion.div>
        )}

        <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
          <h3 className="font-bold text-lg mb-4">Статистика слов</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Всего изучено</span>
              <span className="font-bold text-xl">{stats.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-gray-500">Выучено (коробки 4-5)</span>
              </div>
              <span className="font-bold text-success">{stats.mastered}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning" />
                <span className="text-gray-500">Изучается (коробки 2-3)</span>
              </div>
              <span className="font-bold text-warning">{stats.learning}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-gray-500">Новые (коробка 1)</span>
              </div>
              <span className="font-bold text-error">{stats.newWords}</span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-500">К повторению сегодня</span>
              <span className="font-bold">{stats.dueToday}</span>
            </div>
          </div>

          {/* Leitner box visualization */}
          <div className="mt-6">
            <h4 className="font-bold text-sm text-gray-500 mb-2">Коробки Лейтнера</h4>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(box => {
                const count = allWordsList.filter(w => w.box === box).length;
                const maxH = 60;
                const h = stats.total > 0 ? Math.max(8, (count / stats.total) * maxH) : 8;
                return (
                  <div key={box} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t-lg transition-all ${
                      box === 1 ? 'bg-error/60' : box <= 3 ? 'bg-warning/60' : 'bg-success/60'
                    }`} style={{ height: h }} />
                    <span className="text-xs text-gray-400">{count}</span>
                    <span className="text-xs font-bold text-gray-500">📦{box}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {stats.dueToday > 0 && (
            <button
              onClick={() => { setDueWords(getDue()); setRound(0); setSessionCorrect(0); setSessionTotal(0); }}
              className="mt-6 w-full px-6 py-3 bg-primary text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} /> Повторить ({stats.dueToday} слов)
            </button>
          )}
        </div>
      </div>
    );
  }

  // Review session
  const w = dueWords[round];

  const handleAnswer = (answer: string) => {
    if (feedback) return;
    const isCorrect = answer === w.translation;
    setSelectedAnswer(answer);
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setSessionTotal(t => t + 1);
    if (isCorrect) setSessionCorrect(c => c + 1);
    review(w.word, isCorrect);
    speakWord(w.word);

    setTimeout(() => {
      setRound(r => r + 1);
    }, 1200);
  };

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-6">Повторение слов</h2>

      <div className="flex flex-col items-center">
        <p className="text-gray-500 mb-2">{round + 1} из {dueWords.length}</p>
        <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-4">
          <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${((round + 1) / dueWords.length) * 100}%` }} />
        </div>

        <p className="text-xs text-gray-400 mb-6">Коробка {w.box} • Верно: {w.totalCorrect} Ошибок: {w.totalWrong}</p>

        {/* Word card */}
        <div className="bg-white rounded-2xl shadow-md p-8 mb-6 w-72 text-center">
          <span className="text-5xl block mb-3">{w.emoji}</span>
          <button onClick={() => speakWord(w.word)} className="text-4xl font-bold text-primary word-display hover:text-primary/80">{w.word}</button>
          <button onClick={() => speakWord(w.word)} className="mt-3 p-2 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Volume2 size={18} />
          </button>
        </div>

        <h3 className="text-xl font-bold text-gray-700 mb-4">Выбери перевод</h3>

        <div className="flex flex-col gap-3 w-full max-w-sm">
          {options.map((opt, i) => {
            let style = 'bg-white border-2 border-gray-200 hover:border-primary text-gray-800';
            if (feedback) {
              if (opt === w.translation) style = 'bg-success border-2 border-success text-white';
              else if (opt === selectedAnswer) style = 'bg-error border-2 border-error text-white';
              else style = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
            }
            return (
              <button key={`${round}-${i}`} onClick={() => handleAnswer(opt)}
                className={`p-4 rounded-xl text-lg font-bold transition-colors ${style}`}>{opt}</button>
            );
          })}
        </div>

        {feedback && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mt-4 text-xl font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>
            {feedback === 'correct' ? `Верно! → коробка ${Math.min(5, w.box + 1)}` : `Неверно → коробка 1`}
          </motion.p>
        )}
      </div>
    </div>
  );
}
