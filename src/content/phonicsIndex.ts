import { PHONICS_LESSONS } from './phonicsLessons';
import { CONSONANT_BLEND_LESSONS } from './phonicsConsonantBlends';
import { LONG_VOWEL_LESSONS } from './phonicsLongVowels';
import { DIGRAPH_LESSONS } from './phonicsDigraphs';
import { VOWEL_TEAM_LESSONS } from './phonicsVowelTeams';
import { R_CONTROLLED_LESSONS } from './phonicsRControlled';
import { SIGHT_WORD_LESSONS } from './phonicsSightWords';
import type { PhonicsLessonData } from './phonicsLessons';

export interface PhonicsSection {
  title: string;
  titleRu: string;
  lessons: PhonicsLessonData[];
}

export const PHONICS_SECTIONS: PhonicsSection[] = [
  { title: 'Alphabet', titleRu: 'Алфавит', lessons: PHONICS_LESSONS.filter(l => l.id.startsWith('alphabet')) },
  { title: 'Short Vowels', titleRu: 'Короткие гласные', lessons: PHONICS_LESSONS.filter(l => l.id.startsWith('short')) },
  { title: 'Consonant Blends', titleRu: 'Сочетания согласных', lessons: CONSONANT_BLEND_LESSONS },
  { title: 'Long Vowels (Magic E)', titleRu: 'Долгие гласные (Волшебная E)', lessons: LONG_VOWEL_LESSONS },
  { title: 'Digraphs', titleRu: 'Диграфы (буквосочетания)', lessons: DIGRAPH_LESSONS },
  { title: 'Vowel Teams', titleRu: 'Сочетания гласных', lessons: VOWEL_TEAM_LESSONS },
  { title: 'R-Controlled Vowels', titleRu: 'R-контролируемые гласные', lessons: R_CONTROLLED_LESSONS },
  { title: 'Sight Words', titleRu: 'Слова для запоминания', lessons: SIGHT_WORD_LESSONS },
];

export const ALL_PHONICS_LESSONS: PhonicsLessonData[] = PHONICS_SECTIONS.flatMap(s => s.lessons);
