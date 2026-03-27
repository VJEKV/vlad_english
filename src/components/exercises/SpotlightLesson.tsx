import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, Star, ChevronRight, BookOpen, Square, Eye, Bot, Loader2, Mic, MicOff } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import type { SpotlightModule } from '../../types';
import { lookupWord as lookupWordFn } from '../common/WordCard';
import { shuffle } from '../../content/phonicsLessons';
import { getSyllables } from '../../content/syllables';
import { useWordStore } from '../../store/useWordStore';
import { useProgressStore } from '../../store/useProgressStore';
import { useSettingsStore } from '../../store/useSettingsStore';

// ============================================================
// Types
// ============================================================
type Phase = 'learn' | 'quiz' | 'read' | 'grammar' | 'test' | 'results';

interface Props {
  module: SpotlightModule;
  onComplete: (stars: number) => void;
  onBack: () => void;
  onPhaseChange?: (phase: string) => void;
  initialPhase?: string;
}

// ============================================================
// Helper: clean text for TTS
// ============================================================
function cleanTTS(t: string) {
  return t.replace(/[\u{1F600}-\u{1FAFF}]/gu, '').replace(/[*_~`#]/g, '').replace(/\s+/g, ' ').trim();
}

// ============================================================
// Character icons
// ============================================================
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

// ============================================================
// AI prompt
// ============================================================
const AI_PROMPT = `Ты учитель английского для ребёнка 8 лет. Объясни как читать слова в предложении.
Для каждого ключевого слова:
1. Как читать русскими буквами
2. Зачем это слово тут (особенно can, must, like, is, are, have, got)
3. Если есть правило чтения — коротко
Формат: слово — читай «звук». Пояснение.
Пропускай очевидные (the, a, I). Без emoji. Без markdown. Максимум 1 строка на слово.`;

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function SpotlightLesson({ module, onComplete, onBack, onPhaseChange, initialPhase }: Props) {
  const { speakWord, speakSyllable, speakSentence, speakRu, stop: stopTTS } = useTTS();
  const { addWords } = useWordStore();
  const syllableDelay = useSettingsStore(s => s.syllableDelay);

  // Phase
  const startPhase = (initialPhase && !['completed', 'results'].includes(initialPhase)) ? initialPhase as Phase : 'learn';
  const [phase, setPhase] = useState<Phase>(startPhase);

  // Notify parent
  useEffect(() => { onPhaseChange?.(phase); }, [phase]);

  // Words
  const allWords = module.words;
  const lessonWords = useMemo(() => allWords.slice(0, Math.min(allWords.length, 12)), [allWords]);

  // ==================== PHASE: LEARN ====================
  const [learnIdx, setLearnIdx] = useState(0);
  const [learnMode, setLearnMode] = useState<'whole' | 'syllables'>('whole');
  const [learnPlaying, setLearnPlaying] = useState(false);
  const [learnActiveIdx, setLearnActiveIdx] = useState(-1);

  const learnWord = lessonWords[learnIdx];
  const learnSyllables = learnWord ? getSyllables(learnWord.word) : [];
  const learnInfo = learnWord ? lookupWordFn(learnWord.word) : null;

  const playLearnSyllables = useCallback(async () => {
    if (learnPlaying || !learnWord) return;
    setLearnPlaying(true);
    setLearnMode('syllables');
    for (let i = 0; i < learnSyllables.length; i++) {
      setLearnActiveIdx(i);
      if (learnSyllables.length > 1) {
        await speakSyllable(learnSyllables[i], learnWord.word);
      } else {
        await speakWord(learnWord.word);
      }
      await new Promise(r => setTimeout(r, syllableDelay));
    }
    setLearnActiveIdx(-1);
    await new Promise(r => setTimeout(r, 300));
    setLearnActiveIdx(-2);
    await speakWord(learnWord.word);
    setLearnActiveIdx(-1);
    setLearnPlaying(false);
  }, [learnPlaying, learnWord, learnSyllables, speakSyllable, speakWord, syllableDelay]);

  const playLearnWhole = useCallback(async () => {
    if (learnPlaying || !learnWord) return;
    setLearnMode('whole');
    setLearnPlaying(true);
    setLearnActiveIdx(-2);
    await speakWord(learnWord.word);
    setLearnActiveIdx(-1);
    setLearnPlaying(false);
  }, [learnPlaying, learnWord, speakWord]);

  const nextLearnWord = () => {
    if (learnIdx < lessonWords.length - 1) {
      setLearnIdx(learnIdx + 1);
      setLearnMode('whole');
      setLearnActiveIdx(-1);
    } else {
      addWords(lessonWords.map(w => ({ word: w.word, translation: w.translation, emoji: lookupWordFn(w.word)?.emoji || '📝' })));
      setPhase('quiz');
    }
  };

  // ==================== PHASE: QUIZ ====================
  const [quizQueue, setQuizQueue] = useState<typeof allWords>([]);
  const [quizRound, setQuizRound] = useState(0);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [quizCorrectAns, setQuizCorrectAns] = useState('');
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  // Init quiz queue
  useEffect(() => {
    if (phase === 'quiz' && quizQueue.length === 0) {
      setQuizQueue([...lessonWords]);
      setQuizRound(0);
    }
  }, [phase]);

  // Generate options when round changes
  useEffect(() => {
    if (phase === 'quiz' && quizQueue.length > 0 && quizRound < quizQueue.length) {
      const w = quizQueue[quizRound];
      const wrong = shuffle(allWords.filter(x => x.word !== w.word).map(x => x.translation)).slice(0, 2);
      setQuizOptions(shuffle([w.translation, ...wrong]));
      setQuizCorrectAns(w.translation);
      setQuizSelected(null);
      setQuizFeedback(null);
    }
  }, [phase, quizRound, quizQueue.length]);

  const handleQuizAnswer = (ans: string) => {
    if (quizFeedback) return;
    const correct = ans === quizCorrectAns;
    setQuizSelected(ans);
    setQuizFeedback(correct ? 'correct' : 'wrong');
    if (correct) setQuizScore(s => s + 1);
    else setQuizQueue(q => [...q, q[quizRound]]); // error → end of queue
    speakWord(quizQueue[quizRound].word);
    setTimeout(() => {
      if (quizRound + 1 >= quizQueue.length) setPhase('read');
      else setQuizRound(r => r + 1);
    }, 1500);
  };

  // ==================== PHASE: READ ====================
  const texts = module.texts || [];
  const sentences = module.sentences;
  const [readTextIdx, setReadTextIdx] = useState(0);
  // Per-sentence mode: key = "t0-3" or "s-2"
  const [sentenceModes, setSentenceModes] = useState<Record<string, 'whole' | 'syllables'>>({});
  const [playingKey, setPlayingKey] = useState('');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiLoadingKey, setAiLoadingKey] = useState('');
  const playingRef = useRef(false);

  // Need useRef for playingRef
  const { useRef: _useRef } = { useRef: useState };

  // AI translate on mount
  useEffect(() => {
    if (phase !== 'read' || !window.electronAPI?.ai || texts.length === 0) return;
    const allLines = texts.flatMap((t, ti) => t.lines.map((l, li) => ({ key: `${ti}-${li}`, text: parseLine(l)?.text || l })));
    const batch = allLines.map(l => l.text).join('\n');
    window.electronAPI.ai.chat([{ role: 'user', content: `Переведи каждую строку на русский. Только перевод, по одному на строку.\n${batch}` }], '')
      .then(r => {
        if (r.content) {
          const lines = r.content.split('\n').filter((l: string) => l.trim());
          const map: Record<string, string> = {};
          allLines.forEach((item, i) => { if (lines[i]) map[item.key] = lines[i].trim(); });
          setTranslations(map);
        }
      }).catch(() => {});
  }, [phase]);

  const getSentenceMode = (key: string) => sentenceModes[key] || 'whole';
  const toggleSentenceMode = (key: string) => {
    setSentenceModes(p => ({ ...p, [key]: p[key] === 'syllables' ? 'whole' : 'syllables' }));
  };

  const stopAll = useCallback(() => { stopTTS(); setPlayingKey(''); }, [stopTTS]);

  const playSentence = useCallback(async (text: string, key: string) => {
    if (playingKey) { stopAll(); return; }
    setPlayingKey(key);
    await speakSentence(text);
    setPlayingKey('');
  }, [playingKey, speakSentence, stopAll]);

  const explainLine = async (text: string, key: string) => {
    if (aiExplanations[key] || !window.electronAPI?.ai) return;
    setAiLoadingKey(key);
    try {
      const r = await window.electronAPI.ai.chat([
        { role: 'system', content: AI_PROMPT },
        { role: 'user', content: `Предложение: "${text}"` }
      ], '');
      setAiExplanations(p => ({ ...p, [key]: r.content || 'Ошибка' }));
    } catch { setAiExplanations(p => ({ ...p, [key]: 'Нет связи.' })); }
    setAiLoadingKey('');
  };

  // ==================== PHASE: GRAMMAR ====================
  // (simple — show grammar rules + phrases)

  // ==================== PHASE: TEST ====================
  const [testQueue, setTestQueue] = useState<typeof allWords>([]);
  const [testRound, setTestRound] = useState(0);
  const [testOptions, setTestOptions] = useState<string[]>([]);
  const [testCorrectAns, setTestCorrectAns] = useState('');
  const [testSelected, setTestSelected] = useState<string | null>(null);
  const [testFeedback, setTestFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [testScore, setTestScore] = useState(0);

  useEffect(() => {
    if (phase === 'test' && testQueue.length === 0) {
      setTestQueue(shuffle([...lessonWords]).slice(0, 6));
      setTestRound(0);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'test' && testQueue.length > 0 && testRound < testQueue.length) {
      const w = testQueue[testRound];
      const wrong = shuffle(allWords.filter(x => x.word !== w.word).map(x => x.word)).slice(0, 2);
      setTestOptions(shuffle([w.word, ...wrong]));
      setTestCorrectAns(w.word);
      setTestSelected(null);
      setTestFeedback(null);
    }
  }, [phase, testRound, testQueue.length]);

  // ==================== RENDER ====================
  const phaseLabels: Record<Phase, string> = {
    learn: '1/5 — Изучаем слова', quiz: '2/5 — Проверка', read: '3/5 — Читаем',
    grammar: '4/5 — Грамматика', test: '5/5 — Тест', results: 'Результаты',
  };

  // Header
  const Header = () => (
    <div className="flex items-center gap-4 mb-4">
      <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100"><ArrowLeft size={22} /></button>
      <div><h2 className="text-lg font-bold">{module.title}</h2><p className="text-xs text-gray-400">{phaseLabels[phase]}</p></div>
    </div>
  );

  const ProgressBar = ({ current, total, color = 'bg-primary' }: { current: number; total: number; color?: string }) => (
    <div className="w-full max-w-3xl bg-gray-200 rounded-full h-2 mb-4">
      <div className={`${color} rounded-full h-2 transition-all`} style={{ width: `${(current / total) * 100}%` }} />
    </div>
  );

  // ==================== PHASE: LEARN ====================
  if (phase === 'learn') {
    if (!learnWord) return null;
    const syls = learnSyllables;
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">Слово {learnIdx + 1} из {lessonWords.length}</p>
          <ProgressBar current={learnIdx + 1} total={lessonWords.length} />

          <div className="bg-white rounded-2xl shadow-md p-8 mb-4 w-full max-w-xl text-center">
            <span className="text-6xl block mb-4">{learnInfo?.emoji || '📝'}</span>

            {/* Word display */}
            <div className="flex items-center justify-center gap-1 my-3 flex-wrap">
              {learnMode === 'whole' ? (
                <button onClick={playLearnWhole} className="text-5xl font-bold word-display text-gray-700 hover:text-primary px-3 py-1 rounded-lg">
                  {learnWord.word}
                </button>
              ) : (
                syls.map((syl, i) => (
                  <span key={i} className="flex items-center">
                    <motion.button
                      onClick={() => syls.length > 1 ? speakSyllable(syl, learnWord.word) : speakWord(learnWord.word)}
                      animate={learnActiveIdx === i ? { scale: 1.3, y: -8 } : learnActiveIdx === -2 ? { scale: 1.05 } : { scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className={`text-5xl font-bold word-display px-3 py-1 rounded-lg cursor-pointer transition-colors duration-300 ${
                        learnActiveIdx === i ? 'bg-success text-white shadow-lg'
                        : learnActiveIdx === -2 || learnActiveIdx > i ? 'text-success'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >{syl}</motion.button>
                    {i < syls.length - 1 && <span className="text-3xl text-gray-300 mx-0.5">·</span>}
                  </span>
                ))
              )}
            </div>

            <p className="text-xl text-gray-500 mb-4">{learnWord.translation}</p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={playLearnSyllables} disabled={learnPlaying}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  learnMode === 'syllables' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {learnPlaying && learnMode === 'syllables' ? <><span className="inline-block w-3 h-3 border-2 border-success border-t-transparent rounded-full animate-spin mr-1" />По слогам</> : <><BookOpen size={14} className="inline mr-1" />По слогам</>}
              </button>
              <button onClick={playLearnWhole} disabled={learnPlaying}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  learnMode === 'whole' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                <Volume2 size={14} className="inline mr-1" />Целиком
              </button>
            </div>
          </div>

          <button onClick={nextLearnWord} className="px-8 py-3 bg-success text-white rounded-xl font-bold text-lg">
            {learnIdx < lessonWords.length - 1 ? 'Дальше →' : 'К проверке →'}
          </button>
        </div>
      </div>
    );
  }

  // ==================== PHASE: QUIZ ====================
  if (phase === 'quiz') {
    if (quizQueue.length === 0) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></div>;
    if (quizRound >= quizQueue.length) { setPhase('read'); return null; }
    const w = quizQueue[quizRound];
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">{quizRound + 1} из {quizQueue.length}{quizQueue.length > lessonWords.length ? ' (ошибки вернулись)' : ''}</p>
          <ProgressBar current={quizRound + 1} total={quizQueue.length} color="bg-secondary" />
          <button onClick={() => speakWord(w.word)} className="text-4xl font-bold text-primary word-display mb-6 hover:text-primary/80">{w.word}</button>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {quizOptions.map((opt, i) => {
              let style = 'bg-white border-2 border-gray-200 hover:border-secondary text-gray-800';
              if (quizFeedback) {
                if (opt === quizCorrectAns) style = 'bg-success border-2 border-success text-white';
                else if (opt === quizSelected) style = 'bg-error border-2 border-error text-white';
                else style = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
              }
              return <button key={`${quizRound}-${i}`} onClick={() => handleQuizAnswer(opt)} className={`p-4 rounded-xl text-lg font-bold transition-colors ${style}`}>{opt}</button>;
            })}
          </div>
          {quizFeedback && <p className={`mt-4 text-lg font-bold ${quizFeedback === 'correct' ? 'text-success' : 'text-error'}`}>
            {quizFeedback === 'correct' ? 'Верно!' : `Правильно: ${quizCorrectAns}`}
          </p>}
        </div>
      </div>
    );
  }

  // ==================== PHASE: READ ====================
  if (phase === 'read') {
    const currentText = texts[readTextIdx];

    // Render a single line (dialogue or sentence)
    const renderLine = (text: string, key: string, charInfo?: { icon: string; name: string }) => {
      const mode = getSentenceMode(key);
      const words = text.split(/(\s+)/);
      const tr = translations[key];
      const isPlaying = playingKey === key;

      return (
        <div key={key} className="px-4 py-3 border-b border-gray-50">
          <div className="flex items-start gap-2 mb-1">
            {charInfo && <span className="text-lg shrink-0">{charInfo.icon}</span>}
            <div className="flex-1">
              {charInfo && <span className="text-xs font-bold text-gray-400">{charInfo.name}:</span>}
              {/* Text with syllables or whole */}
              <p className="text-2xl font-bold leading-relaxed mt-1">
                {words.map((token, ti) => {
                  if (/^\s+$/.test(token)) return <span key={ti}> </span>;
                  const clean = token.replace(/[.,!?;:'"()]/g, '');
                  const punct = token.slice(clean.length);
                  if (!clean) return <span key={ti}>{token}</span>;
                  const syls = getSyllables(clean);

                  if (mode === 'syllables' && syls.length > 1) {
                    return <span key={ti} className="inline-block">
                      {syls.map((s, si) => (
                        <span key={si}>
                          <span onClick={() => speakSyllable(s, clean)} className="cursor-pointer hover:text-primary hover:bg-primary/5 rounded px-0.5">{s}</span>
                          {si < syls.length - 1 && <span className="text-gray-300 mx-px text-lg">·</span>}
                        </span>
                      ))}
                      {punct}<span> </span>
                    </span>;
                  }
                  return <span key={ti}><span onClick={() => speakWord(clean)} className="cursor-pointer hover:text-primary hover:bg-primary/5 rounded px-0.5">{token}</span><span> </span></span>;
                })}
              </p>
            </div>
          </div>

          {/* Buttons for this sentence */}
          <div className="flex items-center gap-1.5 ml-7 mt-1">
            <button onClick={() => toggleSentenceMode(key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${mode === 'syllables' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              📖 По слогам
            </button>
            <button onClick={() => { setSentenceModes(p => ({ ...p, [key]: 'whole' })); playSentence(text, key); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold ${mode === 'whole' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-500'}`}>
              {isPlaying ? <><Square size={10} className="inline mr-0.5" />Стоп</> : <>▶ Целиком</>}
            </button>
            {tr !== undefined && (
              <button onClick={() => setShowTranslation(p => ({ ...p, [key]: !p[key] }))}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">
                <Eye size={10} className="inline mr-0.5" />Перевод
              </button>
            )}
            {window.electronAPI?.ai && (
              <button onClick={() => explainLine(text, key)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500">
                {aiLoadingKey === key ? <Loader2 size={10} className="inline animate-spin" /> : <Bot size={10} className="inline mr-0.5" />}
                Как читать
              </button>
            )}
          </div>

          {/* Translation */}
          {showTranslation[key] && tr && <p className="text-sm text-gray-400 italic ml-7 mt-1">{tr}</p>}

          {/* AI explanation */}
          {aiExplanations[key] && (
            <div className="ml-7 mt-2 bg-blue-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{aiExplanations[key]}</p>
              <button onClick={() => speakRu(cleanTTS(aiExplanations[key]))} className="text-xs text-primary mt-1"><Volume2 size={9} className="inline" /> Озвучить</button>
            </div>
          )}
        </div>
      );
    };

    return (
      <div>
        <Header />
        <div className="max-w-3xl mx-auto">
          {/* Dialogue text */}
          {currentText && (
            <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-visible">
              <div className="px-4 py-2.5 bg-gray-50 border-b flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-primary">{currentText.title}</h4>
                  <p className="text-xs text-gray-400">{currentText.titleRu}</p>
                </div>
              </div>
              {currentText.lines.map((line, li) => {
                const key = `t${readTextIdx}-${li}`;
                const ch = parseLine(line);
                return renderLine(ch ? ch.text : line, key, ch || undefined);
              })}
            </div>
          )}

          {/* Key sentences */}
          {readTextIdx >= texts.length - 1 && sentences.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-visible">
              <div className="px-4 py-2 bg-gray-50 border-b"><h4 className="font-bold text-xs text-gray-500">Ключевые предложения</h4></div>
              {sentences.map((s, i) => {
                const key = `s-${i}`;
                return (
                  <div key={key}>
                    {renderLine(s.sentence, key)}
                    <p className="text-sm text-gray-400 px-4 pb-2">{s.translation}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setPhase('grammar')} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Далее → Грамматика</button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== PHASE: GRAMMAR ====================
  if (phase === 'grammar') {
    return (
      <div>
        <Header />
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <h3 className="font-bold text-lg mb-3">Грамматика модуля</h3>
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
          <button onClick={() => { setPhase('test'); setTestRound(0); }} className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Итоговый тест →</button>
        </div>
      </div>
    );
  }

  // ==================== PHASE: TEST ====================
  if (phase === 'test') {
    if (testQueue.length === 0) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-primary mx-auto" /></div>;
    if (testRound >= testQueue.length) {
      const total = quizScore + testScore;
      const max = quizQueue.length + testQueue.length;
      const pct = max > 0 ? total / max : 0;
      const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
      onComplete(stars);
      setPhase('results');
      return null;
    }
    const tw = testQueue[testRound];
    return (
      <div>
        <Header />
        <div className="flex flex-col items-center max-w-3xl mx-auto">
          <p className="text-gray-500 text-sm mb-1">{testRound + 1} из {testQueue.length}</p>
          <ProgressBar current={testRound + 1} total={testQueue.length} color="bg-warning" />
          <p className="text-2xl font-bold mb-4">{tw.translation}</p>
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {testOptions.map((opt, i) => {
              let style = 'bg-white border-2 border-gray-200 hover:border-warning text-gray-800';
              if (testFeedback) {
                if (opt === testCorrectAns) style = 'bg-success border-2 border-success text-white';
                else if (opt === testSelected) style = 'bg-error border-2 border-error text-white';
                else style = 'bg-gray-100 border-2 border-gray-100 text-gray-400';
              }
              return <button key={`${testRound}-${i}`} onClick={() => {
                if (testFeedback) return;
                const correct = opt === testCorrectAns;
                setTestSelected(opt);
                setTestFeedback(correct ? 'correct' : 'wrong');
                if (correct) setTestScore(s => s + 1);
                else setTestQueue(q => [...q, tw]);
                speakWord(tw.word);
                setTimeout(() => setTestRound(r => r + 1), 1500);
              }} className={`p-4 rounded-xl text-xl font-bold word-display transition-colors ${style}`}>{opt}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==================== PHASE: RESULTS ====================
  const totalScore = quizScore + testScore;
  const totalMax = quizQueue.length + testQueue.length;
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
        <p className="text-lg">Слова: <b>{quizScore}/{quizQueue.length}</b> | Тест: <b>{testScore}/{testQueue.length}</b></p>
        <button onClick={onBack} className="mt-6 px-8 py-3 bg-primary text-white rounded-xl font-bold">К модулям</button>
      </motion.div>
    </div>
  );
}
