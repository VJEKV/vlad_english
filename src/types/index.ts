// Electron API (exposed via preload)
export interface ElectronAPI {
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  tts: {
    speak: (text: string, lang: string, rate: string) => Promise<string | null>;
    clearCache: () => Promise<number>;
  };
  ai: {
    chat: (messages: { role: string; content: string }[], context: string) => Promise<{ content?: string; error?: string; requestsLeft?: number }>;
    getLimit: () => Promise<{ used: number; limit: number; left: number }>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

// Grade & age groups
export type Grade = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type AgeGroup = 'junior' | 'middle' | 'senior';
export type CEFRLevel = 'pre-a1' | 'a1' | 'a1+' | 'a1-a2' | 'a2' | 'a2-b1' | 'b1';

export function getAgeGroup(grade: Grade): AgeGroup {
  if (grade <= 4) return 'junior';
  if (grade <= 6) return 'middle';
  return 'senior';
}

export function getCEFR(grade: Grade): CEFRLevel {
  const map: Record<Grade, CEFRLevel> = {
    2: 'pre-a1', 3: 'a1', 4: 'a1+', 5: 'a1-a2', 6: 'a2', 7: 'a2-b1', 8: 'b1',
  };
  return map[grade];
}

// Student profile
export interface StudentProfile {
  id: string;
  name: string;
  avatarId: string;
  grade: Grade;
  createdAt: string;
  parentPin: string;
}

// Phonics
export type PhonicsLevel =
  | 'alphabet' | 'short_vowels' | 'consonant_blends' | 'long_vowels'
  | 'digraphs' | 'vowel_teams' | 'r_controlled' | 'sight_words';

// Exercise types
export type ExerciseType =
  | 'letter_sound' | 'sound_picker' | 'word_builder' | 'word_reader'
  | 'read_aloud' | 'picture_match' | 'sentence_builder' | 'fill_the_gap'
  | 'listen_and_choose' | 'spelling_bee' | 'story_reader'
  | 'grammar_choice' | 'grammar_transform' | 'translation'
  | 'text_comprehension' | 'listening_comprehension'
  | 'essay_writer' | 'error_correction' | 'word_formation';

// Lesson
export interface Lesson {
  id: string;
  title: string;
  titleRu: string;
  level: PhonicsLevel | string;
  order: number;
  grade: Grade;
  exercises: Exercise[];
  unlockCondition: { lessonId: string; minStars: number } | null;
  estimatedMinutes: number;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  instructionRu: string;
  data: any;
  points: number;
  hints: string[];
}

// Progress
export interface LessonProgress {
  lessonId: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  stars: 0 | 1 | 2 | 3;
  bestScore: number;
  attempts: number;
  lastAttemptDate: string;
}

export interface WordProgress {
  word: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  totalAttempts: number;
  correctAttempts: number;
}

// Spotlight vocabulary
export interface SpotlightWord {
  word: string;
  translation: string;
  image: string;
  audio?: string;
  phonicsRule?: string;
  partOfSpeech: string;
  difficulty: 1 | 2 | 3;
}

export interface SpotlightModule {
  id: string;
  title: string;
  titleRu: string;
  grade: Grade;
  order: number;
  words: SpotlightWord[];
  phrases: { phrase: string; translation: string; context: string }[];
  sentences: { sentence: string; translation: string; highlightWords: string[] }[];
  grammar: string[];
  texts?: { title: string; titleRu: string; lines: string[] }[];
}
