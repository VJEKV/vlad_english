import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Loader2, Volume2, RefreshCw, BookOpen } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import { InteractiveText } from '../common/WordCard';
import { useWordStore } from '../../store/useWordStore';

export default function AIStoryGenerator() {
  const { speakSentence } = useTTS();
  const { words: allWords } = useWordStore();
  const [story, setStory] = useState<string[] | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const knownWords = Object.values(allWords)
    .filter(w => w.box >= 2)
    .map(w => w.word);

  const generateStory = async () => {
    if (!window.electronAPI?.ai) {
      setError('AI доступен только в установленном приложении');
      return;
    }

    if (knownWords.length < 10) {
      setError('Пройди несколько уроков в Spotlight, чтобы выучить больше слов! Нужно минимум 10.');
      return;
    }

    setLoading(true);
    setError(null);
    setStory(null);

    const wordsSample = knownWords.sort(() => Math.random() - 0.5).slice(0, 20).join(', ');

    try {
      const result = await window.electronAPI.ai.chat([{
        role: 'user',
        content: `Напиши очень короткую историю на английском (5-6 предложений) для ребёнка 8 лет. Используй ТОЛЬКО эти слова (и базовые служебные: I, is, am, are, the, a, can, have, got, and, but, in, on, my, his, her): ${wordsSample}.

Формат ответа:
Название: [название на английском]
1. [предложение]
2. [предложение]
3. [предложение]
4. [предложение]
5. [предложение]

Без перевода. Простые короткие предложения.`,
      }], '');

      if (result.error) {
        setError(result.error);
      } else if (result.content) {
        const lines = result.content.split('\n').filter(l => l.trim());
        const titleLine = lines.find(l => l.toLowerCase().startsWith('назван'));
        const sentences = lines
          .filter(l => /^\d/.test(l.trim()))
          .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim());

        setStoryTitle(titleLine?.replace(/^.*?:\s*/, '') || 'My Story');
        setStory(sentences.length > 0 ? sentences : lines.slice(1));
      }
    } catch {
      setError('Нет связи с AI. Проверь интернет.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <Bot size={24} className="text-primary" />
        <div>
          <h3 className="text-xl font-bold">AI Генератор историй</h3>
          <p className="text-sm text-gray-400">Создаёт историю из твоих слов</p>
        </div>
      </div>

      {knownWords.length >= 10 && (
        <p className="text-sm text-gray-500 mb-4">
          Ты знаешь {knownWords.length} слов. AI составит из них историю!
        </p>
      )}

      {!story && !loading && (
        <button
          onClick={generateStory}
          className="w-full px-6 py-4 bg-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 mb-4"
        >
          <BookOpen size={24} /> Создать историю!
        </button>
      )}

      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <Loader2 size={32} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500">AI пишет историю из твоих слов...</p>
        </div>
      )}

      {error && (
        <div className="bg-error/10 rounded-xl p-4 text-error text-sm mb-4">
          {error}
        </div>
      )}

      {story && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-lg text-primary">{storyTitle}</h4>
              <button
                onClick={async () => {
                  for (const s of story) {
                    await speakSentence(s);
                    await new Promise(r => setTimeout(r, 500));
                  }
                }}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold"
              >
                <Volume2 size={14} /> Послушать
              </button>
            </div>

            <div className="space-y-3">
              {story.map((sentence, i) => (
                <div key={i} className="flex items-start gap-2">
                  <button
                    onClick={() => speakSentence(sentence)}
                    className="shrink-0 mt-1 text-gray-300 hover:text-primary"
                  >
                    <Volume2 size={14} />
                  </button>
                  <p className="text-lg leading-relaxed">
                    <InteractiveText text={sentence} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={generateStory}
            className="w-full px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200"
          >
            <RefreshCw size={18} /> Новая история
          </button>
        </motion.div>
      )}
    </div>
  );
}
