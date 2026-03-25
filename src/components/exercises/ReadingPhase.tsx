import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Square, Play, Mic, MicOff, Bot, Loader2, ChevronRight } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { InteractiveText } from '../common/WordCard';
import type { SpotlightModule } from '../../types';

const CHAR_ICONS: Record<string, string> = {
  'Larry': '👦', 'Lulu': '👧', 'Nanny': '👩‍🍼', 'Magician': '🎩',
  'Town Mouse': '🐭', 'Country Mouse': '🐹', 'Woman': '👩', 'Chuckles': '🐵',
  'Larry & Lulu': '👦👧', 'Larry/Lulu': '👦👧',
};

function parseLine(line: string): { icon: string; name: string; text: string } | null {
  for (const [name, icon] of Object.entries(CHAR_ICONS)) {
    if (line.startsWith(name + ':')) {
      return { icon, name, text: line.substring(line.indexOf(':') + 1).trim() };
    }
  }
  return null;
}

// Strip emoji and special chars from text before TTS
function cleanForTTS(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F6FF}]/gu, '')
    .replace(/[\u{2600}-\u{27BF}]/gu, '')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '')
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '')
    .replace(/[\u{2700}-\u{27BF}]/gu, '')
    .replace(/[*_~`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface Props {
  module: SpotlightModule;
  onComplete: () => void;
}

type SubPhase = 'text' | 'ai_questions' | 'speak_aloud';

export default function ReadingPhase({ module, onComplete }: Props) {
  const { speakSentence, speakRu, stop: stopTTS } = useTTS();
  const [subPhase, setSubPhase] = useState<SubPhase>('text');
  const [playingIdx, setPlayingIdx] = useState<string>('');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [aiLoadingKey, setAiLoadingKey] = useState('');
  const playingRef = useRef(false);

  // AI Questions state
  const [aiQuestions, setAiQuestions] = useState<{ q: string; opts: string[]; answer: number }[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [qFeedback, setQFeedback] = useState('');
  const [qCorrect, setQCorrect] = useState(0);
  const [qLoading, setQLoading] = useState(false);

  // Speak aloud state
  const [speakLineIdx, setSpeakLineIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speakFeedback, setSpeakFeedback] = useState('');
  const recRef = useRef<any>(null);

  const texts = module.texts || [];
  const sentences = module.sentences;

  // Stop all audio
  const stopAll = useCallback(() => {
    stopTTS();
    playingRef.current = false;
    setPlayingIdx('');
  }, [stopTTS]);

  // Play single line
  const playLine = useCallback(async (text: string, key: string) => {
    if (playingRef.current) { stopAll(); return; }
    playingRef.current = true;
    setPlayingIdx(key);
    await speakSentence(text);
    playingRef.current = false;
    setPlayingIdx('');
  }, [speakSentence, stopAll]);

  // Play all lines of a text
  const playAllLines = useCallback(async (lines: string[]) => {
    if (playingRef.current) { stopAll(); return; }
    playingRef.current = true;
    for (let i = 0; i < lines.length; i++) {
      if (!playingRef.current) break;
      const p = parseLine(lines[i]);
      setPlayingIdx(`all-${i}`);
      await speakSentence(p ? p.text : lines[i]);
      await new Promise(r => setTimeout(r, 200));
    }
    playingRef.current = false;
    setPlayingIdx('');
  }, [speakSentence, stopAll]);

  // AI explain — unique key per line
  const explainLine = async (text: string, key: string) => {
    if (aiExplanations[key] || !window.electronAPI?.ai) return;
    setAiLoadingKey(key);
    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Коротко разбери предложение для ребёнка 8 лет: "${text}". Объясни 2-3 ключевых слова. Максимум 2 строки. Без emoji, без звёздочек, без markdown.`
      }], '');
      setAiExplanations(prev => ({ ...prev, [key]: result.content || 'Ошибка' }));
    } catch {
      setAiExplanations(prev => ({ ...prev, [key]: 'Нет связи с AI.' }));
    }
    setAiLoadingKey('');
  };

  // Generate AI questions
  const generateQuestions = async () => {
    if (!window.electronAPI?.ai) { onComplete(); return; }
    setQLoading(true);
    const allText = texts.flatMap(t => t.lines).join(' ').slice(0, 400);
    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Текст на английском: "${allText}". Задай 3 простых вопроса на понимание для ребёнка 8 лет. На русском. Без emoji. Формат строго:
Q1: вопрос
a) вариант
b) вариант
c) вариант
A1: буква

Q2: вопрос
a) вариант
b) вариант
c) вариант
A2: буква

