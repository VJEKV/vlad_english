import { create } from 'zustand';
import type { LeitnerWord } from '../engine/leitnerBox';
import { createLeitnerWord, reviewWord, getDueWords, getStats } from '../engine/leitnerBox';

interface WordStoreState {
  words: Record<string, LeitnerWord>;  // keyed by word

  addWord: (word: string, translation: string, emoji: string) => void;
  addWords: (items: { word: string; translation: string; emoji: string }[]) => void;
  review: (word: string, correct: boolean) => void;
  getDue: () => LeitnerWord[];
  getWordStats: () => ReturnType<typeof getStats>;
  getWordBox: (word: string) => number;
  init: () => Promise<void>;
}

function saveWords(words: Record<string, LeitnerWord>) {
  try {
    window.electronAPI?.store.set('leitnerWords', words);
  } catch {}
}

export const useWordStore = create<WordStoreState>((set, get) => ({
  words: {},

  addWord: (word, translation, emoji) => {
    const state = get();
    if (state.words[word]) return; // already exists
    const lw = createLeitnerWord(word, translation, emoji);
    const newWords = { ...state.words, [word]: lw };
    set({ words: newWords });
    saveWords(newWords);
  },

  addWords: (items) => {
    const state = get();
    const newWords = { ...state.words };
    let changed = false;
    for (const item of items) {
      if (!newWords[item.word]) {
        newWords[item.word] = createLeitnerWord(item.word, item.translation, item.emoji);
        changed = true;
      }
    }
    if (changed) {
      set({ words: newWords });
      saveWords(newWords);
    }
  },

  review: (word, correct) => {
    const state = get();
    const lw = state.words[word];
    if (!lw) return;
    const updated = reviewWord(lw, correct);
    const newWords = { ...state.words, [word]: updated };
    set({ words: newWords });
    saveWords(newWords);
  },

  getDue: () => {
    return getDueWords(Object.values(get().words));
  },

  getWordStats: () => {
    return getStats(Object.values(get().words));
  },

  getWordBox: (word) => {
    return get().words[word]?.box ?? 0;
  },

  init: async () => {
    try {
      const data = await window.electronAPI?.store.get('leitnerWords');
      if (data && typeof data === 'object') {
        set({ words: data as Record<string, LeitnerWord> });
      }
    } catch {}
  },
}));
