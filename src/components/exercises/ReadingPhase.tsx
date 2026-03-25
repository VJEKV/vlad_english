import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Square, Play, Mic, MicOff, Bot, Loader2, ChevronRight, MessageCircle } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { InteractiveText } from '../common/WordCard';
import type { SpotlightModule } from '../../types';

// Character icons
const CHAR_ICONS: Record<string, string> = {
  'Larry': '👦', 'Lulu': '👧', 'Nanny': '👩‍🍼', 'Magician': '🎩',
  'Town Mouse': '🐭', 'Country Mouse': '🐹', 'Woman': '👩', 'Chuckles': '🐵',
};

function getCharIcon(line: string): { icon: string; name: string; text: string } | null {
  for (const [name, icon] of Object.entries(CHAR_ICONS)) {
    if (line.startsWith(name + ':') || line.startsWith(name + ' &')) {
      const text = line.substring(line.indexOf(':') + 1).trim();
      return { icon, name, text };
    }
  }
  return null;
}

interface Props {
  module: SpotlightModule;
  onComplete: () => void;
}

type SubPhase = 'text' | 'ai_questions' | 'speak_aloud';

export default function ReadingPhase({ module, onComplete }: Props) {
  const { speakSentence, speakWord, speakRu, stop: stopTTS } = useTTS();
  const [subPhase, setSubPhase] = useState<SubPhase>('text');
  const [playingLine, setPlayingLine] = useState<number>(-1);
  const [aiExplanation, setAiExplanation] = useState<Record<number, string>>({});
  const [aiLoading, setAiLoading] = useState<number>(-1);
  const [aiQuestions, setAiQuestions] = useState<{ q: string; opts: string[]; answer: number }[]>([]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [questionFeedback, setQuestionFeedback] = useState<string | null>(null);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  // Speak aloud
  const [speakLine, setSpeakLine] = useState(0);
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [speakFeedback, setSpeakFeedback] = useState('');
  const recognitionRef = useRef<any>(null);

  const texts = module.texts || [];
  const sentences = module.sentences;

  // Play single line with karaoke
  const playLine = useCallback(async (text: string, idx: number) => {
    if (playingLine >= 0) { stopTTS(); setPlayingLine(-1); return; }
    setPlayingLine(idx);
    await speakSentence(text);
    setPlayingLine(-1);
  }, [playingLine, speakSentence, stopTTS]);

  // Play all lines
  const playAll = useCallback(async (lines: string[]) => {
    for (let i = 0; i < lines.length; i++) {
      setPlayingLine(i);
      await speakSentence(lines[i]);
      await new Promise(r => setTimeout(r, 300));
    }
    setPlayingLine(-1);
  }, [speakSentence]);

  // AI explain a line
  const explainLine = async (line: string, idx: number) => {
    if (aiExplanation[idx] || !window.electronAPI?.ai) return;
    setAiLoading(idx);
    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Разбери предложение для ребёнка 8 лет: "${line}". Объясни каждое ключевое слово на русском. Максимум 3 строки. Используй emoji.`
      }], '');
      setAiExplanation(prev => ({ ...prev, [idx]: result.content || 'Не удалось получить объяснение' }));
    } catch {
      setAiExplanation(prev => ({ ...prev, [idx]: 'Нет связи с AI.' }));
    }
    setAiLoading(-1);
  };

  // Generate AI questions
  const generateQuestions = async () => {
    if (!window.electronAPI?.ai) { onComplete(); return; }
    setQuestionsLoading(true);
    const allText = [...(texts.flatMap(t => t.lines)), ...sentences.map(s => s.sentence)].join(' ');
    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Ребёнок 8 лет прочитал текст на английском: "${allText.slice(0, 500)}". Задай 3 простых вопроса на понимание текста. На русском. Формат СТРОГО:
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
      // Parse questions
      const qs: typeof aiQuestions = [];
      const lines = (result.content || '').split('\n');
      let currentQ = '', currentOpts: string[] = [], currentA = 0;
      for (const l of lines) {
        if (l.match(/^Q\d:/)) currentQ = l.replace(/^Q\d:\s*/, '');
        if (l.match(/^[abc]\)/)) currentOpts.push(l.replace(/^[abc]\)\s*/, ''));
        if (l.match(/^A\d:/)) {
          const letter = l.replace(/^A\d:\s*/, '').trim().toLowerCase();
          currentA = letter === 'a' ? 0 : letter === 'b' ? 1 : 2;
          if (currentQ && currentOpts.length === 3) {
            qs.push({ q: currentQ, opts: currentOpts, answer: currentA });
          }
          currentQ = ''; currentOpts = []; currentA = 0;
        }
      }
      setAiQuestions(qs.length > 0 ? qs : [{ q: 'О чём был текст?', opts: ['О животных', 'Об игрушках', 'О еде'], answer: 1 }]);
    } catch {
      setAiQuestions([{ q: 'Тебе понравился текст?', opts: ['Да!', 'Нет', 'Не понял'], answer: 0 }]);
    }
    setQuestionsLoading(false);
    setSubPhase('ai_questions');
  };

  // Speech recognition
  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setSpeakFeedback('Микрофон не поддерживается'); return; }
    const r = new SR();
    r.lang = 'en-US';
    r.interimResults = false;
    r.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setSpokenText(text);
      setListening(false);
      // Compare with original
      checkPronunciation(text);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recognitionRef.current = r;
    r.start();
    setListening(true);
    setSpokenText('');
    setSpeakFeedback('');
  };

  const checkPronunciation = async (spoken: string) => {
    const allLines = texts.flatMap(t => t.lines);
    const original = allLines[speakLine] || sentences[0]?.sentence || '';
    if (!window.electronAPI?.ai) {
      setSpeakFeedback(spoken.toLowerCase().includes(original.split(' ')[0].toLowerCase()) ? 'Хорошо! 👍' : 'Попробуй ещё раз');
      return;
    }
    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Ребёнок 8 лет прочитал вслух по-английски. Оригинал: "${original}". Ребёнок сказал: "${spoken}". Оцени произношение на русском, кратко (2 предложения). Похвали если хорошо. Если есть ошибки — объясни как правильно произнести. Используй emoji.`
      }], '');
      setSpeakFeedback(result.content || 'Молодец!');
    } catch {
      setSpeakFeedback('Хорошая попытка! 👍');
    }
  };

  // ===== SUB-PHASE: TEXT =====
  if (subPhase === 'text') {
    return (
      <div className="max-w-3xl mx-auto">
        {/* Textbook texts */}
        {texts.map((t, ti) => (
          <div key={ti} className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b">
              <div>
                <h4 className="font-bold text-primary">{t.title}</h4>
                <p className="text-xs text-gray-400">{t.titleRu}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => playAll(t.lines)} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">
                  <Play size={12} /> Все
                </button>
                {playingLine >= 0 && (
                  <button onClick={() => { stopTTS(); setPlayingLine(-1); }} className="flex items-center gap-1 px-3 py-1.5 bg-error text-white rounded-lg text-xs font-bold">
                    <Square size={12} /> Стоп
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {t.lines.map((line, li) => {
                const char = getCharIcon(line);
                const isPlaying = playingLine === li;

                return (
                  <div key={li} className={`px-5 py-3 transition-colors ${isPlaying ? 'bg-success/5' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start gap-3">
                      {/* Character icon */}
                      {char ? (
                        <span className="text-xl shrink-0 mt-0.5">{char.icon}</span>
                      ) : (
                        <span className="w-6" />
                      )}

                      <div className="flex-1 min-w-0">
                        {/* English text — clickable words */}
                        <p className={`text-base leading-relaxed ${isPlaying ? 'text-success font-bold' : ''}`}>
                          {char ? <span className="font-bold text-gray-500">{char.name}: </span> : null}
                          <InteractiveText text={char ? char.text : line} />
                        </p>
                      </div>

                      {/* Play button */}
                      <button onClick={() => playLine(char ? char.text : line, li)}
                        className={`shrink-0 p-1.5 rounded-lg transition-colors ${isPlaying ? 'bg-error/10 text-error' : 'text-gray-300 hover:text-primary hover:bg-primary/5'}`}>
                        {isPlaying ? <Square size={14} /> : <Volume2 size={14} />}
                      </button>

                      {/* AI explain button */}
                      {window.electronAPI?.ai && (
                        <button onClick={() => explainLine(char ? char.text : line, li)}
                          className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-primary hover:bg-primary/5">
                          {aiLoading === li ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
                        </button>
                      )}
                    </div>

                    {/* AI explanation */}
                    {aiExplanation[li] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        className="ml-9 mt-2 bg-blue-50 rounded-lg p-3 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <Bot size={14} className="text-primary shrink-0 mt-0.5" />
                          <div>
                            <p className="whitespace-pre-wrap">{aiExplanation[li]}</p>
                            <button onClick={() => speakRu(aiExplanation[li])} className="text-xs text-primary mt-1 flex items-center gap-1">
                              <Volume2 size={10} /> Озвучить
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Key sentences */}
        {sentences.length > 0 && (
          <div className="mb-4">
            <h4 className="font-bold text-gray-600 mb-2">Ключевые предложения</h4>
            <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50 overflow-hidden">
              {sentences.map((s, i) => (
                <div key={i} className="px-5 py-3 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-base font-medium"><InteractiveText text={s.sentence} /></p>
                      <p className="text-sm text-gray-400 mt-0.5">{s.translation}</p>
                    </div>
                    <button onClick={() => speakSentence(s.sentence)} className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-primary">
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next buttons */}
        <div className="flex gap-3">
          <button onClick={generateQuestions}
            className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center justify-center gap-2">
            <Bot size={18} /> Проверка AI <ChevronRight size={16} />
          </button>
          <button onClick={() => setSubPhase('speak_aloud')}
            className="px-6 py-3 bg-secondary text-white rounded-xl font-bold flex items-center gap-2">
            <Mic size={18} /> Читать вслух
          </button>
          <button onClick={onComplete} className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold">
            Пропустить →
          </button>
        </div>
      </div>
    );
  }

  // ===== SUB-PHASE: AI QUESTIONS =====
  if (subPhase === 'ai_questions') {
    if (questionsLoading) {
      return (
        <div className="max-w-lg mx-auto text-center py-12">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">AI готовит вопросы...</p>
        </div>
      );
    }

    if (questionIdx >= aiQuestions.length) {
      return (
        <div className="max-w-lg mx-auto text-center py-8">
          <p className="text-4xl mb-4">{questionsCorrect >= 2 ? '🎉' : '💪'}</p>
          <h3 className="text-2xl font-bold mb-2">{questionsCorrect} из {aiQuestions.length} правильно!</h3>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => setSubPhase('speak_aloud')}
              className="px-6 py-3 bg-secondary text-white rounded-xl font-bold flex items-center gap-2">
              <Mic size={18} /> Читать вслух
            </button>
            <button onClick={onComplete} className="px-6 py-3 bg-primary text-white rounded-xl font-bold">
              Дальше →
            </button>
          </div>
        </div>
      );
    }

    const q = aiQuestions[questionIdx];
    return (
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Bot size={20} className="text-primary" />
          <span className="font-bold text-primary">Вопрос {questionIdx + 1} из {aiQuestions.length}</span>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <p className="text-xl font-bold mb-4">{q.q}</p>
          <div className="space-y-2">
            {q.opts.map((opt, i) => (
              <button key={i} onClick={() => {
                if (questionFeedback) return;
                const correct = i === q.answer;
                if (correct) setQuestionsCorrect(c => c + 1);
                setQuestionFeedback(correct ? '✅ Правильно!' : `❌ Правильный ответ: ${q.opts[q.answer]}`);
                setTimeout(() => { setQuestionFeedback(null); setQuestionIdx(idx => idx + 1); }, 2000);
              }}
                className={`w-full p-3 rounded-xl text-left font-medium transition-colors ${
                  questionFeedback && i === q.answer ? 'bg-success text-white' :
                  questionFeedback ? 'bg-gray-100 text-gray-400' :
                  'bg-gray-50 hover:bg-primary/10'
                }`}>
                {String.fromCharCode(97 + i)}) {opt}
              </button>
            ))}
          </div>
          {questionFeedback && <p className="mt-3 font-bold">{questionFeedback}</p>}
        </div>
      </div>
    );
  }

  // ===== SUB-PHASE: SPEAK ALOUD =====
  const allReadLines = [...texts.flatMap(t => t.lines), ...sentences.map(s => s.sentence)];
  const currentLine = allReadLines[speakLine] || '';

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Mic size={20} className="text-secondary" />
        <span className="font-bold text-secondary">Прочитай вслух — {speakLine + 1} из {Math.min(allReadLines.length, 5)}</span>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        {/* Original sentence */}
        <p className="text-xl font-bold mb-2"><InteractiveText text={currentLine} /></p>
        <button onClick={() => speakSentence(currentLine)} className="flex items-center gap-1 text-primary text-sm mb-4">
          <Volume2 size={14} /> Послушать как правильно
        </button>

        {/* Record button */}
        <button onClick={listening ? () => { recognitionRef.current?.stop(); setListening(false); } : startListening}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
            listening ? 'bg-error text-white animate-pulse' : 'bg-secondary text-white'
          }`}>
          {listening ? <><MicOff size={20} /> Слушаю...</> : <><Mic size={20} /> Нажми и читай</>}
        </button>

        {/* What was heard */}
        {spokenText && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">Я услышал:</p>
            <p className="font-bold">{spokenText}</p>
          </div>
        )}

        {/* AI feedback on pronunciation */}
        {speakFeedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-start gap-2">
              <Bot size={14} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm whitespace-pre-wrap">{speakFeedback}</p>
                <button onClick={() => speakRu(speakFeedback)} className="text-xs text-primary mt-1 flex items-center gap-1">
                  <Volume2 size={10} /> Озвучить
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        {speakLine < Math.min(allReadLines.length, 5) - 1 ? (
          <button onClick={() => { setSpeakLine(l => l + 1); setSpokenText(''); setSpeakFeedback(''); }}
            className="flex-1 px-6 py-3 bg-secondary text-white rounded-xl font-bold">
            Следующее →
          </button>
        ) : (
          <button onClick={onComplete} className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold">
            Готово →
          </button>
        )}
      </div>
    </div>
  );
}
