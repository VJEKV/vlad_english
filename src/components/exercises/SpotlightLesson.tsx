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

type Phase = 'learn' | 'quiz' | 'read' | 'grammar' | 'test' | 'results';

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

const AI_PROMPT = `Ты учитель английского для ребёнка 8 лет. Объясни как читать слова в предложении.
Для каждого ключевого слова:
1. Как читать русскими буквами
2. Зачем это слово тут используется (особенно can, must, like, is, are, have, got)
3. Если есть правило чтения — коротко
Формат: слово — читай «звук». Пояснение.
Пропускай очевидные (the, a, I). Без emoji. Без markdown. Максимум 1 строка на слово.`;

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
      const pct = (quizScore + testScore) / ((quizQueue.length || lessonWords.length) + testQueue.length);
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
    if (aiExplanations[key] || !window.electronAPI?.ai) return;
    setAiLoadingKey(key);
    try {
      const r = await window.electronAPI.ai.chat([{ role: 'system', content: AI_PROMPT }, { role: 'user', content: `Предложение: "${text}"` }], '');
      setAiExplanations(p => ({ ...p, [key]: r.content || 'Ошибка' }));
    } catch { setAiExplanations(p => ({ ...p, [key]: 'Нет связи.' })); }
    setAiLoadingKey('');
  };

  const phaseLabels: Record<Phase, string> = {
    learn: '1/5 — Изучаем слова', quiz: '2/5 — Проверка', read: '3/5 — Читаем',
    grammar: '4/5 — Грамматика', test: '5/5 — Тест', results: 'Результаты',
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
          <button onClick={() => setPhase('grammar')} className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Далее → Грамматика</button>
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
  const total = quizScore + testScore;
  const max = (quizQueue.length || lessonWords.length) + (testQueue.length || 6);
  const pct = max > 0 ? total / max : 0;
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
        <p className="text-lg">Проверка: <b>{quizScore}</b> | Тест: <b>{testScore}</b></p>
        <button onClick={onBack} className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold">К модулям</button>
      </motion.div>
    </div>
  );
}
