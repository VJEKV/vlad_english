import { create } from 'zustand';
import type { LessonProgress } from '../types';

interface ProgressState {
  totalPoints: number;
  currentStreak: number;
  lessonsCompleted: Record<string, LessonProgress>;
  // Track which module lesson phase user is on
  lessonPhases: Record<string, { phase: string; round: number }>;

  addPoints: (pts: number) => void;
  completeLesson: (lessonId: string, stars: 0 | 1 | 2 | 3, score: number) => void;
  saveLessonPhase: (lessonId: string, phase: string, round: number) => void;
  getLessonPhase: (lessonId: string) => { phase: string; round: number } | null;
  init: () => Promise<void>;
}

// Save full state snapshot to disk
function saveFullState(getState: () => ProgressState) {
  try {
    const s = getState();
    window.electronAPI?.store.set('progress', {
      totalPoints: s.totalPoints,
      currentStreak: s.currentStreak,
      lessonsCompleted: s.lessonsCompleted,
      lessonPhases: s.lessonPhases,
    });
  } catch {}
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  totalPoints: 0,
  currentStreak: 0,
  lessonsCompleted: {},
  lessonPhases: {},

  addPoints: (pts) => {
    set((s) => ({ totalPoints: s.totalPoints + pts }));
    saveFullState(get);
  },

  completeLesson: (lessonId, stars, score) => {
    const prev = get().lessonsCompleted[lessonId];
    const progress: LessonProgress = {
      lessonId,
      status: 'completed',
      stars: prev ? (Math.max(prev.stars, stars) as 0 | 1 | 2 | 3) : stars,
      bestScore: prev ? Math.max(prev.bestScore, score) : score,
      attempts: (prev?.attempts ?? 0) + 1,
      lastAttemptDate: new Date().toISOString(),
    };
    set((s) => ({
      lessonsCompleted: { ...s.lessonsCompleted, [lessonId]: progress },
    }));
    saveFullState(get);
  },

  saveLessonPhase: (lessonId, phase, round) => {
    set((s) => ({
      lessonPhases: { ...s.lessonPhases, [lessonId]: { phase, round } },
    }));
    saveFullState(get);
  },

  getLessonPhase: (lessonId) => {
    return get().lessonPhases[lessonId] || null;
  },

  init: async () => {
    try {
      const data = await window.electronAPI?.store.get('progress');
      if (data) {
        set({
          totalPoints: data.totalPoints ?? 0,
          currentStreak: data.currentStreak ?? 0,
          lessonsCompleted: data.lessonsCompleted ?? {},
          lessonPhases: data.lessonPhases ?? {},
        });
      }
    } catch {
      // browser mode
    }
  },
}));
