import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, Volume2, X } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

interface Props {
  word: string;
  correctAnswer: string;
  wrongAnswer: string;
  exerciseType: 'translation' | 'spelling' | 'grammar';
  onClose: () => void;
}

export default function AIErrorHelper({ word, correctAnswer, wrongAnswer, exerciseType, onClose }: Props) {
  const { speakWord, speakRu } = useTTS();
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);

  const askAI = async () => {
    if (!window.electronAPI?.ai || asked) return;
    setLoading(true);
    setAsked(true);

    const prompts: Record<string, string> = {
      translation: `Ребёнок 8 лет перевёл слово "${word}" как "${wrongAnswer}", а правильный ответ "${correctAnswer}". Объясни разницу просто, на русском. Дай запоминалку. Максимум 3 предложения. Используй emoji.`,
      spelling: `Ребёнок написал "${wrongAnswer}" вместо "${correctAnswer}". Объясни правило написания просто, на русском. Дай запоминалку. Максимум 3 предложения.`,
      grammar: `Ребёнок выбрал "${wrongAnswer}" вместо "${correctAnswer}" в предложении с "${word}". Объясни грамматическое правило просто, на русском, для ребёнка 8 лет. Максимум 3 предложения.`,
    };

    try {
      const result = await window.electronAPI.ai.chat(
        [{ role: 'user', content: prompts[exerciseType] || prompts.translation }],
        ''
      );
      setExplanation(result.content || result.error || 'Не удалось получить объяснение');
    } catch {
      setExplanation('Нет связи с AI. Проверь интернет.');
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 rounded-xl p-4 mt-4 max-w-sm mx-auto relative"
    >
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
        <X size={16} />
      </button>

      <div className="flex items-center gap-2 mb-2">
        <Bot size={18} className="text-primary" />
        <span className="font-bold text-sm text-primary">AI Помощник</span>
      </div>

      {!asked && !loading && (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            <span className="text-error line-through">{wrongAnswer}</span> → <span className="text-success font-bold">{correctAnswer}</span>
          </p>
          <button
            onClick={askAI}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90"
          >
            🤖 Объясни почему!
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-3">
          <Loader2 size={20} className="animate-spin text-primary" />
          <span className="ml-2 text-sm text-gray-500">AI думает...</span>
        </div>
      )}

      {explanation && (
        <div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{explanation}</p>
          <button
            onClick={() => speakRu(explanation)}
            className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <Volume2 size={12} /> Послушать
          </button>
        </div>
      )}
    </motion.div>
  );
}
