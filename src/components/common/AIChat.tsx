import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic, MicOff, Bot, User, Loader2, Volume2 } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useWordStore } from '../../store/useWordStore';
import { useTTS } from '../../hooks/useTTS';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [requestsLeft, setRequestsLeft] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { speakRu, speakSentence } = useTTS();
  const grade = useSettingsStore((s) => s.grade) ?? 2;
  const { getWordStats } = useWordStore();

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check limits on open
  useEffect(() => {
    if (open && window.electronAPI?.ai) {
      window.electronAPI.ai.getLimit().then(l => setRequestsLeft(l.left));
    }
  }, [open]);

  // Build context from student data
  const buildContext = () => {
    const stats = getWordStats();
    return `Класс: ${grade}. Изучено слов: ${stats.total}. Выучено: ${stats.mastered}. Учит: ${stats.learning}. Новых: ${stats.newWords}.`;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!window.electronAPI?.ai) {
      setMessages(m => [...m, { role: 'user', content: text }, { role: 'assistant', content: 'AI-чат работает только в установленном приложении (Electron).' }]);
      return;
    }

    const userMsg: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      const result = await window.electronAPI.ai.chat(apiMessages, buildContext());

      if (result.error) {
        setMessages(m => [...m, { role: 'assistant', content: `⚠️ ${result.error}` }]);
      } else {
        setMessages(m => [...m, { role: 'assistant', content: result.content || '' }]);
        if (result.requestsLeft !== undefined) setRequestsLeft(result.requestsLeft);
      }
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Ошибка связи. Проверь интернет.' }]);
    }

    setLoading(false);
  };

  // Speech recognition (microphone)
  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages(m => [...m, { role: 'assistant', content: '⚠️ Микрофон не поддерживается в этом браузере.' }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ru-RU'; // Listen for Russian
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setListening(false);
      // Auto-send after speech
      setTimeout(() => sendMessage(text), 300);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Привет! 👋 Я твой помощник по английскому! Спроси меня:\n\n• "Как читается слово three?"\n• "Почему he plays а не he play?"\n• "Переведи: я люблю кошек"\n• "Объясни что такое Magic E"',
      }]);
    }
  }, []);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-colors ${
          open ? 'bg-gray-500' : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </button>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary text-white px-4 py-3 flex items-center gap-3">
              <Bot size={20} />
              <div className="flex-1">
                <p className="font-bold text-sm">AI Помощник</p>
                <p className="text-xs text-white/70">Только английский язык</p>
              </div>
              {requestsLeft !== null && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{requestsLeft} запросов</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                      <span className="text-xs opacity-60">{msg.role === 'user' ? 'Ты' : 'AI'}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.role === 'assistant' && msg.content && !msg.content.startsWith('⚠️') && (
                      <button
                        onClick={() => speakRu(msg.content)}
                        className="mt-1.5 flex items-center gap-1 text-xs opacity-50 hover:opacity-100 transition-opacity"
                      >
                        <Volume2 size={11} /> Озвучить
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 rounded-bl-sm">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-3">
              <div className="flex gap-2">
                <button
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-colors ${
                    listening ? 'bg-error text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  title={listening ? 'Остановить' : 'Говорить'}
                >
                  {listening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder={listening ? 'Слушаю...' : 'Спроси про английский...'}
                  className="flex-1 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-primary"
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-40 hover:bg-primary/90"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
