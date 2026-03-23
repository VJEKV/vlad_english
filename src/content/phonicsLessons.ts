// Structured phonics lessons for learning to read

export interface LetterData {
  letter: string;
  sound: string;       // Phonetic sound description
  word: string;        // Example word
  wordRu: string;      // Russian translation
  emoji: string;       // Visual hint (emoji as placeholder for SVG)
}

export interface PhonicsLessonData {
  id: string;
  title: string;
  titleRu: string;
  letters: LetterData[];
  practiceWords: { word: string; ru: string; emoji: string }[];
}

export const ALPHABET_DATA: LetterData[] = [
  { letter: 'a', sound: '/æ/', word: 'apple', wordRu: 'яблоко', emoji: '🍎' },
  { letter: 'b', sound: '/b/', word: 'ball', wordRu: 'мяч', emoji: '⚽' },
  { letter: 'c', sound: '/k/', word: 'cat', wordRu: 'кот', emoji: '🐱' },
  { letter: 'd', sound: '/d/', word: 'dog', wordRu: 'собака', emoji: '🐶' },
  { letter: 'e', sound: '/ɛ/', word: 'egg', wordRu: 'яйцо', emoji: '🥚' },
  { letter: 'f', sound: '/f/', word: 'fish', wordRu: 'рыба', emoji: '🐟' },
  { letter: 'g', sound: '/g/', word: 'green', wordRu: 'зелёный', emoji: '💚' },
  { letter: 'h', sound: '/h/', word: 'hat', wordRu: 'шляпа', emoji: '🎩' },
  { letter: 'i', sound: '/ɪ/', word: 'ink', wordRu: 'чернила', emoji: '🖋️' },
  { letter: 'j', sound: '/dʒ/', word: 'jump', wordRu: 'прыгать', emoji: '🦘' },
  { letter: 'k', sound: '/k/', word: 'king', wordRu: 'король', emoji: '👑' },
  { letter: 'l', sound: '/l/', word: 'lamp', wordRu: 'лампа', emoji: '💡' },
  { letter: 'm', sound: '/m/', word: 'mouse', wordRu: 'мышь', emoji: '🐭' },
  { letter: 'n', sound: '/n/', word: 'nose', wordRu: 'нос', emoji: '👃' },
  { letter: 'o', sound: '/ɒ/', word: 'orange', wordRu: 'апельсин', emoji: '🍊' },
  { letter: 'p', sound: '/p/', word: 'pen', wordRu: 'ручка', emoji: '🖊️' },
  { letter: 'q', sound: '/kw/', word: 'queen', wordRu: 'королева', emoji: '👸' },
  { letter: 'r', sound: '/r/', word: 'rabbit', wordRu: 'кролик', emoji: '🐰' },
  { letter: 's', sound: '/s/', word: 'snake', wordRu: 'змея', emoji: '🐍' },
  { letter: 't', sound: '/t/', word: 'tree', wordRu: 'дерево', emoji: '🌳' },
  { letter: 'u', sound: '/ʌ/', word: 'umbrella', wordRu: 'зонт', emoji: '☂️' },
  { letter: 'v', sound: '/v/', word: 'van', wordRu: 'фургон', emoji: '🚐' },
  { letter: 'w', sound: '/w/', word: 'window', wordRu: 'окно', emoji: '🪟' },
  { letter: 'x', sound: '/ks/', word: 'box', wordRu: 'коробка', emoji: '📦' },
  { letter: 'y', sound: '/j/', word: 'yellow', wordRu: 'жёлтый', emoji: '💛' },
  { letter: 'z', sound: '/z/', word: 'zoo', wordRu: 'зоопарк', emoji: '🦁' },
];