Q3: вопрос
a) вариант
b) вариант
c) вариант
A3: буква`
      }], '');
      const qs: typeof aiQuestions = [];
      const lines = (result.content || '').split('\n');
      let curQ = '', curOpts: string[] = [];
      for (const l of lines) {
        if (l.match(/^Q\d:/)) curQ = l.replace(/^Q\d:\s*/, '');
        if (l.match(/^[abc]\)/)) curOpts.push(l.replace(/^[abc]\)\s*/, ''));
        if (l.match(/^A\d:/)) {
          const a = l.replace(/^A\d:\s*/, '').trim().toLowerCase();
          if (curQ && curOpts.length === 3) {
            qs.push({ q: curQ, opts: [...curOpts], answer: a === 'a' ? 0 : a === 'b' ? 1 : 2 });
          }
          curQ = ''; curOpts = [];
        }
      }
      setAiQuestions(qs.length > 0 ? qs : [{ q: 'Тебе понравился текст?', opts: ['Да', 'Нет', 'Не понял'], answer: 0 }]);
    } catch {
      setAiQuestions([{ q: 'Тебе понравился текст?', opts: ['Да', 'Нет', 'Не понял'], answer: 0 }]);
    }
    setQLoading(false);
    setSubPhase('ai_questions');
  };

  // Speech recognition
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeakFeedback('Микрофон не поддерживается'); return; }
    const r = new SR(); r.lang = 'en-US'; r.interimResults = false;
    r.onresult = (e: any) => { setSpokenText(e.results[0][0].transcript); setListening(false); checkPronunciation(e.results[0][0].transcript); };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recRef.current = r; r.start(); setListening(true); setSpokenText(''); setSpeakFeedback('');
  };

  const allReadLines = [...texts.flatMap(t => t.lines), ...sentences.map(s => s.sentence)];

  const checkPronunciation = async (spoken: string) => {
    const orig = allReadLines[speakLineIdx] || '';
    const p = parseLine(orig);
    const clean = p ? p.text : orig;
    if (!window.electronAPI?.ai) { setSpeakFeedback(spoken ? 'Хорошая попытка!' : ''); return; }
    try {
      const r = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Ребёнок прочитал вслух. Оригинал: "${clean}". Сказал: "${spoken}". Оцени кратко (1-2 предложения). Без emoji, без markdown.`
      }], '');
      setSpeakFeedback(r.content || 'Молодец!');
    } catch { setSpeakFeedback('Хорошая попытка!'); }
  };

  // ===== TEXT PHASE =====
  if (subPhase === 'text') {
    return (
      <div className="max-w-3xl mx-auto">
        {texts.map((t, ti) => (
          <div key={ti} className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b">
              <div>
                <h4 className="font-bold text-sm text-primary">{t.title}</h4>
                <p className="text-xs text-gray-400">{t.titleRu}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => playAllLines(t.lines)} className="flex items-center gap-1 px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold">
                  {playingIdx.startsWith('all') ? <Square size={11} /> : <Play size={11} />}
                  {playingIdx.startsWith('all') ? 'Стоп' : 'Все'}
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {t.lines.map((line, li) => {
                const key = `t${ti}-${li}`;
                const ch = parseLine(line);
                const isPlaying = playingIdx === key || playingIdx === `all-${li}`;
                const lineText = ch ? ch.text : line;

                return (
                  <div key={key} className={`px-4 py-2.5 ${isPlaying ? 'bg-success/5' : ''}`}>
                    <div className="flex items-start gap-2">
                      {ch && <span className="text-lg shrink-0">{ch.icon}</span>}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed ${isPlaying ? 'text-success font-bold' : ''}`}>
                          {ch && <span className="font-bold text-gray-500 text-xs">{ch.name}: </span>}
                          <InteractiveText text={lineText} />
                        </p>
                      </div>
                      <button onClick={() => isPlaying ? stopAll() : playLine(lineText, key)}
                        className={`shrink-0 p-1 rounded ${isPlaying ? 'text-error' : 'text-gray-300 hover:text-primary'}`}>
                        {isPlaying ? <Square size={12} /> : <Volume2 size={12} />}
                      </button>
                      {window.electronAPI?.ai && (
                        <button onClick={() => explainLine(lineText, key)}
                          className="shrink-0 p-1 rounded text-gray-300 hover:text-primary">
                          {aiLoadingKey === key ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />}
                        </button>
                      )}
                    </div>
                    {aiExplanations[key] && (
                      <div className="ml-7 mt-1.5 bg-blue-50 rounded-lg px-3 py-2">
                        <p className="text-xs text-gray-600 leading-relaxed">{aiExplanations[key]}</p>
                        <button onClick={() => speakRu(cleanForTTS(aiExplanations[key]))}
                          className="text-xs text-primary mt-1 flex items-center gap-0.5">
                          <Volume2 size={9} /> Озвучить
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {sentences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b">
              <h4 className="font-bold text-sm text-gray-600">Ключевые предложения</h4>
            </div>
            <div className="divide-y divide-gray-50">
              {sentences.map((s, i) => {
                const key = `s-${i}`;
                return (
                  <div key={key} className="px-4 py-2.5">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm"><InteractiveText text={s.sentence} /></p>
                        <p className="text-xs text-gray-400">{s.translation}</p>
                      </div>
                      <button onClick={() => playLine(s.sentence, key)}
                        className="shrink-0 p-1 text-gray-300 hover:text-primary">
                        <Volume2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={generateQuestions} className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-1.5">
            <Bot size={15} /> Проверка AI
          </button>
          <button onClick={() => setSubPhase('speak_aloud')} className="px-4 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm flex items-center gap-1.5">
            <Mic size={15} /> Вслух
          </button>
          <button onClick={onComplete} className="px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm">
            Далее →
          </button>
        </div>
      </div>
    );
  }

  // ===== AI QUESTIONS =====
  if (subPhase === 'ai_questions') {
    if (qLoading) return <div className="text-center py-12"><Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" /><p className="text-gray-400 text-sm">AI готовит вопросы...</p></div>;
    if (qIdx >= aiQuestions.length) return (
      <div className="max-w-md mx-auto text-center py-8">
        <p className="text-3xl mb-3">{qCorrect >= 2 ? '🎉' : '💪'}</p>
        <h3 className="text-xl font-bold mb-4">{qCorrect} из {aiQuestions.length} правильно</h3>
        <div className="flex gap-2 justify-center">
          <button onClick={() => setSubPhase('speak_aloud')} className="px-5 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm"><Mic size={14} className="inline mr-1" />Вслух</button>
          <button onClick={onComplete} className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Далее →</button>
        </div>
      </div>
    );
    const q = aiQuestions[qIdx];
    return (
      <div className="max-w-md mx-auto">
        <p className="text-xs text-primary font-bold mb-3">Вопрос {qIdx + 1}/{aiQuestions.length}</p>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="font-bold mb-3">{q.q}</p>
          <div className="space-y-2">
            {q.opts.map((o, i) => (
              <button key={i} disabled={!!qFeedback} onClick={() => {
                if (i === q.answer) setQCorrect(c => c + 1);
                setQFeedback(i === q.answer ? '✅ Верно!' : `❌ Ответ: ${q.opts[q.answer]}`);
                setTimeout(() => { setQFeedback(''); setQIdx(x => x + 1); }, 1500);
              }} className={`w-full p-2.5 rounded-xl text-left text-sm font-medium ${
                qFeedback && i === q.answer ? 'bg-success text-white' : qFeedback ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-primary/10'
              }`}>{String.fromCharCode(97 + i)}) {o}</button>
            ))}
          </div>
          {qFeedback && <p className="mt-2 text-sm font-bold">{qFeedback}</p>}
        </div>
      </div>
    );
  }

  // ===== SPEAK ALOUD =====
  const curLine = allReadLines[speakLineIdx] || '';
  const curParsed = parseLine(curLine);
  const curText = curParsed ? curParsed.text : curLine;
  const maxLines = Math.min(allReadLines.length, 5);

  return (
    <div className="max-w-md mx-auto">
      <p className="text-xs text-secondary font-bold mb-3">Прочитай вслух {speakLineIdx + 1}/{maxLines}</p>
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-3">
        <p className="text-base font-bold mb-2"><InteractiveText text={curText} /></p>
        <button onClick={() => speakSentence(curText)} className="text-xs text-primary flex items-center gap-1 mb-3">
          <Volume2 size={11} /> Как правильно
        </button>
        <button onClick={listening ? () => { recRef.current?.stop(); setListening(false); } : startListening}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${listening ? 'bg-error text-white animate-pulse' : 'bg-secondary text-white'}`}>
          {listening ? <><MicOff size={16} /> Слушаю...</> : <><Mic size={16} /> Нажми и читай</>}
        </button>
        {spokenText && <div className="mt-3 p-2 bg-gray-50 rounded-lg"><p className="text-xs text-gray-400">Услышал:</p><p className="text-sm font-medium">{spokenText}</p></div>}
        {speakFeedback && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600">{speakFeedback}</p>
            <button onClick={() => speakRu(cleanForTTS(speakFeedback))} className="text-xs text-primary mt-1 flex items-center gap-0.5"><Volume2 size={9} /> Озвучить</button>
          </div>
        )}
      </div>
      {speakLineIdx < maxLines - 1
        ? <button onClick={() => { setSpeakLineIdx(i => i + 1); setSpokenText(''); setSpeakFeedback(''); }} className="w-full px-4 py-2.5 bg-secondary text-white rounded-xl font-bold text-sm">Следующее →</button>
        : <button onClick={onComplete} className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">Готово →</button>
      }
    </div>
  );
}
