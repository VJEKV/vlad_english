// Leitner Box — spaced repetition system for vocabulary
// 5 boxes: Box 1 (every day) → Box 5 (every 16 days)
// Correct → move to next box. Wrong → back to box 1.

export interface LeitnerWord {
  word: string;
  translation: string;
  emoji: string;
  box: 1 | 2 | 3 | 4 | 5;      // Current box (1=new, 5=mastered)
  nextReview: string;             // ISO date string
  totalCorrect: number;
  totalWrong: number;
  lastReviewed: string;
}

// Days between reviews for each box
const BOX_INTERVALS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function createLeitnerWord(word: string, translation: string, emoji: string): LeitnerWord {
  return {
    word,
    translation,
    emoji,
    box: 1,
    nextReview: new Date().toISOString(),
    totalCorrect: 0,
    totalWrong: 0,
    lastReviewed: new Date().toISOString(),
  };
}

// Process answer: correct → next box, wrong → box 1
export function reviewWord(lw: LeitnerWord, correct: boolean): LeitnerWord {
  const now = new Date();
  if (correct) {
    const newBox = Math.min(5, lw.box + 1) as 1 | 2 | 3 | 4 | 5;
    return {
      ...lw,
      box: newBox,
      nextReview: addDays(now, BOX_INTERVALS[newBox]).toISOString(),
      totalCorrect: lw.totalCorrect + 1,
      lastReviewed: now.toISOString(),
    };
  } else {
    return {
      ...lw,
      box: 1,
      nextReview: addDays(now, 1).toISOString(),
      totalWrong: lw.totalWrong + 1,
      lastReviewed: now.toISOString(),
    };
  }
}

// Get words due for review today
export function getDueWords(words: LeitnerWord[]): LeitnerWord[] {
  const now = new Date().toISOString();
  return words.filter(w => w.nextReview <= now).sort((a, b) => a.box - b.box);
}

// Stats
export function getStats(words: LeitnerWord[]) {
  const total = words.length;
  const mastered = words.filter(w => w.box >= 4).length;
  const learning = words.filter(w => w.box >= 2 && w.box <= 3).length;
  const newWords = words.filter(w => w.box === 1).length;
  const dueToday = getDueWords(words).length;
  return { total, mastered, learning, newWords, dueToday };
}