export const PHONICS_LESSONS: PhonicsLessonData[] = [
  {
    id: 'alphabet_1',
    title: 'Letters A-E',
    titleRu: 'Буквы A-E',
    letters: ALPHABET_DATA.slice(0, 5),
    practiceWords: [
      { word: 'cat', ru: 'кот', emoji: '🐱' },
      { word: 'bed', ru: 'кровать', emoji: '🛏️' },
      { word: 'dad', ru: 'папа', emoji: '👨' },
      { word: 'cab', ru: 'такси', emoji: '🚕' },
    ],
  },
  {
    id: 'alphabet_2',
    title: 'Letters F-J',
    titleRu: 'Буквы F-J',
    letters: ALPHABET_DATA.slice(5, 10),
    practiceWords: [
      { word: 'fig', ru: 'инжир', emoji: '🫐' },
      { word: 'jig', ru: 'танец', emoji: '💃' },
      { word: 'hug', ru: 'обнимать', emoji: '🤗' },
      { word: 'gif', ru: 'подарок', emoji: '🎁' },
    ],
  },
  {
    id: 'alphabet_3',
    title: 'Letters K-O',
    titleRu: 'Буквы K-O',
    letters: ALPHABET_DATA.slice(10, 15),
    practiceWords: [
      { word: 'man', ru: 'мужчина', emoji: '👨' },
      { word: 'log', ru: 'бревно', emoji: '🪵' },
      { word: 'not', ru: 'нет', emoji: '❌' },
      { word: 'mom', ru: 'мама', emoji: '👩' },
    ],
  },
  {
    id: 'alphabet_4',
    title: 'Letters P-T',
    titleRu: 'Буквы P-T',
    letters: ALPHABET_DATA.slice(15, 20),
    practiceWords: [
      { word: 'pen', ru: 'ручка', emoji: '🖊️' },
      { word: 'run', ru: 'бегать', emoji: '🏃' },
      { word: 'sun', ru: 'солнце', emoji: '☀️' },
      { word: 'top', ru: 'верх', emoji: '🔝' },
    ],
  },
  {
    id: 'alphabet_5',
    title: 'Letters U-Z',
    titleRu: 'Буквы U-Z',
    letters: ALPHABET_DATA.slice(20, 26),
    practiceWords: [
      { word: 'van', ru: 'фургон', emoji: '🚐' },
      { word: 'wax', ru: 'воск', emoji: '🕯️' },
      { word: 'yes', ru: 'да', emoji: '✅' },
      { word: 'zip', ru: 'молния', emoji: '🤐' },
    ],
  },
  {
    id: 'short_a',
    title: 'Short A — /æ/',
    titleRu: 'Короткий звук A',
    letters: [ALPHABET_DATA[0]],
    practiceWords: [
      { word: 'cat', ru: 'кот', emoji: '🐱' },
      { word: 'hat', ru: 'шляпа', emoji: '🎩' },
      { word: 'bat', ru: 'летучая мышь', emoji: '🦇' },
      { word: 'man', ru: 'мужчина', emoji: '👨' },
      { word: 'can', ru: 'банка', emoji: '🥫' },
      { word: 'van', ru: 'фургон', emoji: '🚐' },
      { word: 'map', ru: 'карта', emoji: '🗺️' },
      { word: 'bag', ru: 'сумка', emoji: '👜' },
      { word: 'sad', ru: 'грустный', emoji: '😢' },
      { word: 'dad', ru: 'папа', emoji: '👨' },
    ],
  },
  {
    id: 'short_e',
    title: 'Short E — /ɛ/',
    titleRu: 'Короткий звук E',
    letters: [ALPHABET_DATA[4]],
    practiceWords: [
      { word: 'pen', ru: 'ручка', emoji: '🖊️' },
      { word: 'hen', ru: 'курица', emoji: '🐔' },
      { word: 'ten', ru: 'десять', emoji: '🔟' },
      { word: 'bed', ru: 'кровать', emoji: '🛏️' },
      { word: 'red', ru: 'красный', emoji: '🔴' },
      { word: 'leg', ru: 'нога', emoji: '🦵' },
      { word: 'pet', ru: 'питомец', emoji: '🐾' },
      { word: 'net', ru: 'сеть', emoji: '🥅' },
      { word: 'wet', ru: 'мокрый', emoji: '💧' },
      { word: 'yes', ru: 'да', emoji: '✅' },
    ],
  },
  {
    id: 'short_i',
    title: 'Short I — /ɪ/',
    titleRu: 'Короткий звук I',
    letters: [ALPHABET_DATA[8]],
    practiceWords: [
      { word: 'big', ru: 'большой', emoji: '🐘' },
      { word: 'pig', ru: 'свинья', emoji: '🐷' },
      { word: 'dig', ru: 'копать', emoji: '⛏️' },
      { word: 'hit', ru: 'удар', emoji: '👊' },
      { word: 'sit', ru: 'сидеть', emoji: '🪑' },
      { word: 'pin', ru: 'булавка', emoji: '📌' },
      { word: 'bin', ru: 'корзина', emoji: '🗑️' },
      { word: 'win', ru: 'победить', emoji: '🏆' },
      { word: 'lip', ru: 'губа', emoji: '👄' },
      { word: 'zip', ru: 'молния', emoji: '🤐' },
    ],
  },
  {
    id: 'short_o',
    title: 'Short O — /ɒ/',
    titleRu: 'Короткий звук O',
    letters: [ALPHABET_DATA[14]],
    practiceWords: [
      { word: 'dog', ru: 'собака', emoji: '🐶' },
      { word: 'log', ru: 'бревно', emoji: '🪵' },
      { word: 'fog', ru: 'туман', emoji: '🌫️' },
      { word: 'hot', ru: 'горячий', emoji: '🔥' },
      { word: 'pot', ru: 'горшок', emoji: '🍲' },
      { word: 'dot', ru: 'точка', emoji: '⚫' },
      { word: 'box', ru: 'коробка', emoji: '📦' },
      { word: 'fox', ru: 'лиса', emoji: '🦊' },
      { word: 'hop', ru: 'прыгать', emoji: '🐸' },
      { word: 'top', ru: 'верх', emoji: '🔝' },
    ],
  },
  {
    id: 'short_u',
    title: 'Short U — /ʌ/',
    titleRu: 'Короткий звук U',
    letters: [ALPHABET_DATA[20]],
    practiceWords: [
      { word: 'cup', ru: 'чашка', emoji: '☕' },
      { word: 'pup', ru: 'щенок', emoji: '🐶' },
      { word: 'bus', ru: 'автобус', emoji: '🚌' },
      { word: 'mud', ru: 'грязь', emoji: '💩' },
      { word: 'bug', ru: 'жук', emoji: '🐛' },
      { word: 'hug', ru: 'обнимать', emoji: '🤗' },
      { word: 'rug', ru: 'коврик', emoji: '🟫' },
      { word: 'run', ru: 'бегать', emoji: '🏃' },
      { word: 'sun', ru: 'солнце', emoji: '☀️' },
      { word: 'fun', ru: 'веселье', emoji: '🎉' },
    ],
  },
];

// Helper: shuffle array
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
