import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Star, Lock, Play } from 'lucide-react';
import { PHONICS_SECTIONS } from '../content/phonicsIndex';
import type { PhonicsLessonData } from '../content/phonicsLessons';
import LetterLearn from '../components/exercises/LetterLearn';
import SoundPicker from '../components/exercises/SoundPicker';
import WordPractice from '../components/exercises/WordPractice';
import SpellExercise from '../components/exercises/SpellExercise';
import { useProgressStore } from '../store/useProgressStore';
import { PHONICS_EXPLANATIONS } from '../content/ruExplanations';
import { PhonicsRuCard } from '../components/common/RuExplanation';

type LessonPhase = 'menu' | 'learn' | 'sound_pick' | 'word_practice' | 'spell' | 'results';

export default function PhonicsPage() {
  const [activeLesson, setActiveLesson] = useState<PhonicsLessonData | null>(null);
  const [phase, setPhase] = useState<LessonPhase>('menu');
  const [scores, setScores] = useState({ sound: 0, word: 0, spell: 0 });
  const { addPoints, completeLesson, lessonsCompleted } = useProgressStore();

  const startLesson = (lesson: PhonicsLessonData) => {
    setActiveLesson(lesson);
    setPhase('learn');
    setScores({ sound: 0, word: 0, spell: 0 });
  };

  const handleLearnComplete = () => setPhase('sound_pick');

  const handleSoundComplete = (correct: number, total: number) => {
    setScores((s) => ({ ...s, sound: correct }));
    setPhase('word_practice');
  };

  const handleWordComplete = (correct: number, total: number) => {
    setScores((s) => ({ ...s, word: correct }));
    setPhase('spell');
  };

  const handleSpellComplete = (correct: number, total: number) => {
    const s = { ...scores, spell: correct };
    setScores(s);

    // Calculate stars
    const totalCorrect = s.sound + s.word + s.spell;
    const totalQuestions = 5 + Math.min(activeLesson!.practiceWords.length, 6) + Math.min(activeLesson!.practiceWords.length, 5);
    const pct = totalCorrect / totalQuestions;
    const stars = pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
    const pts = totalCorrect * 10 + (stars === 3 ? 50 : 0);

    addPoints(pts);
    completeLesson(activeLesson!.id, stars as 0 | 1 | 2 | 3, pts);
    setPhase('results');
  };

  const goBack = () => {
    setActiveLesson(null);
    setPhase('menu');
  };

  // MENU — lesson list
  if (phase === 'menu') {
    return (
      <div>
        <h2 className="text-3xl font-display text-primary mb-2">Phonics — Учимся читать</h2>
        <p className="text-gray-400 mb-6">Выбери урок и начни учить буквы и звуки</p>

        <div className="space-y-8 max-w-lg">
          {PHONICS_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-display text-gray-600 mb-3">{section.titleRu}</h3>
              <div className="space-y-2">
                {section.lessons.map((lesson) => {
                  const progress = lessonsCompleted[lesson.id];
                  const stars = progress?.stars ?? 0;

                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => startLesson(lesson)}
                      className="w-full flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex-1">
                        <h4 className="font-bold">{lesson.title}</h4>
                        <p className="text-xs text-gray-400">{lesson.titleRu}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star key={s} size={14} className={s <= stars ? 'text-warning fill-warning' : 'text-gray-200'} />
                        ))}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Phonics rules with Russian explanations */}
        <div className="mt-10 max-w-2xl">
          <h3 className="text-xl font-display text-gray-600 mb-4">Правила чтения — объяснения на русском</h3>
          <div className="space-y-3">
            {PHONICS_EXPLANATIONS.map((exp) => (
              <PhonicsRuCard key={exp.id} data={exp} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // RESULTS
  if (phase === 'results' && activeLesson) {
    const totalCorrect = scores.sound + scores.word + scores.spell;
    const progress = lessonsCompleted[activeLesson.id];
    const stars = progress?.stars ?? 0;

    return (
      <div className="flex flex-col items-center py-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-4xl font-display text-primary mb-4">Урок пройден!</h2>

          <div className="flex justify-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <motion.div
                key={s}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: s * 0.3 }}
              >
                <Star
                  size={56}
                  className={s <= stars ? 'text-warning fill-warning' : 'text-gray-200'}
                />
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 max-w-xs mx-auto">
            <p className="text-lg">Звуки: <span className="font-bold">{scores.sound}/5</span></p>
            <p className="text-lg">Слова: <span className="font-bold">{scores.word}/{Math.min(activeLesson.practiceWords.length, 6)}</span></p>
            <p className="text-lg">Буквы: <span className="font-bold">{scores.spell}/{Math.min(activeLesson.practiceWords.length, 5)}</span></p>
            <hr className="my-3" />
            <p className="text-xl font-bold text-primary">+{totalCorrect * 10 + (stars === 3 ? 50 : 0)} очков</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => startLesson(activeLesson)}
              className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
            >
              Пройти снова
            </button>
            <button
              onClick={goBack}
              className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
            >
              К урокам
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // LESSON FLOW
  if (!activeLesson) return null;

  const phaseLabel = {
    learn: '1/4 — Изучаем буквы',
    sound_pick: '2/4 — Узнай звук',
    word_practice: '3/4 — Подбери слово',
    spell: '4/4 — Собери слово',
  }[phase] ?? '';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={goBack}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold">{activeLesson.title}</h2>
          <p className="text-sm text-gray-400">{phaseLabel}</p>
        </div>
      </div>

      {/* Exercise */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {phase === 'learn' && (
            <LetterLearn letters={activeLesson.letters} onComplete={handleLearnComplete} />
          )}
          {phase === 'sound_pick' && (
            <SoundPicker letters={activeLesson.letters} rounds={5} onComplete={handleSoundComplete} />
          )}
          {phase === 'word_practice' && (
            <WordPractice words={activeLesson.practiceWords} onComplete={handleWordComplete} />
          )}
          {phase === 'spell' && (
            <SpellExercise words={activeLesson.practiceWords} onComplete={handleSpellComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
