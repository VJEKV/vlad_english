import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Loader2, Trophy, AlertCircle, BookOpen } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface Props {
  sentences: { sentence: string; translation: string }[];
  onComplete: (correct: number, total: number) => void;
}

type QuestionType = 'understanding' | 'grammar' | 'vocabulary';

const QUESTION_TYPES: QuestionType[] = ['understanding', 'grammar', 'vocabulary'];

interface ParsedQuestion {
  question: string;
  options: { key: string; text: string }[];
  answer: string;
}

function parseQuestion(raw: string): ParsedQuestion | null {
  const lines = raw.trim().split('\n').filter((l) => l.trim());
  if (lines.length < 4) return null;

  const question = lines[0];
  const options: { key: string; text: string }[] = [];
  let answer = '';

  for (const line of lines.slice(1)) {
    const optMatch = line.match(/^([abc])\)\s*(.+)/i);
    if (optMatch) {
      options.push({ key: optMatch[1].toLowerCase(), text: optMatch[2].trim() });
      continue;
    }
    const ansMatch = line.match(/[Оо]твет:\s*([abc])/i);
    if (ansMatch) {
      answer = ansMatch[1].toLowerCase();
    }
  }

  if (options.length < 3 || !answer) return null;
  return { question, options, answer };
}

function getSystemPrompt(type: QuestionType, sentence: string): string {
  switch (type) {
    case 'understanding':
      return `Предложение: '${sentence}'. Задай вопрос на понимание. 3 варианта ответа.\nФормат: Вопрос\na) ...\nb) ...\nc) ...\nОтвет: [a/b/c]`;
    case 'grammar':
      return `Предложение: '${sentence}'. Задай вопрос по грамматике (почему тут is/are/can). 3 варианта.\nФормат: Вопрос\na) ...\nb) ...\nc) ...\nОтвет: [a/b/c]`;
    case 'vocabulary':
      return `Предложение: '${sentence}'. Спроси перевод одного слова из предложения. 3 варианта.\nФормат: Вопрос\na) ...\nb) ...\nc) ...\nОтвет: [a/b/c]`;
  }
}

export default function AITextAnalysis({ sentences, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState<ParsedQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [finished, setFinished] = useState(false);

  const { speakSentence } = useTTS();
  const total = sentences.length;
  const current = sentences[index];
  const questionType = QUESTION_TYPES[index % QUESTION_TYPES.length];

  const fetchQuestion = useCallback(
    async (sent: string, type: QuestionType) => {
      if (!window.electronAPI?.ai) {
        setError('AI доступен только в приложении.');
        return;
      }
      setLoading(true);
      setError('');
      setQuestion(null);

      try {
        const prompt = getSystemPrompt(type, sent);
        const messages = [{ role: 'user' as const, content: prompt }];
        const result = await window.electronAPI.ai.chat(messages, `Перевод: ${sentences[index]?.translation || ''}`);

        if (result.error) {
          setError(result.error);
          return;
        }

        const parsed = parseQuestion(result.content || '');
        if (parsed) {
          setQuestion(parsed);
        } else {
          setError('AI не отвечает, попробуй позже');
        }
      } catch {
        setError('AI не отвечает, попробуй позже');
      } finally {
        setLoading(false);
      }
    },
    [sentences, index],
  );

  // Fetch question when sentence changes
  useEffect(() => {
    if (!finished && current) {
      fetchQuestion(current.sentence, questionType);
    }
  }, [index, finished]);

  const handleAnswer = useCallback(
    (key: string) => {
      if (feedback || !question) return;
      setSelectedAnswer(key);
      if (key === question.answer) {
        setScore((s) => s + 1);
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    },
    [question, feedback],
  );

  const goNext = useCallback(() => {
    const next = index + 1;
    if (next >= total) {
      setFinished(true);
    } else {
      setIndex(next);
      setFeedback(null);
      setSelectedAnswer('');
      setQuestion(null);
    }
  }, [index, total]);

  if (finished) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-12"
      >
        <Trophy size={64} className="mx-auto text-warning mb-4" />
        <h3 className="text-2xl font-display text-primary mb-2">Анализ завершён!</h3>
        <p className="text-lg text-gray-600 mb-6">
          <span className="font-bold text-primary">{score}</span> из {total} правильных ответов
        </p>
        <button
          onClick={() => onComplete(score, total)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          Готово
        </button>
      </motion.div>
    );
  }

  const progress = Math.round((index / total) * 100);
  const typeLabel =
    questionType === 'understanding'
      ? 'Понимание'
      : questionType === 'grammar'
        ? 'Грамматика'
        : 'Словарный запас';

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <BookOpen size={14} />
          Предложение {index + 1} / {total}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {typeLabel}
          </span>
          <span className="text-sm font-bold text-primary flex items-center gap-1">
            <Trophy size={14} />
            {score}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`sentence-${index}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {/* Sentence card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-lg font-display text-gray-800 leading-relaxed">
                    {current.sentence}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{current.translation}</p>
                </div>
                <button
                  onClick={() => speakSentence(current.sentence)}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                  title="Прослушать"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center gap-2 py-6 text-primary">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">AI придумывает вопрос...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 rounded-xl p-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Question */}
            {question && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
              >
                <p className="font-bold text-gray-800 mb-4">{question.question}</p>

                <div className="space-y-2 mb-4">
                  {question.options.map((opt) => {
                    let btnClass =
                      'w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-colors ';
                    if (!feedback) {
                      btnClass += 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/5';
                    } else if (opt.key === question.answer) {
                      btnClass += 'border-green-400 bg-green-50 text-green-700';
                    } else if (opt.key === selectedAnswer && feedback === 'wrong') {
                      btnClass += 'border-red-400 bg-red-50 text-red-600';
                    } else {
                      btnClass += 'border-gray-200 bg-gray-50 opacity-50';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleAnswer(opt.key)}
                        disabled={!!feedback}
                        className={btnClass}
                      >
                        <span className="font-bold mr-2">{opt.key})</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback + Next */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <p
                        className={`text-lg font-bold mb-3 ${
                          feedback === 'correct' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {feedback === 'correct'
                          ? 'Правильно!'
                          : `Неправильно. Ответ: ${question.answer})`}
                      </p>
                      <button
                        onClick={goNext}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                      >
                        {index + 1 >= total ? 'Результат' : 'Дальше'}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
