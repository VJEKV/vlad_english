import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronRight, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProgressStore } from '../store/useProgressStore';
import { SPOTLIGHT_2_MODULES } from '../content/spotlight2';
import { SPOTLIGHT_3_MODULES } from '../content/spotlight3';
import type { SpotlightModule } from '../types';
import SpotlightLesson from '../components/exercises/SpotlightLesson';

export default function SpotlightPage() {
  const grade = useSettingsStore((s) => s.grade) ?? 2;
  const { lessonsCompleted, addPoints, completeLesson, saveLessonPhase, getLessonPhase } = useProgressStore();
  const [activeModule, setActiveModule] = useState<SpotlightModule | null>(null);

  const modules = grade === 2 ? SPOTLIGHT_2_MODULES : grade === 3 ? SPOTLIGHT_3_MODULES : [];

  const handleComplete = (stars: number) => {
    if (!activeModule) return;
    const pts = stars * 20;
    addPoints(pts);
    completeLesson(`spotlight_${activeModule.id}`, stars as 0 | 1 | 2 | 3, pts);
    // Clear saved phase on completion
    saveLessonPhase(`spotlight_${activeModule.id}`, 'completed', 0);
  };

  const handlePhaseChange = (phase: string) => {
    if (!activeModule) return;
    saveLessonPhase(`spotlight_${activeModule.id}`, phase, 0);
  };

  if (activeModule) {
    const savedPhase = getLessonPhase(`spotlight_${activeModule.id}`);
    return (
      <SpotlightLesson
        module={activeModule}
        onComplete={handleComplete}
        onBack={() => setActiveModule(null)}
        onPhaseChange={handlePhaseChange}
        initialPhase={savedPhase?.phase}
      />
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-2">Spotlight {grade}</h2>
      <p className="text-gray-400 mb-6">Уроки по учебнику — нажми на модуль, чтобы начать</p>

      {modules.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          Контент для Spotlight {grade} скоро появится!
        </div>
      )}

      <div className="space-y-3 max-w-lg">
        {modules.map((mod, i) => {
          const progress = lessonsCompleted[`spotlight_${mod.id}`];
          const stars = progress?.stars ?? 0;

          return (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActiveModule(mod)}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{mod.title}</h3>
                <p className="text-sm text-gray-400">{mod.titleRu} — {mod.words.length} слов</p>
              </div>
              <div className="flex gap-0.5 mr-2">
                {[1, 2, 3].map((s) => (
                  <Star key={s} size={14} className={s <= stars ? 'text-warning fill-warning' : 'text-gray-200'} />
                ))}
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
