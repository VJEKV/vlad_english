import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, Star, ChevronRight, Loader2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import type { SpotlightModule } from '../../types';
import { lookupWord as lookupWordFn } from '../common/WordCard';
import { shuffle } from '../../content/phonicsLessons';
import { useWordStore } from '../../store/useWordStore';
import SyllableDisplay from '../spotlight/SyllableDisplay';
import SentenceReader from '../spotlight/SentenceReader';

type Phase = 'learn' | 'quiz' | 'read' | 'dialogueTest' | 'grammar' | 'test' | 'results';

interface Props {
  module: SpotlightModule;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onPhaseChange?: (phase: string) => void;
  initialPhase?: string;
}

const CHARS: Record<string, string> = {
  'Larry': '👦', 'Lulu': '👧', 'Nanny': '👩‍🍼', 'Magician': '🎩',
  'Town Mouse': '🐭', 'Country Mouse': '🐹', 'Woman': '👩', 'Chuckles': '🐵',
  'Larry & Lulu': '👦👧', 'Larry/Lulu': '👦👧',
};
function parseLine(line: string) {
  for (const [n, icon] of Object.entries(CHARS)) {
    if (line.startsWith(n + ':')) return { icon, name: n, text: line.slice(line.indexOf(':') + 1).trim() };
  }
  return null;
}

const AI_PROMPT = `Ты учитель английского для русского ребёнка 8 лет (2 класс). Объясни как ПРОИЗНОСИТЬ каждое слово в предложении.

ПРАВИЛА:
- Разбирай КАЖДОЕ слово, даже простые (my, is, the, a, it, in)
- Составные слова разбирай отдельно: "teddy bear" — это ДВА слова: teddy (тЕдди) и bear (бЭа)
- Для КАЖДОГО слова пиши: слово — читай «русская транскрипция». Короткое пояснение (1 строка).
- Если слово читается НЕ по правилам — обязательно укажи это (said читается «сэд», а не «сэйд»!)
- Обращай внимание на: th (язык между зубами), sh, ch, ck, oo, ee, ea, ow, ou, igh, magic e
- Указывай ударение в длинных словах: elephant — «Элифант» (ударение на Э)
- Без emoji. Без markdown. Без заголовков. Просто список слов.

ПРИМЕР:
This — читай «зис» (th — кончик языка между зубами + голос).
is — читай «из».
my — читай «май» (y на конце читается как «ай»).
teddy — читай «тЕдди» (ударение на первый слог, y на конце = «и»).
bear — читай «бЭа» (ea здесь = «э», r почти не слышно).`;

// Generate dialogue comprehension questions from module data
interface DialogueQuestion {
  type: 'translate_word' | 'translate_sentence' | 'pick_word' | 'true_false';
  question: string;
  options: string[];
  correctIndex: number;
}

