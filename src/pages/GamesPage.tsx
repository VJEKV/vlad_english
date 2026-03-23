import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Puzzle, Zap, Keyboard, Star, Timer, CheckCircle } from 'lucide-react';
import MemoryCards from '../components/games/MemoryCards';
import GrammarBattle from '../components/games/GrammarBattle';
import SpellingBeeGame from '../components/games/SpellingBeeGame';
import WordRace from '../components/games/WordRace';
import TrueFalse from '../components/games/TrueFalse';
import { useProgressStore } from '../store/useProgressStore';

type GameId = 'menu' | 'memory' | 'grammar_battle' | 'spelling_bee' | 'word_race' | 'true_false';

const MEMORY_PAIRS = [
  { en: 'cat', ru: 'кот', emoji: '🐱' }, { en: 'dog', ru: 'собака', emoji: '🐶' },
  { en: 'fish', ru: 'рыба', emoji: '🐟' }, { en: 'bird', ru: 'птица', emoji: '🐦' },
  { en: 'sun', ru: 'солнце', emoji: '☀️' }, { en: 'tree', ru: 'дерево', emoji: '🌳' },
  { en: 'hat', ru: 'шляпа', emoji: '🎩' }, { en: 'cake', ru: 'торт', emoji: '🎂' },
  { en: 'lion', ru: 'лев', emoji: '🦁' }, { en: 'monkey', ru: 'обезьяна', emoji: '🐒' },
  { en: 'coat', ru: 'пальто', emoji: '🧥' }, { en: 'frog', ru: 'лягушка', emoji: '🐸' },
  { en: 'horse', ru: 'лошадь', emoji: '🐴' }, { en: 'milk', ru: 'молоко', emoji: '🥛' },
  { en: 'balloon', ru: 'шар', emoji: '🎈' }, { en: 'star', ru: 'звезда', emoji: '⭐' },
];

export default function GamesPage() {
  const [game, setGame] = useState<GameId>('menu');
  const [result, setResult] = useState<string | null>(null);
  const { addPoints } = useProgressStore();

  const handleMemoryComplete = (moves: number) => {
    const pts = Math.max(10, 60 - moves * 2);
    addPoints(pts);
    setResult(`Собрал все пары за ${moves} ходов! +${pts} очков`);
    setGame('menu');
  };

  const handleGrammarComplete = (score: number) => {
    const pts = score * 5;
    addPoints(pts);
    setResult(`${score} правильных ответов за минуту! +${pts} очков`);
    setGame('menu');
  };

  const handleSpellingComplete = (correct: number, total: number) => {
    const pts = correct * 10;
    addPoints(pts);
    setResult(`${correct} из ${total} слов написано верно! +${pts} очков`);
    setGame('menu');
  };

  const handleWordRaceComplete = (score: number) => {
    const pts = score * 8;
    addPoints(pts);
    setResult(`${score} слов переведено вовремя! +${pts} очков`);
    setGame('menu');
  };

  const handleTrueFalseComplete = (score: number, total: number) => {
    const pts = score * 6;
    addPoints(pts);
    setResult(`${score} из ${total} правильных ответов! +${pts} очков`);
    setGame('menu');
  };

  if (game !== 'menu') {
    return (
      <div>
        <button onClick={() => setGame('menu')} className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-800">
          <ArrowLeft size={20} /> Назад к играм
        </button>

        {game === 'memory' && <MemoryCards pairs={MEMORY_PAIRS} onComplete={handleMemoryComplete} />}
        {game === 'grammar_battle' && <GrammarBattle onComplete={handleGrammarComplete} />}
        {game === 'spelling_bee' && <SpellingBeeGame onComplete={handleSpellingComplete} />}
        {game === 'word_race' && <WordRace onComplete={handleWordRaceComplete} />}
        {game === 'true_false' && <TrueFalse onComplete={handleTrueFalseComplete} />}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-6">Игры</h2>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/10 text-success rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <Star size={20} fill="currentColor" />
          {result}
          <button onClick={() => setResult(null)} className="ml-auto text-sm underline">OK</button>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setGame('memory')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left transition-shadow"
        >
          <div className="w-14 h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Puzzle size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Memory Cards</h3>
            <p className="text-sm text-gray-400">Найди пары: слово ↔ перевод</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setGame('grammar_battle')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left transition-shadow"
        >
          <div className="w-14 h-14 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
            <Zap size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Grammar Battle</h3>
            <p className="text-sm text-gray-400">60 сек — выбирай правильную форму</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setGame('spelling_bee')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left transition-shadow"
        >
          <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Keyboard size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Spelling Bee</h3>
            <p className="text-sm text-gray-400">Послушай слово — напиши его</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setGame('word_race')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left transition-shadow"
        >
          <div className="w-14 h-14 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Timer size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Word Race</h3>
            <p className="text-sm text-gray-400">Слово падает — переведи!</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setGame('true_false')}
          className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left transition-shadow"
        >
          <div className="w-14 h-14 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={28} />
          </div>
          <div>
            <h3 className="font-bold text-lg">True or False</h3>
            <p className="text-sm text-gray-400">Правда или ложь?</p>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
