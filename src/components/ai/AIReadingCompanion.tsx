import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, BookOpen, Loader2, ChevronRight, Trophy, AlertCircle } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface Props {
  text: { title: string; lines: string[] };
  moduleWords: string[];
  onComplete: () => void;
}

type Phase = 'reading' | 'comprehension' | 'done';

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

export default function AIReadingCompanion({ text, moduleWords, onComplete }: Props) {
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('reading');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [explained, setExplained] = useState(false);

  // Comprehension
  const [compQuestion, setCompQuestion] = useState<ParsedQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const { speakSentence } = useTTS();
  const currentSentence = text.lines[sentenceIndex] || '';
  const totalSentences = text.lines.length;
  const progress = phase === 'done' ? 100 : Math.round((sentenceIndex / totalSentences) * 100);

  const callAI = useCallback(
    async (systemPrompt: string): Promise<string | null> => {
      if (!window.electronAPI?.ai) {
        setError('AI доступен только в приложении.');
        return null;
      }
      setLoading(true);
      setError('');
      try {
        const messages = [{ role: 'user' as const, content: systemPrompt }];
        const context = `Известные слова: ${moduleWords.join(', ')}`;
        const result = await window.electronAPI.ai.chat(messages, context);
        if (result.error) {
          setError(result.error);
          return null;
        }
        return result.content || null;
      } catch {
        setError('AI не отвечает, попробуй позже');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [moduleWords],
  );

  const explainSentence = useCallback(async () => {
    const prompt = `Ты помогаешь ребёнку 8 лет читать текст на английском.\nРазбери это предложение: "${currentSentence}"\nОбъясни каждое слово просто, на русском. Используй emoji.\nМаксимум 4 строки.`;
    const result = await callAI(prompt);
    if (result) {
      setExplanation(result);
      setExplained(true);
    }
  }, [currentSentence, callAI]);

  const goNext = useCallback(() => {
    const next = sentenceIndex + 1;
    if (next >= totalSentences) {
      // All sentences done — generate comprehension question
      setPhase('comprehension');
      generateComprehension();
    } else {
      setSentenceIndex(next);
      setExplanation('');
      setExplained(false);
    }
  }, [sentenceIndex, totalSentences]);

  const generateComprehension = useCallback(async () => {
    const fullText = text.lines.join(' ');
    const prompt = `Ребёнок прочитал текст: "${fullText}"\nЗадай ОДИН простой вопрос на понимание текста. На русском.\nДай 3 варианта ответа (a, b, c). Один правильный.\nФормат: Вопрос\na) вариант\nb) вариант\nc) вариант\nОтвет: буква`;
    const result = await callAI(prompt);
    if (result) {
      const parsed = parseQuestion(result);
      if (parsed) {
        setCompQuestion(parsed);
      } else {
        setError('Не удалось разобрать вопрос от AI');
      }
    }
  }, [text.lines, callAI]);

  const handleCompAnswer = useCallback(
    async (key: string) => {
      if (feedback) return;
      setSelectedAnswer(key);
      if (compQuestion && key === compQuestion.answer) {
        setFeedback('correct');
      } else {
        setFeedback('wrong');
      }
    },
    [compQuestion, feedback],
  );

  const handleFinish = () => {
    setPhase('done');
    onComplete();
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <BookOpen size={14} />
            {phase === 'reading'
              ? `Предложение ${sentenceIndex + 1} / ${totalSentences}`
              : phase === 'comprehension'
                ? 'Вопрос на понимание'
                : 'Готово!'}
          </span>
          <span className="text-xs text-gray-400">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-display text-primary mb-4 text-center">{text.title}</h3>

      <AnimatePresence mode="wait">
        {/* READING PHASE */}
        {phase === 'reading' && (
          <motion.div
            key={`sentence-${sentenceIndex}`}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
          >
            {/* Sentence card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 mb-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xl font-display text-gray-800 leading-relaxed flex-1">
                  {currentSentence}
                </p>
                <button
                  onClick={() => speakSentence(currentSentence)}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors shrink-0"
                  title="Прослушать"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            {/* Explain button or explanation */}
            {!explained && !loading && (
              <button
                onClick={explainSentence}
                className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors mb-4"
              >
                Объясни слова
              </button>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 py-4 text-primary">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">AI думает...</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 rounded-xl p-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {explained && explanation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100"
              >
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {explanation}
                </p>
              </motion.div>
            )}

            {explained && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={goNext}
                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                Понял!
                <ChevronRight size={18} />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* COMPREHENSION PHASE */}
        {phase === 'comprehension' && (
          <motion.div
            key="comprehension"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            {loading && !compQuestion && (
              <div className="flex items-center justify-center gap-2 py-8 text-primary">
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm">AI придумывает вопрос...</span>
              </div>
            )}

            {error && !compQuestion && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-4 bg-red-50 rounded-xl p-3">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {compQuestion && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <p className="text-lg font-bold text-gray-800 mb-4">{compQuestion.question}</p>

                <div className="space-y-3 mb-4">
                  {compQuestion.options.map((opt) => {
                    let btnClass =
                      'w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-colors ';
                    if (!feedback) {
                      btnClass += 'border-gray-200 bg-gray-50 hover:border-primary hover:bg-primary/5';
                    } else if (opt.key === compQuestion.answer) {
                      btnClass += 'border-green-400 bg-green-50 text-green-700';
                    } else if (opt.key === selectedAnswer && feedback === 'wrong') {
                      btnClass += 'border-red-400 bg-red-50 text-red-600';
                    } else {
                      btnClass += 'border-gray-200 bg-gray-50 opacity-50';
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleCompAnswer(opt.key)}
                        disabled={!!feedback}
                        className={btnClass}
                      >
                        <span className="font-bold mr-2">{opt.key})</span>
                        {opt.text}
                      </button>
                    );
                  })}
                </div>

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
                        {feedback === 'correct' ? 'Правильно! Молодец!' : `Неправильно. Ответ: ${compQuestion.answer})`}
                      </p>
                      <button
                        onClick={handleFinish}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                      >
                        Готово
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* DONE PHASE */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <Trophy size={56} className="mx-auto text-warning mb-4" />
            <h3 className="text-2xl font-display text-primary mb-2">Текст прочитан!</h3>
            <p className="text-gray-500">Отличная работа!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
