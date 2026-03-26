import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Square, Play, Mic, MicOff, Bot, Loader2, ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { InteractiveText } from '../common/WordCard';
import SyllableText from '../common/SyllableText';
import SyllableWord from '../common/SyllableWord';
import type { SpotlightModule } from '../../types';

const CHAR_ICONS: Record<string, string> = {
  'Larry': '👦', 'Lulu': '👧', 'Nanny': '👩‍🍼', 'Magician': '🎩',
  'Town Mouse': '🐭', 'Country Mouse': '🐹', 'Woman': '👩', 'Chuckles': '🐵',
  'Larry & Lulu': '👦👧', 'Larry/Lulu': '👦👧',
};

function parseLine(line: string): { icon: string; name: string; text: string } | null {
  for (const [name, icon] of Object.entries(CHAR_ICONS)) {
    if (line.startsWith(name + ':')) return { icon, name, text: line.substring(line.indexOf(':') + 1).trim() };
  }
  return null;
}

function cleanForTTS(text: string): string {
  return text.replace(/[\u{1F600}-\u{1FAFF}]/gu, '').replace(/[*_~`#]/g, '').replace(/\s+/g, ' ').trim();
}

// AI prompt for explaining sentences — pedagogical approach
const EXPLAIN_PROMPT = `Ты сидишь рядом с ребёнком 8 лет и помогаешь ему читать по-английски.
Он прочитал предложение и не всё понял. Помоги ему понять СМЫСЛ.
Скажи "Тут говорится что..." и объясни ситуацию простыми словами.
Если есть интересное слово — приведи пример из жизни ребёнка.
Максимум 2 короткие строки. Без терминов. Без грамматики. Без emoji. Без markdown.`;

interface Props {
  module: SpotlightModule;
  onComplete: () => void;
}

type SubPhase = 'text' | 'quiz_after_text' | 'speak_aloud';

export default function ReadingPhase({ module, onComplete }: Props) {
  const { speakSentence, speakRu, stop: stopTTS } = useTTS();
  const [subPhase, setSubPhase] = useState<SubPhase>('text');
  const [playingKey, setPlayingKey] = useState('');
  const playingRef = useRef(false);

  // Reading mode toggle
  const [readMode, setReadMode] = useState<'syllables' | 'whole'>('whole');

  // AI translations — loaded on mount via DeepSeek
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});

  // AI explanations per line
  const [explanations, setExplanations] = useState<Record<string, string>>({});
  const [explainLoading, setExplainLoading] = useState('');

  // Per-text quiz
  const [quizTextIdx, setQuizTextIdx] = useState(0);
  const [quizQ, setQuizQ] = useState<{ q: string; opts: string[]; answer: number } | null>(null);
  const [quizFeedback, setQuizFeedback] = useState('');
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizTotal, setQuizTotal] = useState(0);

  // Speak aloud
  const [speakIdx, setSpeakIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speakFeedback, setSpeakFeedback] = useState('');
  const recRef = useRef<any>(null);

  // Syllable popup
  const [syllableWord, setSyllableWord] = useState<string | null>(null);

  const texts = module.texts || [];
  const sentences = module.sentences;

  // Pre-generate translations on mount via AI
  useEffect(() => {
    if (!window.electronAPI?.ai || texts.length === 0) return;
    setTranslationsLoading(true);
    const allLines = texts.flatMap((t, ti) => t.lines.map((l, li) => ({ key: `${ti}-${li}`, text: parseLine(l)?.text || l })));
    const batch = allLines.map(l => l.text).join('\n');

    window.electronAPI.ai.chat([{
      role: 'user',
      content: `Переведи каждую строку на русский. Только перевод, по одному на строку. Без номеров. Без пояснений.\n${batch}`
    }], '').then(r => {
      if (r.content) {
        const lines = r.content.split('\n').filter((l: string) => l.trim());
        const map: Record<string, string> = {};
        allLines.forEach((item, i) => { if (lines[i]) map[item.key] = lines[i].trim(); });
        setTranslations(map);
      }
      setTranslationsLoading(false);
    }).catch(() => setTranslationsLoading(false));
  }, []);

  const stopAll = useCallback(() => { stopTTS(); playingRef.current = false; setPlayingKey(''); }, [stopTTS]);

  const playLine = useCallback(async (text: string, key: string) => {
    if (playingRef.current) { stopAll(); return; }
    playingRef.current = true; setPlayingKey(key);
    await speakSentence(text);
    playingRef.current = false; setPlayingKey('');
  }, [speakSentence, stopAll]);

  const playAllLines = useCallback(async (lines: string[]) => {
    if (playingRef.current) { stopAll(); return; }
    playingRef.current = true;
    for (let i = 0; i < lines.length; i++) {
      if (!playingRef.current) break;
      setPlayingKey(`all-${i}`);
      const p = parseLine(lines[i]);
      await speakSentence(p ? p.text : lines[i]);
      await new Promise(r => setTimeout(r, 200));
    }
    playingRef.current = false; setPlayingKey('');
  }, [speakSentence, stopAll]);

  const explainLine = async (text: string, key: string) => {
    if (explanations[key] || !window.electronAPI?.ai) return;
    setExplainLoading(key);
    try {
      const r = await window.electronAPI.ai.chat([
        { role: 'system', content: EXPLAIN_PROMPT },
        { role: 'user', content: `Предложение: "${text}"` }
      ], '');
      setExplanations(prev => ({ ...prev, [key]: r.content || 'Ошибка' }));
    } catch { setExplanations(prev => ({ ...prev, [key]: 'Нет связи.' })); }
    setExplainLoading('');
  };

  // Generate quiz for a specific text
  const generateQuiz = async (textIdx: number) => {
    if (!window.electronAPI?.ai) return;
    setQuizLoading(true);
    const t = texts[textIdx];
    try {
      const r = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Текст: "${t.lines.join(' ')}". Задай 1 простой вопрос на понимание для ребёнка 8 лет. На русском. Без emoji. Формат:
Q: вопрос
a) вариант
b) вариант
c) вариант
A: буква`
      }], '');
      const lines = (r.content || '').split('\n');
      let q = '', opts: string[] = [], ans = 0;
      for (const l of lines) {
        if (l.startsWith('Q:')) q = l.replace('Q:', '').trim();
        if (l.match(/^[abc]\)/)) opts.push(l.replace(/^[abc]\)\s*/, ''));
        if (l.startsWith('A:')) ans = l.replace('A:', '').trim().toLowerCase() === 'a' ? 0 : l.replace('A:', '').trim().toLowerCase() === 'b' ? 1 : 2;
      }
      setQuizQ(q && opts.length === 3 ? { q, opts, answer: ans } : null);
    } catch { setQuizQ(null); }
    setQuizLoading(false);
  };

  // Move to next text or finish
  const nextAfterQuiz = () => {
    setQuizQ(null); setQuizFeedback('');
    if (quizTextIdx + 1 < texts.length) {
      setQuizTextIdx(quizTextIdx + 1);
      setSubPhase('text');
    } else {
      setSubPhase('speak_aloud');
    }
  };

  // ===== TEXT PHASE =====
  if (subPhase === 'text') {
    const currentText = texts[quizTextIdx];
    return (
      <div className="max-w-3xl mx-auto">
        {/* Reading mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-400 mr-2">Режим:</span>
          <button onClick={() => setReadMode('syllables')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${readMode === 'syllables' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            📖 По слогам
          </button>
          <button onClick={() => setReadMode('whole')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${readMode === 'whole' ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            ▶ Целиком
          </button>
        </div>

        {translationsLoading && (
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
            <Loader2 size={12} className="animate-spin" /> Готовлю переводы...
          </div>
        )}

        {currentText && (
          <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
              <div>
                <h4 className="font-bold text-sm text-primary">{currentText.title}</h4>
                <p className="text-xs text-gray-400">{currentText.titleRu}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => playAllLines(currentText.lines)} className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold">
                  {playingKey.startsWith('all') ? <><Square size={11} /> Стоп</> : <><Play size={11} /> Все</>}
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {currentText.lines.map((line, li) => {
                const key = `${quizTextIdx}-${li}`;
                const ch = parseLine(line);
                const lineText = ch ? ch.text : line;
                const isPlaying = playingKey === key || playingKey === `all-${li}`;
                const tr = translations[key];

                return (
                  <div key={key} className={`px-4 py-2 ${isPlaying ? 'bg-success/5' : ''}`}>
                    <div className="flex items-start gap-2">
                      {ch && <span className="text-base shrink-0">{ch.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className={`text-2xl leading-relaxed font-medium ${isPlaying ? 'text-success font-bold' : ''}`}>
                          {ch && <span className="font-bold text-gray-400 text-xs mr-1">{ch.name}:</span>}
                          <SyllableText text={lineText} mode={readMode} />
                        </p>
                        {/* Translation — show on click */}
                        {tr && showTranslation[key] && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">{tr}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        {tr && (
                          <button onClick={() => setShowTranslation(p => ({ ...p, [key]: !p[key] }))}
                            className="p-1 rounded text-gray-300 hover:text-blue-400" title="Перевод">
                            <Eye size={11} />
                          </button>
                        )}
                        <button onClick={() => isPlaying ? stopAll() : playLine(lineText, key)}
                          className={`p-1 rounded ${isPlaying ? 'text-error' : 'text-gray-300 hover:text-primary'}`}>
                          {isPlaying ? <Square size={11} /> : <Volume2 size={11} />}
                        </button>
                        {window.electronAPI?.ai && (
                          <button onClick={() => explainLine(lineText, key)}
                            className="p-1 rounded text-gray-300 hover:text-primary" title="AI объяснит">
                            {explainLoading === key ? <Loader2 size={11} className="animate-spin" /> : <Bot size={11} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {explanations[key] && (
                      <div className="ml-6 mt-1 bg-blue-50 rounded-lg px-3 py-1.5">
                        <p className="text-xs text-gray-600">{explanations[key]}</p>
                        <button onClick={() => speakRu(cleanForTTS(explanations[key]))} className="text-xs text-primary mt-0.5 flex items-center gap-0.5">
                          <Volume2 size={9} /> Озвучить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Key sentences */}
        {quizTextIdx === texts.length - 1 && sentences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b"><h4 className="font-bold text-xs text-gray-500">Ключевые предложения</h4></div>
            <div className="divide-y divide-gray-50">
              {sentences.map((s, i) => (
                <div key={i} className="px-4 py-2 flex items-start gap-2">
                  <div className="flex-1">
                    <p className="text-2xl font-bold"><SyllableText text={s.sentence} mode={readMode} /></p>
                    <p className="text-xs text-gray-400">{s.translation}</p>
                  </div>
                  <button onClick={() => speakSentence(s.sentence)} className="shrink-0 p-1 text-gray-300 hover:text-primary"><Volume2 size={11} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Syllable popup */}
        {syllableWord && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            onClick={() => setSyllableWord(null)}>
            <div className="bg-white rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <SyllableWord word={syllableWord} size="lg" />
              <button onClick={() => setSyllableWord(null)} className="mt-4 w-full py-2 bg-gray-100 rounded-xl text-sm font-bold text-gray-500">Закрыть</button>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {texts.length > 0 ? (
            <button onClick={() => { setSubPhase('quiz_after_text'); generateQuiz(quizTextIdx); }}
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
              <Bot size={14} /> Проверка
            </button>
          ) : (
            <button onClick={() => setSubPhase('speak_aloud')}
              className="flex-1 px-4 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm">
              <Mic size={14} className="inline mr-1" /> Вслух
            </button>
          )}
          <button onClick={onComplete} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">Далее →</button>
        </div>
      </div>
    );
  }

  // ===== QUIZ AFTER TEXT =====
  if (subPhase === 'quiz_after_text') {
    if (quizLoading) return <div className="text-center py-8"><Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" /><p className="text-xs text-gray-400">AI готовит вопрос...</p></div>;
    if (!quizQ) { nextAfterQuiz(); return null; }
    return (
      <div className="max-w-md mx-auto">
        <p className="text-xs text-primary font-bold mb-2">Проверка после текста {quizTextIdx + 1}</p>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-bold text-sm mb-3">{quizQ.q}</p>
          <div className="space-y-2">
            {quizQ.opts.map((o, i) => (
              <button key={i} disabled={!!quizFeedback} onClick={() => {
                const correct = i === quizQ.answer;
                if (correct) setQuizCorrect(c => c + 1);
                setQuizTotal(t => t + 1);
                setQuizFeedback(correct ? 'Верно!' : `Ответ: ${quizQ.opts[quizQ.answer]}`);
                setTimeout(nextAfterQuiz, 1500);
              }} className={`w-full p-2 rounded-xl text-left text-sm ${
                quizFeedback && i === quizQ.answer ? 'bg-success text-white' : quizFeedback ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-primary/10'
              }`}>{String.fromCharCode(97 + i)}) {o}</button>
            ))}
          </div>
          {quizFeedback && <p className="mt-2 text-sm font-bold">{quizFeedback}</p>}
        </div>
      </div>
    );
  }

  // ===== SPEAK ALOUD =====
  const allLines = [...texts.flatMap(t => t.lines), ...sentences.map(s => s.sentence)];
  const curLine = allLines[speakIdx] || '';
  const curParsed = parseLine(curLine);
  const curText = curParsed ? curParsed.text : curLine;
  const maxLines = Math.min(allLines.length, 5);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeakFeedback('Микрофон не поддерживается'); return; }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false;
    r.onresult = (e: any) => { const t = e.results[0][0].transcript; setSpokenText(t); setListening(false); checkPronunciation(t); };
    r.onerror = () => setListening(false); r.onend = () => setListening(false);
    recRef.current = r; r.start(); setListening(true); setSpokenText(''); setSpeakFeedback('');
  };

  const checkPronunciation = async (spoken: string) => {
    if (!window.electronAPI?.ai) { setSpeakFeedback('Хорошая попытка!'); return; }
    try {
      const r = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Ребёнок прочитал вслух. Оригинал: "${curText}". Сказал: "${spoken}". Оцени кратко 1 предложение. Без emoji. Без markdown.`
      }], '');
      setSpeakFeedback(r.content || 'Молодец!');
    } catch { setSpeakFeedback('Хорошая попытка!'); }
  };

  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs text-secondary font-bold mb-2">Прочитай вслух {speakIdx + 1}/{maxLines}</p>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <p className="text-2xl font-bold mb-2"><SyllableText text={curText} mode={readMode} /></p>
        <button onClick={() => speakSentence(curText)} className="text-xs text-primary flex items-center gap-1 mb-3"><Volume2 size={11} /> Послушать</button>
        <button onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startListening}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${listening ? 'bg-error text-white animate-pulse' : 'bg-secondary text-white'}`}>
          {listening ? <><MicOff size={15} /> Слушаю...</> : <><Mic size={15} /> Нажми и читай</>}
        </button>
        {spokenText && <div className="mt-2 p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Услышал:</p><p className="text-sm font-medium">{spokenText}</p></div>}
        {speakFeedback && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">{speakFeedback}</p>
            <button onClick={() => speakRu(cleanForTTS(speakFeedback))} className="text-xs text-primary mt-0.5"><Volume2 size={9} className="inline" /> Озвучить</button>
          </div>
        )}
      </div>
      {speakIdx < maxLines - 1
        ? <button onClick={() => { setSpeakIdx(i => i + 1); setSpokenText(''); setSpeakFeedback(''); }} className="w-full py-2.5 bg-secondary text-white rounded-xl font-bold text-sm">Следующее →</button>
        : <button onClick={onComplete} className="w-full py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Готово →</button>
      }
    </div>
  );
}
