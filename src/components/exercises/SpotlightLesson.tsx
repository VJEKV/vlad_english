import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Star, ChevronRight } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import type { SpotlightModule } from '../../types';
import { InteractiveText, lookupWord as lookupWordFn } from '../common/WordCard';
import { shuffle } from '../../content/phonicsLessons';
import { useWordStore } from '../../store/useWordStore';
import AIErrorHelper from '../ai/AIErrorHelper';
import KaraokeText from '../common/KaraokeText';
import SyllableWord from '../common/SyllableWord';

type Phase = 'learn_words' | 'quiz_words' | 'spell_words' | 'read_sentences' | 'grammar' | 'test' | 'results';

interface Props {
  module: SpotlightModule;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onPhaseChange?: (phase: string) => void;
  initialPhase?: string;
}

export default function SpotlightLesson({ module, onComplete, onBack, onPhaseChange, initialPhase }: Props) {
  const { speakWord, speakSentence, speakRu } = useTTS();
  const { addWords } = useWordStore();
  // Resume from saved phase if available
  const startPhase = (initialPhase && initialPhase !== 'completed' && initialPhase !== 'results')
    ? initialPhase as Phase : 'learn_words';
  const [phase, setPhase] = useState<Phase>(startPhase);
  const [wordIndex, setWordIndex] = useState(0);
  const [round, setRound] = useState(0);
  const [scores, setScores] = useState({ quiz: 0, spell: 0, test: 0 });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [spellInput, setSpellInput] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [showAIHelper, setShowAIHelper] = useState<{ word: string; correct: string; wrong: string; type: 'translation' | 'spelling' | 'grammar' } | null>(null);
  // Queues that grow when mistakes are made
  const [quizQueue, setQuizQueue] = useState<typeof module.words>([]);
  const [spellQueue, setSpellQueue] = useState<typeof module.words>([]);
  const [testQueue, setTestQueue] = useState<typeof module.words>([]);

  const words = module.words;
  const lessonWords = useMemo(() => words.slice(0, Math.min(words.length, 10)), [words]);

  // Notify parent of phase changes (for saving progress)
  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase]);

  // Initialize queues when phase changes
  useEffect(() => {
    if (phase === 'quiz_words' && quizQueue.length === 0) setQuizQueue([...lessonWords]);
    if (phase === 'spell_words' && spellQueue.length === 0) {
      setSpellQueue(lessonWords.filter(w => w.word.length <= 8).slice(0, 6));
    }
    if (phase === 'test' && testQueue.length === 0) setTestQueue(shuffle([...lessonWords]).slice(0, 6));
  }, [phase]);

  const phaseLabels: Record<Phase, string> = {
    learn_words: '1/6 — Изучаем слова',
    quiz_words: '2/6 — Выбери перевод',
    spell_words: '3/6 — Напиши слово',
    read_sentences: '4/6 — Читаем',
    grammar: '5/6 — Грамматика',
    test: '6/6 — Итоговый тест',
    results: 'Результаты',
  };

  // Generate stable options when round/phase changes
  useEffect(() => {
    if (phase === 'quiz_words' && round < quizQueue.length) {
      const w = quizQueue[round];
      if (!w) return;
      const wrong = shuffle(words.filter(x => x.word !== w.word).map(x => x.translation)).slice(0, 2);
      setCurrentOptions(shuffle([w.translation, ...wrong]));
      setCorrectAnswer(w.translation);
      setSelectedAnswer(null);
      setFeedback(null);
    } else if (phase === 'test' && round < testQueue.length) {
      const tw = testQueue[round];
      if (!tw) return;
      const wrong = shuffle(words.filter(x => x.word !== tw.word).map(x => x.word)).slice(0, 2);
      setCurrentOptions(shuffle([tw.word, ...wrong]));
      setCorrectAnswer(tw.word);
      setSelectedAnswer(null);
      setFeedback(null);
    } else if (phase === 'spell_words' && round < spellQueue.length) {
      const sw = spellQueue[round];
      if (!sw) return;
      setSpellInput('');
      setFeedback(null);
      setTimeout(() => speakWord(sw.word), 400);
    }
  }, [phase, round, quizQueue.length, testQueue.length, spellQueue.length]);

  const goNext = (delay = 1200) => {
    setTimeout(() => {
      setRound(r => r + 1);
    }, delay);
  };

  // ===== PHASE 1: Learn Words (with cards) =====
  if (phase === 'learn_words') {
    const w = lessonWords[wordIndex];
    const info = lookupWordFn(w.word);
    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-2">Слово {wordIndex + 1} из {lessonWords.length}</p>
          <ProgressBar current={wordIndex + 1} total={lessonWords.length} />
          <AnimatePresence mode="wait">
            <motion.div key={wordIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col items-center">
              {/* Word Card with syllable reading */}
              <div className="bg-white rounded-2xl shadow-md p-8 mb-6 w-80">
                <SyllableWord
                  word={w.word}
                  translation={w.translation}
                  emoji={info?.emoji || '📝'}
                  size="lg"
                />
              </div>
            </motion.div>
          </AnimatePresence>
          <button
            onClick={() => {
              if (wordIndex < lessonWords.length - 1) setWordIndex(wordIndex + 1);
              else {
                // Add all learned words to Leitner box for spaced repetition
                addWords(lessonWords.map(w => ({
                  word: w.word,
                  translation: w.translation,
                  emoji: lookupWordFn(w.word)?.emoji || '📝',
                })));
                setPhase('quiz_words'); setRound(0);
              }
            }}
            className="px-8 py-3 bg-success text-white rounded-xl font-bold text-lg"
          >
            {wordIndex < lessonWords.length - 1 ? 'Дальше' : 'К проверке!'} <ChevronRight size={18} className="inline" />
          </button>
        </div>
      </div>
    );
  }

  // ===== PHASE 2: Quiz Words (mistakes go to end of queue) =====
  if (phase === 'quiz_words') {
    if (round >= quizQueue.length) {
      setPhase('spell_words'); setRound(0);
      return null;
    }
    const w = quizQueue[round];
    if (!w) { setPhase('spell_words'); setRound(0); return null; }

    const handleAnswer = (answer: string) => {
      if (feedback) return;
      const isCorrect = answer === correctAnswer;
      setSelectedAnswer(answer);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      setShowAIHelper(null);
      if (isCorrect) {
        setScores(s => ({ ...s, quiz: s.quiz + 1 }));
      } else {
        setQuizQueue(q => [...q, w]);
        setShowAIHelper({ word: w.word, correct: correctAnswer, wrong: answer, type: 'translation' });
      }
      speakWord(w.word);
      goNext(2500); // more time to see AI helper
    };

    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-2">{round + 1} из {quizQueue.length}</p>
          <ProgressBar current={round + 1} total={quizQueue.length} color="bg-secondary" />
          <h3 className="text-2xl font-bold mb-2">Выбери перевод</h3>
          <button onClick={() => speakWord(w.word)} className="text-4xl font-bold text-primary word-display mb-6 hover:text-primary/80">{w.word}</button>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {currentOptions.map((opt, i) => {
              let style = 'bg-white border-2 border-gray-200 hover:border-secondary text-gray-800';
              if (feedback) {
                if (opt === correctAnswer) style = 'bg-success border-2 border-success text-white';
                else if (opt === selectedAnswer) style = 'bg-error border-2 border-error text-white';
                else style = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
              }
              return <button key={`${round}-${i}`} onClick={() => handleAnswer(opt)} className={`p-4 rounded-xl text-lg font-bold transition-colors ${style}`}>{opt}</button>;
            })}
          </div>
          {feedback && <p className={`mt-4 text-xl font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>{feedback === 'correct' ? 'Верно!' : `Правильно: ${correctAnswer}`}</p>}
          {feedback === 'wrong' && showAIHelper && (
            <AIErrorHelper word={showAIHelper.word} correctAnswer={showAIHelper.correct} wrongAnswer={showAIHelper.wrong} exerciseType={showAIHelper.type} onClose={() => setShowAIHelper(null)} />
          )}
        </div>
      </div>
    );
  }

  // ===== PHASE 3: Spell Words (mistakes go to end) =====
  if (phase === 'spell_words') {
    if (round >= spellQueue.length) {
      setPhase('read_sentences'); setRound(0);
      return null;
    }
    const sw = spellQueue[round];
    if (!sw) { setPhase('read_sentences'); setRound(0); return null; }

    const handleSpellCheck = () => {
      if (!spellInput.trim()) return;
      const isCorrect = spellInput.trim().toLowerCase() === sw.word.toLowerCase();
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setScores(s => ({ ...s, spell: s.spell + 1 }));
      } else {
        setSpellQueue(q => [...q, sw]);
      }
      speakWord(sw.word);
      setTimeout(() => { setSpellInput(''); setRound(r => r + 1); }, 1500);
    };

    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-2">{round + 1} из {spellQueue.length}</p>
          <ProgressBar current={round + 1} total={spellQueue.length} color="bg-accent" />
          <h3 className="text-2xl font-bold mb-2">Послушай и напиши</h3>
          <p className="text-gray-400 mb-4">{sw.translation}</p>
          <button onClick={() => speakWord(sw.word)} className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center mb-6"><Volume2 size={32} /></button>
          <input type="text" value={spellInput} onChange={e => setSpellInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSpellCheck()} placeholder="Напиши слово..." autoFocus
            className={`text-2xl font-bold text-center p-3 rounded-xl border-2 w-56 word-display outline-none ${feedback === 'correct' ? 'border-success bg-success/10' : feedback === 'wrong' ? 'border-error bg-error/10' : 'border-gray-200 focus:border-primary'}`}
          />
          {!feedback && <button onClick={handleSpellCheck} disabled={!spellInput.trim()} className="mt-4 px-8 py-3 bg-success text-white rounded-xl font-bold disabled:opacity-40">Проверить</button>}
          {feedback && <p className={`mt-4 text-xl font-bold ${feedback === 'correct' ? 'text-success' : 'text-error'}`}>{feedback === 'correct' ? 'Верно!' : `Правильно: ${sw.word}`}</p>}
        </div>
      </div>
    );
  }

  // ===== PHASE 4: Read Sentences + Textbook Texts =====
  if (phase === 'read_sentences') {
    const texts = module.texts || [];
    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="max-w-lg mx-auto">
          {texts.length > 0 && (
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">Текст учебника</h3>
              <p className="text-sm text-gray-400 mb-4">Наведи на слово — увидишь перевод и картинку</p>
              {texts.map((t, ti) => (
                <div key={ti} className="bg-white rounded-2xl p-6 shadow-sm mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-primary">{t.title}</h4>
                    <button onClick={async () => { for (const line of t.lines) { await speakSentence(line); await new Promise(r => setTimeout(r, 400)); }}}
                      className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20"><Volume2 size={14} /> Послушать</button>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{t.titleRu}</p>
                  <div className="space-y-3">
                    {t.lines.map((line, li) => (
                      <KaraokeText key={li} sentence={line} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <h3 className="text-2xl font-bold mb-2">Ключевые предложения</h3>
          <p className="text-sm text-gray-400 mb-4">Нажми "Читать по словам" — каждое слово подсветится и озвучится</p>
          <div className="space-y-3">
            {module.sentences.map((s, i) => (
              <KaraokeText key={i} sentence={s.sentence} translation={s.translation} />
            ))}
          </div>
          <button onClick={() => setPhase('grammar')} className="mt-6 px-8 py-3 bg-success text-white rounded-xl font-bold text-lg w-full">Дальше — Грамматика</button>
        </div>
      </div>
    );
  }

  // ===== PHASE 5: Grammar =====
  if (phase === 'grammar') {
    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="max-w-lg mx-auto">
          <h3 className="text-2xl font-bold mb-4">Грамматика модуля</h3>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <ul className="space-y-3">
              {module.grammar.map((g, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <div>
                    <p className="font-medium">{g}</p>
                    <button onClick={() => speakRu(g)} className="text-xs text-gray-400 hover:text-primary mt-1">🔊 Послушать</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {module.phrases.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h4 className="font-bold text-sm text-gray-500 mb-3">Полезные фразы</h4>
              {module.phrases.map((p, i) => (
                <button key={i} onClick={() => speakSentence(p.phrase)} className="block w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  <p className="font-medium">{p.phrase}</p>
                  <p className="text-sm text-gray-400">{p.translation}</p>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => { setPhase('test'); setRound(0); }} className="px-8 py-3 bg-success text-white rounded-xl font-bold text-lg w-full">Итоговый тест!</button>
        </div>
      </div>
    );
  }

  // ===== PHASE 6: Final Test =====
  if (phase === 'test') {
    if (round >= testQueue.length) {
      const totalCorrect = scores.quiz + scores.spell + scores.test;
      const totalQ = quizQueue.length + spellQueue.length + testQueue.length;
      const pct = totalQ > 0 ? totalCorrect / totalQ : 0;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
      if (phase !== 'results') {
        setPhase('results');
        onComplete(stars);
      }
      return null;
    }

    const tw = testQueue[round];
    if (!tw) { setPhase('results'); return null; }

    const handleTestAnswer = (answer: string) => {
      if (feedback) return;
      const isCorrect = answer === correctAnswer;
      setSelectedAnswer(answer);
      setFeedback(isCorrect ? 'correct' : 'wrong');
      if (isCorrect) {
        setScores(s => ({ ...s, test: s.test + 1 }));
      } else {
        setTestQueue(q => [...q, tw]);
      }
      speakWord(tw.word);
      goNext();
    };

    return (
      <div>
        <Header label={phaseLabels[phase]} onBack={onBack} moduleTitle={module.title} />
        <div className="flex flex-col items-center">
          <p className="text-gray-500 mb-2">{round + 1} из {testQueue.length}</p>
          <ProgressBar current={round + 1} total={testQueue.length} color="bg-warning" />
          <h3 className="text-2xl font-bold mb-2">Выбери правильное слово</h3>
          <p className="text-3xl mb-6">{tw.translation}</p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {currentOptions.map((opt, i) => {
              let style = 'bg-white border-2 border-gray-200 hover:border-warning text-gray-800';
              if (feedback) {
                if (opt === correctAnswer) style = 'bg-success border-2 border-success text-white';
                else if (opt === selectedAnswer) style = 'bg-error border-2 border-error text-white';
                else style = 'bg-gray-100 text-gray-400 border-2 border-gray-100';
              }
              return <button key={`${round}-${i}`} onClick={() => handleTestAnswer(opt)} className={`p-4 rounded-xl text-xl font-bold word-display transition-colors ${style}`}>{opt}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===== RESULTS =====
  const totalCorrect = scores.quiz + scores.spell + scores.test;
  const totalQ = quizQueue.length + spellQueue.length + testQueue.length;
  const pct = totalQ > 0 ? totalCorrect / totalQ : 0;
  const finalStars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;

  return (
    <div className="flex flex-col items-center py-8">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <h2 className="text-4xl font-display text-primary mb-4">Модуль пройден!</h2>
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: s * 0.3 }}>
              <Star size={48} className={s <= finalStars ? 'text-warning fill-warning' : 'text-gray-200'} />
            </motion.div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 max-w-xs mx-auto">
          <p>Слова: <b>{scores.quiz}/{quizQueue.length}</b></p>
          <p>Правописание: <b>{scores.spell}/{spellQueue.length}</b></p>
          <p>Тест: <b>{scores.test}/{testQueue.length}</b></p>
          <hr className="my-2" />
          <p className="text-lg font-bold text-primary">Итого: {totalCorrect}/{totalQ}</p>
        </div>
        <button onClick={onBack} className="px-8 py-3 bg-primary text-white rounded-xl font-bold">К модулям</button>
      </motion.div>
    </div>
  );
}

function Header({ label, onBack, moduleTitle }: { label: string; onBack: () => void; moduleTitle: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={24} /></button>
      <div>
        <h2 className="text-xl font-bold">{moduleTitle}</h2>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

function ProgressBar({ current, total, color = 'bg-primary' }: { current: number; total: number; color?: string }) {
  return (
    <div className="w-full max-w-md bg-gray-200 rounded-full h-2 mb-6">
      <div className={`${color} rounded-full h-2 transition-all`} style={{ width: `${(current / total) * 100}%` }} />
    </div>
  );
}
