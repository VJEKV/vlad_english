import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTTS } from '../../hooks/useTTS';
import { shuffle } from '../../content/phonicsLessons';

interface Props {
  pairs: { en: string; ru: string; emoji: string }[];
  onComplete: (moves: number) => void;
}

interface Card {
  id: number;
  text: string;
  type: 'en' | 'ru';
  pairKey: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryCards({ pairs, onComplete }: Props) {
  const { speakWord } = useTTS();
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const selected = pairs.slice(0, 6);
    const deck: Card[] = [];
    selected.forEach((p, i) => {
      deck.push({ id: i * 2, text: p.en, type: 'en', pairKey: p.en, flipped: false, matched: false });
      deck.push({ id: i * 2 + 1, text: `${p.emoji} ${p.ru}`, type: 'ru', pairKey: p.en, flipped: false, matched: false });
    });
    setCards(shuffle(deck));
  }, [pairs]);

  const handleFlip = (id: number) => {
    if (locked) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched) return;

    if (card.type === 'en') speakWord(card.text);

    const newFlipped = [...flipped, id];
    setCards(cards.map((c) => (c.id === id ? { ...c, flipped: true } : c)));

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = newFlipped.map((fid) => cards.find((c) => c.id === fid)!);

      if (a.pairKey === b.pairKey && a.type !== b.type) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.pairKey === a.pairKey ? { ...c, matched: true } : c))
          );
          setFlipped([]);
          setLocked(false);

          // Check if all matched
          const remaining = cards.filter((c) => !c.matched && c.pairKey !== a.pairKey);
          if (remaining.length === 0) {
            setTimeout(() => onComplete(moves + 1), 500);
          }
        }, 500);
      } else {
        // No match — flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newFlipped.includes(c.id) ? { ...c, flipped: false } : c
            )
          );
          setFlipped([]);
          setLocked(false);
        }, 1000);
      }
    } else {
      setFlipped(newFlipped);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-lg text-gray-500 mb-4">Ходов: {moves}</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg">
        {cards.map((card) => (
          <motion.button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            whileHover={{ scale: card.matched ? 1 : 1.05 }}
            className={`w-24 h-24 rounded-xl text-center font-bold transition-all ${
              card.matched
                ? 'bg-success/20 text-success border-2 border-success/30'
                : card.flipped
                ? 'bg-white border-2 border-primary shadow-md text-gray-800'
                : 'bg-primary text-white shadow-sm cursor-pointer'
            }`}
          >
            {card.flipped || card.matched ? (
              <span className={card.type === 'en' ? 'text-lg word-display' : 'text-sm'}>
                {card.text}
              </span>
            ) : (
              <span className="text-3xl">?</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
