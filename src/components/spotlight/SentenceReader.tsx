import { useState, useCallback, useRef, useEffect } from 'react';
import { Square, BookOpen, Volume2, Eye, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSyllables } from '../../content/syllables';
import { playWord, playSyllable, stopAudio } from '../../audio/player';
import { useTTS } from '../../hooks/useTTS';
import { lookupWord } from '../common/WordCard';

// Word with hover card showing emoji + translation
function WordWithCard({ children, word, className, onClick }: {
  children: React.ReactNode; word: string; className?: string; onClick?: () => void;
}) {
  const [show, setShow] = useState(false);
  const showRef = useRef<ReturnType<typeof setTimeout>>();
  const hideRef = useRef<ReturnType<typeof setTimeout>>();
  const info = lookupWord(word);

  useEffect(() => () => { clearTimeout(showRef.current); clearTimeout(hideRef.current); }, []);

  return (
    <span className="relative inline-block"
      onMouseEnter={() => { clearTimeout(hideRef.current); showRef.current = setTimeout(() => setShow(true), 500); }}
      onMouseLeave={() => { clearTimeout(showRef.current); hideRef.current = setTimeout(() => setShow(false), 100); }}>
      <span onClick={onClick} className={className}>{children}</span>
      <AnimatePresence>
        {show && info && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-2 min-w-[110px] text-center pointer-events-none">
            <span className="text-3xl block">{info.emoji}</span>
            <p className="font-bold text-xs">{word}</p>
            <p className="text-xs text-gray-600">{info.ru}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}
import { useSettingsStore } from '../../store/useSettingsStore';

interface Props {
  text: string;
  charIcon?: string;
  charName?: string;
  translation?: string;
  onAIExplain?: () => void;
  aiExplanation?: string;
  aiLoading?: boolean;
  speakRuFn?: (text: string) => void;
}

/**
 * A single sentence with per-sentence [По слогам] [Целиком] toggle.
 * Green highlight marker runs through syllables/words during playback.
 * Uses pre-generated mp3 (instant), falls back to TTS API.
 */
export default function SentenceReader({
  text, charIcon, charName, translation, onAIExplain, aiExplanation, aiLoading, speakRuFn
}: Props) {
  const { speakWord: ttsWord, speakSyllable: ttsSyl, speakSentence: ttsSent } = useTTS();
  const syllableDelay = useSettingsStore(s => s.syllableDelay);
  const [mode, setMode] = useState<'whole' | 'syllables'>('whole');
  const [playing, setPlaying] = useState(false);
  const [activeWordIdx, setActiveWordIdx] = useState(-1);
  const [activeSylIdx, setActiveSylIdx] = useState(-1);
  const [showTranslation, setShowTranslation] = useState(false);

  // Parse words (skip whitespace)
  const rawTokens = text.split(/\s+/);

  // Play word from mp3, fallback API
  const pw = async (w: string) => { try { await playWord(w); } catch { await ttsWord(w); } };
  const ps = async (syl: string, word: string) => { try { await playSyllable(syl, word); } catch { await ttsSyl(syl, word); } };
  const pSent = async (t: string) => { try { /* no sentence mp3 yet */ await ttsSent(t); } catch {} };

  // "По слогам" — read by syllables with green marker
  const playSyllables = useCallback(async () => {
    if (playing) { stopAudio(); setPlaying(false); setActiveWordIdx(-1); setActiveSylIdx(-1); return; }
    setMode('syllables');
    setPlaying(true);

    for (let wi = 0; wi < rawTokens.length; wi++) {
      const clean = rawTokens[wi].replace(/[.,!?;:'"()]/g, '');
      if (!clean) continue;
      const syls = getSyllables(clean);
      if (syls.length > 1) {
        for (let si = 0; si < syls.length; si++) {
          setActiveWordIdx(wi);
          setActiveSylIdx(si);
          await ps(syls[si], clean);
          await new Promise(r => setTimeout(r, syllableDelay));
        }
      } else {
        setActiveWordIdx(wi);
        setActiveSylIdx(-1);
        await pw(clean);
        await new Promise(r => setTimeout(r, syllableDelay));
      }
    }

    // Full sentence
    setActiveWordIdx(-1); setActiveSylIdx(-1);
    await new Promise(r => setTimeout(r, 400));
    setActiveWordIdx(-2); // all green
    await pSent(text);
    setActiveWordIdx(-1);
    setPlaying(false);
  }, [playing, rawTokens, text, syllableDelay]);

  // "Целиком" — read word by word with green marker
  const playWhole = useCallback(async () => {
    if (playing) { stopAudio(); setPlaying(false); setActiveWordIdx(-1); return; }
    setMode('whole');
    setPlaying(true);

    for (let wi = 0; wi < rawTokens.length; wi++) {
      const clean = rawTokens[wi].replace(/[.,!?;:'"()]/g, '');
      if (!clean) continue;
      setActiveWordIdx(wi);
      await pw(clean);
      await new Promise(r => setTimeout(r, syllableDelay));
    }

    setActiveWordIdx(-1);
    await new Promise(r => setTimeout(r, 400));
    setActiveWordIdx(-2);
    await pSent(text);
    setActiveWordIdx(-1);
    setPlaying(false);
  }, [playing, rawTokens, text, syllableDelay]);

  // Click individual syllable
  const clickSyl = async (syl: string, word: string, wi: number, si: number) => {
    if (playing) return;
    setActiveWordIdx(wi); setActiveSylIdx(si);
    await ps(syl, word);
    setTimeout(() => { setActiveWordIdx(-1); setActiveSylIdx(-1); }, 400);
  };

  // Click whole word
  const clickWord = async (word: string, wi: number) => {
    if (playing) return;
    setActiveWordIdx(wi);
    await pw(word);
    setTimeout(() => setActiveWordIdx(-1), 400);
  };

  return (
    <div className="px-4 py-3 border-b border-gray-50">
      {/* Character + text */}
      <div className="flex items-start gap-2 mb-1">
        {charIcon && <span className="text-lg shrink-0">{charIcon}</span>}
        <div className="flex-1">
          {charName && <span className="text-xs font-bold text-gray-400">{charName}:</span>}
          <p className="text-2xl font-bold leading-relaxed mt-1">
            {rawTokens.map((token, wi) => {
              const clean = token.replace(/[.,!?;:'"()]/g, '');
              const punct = token.slice(clean.length);
              if (!clean) return <span key={wi}>{token} </span>;
              const syls = getSyllables(clean);
              const isWordActive = activeWordIdx === wi || activeWordIdx === -2;

              if (mode === 'syllables' && syls.length > 1) {
                return (
                  <span key={wi} className="inline-block">
                    {syls.map((s, si) => {
                      const isSylActive = isWordActive && (activeSylIdx === si || activeSylIdx === -1 && activeWordIdx === -2);
                      return (
                        <span key={si}>
                          <WordWithCard word={clean} onClick={() => clickSyl(s, clean, wi, si)}
                            className={`cursor-pointer rounded px-0.5 transition-all duration-200 ${
                              isSylActive ? 'bg-success text-white' : 'hover:text-primary hover:bg-primary/5'
                            }`}>{s}</WordWithCard>
                          {si < syls.length - 1 && <span className="text-gray-300 mx-px text-lg">·</span>}
                        </span>
                      );
                    })}
                    {punct}
                    <span> </span>
                  </span>
                );
              }

              return (
                <span key={wi}>
                  <span onClick={() => clickWord(clean, wi)}
                    className={`cursor-pointer rounded px-0.5 transition-all duration-200 ${
                      isWordActive ? 'bg-success text-white' : 'hover:text-primary hover:bg-primary/5'
                    }`}>{token}</span>
                  <span> </span>
                </span>
              );
            })}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-1.5 ml-7 mt-1 flex-wrap">
        <button onClick={playSyllables}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            playing && mode === 'syllables' ? 'bg-error text-white' : mode === 'syllables' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}>
          {playing && mode === 'syllables' ? <><Square size={10} className="inline mr-0.5" />Стоп</> : <>📖 По слогам</>}
        </button>
        <button onClick={playWhole}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            playing && mode === 'whole' ? 'bg-error text-white' : mode === 'whole' && !playing ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}>
          {playing && mode === 'whole' ? <><Square size={10} className="inline mr-0.5" />Стоп</> : <>▶ Целиком</>}
        </button>
        {translation !== undefined && (
          <button onClick={() => setShowTranslation(!showTranslation)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${showTranslation ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <Eye size={10} className="inline mr-0.5" />Перевод
          </button>
        )}
        {onAIExplain && (
          <button onClick={onAIExplain}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-500 hover:bg-gray-200">
            {aiLoading ? <Loader2 size={10} className="inline animate-spin mr-0.5" /> : <Bot size={10} className="inline mr-0.5" />}
            Как читать
          </button>
        )}
      </div>

      {/* Translation */}
      {showTranslation && translation && (
        <p className="text-sm text-gray-400 italic ml-7 mt-1">{translation}</p>
      )}

      {/* AI explanation */}
      {aiExplanation && (
        <div className="ml-7 mt-2 bg-blue-50 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-600 whitespace-pre-wrap">{aiExplanation}</p>
          {speakRuFn && (
            <button onClick={() => speakRuFn(aiExplanation.replace(/[\u{1F600}-\u{1FAFF}]/gu, '').replace(/[*_~`#]/g, ''))}
              className="text-xs text-primary mt-1"><Volume2 size={9} className="inline" /> Озвучить</button>
          )}
        </div>
      )}
    </div>
  );
}