function generateDialogueQuestions(module: SpotlightModule): DialogueQuestion[] {
  const questions: DialogueQuestion[] = [];
  const words = module.words;
  const texts = module.texts || [];
  const sentences = module.sentences;

  // Collect all dialogue lines
  const allLines: string[] = [];
  texts.forEach(t => t.lines.forEach(l => {
    const ch = parseLine(l);
    allLines.push(ch ? ch.text : l);
  }));

  // Type 1: Word from dialogue — what does it mean? (use module words)
  const dialogueWords = words.filter(w => {
    const wLower = w.word.toLowerCase();
    return allLines.some(line => line.toLowerCase().includes(wLower));
  });
  const wordsForTest = shuffle(dialogueWords).slice(0, 4);
  wordsForTest.forEach(w => {
    const wrong = shuffle(words.filter(x => x.word !== w.word)).slice(0, 2);
    const opts = shuffle([
      { text: w.translation, correct: true },
      ...wrong.map(wr => ({ text: wr.translation, correct: false })),
    ]);
    questions.push({
      type: 'translate_word',
      question: `Что значит "${w.word}"?`,
      options: opts.map(o => o.text),
      correctIndex: opts.findIndex(o => o.correct),
    });
  });

  // Type 2: Sentence translation — pick correct meaning
  const sentencesForTest = shuffle([...sentences]).slice(0, 3);
  sentencesForTest.forEach(s => {
    // Generate wrong translations from other sentences
    const wrongSentences = shuffle(sentences.filter(x => x.sentence !== s.sentence)).slice(0, 2);
    const wrongTranslations = wrongSentences.map(ws => ws.translation);
    // If not enough wrong sentences, make up simple wrong ones
    while (wrongTranslations.length < 2) {
      const rw = shuffle(words).slice(0, 2);
      wrongTranslations.push(`${rw[0]?.translation || 'кот'} и ${rw[1]?.translation || 'собака'}`);
    }
    const opts = shuffle([
      { text: s.translation, correct: true },
      ...wrongTranslations.map(t => ({ text: t, correct: false })),
    ]);
    questions.push({
      type: 'translate_sentence',
      question: `Переведи: "${s.sentence}"`,
      options: opts.map(o => o.text),
      correctIndex: opts.findIndex(o => o.correct),
    });
  });

  // Type 3: Pick English word for Russian translation (reverse of Type 1)
  const reverseWords = shuffle(dialogueWords.filter(w => !wordsForTest.includes(w)).length > 0
    ? dialogueWords.filter(w => !wordsForTest.includes(w))
    : dialogueWords
  ).slice(0, 3);
  reverseWords.forEach(w => {
    const wrong = shuffle(words.filter(x => x.word !== w.word)).slice(0, 2);
    const opts = shuffle([
      { text: w.word, correct: true },
      ...wrong.map(wr => ({ text: wr.word, correct: false })),
    ]);
    questions.push({
      type: 'pick_word',
      question: `Как по-английски "${w.translation}"?`,
      options: opts.map(o => o.text),
      correctIndex: opts.findIndex(o => o.correct),
    });
  });

  return shuffle(questions);
}

