import { useTTS } from '../../hooks/useTTS';
import { getSyllables } from '../../content/syllables';
import { lookupWord, WORD_DICT } from './WordCard';
import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';

interface Props {
  text: string;
  mode: 'syllables' | 'whole';
  className?: string;
  textSize?: string;
}

// Text with syllable dots (mode=syllables) or whole words (mode=whole)
// Each word/syllable is clickable
// Hover shows card with emoji + translation
export default function SyllableText({ text, mode, className, textSize = 'text-2xl' }: Props) {
  const { speakWord, speakSyllable } = useTTS();

  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;

        const clean = token.replace(/[.,!?;:'"()]/g, '');
        const punct = token.slice(clean.length);
        const syllables = getSyllables(clean);
        const info = lookupWord(clean);

        if (mode === 'whole') {
          // WHOLE MODE: word as-is, click = speak word
          return (
            <ClickableWord key={i} word={clean} punct={punct} info={info} textSize={textSize}
              onClick={() => speakWord(clean)} />
          );
        }

        // SYLLABLE MODE: show dots, click syllable = speak syllable
        return (
          <span key={i} className="inline-block">
            {syllables.map((syl, si) => (
              <span key={si}>
                <ClickableSyllable syl={syl} fullWord={clean} info={si === 0 ? info : null} textSize={textSize}
                  onClick={() => syllables.length > 1 ? speakSyllable(syl, clean) : speakWord(clean)} />
                {si < syllables.length - 1 && <span className="text-gray-300 mx-px">·</span>}
              </span>
            ))}
            {punct && <span className={textSize}>{punct}</span>}
            <span> </span>
          </span>
        );
      })}
    </span>
  );
}

// Clickable word with hover card
function ClickableWord({ word, punct, info, textSize, onClick }: {
  word: string; punct: string; info: { ru: string; emoji: string } | null; textSize: string;
  onClick: () => void;
}) {
  const [showCard, setShowCard] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <span className="relative inline-block"
      onMouseEnter={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowCard(true), 600); }}
      onMouseLeave={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowCard(false), 100); }}>
      <span onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`${textSize} font-bold cursor-pointer hover:text-primary hover:bg-primary/5 rounded px-0.5 transition-colors`}>
        {word}{punct}
      </span>
      <AnimatePresence>
        {showCard && info && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[120px] text-center"
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={() => { timerRef.current = setTimeout(() => setShowCard(false), 100); }}>
            <span className="text-3xl block">{info.emoji}</span>
            <p className="font-bold text-sm">{word}</p>
            <p className="text-sm text-gray-600">{info.ru}</p>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-transparent border-b-white" />
          </motion.div>
        )}
      </AnimatePresence>
      <span> </span>
    </span>
  );
}

// Clickable syllable
function ClickableSyllable({ syl, fullWord, info, textSize, onClick }: {
  syl: string; fullWord: string; info: { ru: string; emoji: string } | null; textSize: string;
  onClick: () => void;
}) {
  const [showCard, setShowCard] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <span className="relative inline-block"
      onMouseEnter={() => { if (info) { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowCard(true), 600); } }}
      onMouseLeave={() => { clearTimeout(timerRef.current); timerRef.current = setTimeout(() => setShowCard(false), 100); }}>
      <span onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`${textSize} font-bold cursor-pointer hover:text-primary hover:bg-primary/5 rounded px-0.5 transition-colors`}>
        {syl}
      </span>
      <AnimatePresence>
        {showCard && info && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[120px] text-center"
            onMouseEnter={() => clearTimeout(timerRef.current)}
            onMouseLeave={() => { timerRef.current = setTimeout(() => setShowCard(false), 100); }}>
            <span className="text-3xl block">{info.emoji}</span>
            <p className="font-bold text-sm">{fullWord}</p>
            <p className="text-sm text-gray-600">{info.ru}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
