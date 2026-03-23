import { useState, useRef, useEffect } from 'react';
import { Star, Flame, Search, Volume2, X } from 'lucide-react';
import { useProgressStore } from '../../store/useProgressStore';
import { WORD_DICT, lookupWord } from '../common/WordCard';
import { useTTS } from '../../hooks/useTTS';

export default function TopBar() {
  const { totalPoints, currentStreak } = useProgressStore();
  const { speakWord } = useTTS();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search results
  const results = query.trim().length >= 1
    ? Object.entries(WORD_DICT)
        .filter(([word, info]) =>
          word.includes(query.toLowerCase()) ||
          info.ru.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 8)
    : [];

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm border-b border-gray-100">
      <h1 className="text-2xl font-display text-primary">VladEnglish</h1>

      {/* Search bar */}
      <div ref={containerRef} className="relative flex-1 max-w-md mx-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Поиск слова..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-primary focus:bg-white transition-colors"
          />
          {query && (
            <button onClick={() => { setQuery(''); setShowResults(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
            {results.map(([word, info]) => (
              <button
                key={word}
                onClick={() => { speakWord(word); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-50 last:border-0"
              >
                <span className="text-2xl">{info.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{word}</p>
                  <p className="text-xs text-gray-400">{info.ru}</p>
                </div>
                <Volume2 size={14} className="text-gray-300" />
              </button>
            ))}
          </div>
        )}

        {showResults && query.trim().length >= 1 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-400 z-50">
            Слово не найдено
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5 text-warning">
          <Star size={20} fill="currentColor" />
          <span className="font-bold text-lg">{totalPoints}</span>
        </div>
        <div className="flex items-center gap-1.5 text-error">
          <Flame size={20} fill="currentColor" />
          <span className="font-bold text-lg">{currentStreak}</span>
        </div>
      </div>
    </header>
  );
}
