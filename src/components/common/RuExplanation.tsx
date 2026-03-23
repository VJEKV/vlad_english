import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';
import type { PhonicsExplanation, GrammarExplanation } from '../../content/ruExplanations';

// Phonics explanation card
export function PhonicsRuCard({ data }: { data: PhonicsExplanation }) {
  const { speakRu, speakWord } = useTTS();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-bold text-lg">
            {data.rule}
          </div>
          <div>
            <h3 className="font-bold">{data.titleRu}</h3>
            <p className="text-sm text-gray-400">{data.titleEn}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-gray-100 p-5 space-y-5"
        >
          {/* Russian explanation with listen button */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => speakRu(data.explanation)}
                className="shrink-0 p-2 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                <Volume2 size={20} />
              </button>
              <p className="text-gray-700 leading-relaxed">{data.explanation}</p>
            </div>
          </div>

          {/* Tip */}
          <div className="flex items-start gap-3 bg-yellow-50 rounded-xl p-4">
            <Lightbulb size={20} className="text-warning shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-warning mb-1">Совет</p>
              <p className="text-gray-700 text-sm">{data.tip}</p>
            </div>
          </div>

          {/* Examples */}
          <div>
            <h4 className="font-bold text-sm text-gray-500 mb-3">Примеры</h4>
            <div className="space-y-2">
              {data.examples.map((ex) => (
                <button
                  key={ex.word}
                  onClick={() => speakWord(ex.word)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-left transition-colors"
                >
                  <Volume2 size={16} className="text-gray-300 shrink-0" />
                  <span className="font-bold text-lg word-display">{ex.word}</span>
                  <span className="text-sm text-gray-400">{ex.transcription}</span>
                  <span className="text-sm text-gray-500 ml-auto">{ex.ru}</span>
                </button>
              ))}
            </div>
            {data.examples.some((e) => e.note) && (
              <div className="mt-3 space-y-1">
                {data.examples.filter((e) => e.note).map((ex) => (
                  <p key={ex.word} className="text-xs text-gray-400">
                    <span className="font-bold">{ex.word}</span> — {ex.note}
                  </p>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Grammar explanation card
export function GrammarRuCard({ data }: { data: GrammarExplanation }) {
  const { speakRu, speakSentence } = useTTS();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 className="font-bold">{data.titleRu}</h3>
            <p className="text-sm text-gray-400">{data.titleEn} • {data.level} класс</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-gray-100 p-5 space-y-5"
        >
          {/* Main explanation */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => speakRu(data.explanation)}
                className="shrink-0 p-2 rounded-lg bg-primary text-white hover:bg-primary/90"
              >
                <Volume2 size={20} />
              </button>
              <p className="text-gray-700 leading-relaxed">{data.explanation}</p>
            </div>
          </div>

          {/* Russian analogy */}
          <div className="bg-green-50 rounded-xl p-4">
            <p className="font-bold text-sm text-success mb-1">По-русски это как:</p>
            <p className="text-gray-700">{data.ruAnalogy}</p>
          </div>

          {/* Formula */}
          <div className="bg-primary/5 rounded-xl p-4 text-center">
            <p className="font-bold text-sm text-primary mb-2">Формула</p>
            <p className="text-xl font-bold text-gray-800 font-mono">{data.formula}</p>
          </div>

          {/* Examples */}
          <div>
            <h4 className="font-bold text-sm text-gray-500 mb-3">Примеры</h4>
            <div className="space-y-2">
              {data.examples.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => speakSentence(ex.en)}
                  className="w-full p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-left transition-colors"
                >
                  <p className="font-medium">
                    {ex.en.split(ex.highlight).map((part, j, arr) => (
                      <span key={j}>
                        {part}
                        {j < arr.length - 1 && (
                          <span className="text-primary font-bold bg-primary/10 px-1 rounded">{ex.highlight}</span>
                        )}
                      </span>
                    ))}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{ex.ru}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Anti-examples (common mistakes) */}
          {data.antiExamples && data.antiExamples.length > 0 && (
            <div>
              <h4 className="font-bold text-sm text-error mb-3 flex items-center gap-1">
                <AlertTriangle size={14} /> Частые ошибки
              </h4>
              <div className="space-y-2">
                {data.antiExamples.map((ae, i) => (
                  <div key={i} className="bg-red-50 rounded-xl p-3">
                    <p className="text-error line-through text-sm">{ae.wrong}</p>
                    <p className="text-success font-bold text-sm">{ae.right} ✓</p>
                    <p className="text-xs text-gray-500 mt-1">{ae.whyRu}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tip */}
          <div className="flex items-start gap-3 bg-yellow-50 rounded-xl p-4">
            <Lightbulb size={20} className="text-warning shrink-0 mt-0.5" />
            <p className="text-gray-700 text-sm">{data.tip}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
