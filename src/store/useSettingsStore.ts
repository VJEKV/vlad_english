import { create } from 'zustand';
import type { Grade, AgeGroup } from '../types';
import { getAgeGroup } from '../types';

export type TTSSpeed = 'slow' | 'normal' | 'fast';

interface SettingsState {
  volume: number;
  musicVolume: number;
  ttsSpeed: TTSSpeed;
  theme: 'auto' | 'playful' | 'modern' | 'minimal';
  grade: Grade | null;
  ageGroup: AgeGroup;
  initialized: boolean;

  setVolume: (v: number) => void;
  setTTSSpeed: (s: TTSSpeed) => void;
  setGrade: (g: Grade) => void;
  init: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  volume: 0.7,
  musicVolume: 0.3,
  ttsSpeed: 'slow' as TTSSpeed,
  theme: 'auto',
  grade: null,
  ageGroup: 'junior',
  initialized: false,

  setVolume: (v) => {
    set({ volume: v });
    window.electronAPI?.store.set('settings.volume', v);
  },

  setTTSSpeed: (s) => {
    set({ ttsSpeed: s });
    window.electronAPI?.store.set('settings.ttsSpeed', s);
  },

  setGrade: (g) => {
    const ageGroup = getAgeGroup(g);
    set({ grade: g, ageGroup });
    window.electronAPI?.store.set('settings.defaultGrade', g);
  },

  init: async () => {
    if (get().initialized) return;
    try {
      const settings = await window.electronAPI?.store.get('settings');
      if (settings) {
        const grade = settings.defaultGrade as Grade | null;
        set({
          volume: settings.volume ?? 0.7,
          musicVolume: settings.musicVolume ?? 0.3,
          ttsSpeed: (settings.ttsSpeed as TTSSpeed) ?? 'slow',
          grade,
          ageGroup: grade ? getAgeGroup(grade) : 'junior',
          initialized: true,
        });
      } else {
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },
}));