export default function SpotlightLesson({ module, onComplete, onBack, onPhaseChange, initialPhase }: Props) {
  const { speakWord, speakSentence, speakRu } = useTTS();
  const { addWords } = useWordStore();

  const startPhase = (initialPhase && !['completed', 'results'].includes(initialPhase)) ? initialPhase as Phase : 'learn';
  const [phase, setPhase] = useState<Phase>(startPhase);

  const allWords = module.words;
  const lessonWords = useMemo(() => allWords.slice(0, Math.min(allWords.length, 12)), [allWords]);
  const texts = module.texts || [];
  const sentencesData = module.sentences;

  // ===== ALL HOOKS MUST BE HERE — BEFORE ANY CONDITIONAL RETURN =====

  // Phase change notification
  useEffect(() => { onPhaseChange?.(phase); }, [phase]);

  // Learn state
  const [learnIdx, setLearnIdx] = useState(0);

  // Quiz state
  const [quizQueue, setQuizQueue] = useState<typeof allWords>([]);
  const [quizRound, setQuizRound] = useState(0);
  const [quizOpts, setQuizOpts] = useState<string[]>([]);
  const [quizAns, setQuizAns] = useState('');
  const [quizSel, setQuizSel] = useState<string | null>(null);
  const [quizFb, setQuizFb] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const quizInitialized = useRef(false);

  // Quiz effect
  useEffect(() => {
    if (phase !== 'quiz') { quizInitialized.current = false; return; }
    if (!quizInitialized.current) {
      setQuizQueue([...lessonWords]);
      setQuizRound(0);
      quizInitialized.current = true;
      return;
    }
    if (quizQueue.length > 0 && quizRound >= quizQueue.length) {
      setPhase('read');
      return;
    }
    if (quizQueue.length > 0 && quizRound < quizQueue.length) {
      const w = quizQueue[quizRound];
      if (w) {
        const wrong = shuffle(allWords.filter(x => x.word !== w.word).map(x => x.translation)).slice(0, 2);
        setQuizOpts(shuffle([w.translation, ...wrong]));
        setQuizAns(w.translation);
        setQuizSel(null);
        setQuizFb(null);
      }
    }
  }, [phase, quizRound, quizQueue.length]);

  // Read state
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiLoadingKey, setAiLoadingKey] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (phase !== 'read' || !window.electronAPI?.ai || texts.length === 0) return;
    const allLines = texts.flatMap((t, ti) => t.lines.map((l, li) => ({ key: `${ti}-${li}`, text: parseLine(l)?.text || l })));
    const batch = allLines.map(l => l.text).join('\n');
    window.electronAPI.ai.chat([{ role: 'user', content: `Переведи каждую строку на русский. Только перевод, по одному на строку.\n${batch}` }], '')
      .then(r => {
        if (r.content) {
          const ls = r.content.split('\n').filter((l: string) => l.trim());
          const map: Record<string, string> = {};
          allLines.forEach((item, i) => { if (ls[i]) map[item.key] = ls[i].trim(); });
          setTranslations(map);
        }
      }).catch(() => {});
  }, [phase]);

  // Dialogue test state
  const [dtQuestions, setDtQuestions] = useState<DialogueQuestion[]>([]);
  const [dtRound, setDtRound] = useState(0);
  const [dtSel, setDtSel] = useState<number | null>(null);
  const [dtFb, setDtFb] = useState<'correct' | 'wrong' | null>(null);
  const [dtScore, setDtScore] = useState(0);
  const dtInitialized = useRef(false);

  useEffect(() => {
    if (phase !== 'dialogueTest') { dtInitialized.current = false; return; }
    if (!dtInitialized.current) {
      const qs = generateDialogueQuestions(module);
      setDtQuestions(qs);
      setDtRound(0);
      setDtScore(0);
      setDtSel(null);
      setDtFb(null);
      dtInitialized.current = true;
    }
  }, [phase]);

  // Test state
  const [testQueue, setTestQueue] = useState<typeof allWords>([]);
  const [testRound, setTestRound] = useState(0);
  const [testOpts, setTestOpts] = useState<string[]>([]);
  const [testAns, setTestAns] = useState('');
  const [testSel, setTestSel] = useState<string | null>(null);
  const [testFb, setTestFb] = useState<'correct' | 'wrong' | null>(null);
  const [testScore, setTestScore] = useState(0);
  const testInitialized = useRef(false);

  useEffect(() => {
    if (phase !== 'test') { testInitialized.current = false; return; }
    if (!testInitialized.current) {
      setTestQueue(shuffle([...lessonWords]).slice(0, 6));
      setTestRound(0);
      testInitialized.current = true;
      return;
    }
    if (testQueue.length > 0 && testRound >= testQueue.length) {
      const totalScore = quizScore + dtScore + testScore;
      const totalMax = (quizQueue.length || lessonWords.length) + (dtQuestions.length || 1) + testQueue.length;
      const pct = totalMax > 0 ? totalScore / totalMax : 0;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
      onComplete(stars);
      setPhase('results');
      return;
    }
    if (testQueue.length > 0 && testRound < testQueue.length) {
      const w = testQueue[testRound];
      if (w) {
        const wrong = shuffle(allWords.filter(x => x.word !== w.word).map(x => x.word)).slice(0, 2);
        setTestOpts(shuffle([w.word, ...wrong]));
        setTestAns(w.word);
        setTestSel(null);
        setTestFb(null);
      }
    }
  }, [phase, testRound, testQueue.length]);

  // ===== HELPER FUNCTIONS =====
  const explainLine = async (text: string, key: string) => {
    if (aiExplanations[key]) return;
    if (!window.electronAPI?.ai) return;
    setAiLoadingKey(key);
    try {
      const r = await window.electronAPI.ai.chat([{ role: 'system', content: AI_PROMPT }, { role: 'user', content: `Предложение: "${text}"` }], '');
      setAiExplanations(p => ({ ...p, [key]: r.content || 'Ошибка' }));
    } catch { setAiExplanations(p => ({ ...p, [key]: 'Нет связи.' })); }
    setAiLoadingKey('');
  };

  const phaseLabels: Record<Phase, string> = {
    learn: '1/6 — Изучаем слова', quiz: '2/6 — Проверка слов', read: '3/6 — Читаем диалог',
    dialogueTest: '4/6 — Тест по диалогу', grammar: '5/6 — Грамматика', test: '6/6 — Итоговый тест', results: 'Результаты',
  };
  const Hdr = () => (
    <div className="flex items-center gap-4 mb-4">
      <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={22} /></button>
      <div><h2 className="text-lg font-bold">{module.title}</h2><p className="text-xs text-gray-400">{phaseLabels[phase]}</p></div>
    </div>
  );
  const PBar = ({ current, total, color = 'bg-primary' }: { current: number; total: number; color?: string }) => (
    <div className="w-full max-w-3xl bg-gray-200 rounded-full h-2 mb-4">
      <div className={`${color} rounded-full h-2 transition-all`} style={{ width: `${(current / total) * 100}%` }} />
    </div>
  );

  // ===== RENDER BY PHASE =====

  if (phase === 'learn') {
    const w = lessonWords[learnIdx];
    if (!w) return null;
    const info = lookupWordFn(w.word);
    return (
      <div><Hdr />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">Слово {learnIdx + 1} из {lessonWords.length}</p>
          <PBar current={learnIdx + 1} total={lessonWords.length} />
          <div className="bg-white rounded-2xl shadow-md p-8 mb-4 w-full max-w-xl">
            <SyllableDisplay word={w.word} translation={w.translation} emoji={info?.emoji || '📝'} size="lg" />
          </div>
          <button onClick={() => {
            if (learnIdx < lessonWords.length - 1) setLearnIdx(learnIdx + 1);
            else {
              addWords(lessonWords.map(lw => ({ word: lw.word, translation: lw.translation, emoji: lookupWordFn(lw.word)?.emoji || '📝' })));
              setPhase('quiz');
            }
          }} className="px-8 py-3 bg-success text-white rounded-xl font-bold text-lg">
            {learnIdx < lessonWords.length - 1 ? 'Дальше →' : 'К проверке →'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    if (quizQueue.length === 0 || quizRound >= quizQueue.length) {
      return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-primary mx-auto" /><p className="text-sm text-gray-400 mt-2">Загрузка...</p></div>;
    }
    const w = quizQueue[quizRound];
    return (
      <div><Hdr />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">{quizRound + 1} из {quizQueue.length}{quizQueue.length > lessonWords.length ? ' (ошибки)' : ''}</p>
          <PBar current={quizRound + 1} total={quizQueue.length} color="bg-secondary" />
          <button onClick={() => speakWord(w.word)} className="text-4xl font-bold text-primary word-display mb-6 hover:text-primary/80">{w.word}</button>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {quizOpts.map((opt, i) => {
              let st = 'bg-white border-2 border-gray-200 hover:border-secondary text-gray-800';
              if (quizFb) {
                if (opt === quizAns) st = 'bg-success border-2 border-success text-white';
                else if (opt === quizSel) st = 'bg-error border-2 border-error text-white';
                else st = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
              }
              return <button key={`q${quizRound}-${i}`} onClick={() => {
                if (quizFb) return;
                const ok = opt === quizAns;
                setQuizSel(opt); setQuizFb(ok ? 'correct' : 'wrong');
                if (ok) setQuizScore(s => s + 1); else setQuizQueue(q => [...q, q[quizRound]]);
                speakWord(w.word);
                setTimeout(() => setQuizRound(r => r + 1), 1500);
              }} className={`p-4 rounded-xl text-lg font-bold transition-colors ${st}`}>{opt}</button>;
            })}
          </div>
          {quizFb && <p className={`mt-4 text-lg font-bold ${quizFb === 'correct' ? 'text-success' : 'text-error'}`}>{quizFb === 'correct' ? 'Верно!' : `Правильно: ${quizAns}`}</p>}
        </div>
      </div>
    );
  }

  if (phase === 'read') {
    return (
      <div><Hdr />
        <div className="max-w-3xl mx-auto">
          {texts.map((t, ti) => (
            <div key={ti} className="bg-white rounded-2xl shadow-sm mb-4 overflow-visible">
              <div className="px-4 py-2.5 bg-gray-50 border-b">
                <h4 className="font-bold text-sm text-primary">{t.title}</h4>
                <p className="text-xs text-gray-400">{t.titleRu}</p>
              </div>
              {t.lines.map((line, li) => {
                const key = `${ti}-${li}`;
                const ch = parseLine(line);
                return (
                  <SentenceReader key={key} text={ch ? ch.text : line}
                    charIcon={ch?.icon} charName={ch?.name}
                    translation={translations[key]}
                    onAIExplain={() => explainLine(ch ? ch.text : line, key)}
                    aiExplanation={aiExplanations[key]}
                    aiLoading={aiLoadingKey === key}
                    speakRuFn={speakRu}
                  />
                );
              })}
            </div>
          ))}
          {sentencesData.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-visible">
              <div className="px-4 py-2 bg-gray-50 border-b"><h4 className="font-bold text-xs text-gray-500">Ключевые предложения</h4></div>
              {sentencesData.map((s, i) => (
                <SentenceReader key={`s${i}`} text={s.sentence} translation={s.translation} />
              ))}
            </div>
          )}
          <button onClick={() => setPhase('dialogueTest')} className="w-full px-4 py-2.5 bg-info text-white rounded-xl font-bold text-sm">
            Тест по диалогу →
          </button>
        </div>
      </div>
    );
  }

  // ===== DIALOGUE TEST — right after reading =====
  if (phase === 'dialogueTest') {
    if (dtQuestions.length === 0) {
      // No questions generated — skip to grammar
      return (
        <div className="text-center py-8">
          <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          {/* Auto-skip after init */}
          {dtInitialized.current && setTimeout(() => setPhase('grammar'), 100) && null}
        </div>
      );
    }
    if (dtRound >= dtQuestions.length) {
      // Done — show mini results and go to grammar
      return (
        <div><Hdr />
          <div className="flex flex-col items-center max-w-3xl mx-auto py-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
              <p className="text-5xl mb-4">{dtScore >= dtQuestions.length * 0.8 ? '🎉' : dtScore >= dtQuestions.length * 0.5 ? '👍' : '💪'}</p>
              <h3 className="text-2xl font-bold text-primary mb-2">Тест по диалогу</h3>
              <p className="text-xl font-bold mb-1">{dtScore} из {dtQuestions.length} правильно</p>
              <p className="text-sm text-gray-400 mb-6">
                {dtScore >= dtQuestions.length * 0.8 ? 'Отлично! Ты хорошо понял диалог!' : 'Перечитай диалог ещё раз и попробуй снова!'}
              </p>
              <button onClick={() => setPhase('grammar')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold text-lg">
                Далее → Грамматика
              </button>
            </motion.div>
          </div>
        </div>
      );
    }

    const dq = dtQuestions[dtRound];
    return (
      <div><Hdr />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">{dtRound + 1} из {dtQuestions.length}</p>
          <PBar current={dtRound + 1} total={dtQuestions.length} color="bg-info" />

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 w-full max-w-md text-center">
            <p className="text-xs text-gray-400 mb-2 uppercase font-bold">
              {dq.type === 'translate_word' ? 'Слово из диалога' : dq.type === 'translate_sentence' ? 'Предложение из диалога' : 'Слово из диалога'}
            </p>
            <p className="text-2xl font-bold">{dq.question}</p>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-sm">
            {dq.options.map((opt, i) => {
              let st = 'bg-white border-2 border-gray-200 hover:border-info text-gray-800';
              if (dtFb !== null) {
                if (i === dq.correctIndex) st = 'bg-success border-2 border-success text-white';
                else if (i === dtSel && i !== dq.correctIndex) st = 'bg-error border-2 border-error text-white';
                else st = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
              }
              return (
                <button key={`dt${dtRound}-${i}`} onClick={() => {
                  if (dtFb !== null) return;
                  const ok = i === dq.correctIndex;
                  setDtSel(i);
                  setDtFb(ok ? 'correct' : 'wrong');
                  if (ok) setDtScore(s => s + 1);
                  setTimeout(() => {
                    setDtSel(null);
                    setDtFb(null);
                    setDtRound(r => r + 1);
                  }, 1500);
                }} className={`p-4 rounded-xl text-lg font-bold transition-colors ${st}`}>
                  {opt}
                </button>
              );
            })}
          </div>

          {dtFb && (
            <p className={`mt-4 text-lg font-bold ${dtFb === 'correct' ? 'text-success' : 'text-error'}`}>
              {dtFb === 'correct' ? 'Верно!' : `Правильно: ${dq.options[dq.correctIndex]}`}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'grammar') {
    return (
      <div><Hdr />
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="font-bold text-lg mb-3">Грамматика</h3>
            <ul className="space-y-2">
              {module.grammar.map((g, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-secondary/10 text-secondary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                  <p className="text-sm">{g}</p>
                </li>
              ))}
            </ul>
          </div>
          {module.phrases.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
              <h4 className="font-bold text-sm text-gray-500 mb-2">Фразы</h4>
              {module.phrases.map((p, i) => (
                <button key={i} onClick={() => speakSentence(p.phrase)} className="block w-full text-left p-2 rounded-lg hover:bg-gray-50">
                  <p className="font-medium text-sm">{p.phrase}</p>
                  <p className="text-xs text-gray-400">{p.translation}</p>
                </button>
              ))}
            </div>
          )}
          <button onClick={() => setPhase('test')} className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Итоговый тест →</button>
        </div>
      </div>
    );
  }

  if (phase === 'test') {
    if (testQueue.length === 0 || testRound >= testQueue.length) {
      return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-primary mx-auto" /><p className="text-sm text-gray-400 mt-2">Загрузка...</p></div>;
    }
    const tw = testQueue[testRound];
    return (
      <div><Hdr />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">{testRound + 1} из {testQueue.length}</p>
          <PBar current={testRound + 1} total={testQueue.length} color="bg-warning" />
          <p className="text-2xl font-bold mb-4">{tw.translation}</p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {testOpts.map((opt, i) => {
              let st = 'bg-white border-2 border-gray-200 hover:border-warning text-gray-800';
              if (testFb) { if (opt === testAns) st = 'bg-success border-2 border-success text-white'; else if (opt === testSel) st = 'bg-error border-2 border-error text-white'; else st = 'bg-gray-100 border-2 border-gray-100 text-gray-400'; }
              return <button key={`t${testRound}-${i}`} onClick={() => {
                if (testFb) return;
                const ok = opt === testAns;
                setTestSel(opt); setTestFb(ok ? 'correct' : 'wrong');
                if (ok) setTestScore(s => s + 1); else setTestQueue(q => [...q, tw]);
                speakWord(tw.word);
                setTimeout(() => setTestRound(r => r + 1), 1500);
              }} className={`p-4 rounded-xl text-xl font-bold word-display transition-colors ${st}`}>{opt}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  const totalScore = quizScore + dtScore + testScore;
  const totalMax = (quizQueue.length || lessonWords.length) + (dtQuestions.length || 0) + (testQueue.length || 6);
  const pct = totalMax > 0 ? totalScore / totalMax : 0;
  const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
  return (
    <div className="flex flex-col items-center py-8">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
        <h2 className="text-3xl font-display text-primary mb-4">Модуль пройден!</h2>
        <div className="flex justify-center gap-3 mb-4">
          {[1, 2, 3].map(s => (
            <motion.div key={s} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: s * 0.3 }}>
              <Star size={48} className={s <= stars ? 'text-warning fill-warning' : 'text-gray-200'} />
            </motion.div>
          ))}
        </div>
        <div className="space-y-1 mb-4">
          <p className="text-sm">Слова: <b>{quizScore}</b>/{quizQueue.length || lessonWords.length}</p>
          <p className="text-sm">Диалог: <b>{dtScore}</b>/{dtQuestions.length || 0}</p>
          <p className="text-sm">Итоговый: <b>{testScore}</b>/{testQueue.length || 6}</p>
        </div>
        <button onClick={onBack} className="mt-4 px-8 py-3 bg-primary text-white rounded-xl font-bold">К модулям</button>
      </motion.div>
    </div>
  );
}
