import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useTTS } from '../../hooks/useTTS';

// Dictionary of all known words with emoji and translation
const WORD_DICT: Record<string, { ru: string; emoji: string }> = {
  // Animals
  cat: { ru: 'кот', emoji: '🐱' }, dog: { ru: 'собака', emoji: '🐶' }, fish: { ru: 'рыба', emoji: '🐟' },
  bird: { ru: 'птица', emoji: '🐦' }, frog: { ru: 'лягушка', emoji: '🐸' }, horse: { ru: 'лошадь', emoji: '🐴' },
  elephant: { ru: 'слон', emoji: '🐘' }, monkey: { ru: 'обезьяна', emoji: '🐒' }, lion: { ru: 'лев', emoji: '🦁' },
  tiger: { ru: 'тигр', emoji: '🐯' }, bear: { ru: 'медведь', emoji: '🐻' }, rabbit: { ru: 'кролик', emoji: '🐰' },
  'teddy bear': { ru: 'плюшевый мишка', emoji: '🧸' }, teddy: { ru: 'мишка', emoji: '🧸' },
  hamster: { ru: 'хомяк', emoji: '🐹' }, parrot: { ru: 'попугай', emoji: '🦜' }, tortoise: { ru: 'черепаха', emoji: '🐢' },
  puppy: { ru: 'щенок', emoji: '🐕' }, kitten: { ru: 'котёнок', emoji: '😺' }, sheep: { ru: 'овца', emoji: '🐑' },
  seal: { ru: 'тюлень', emoji: '🦭' }, chimp: { ru: 'шимпанзе', emoji: '🐵' }, snake: { ru: 'змея', emoji: '🐍' },
  // Body
  head: { ru: 'голова', emoji: '👤' }, body: { ru: 'тело', emoji: '🧍' }, arm: { ru: 'рука', emoji: '💪' },
  arms: { ru: 'руки', emoji: '💪' }, leg: { ru: 'нога', emoji: '🦵' }, legs: { ru: 'ноги', emoji: '🦵' },
  hand: { ru: 'кисть', emoji: '✋' }, hands: { ru: 'ладони', emoji: '✋' }, foot: { ru: 'ступня', emoji: '🦶' },
  feet: { ru: 'ступни', emoji: '🦶' }, eye: { ru: 'глаз', emoji: '👁️' }, eyes: { ru: 'глаза', emoji: '👀' },
  ear: { ru: 'ухо', emoji: '👂' }, ears: { ru: 'уши', emoji: '👂' }, nose: { ru: 'нос', emoji: '👃' },
  mouth: { ru: 'рот', emoji: '👄' }, hair: { ru: 'волосы', emoji: '💇' }, teeth: { ru: 'зубы', emoji: '🦷' },
  face: { ru: 'лицо', emoji: '🙂' }, tummy: { ru: 'животик', emoji: '🤰' }, shoulders: { ru: 'плечи', emoji: '🤷' },
  knees: { ru: 'колени', emoji: '🧎' }, toes: { ru: 'пальцы ног', emoji: '🦶' },
  // Food
  cake: { ru: 'торт', emoji: '🎂' }, pizza: { ru: 'пицца', emoji: '🍕' }, milk: { ru: 'молоко', emoji: '🥛' },
  juice: { ru: 'сок', emoji: '🧃' }, apple: { ru: 'яблоко', emoji: '🍎' }, banana: { ru: 'банан', emoji: '🍌' },
  chocolate: { ru: 'шоколад', emoji: '🍫' }, egg: { ru: 'яйцо', emoji: '🥚' }, bread: { ru: 'хлеб', emoji: '🍞' },
  cheese: { ru: 'сыр', emoji: '🧀' }, sandwich: { ru: 'бутерброд', emoji: '🥪' },
  'ice cream': { ru: 'мороженое', emoji: '🍦' }, ice: { ru: 'лёд', emoji: '🧊' },
  cream: { ru: 'крем', emoji: '🧴' }, water: { ru: 'вода', emoji: '💧' }, fruit: { ru: 'фрукты', emoji: '🍇' },
  balloon: { ru: 'воздушный шар', emoji: '🎈' }, balloons: { ru: 'воздушные шары', emoji: '🎈' },
  candle: { ru: 'свеча', emoji: '🕯️' }, present: { ru: 'подарок', emoji: '🎁' },
  chips: { ru: 'чипсы', emoji: '🍟' }, burgers: { ru: 'бургеры', emoji: '🍔' },
  toast: { ru: 'тост', emoji: '🥪' }, lemonade: { ru: 'лимонад', emoji: '🥤' },
  watermelon: { ru: 'арбуз', emoji: '🍉' },
  // Home
  house: { ru: 'дом', emoji: '🏠' }, home: { ru: 'дом', emoji: '🏠' }, bedroom: { ru: 'спальня', emoji: '🛏️' },
  kitchen: { ru: 'кухня', emoji: '🍳' }, bathroom: { ru: 'ванная', emoji: '🛁' }, garden: { ru: 'сад', emoji: '🌿' },
  table: { ru: 'стол', emoji: '🍽️' }, chair: { ru: 'стул', emoji: '🪑' }, bed: { ru: 'кровать', emoji: '🛏️' },
  door: { ru: 'дверь', emoji: '🚪' }, window: { ru: 'окно', emoji: '🪟' }, lamp: { ru: 'лампа', emoji: '💡' },
  sofa: { ru: 'диван', emoji: '🛋️' }, mirror: { ru: 'зеркало', emoji: '🪞' }, floor: { ru: 'пол', emoji: '🔲' },
  wall: { ru: 'стена', emoji: '🧱' }, roof: { ru: 'крыша', emoji: '🏡' }, stairs: { ru: 'лестница', emoji: '🪜' },
  cupboard: { ru: 'шкаф', emoji: '🗄️' }, fridge: { ru: 'холодильник', emoji: '🧊' },
  cooker: { ru: 'плита', emoji: '♨️' }, fireplace: { ru: 'камин', emoji: '🪵' },
  armchair: { ru: 'кресло', emoji: '💺' }, carpet: { ru: 'ковёр', emoji: '🟫' },
  bookcase: { ru: 'книжный шкаф', emoji: '📚' }, wardrobe: { ru: 'шкаф для одежды', emoji: '👔' },
  picture: { ru: 'картина', emoji: '🖼️' }, radio: { ru: 'радио', emoji: '📻' },
  // Toys
  ball: { ru: 'мяч', emoji: '⚽' }, doll: { ru: 'кукла', emoji: '🪆' }, car: { ru: 'машина', emoji: '🚗' },
  bike: { ru: 'велосипед', emoji: '🚲' }, train: { ru: 'поезд', emoji: '🚂' }, boat: { ru: 'лодка', emoji: '⛵' },
  kite: { ru: 'воздушный змей', emoji: '🪁' }, robot: { ru: 'робот', emoji: '🤖' }, toy: { ru: 'игрушка', emoji: '🧸' },
  'toy soldier': { ru: 'игрушечный солдатик', emoji: '💂' }, 'toy box': { ru: 'коробка с игрушками', emoji: '📦' },
  'jack-in-the-box': { ru: 'чёртик из коробки', emoji: '🤡' },
  'living room': { ru: 'гостиная', emoji: '🛋️' }, 'tree house': { ru: 'домик на дереве', emoji: '🏡' },
  game: { ru: 'игра', emoji: '🎮' }, drum: { ru: 'барабан', emoji: '🥁' }, guitar: { ru: 'гитара', emoji: '🎸' },
  piano: { ru: 'пианино', emoji: '🎹' }, puzzle: { ru: 'пазл', emoji: '🧩' },
  // Clothes
  hat: { ru: 'шляпа', emoji: '🎩' }, coat: { ru: 'пальто', emoji: '🧥' }, shoes: { ru: 'туфли', emoji: '👟' },
  boots: { ru: 'сапоги', emoji: '🥾' }, dress: { ru: 'платье', emoji: '👗' }, shorts: { ru: 'шорты', emoji: '🩳' },
  jacket: { ru: 'куртка', emoji: '🧥' }, skirt: { ru: 'юбка', emoji: '👚' }, socks: { ru: 'носки', emoji: '🧦' },
  scarf: { ru: 'шарф', emoji: '🧣' }, gloves: { ru: 'перчатки', emoji: '🧤' },
  // Nature/Weather
  sun: { ru: 'солнце', emoji: '☀️' }, tree: { ru: 'дерево', emoji: '🌳' }, sea: { ru: 'море', emoji: '🌊' },
  beach: { ru: 'пляж', emoji: '🏖️' }, park: { ru: 'парк', emoji: '🏞️' }, forest: { ru: 'лес', emoji: '🌲' },
  mountain: { ru: 'гора', emoji: '⛰️' }, lake: { ru: 'озеро', emoji: '🏞️' }, river: { ru: 'река', emoji: '🏞️' },
  rain: { ru: 'дождь', emoji: '🌧️' }, snow: { ru: 'снег', emoji: '❄️' }, moon: { ru: 'луна', emoji: '🌙' },
  star: { ru: 'звезда', emoji: '⭐' }, flower: { ru: 'цветок', emoji: '🌸' },
  // School
  school: { ru: 'школа', emoji: '🏫' }, book: { ru: 'книга', emoji: '📖' }, pencil: { ru: 'карандаш', emoji: '✏️' },
  pen: { ru: 'ручка', emoji: '🖊️' }, ruler: { ru: 'линейка', emoji: '📏' }, desk: { ru: 'парта', emoji: '📐' },
  teacher: { ru: 'учитель', emoji: '👩‍🏫' }, lesson: { ru: 'урок', emoji: '📝' },
  // Colors
  red: { ru: 'красный', emoji: '🔴' }, blue: { ru: 'синий', emoji: '🔵' }, green: { ru: 'зелёный', emoji: '🟢' },
  yellow: { ru: 'жёлтый', emoji: '🟡' }, black: { ru: 'чёрный', emoji: '⚫' }, white: { ru: 'белый', emoji: '⚪' },
  brown: { ru: 'коричневый', emoji: '🟤' }, pink: { ru: 'розовый', emoji: '💗' }, orange: { ru: 'оранжевый', emoji: '🟠' },
  purple: { ru: 'фиолетовый', emoji: '🟣' },
  // Circus & extra
  circus: { ru: 'цирк', emoji: '🎪' }, clown: { ru: 'клоун', emoji: '🤡' },
  magician: { ru: 'фокусник', emoji: '🪄' }, puppet: { ru: 'кукла-марионетка', emoji: '🎭' },
  ballerina: { ru: 'балерина', emoji: '🩰' }, soldier: { ru: 'солдатик', emoji: '💂' },
  shelf: { ru: 'полка', emoji: '📖' }, near: { ru: 'рядом', emoji: '📍' },
  island: { ru: 'остров', emoji: '🏝️' }, magic: { ru: 'волшебный', emoji: '✨' },
  flowers: { ru: 'цветы', emoji: '🌸' }, weather: { ru: 'погода', emoji: '🌤️' },
  holiday: { ru: 'каникулы', emoji: '🌴' }, holidays: { ru: 'каникулы', emoji: '🌴' },
  wonderful: { ru: 'замечательный', emoji: '🌟' }, pretty: { ru: 'красивый', emoji: '💕' },
  clever: { ru: 'умный', emoji: '🧠' }, ready: { ru: 'готов', emoji: '✅' },
  today: { ru: 'сегодня', emoji: '📅' }, please: { ru: 'пожалуйста', emoji: '🙏' },
  welcome: { ru: 'добро пожаловать', emoji: '👋' }, party: { ru: 'вечеринка', emoji: '🎉' },
  children: { ru: 'дети', emoji: '👧👦' }, boy: { ru: 'мальчик', emoji: '👦' },
  girl: { ru: 'девочка', emoji: '👧' }, woman: { ru: 'женщина', emoji: '👩' },
  nanny: { ru: 'няня', emoji: '👩‍🍼' },
  // Actions
  run: { ru: 'бегать', emoji: '🏃' }, jump: { ru: 'прыгать', emoji: '🦘' }, swim: { ru: 'плавать', emoji: '🏊' },
  dance: { ru: 'танцевать', emoji: '💃' }, sing: { ru: 'петь', emoji: '🎤' }, fly: { ru: 'летать', emoji: '✈️' },
  read: { ru: 'читать', emoji: '📖' }, write: { ru: 'писать', emoji: '✍️' }, draw: { ru: 'рисовать', emoji: '🎨' },
  paint: { ru: 'рисовать', emoji: '🎨' }, cook: { ru: 'готовить', emoji: '👨‍🍳' }, eat: { ru: 'есть', emoji: '🍽️' },
  drink: { ru: 'пить', emoji: '🥤' }, sleep: { ru: 'спать', emoji: '😴' }, play: { ru: 'играть', emoji: '🎮' },
  climb: { ru: 'лазить', emoji: '🧗' }, walk: { ru: 'гулять', emoji: '🚶' },
  swing: { ru: 'качаться', emoji: '🤸' }, hurry: { ru: 'спешить', emoji: '⏩' },
  wear: { ru: 'носить', emoji: '👕' }, wearing: { ru: 'одет в', emoji: '👕' },
  find: { ru: 'найти', emoji: '🔍' }, know: { ru: 'знать', emoji: '🧠' },
  help: { ru: 'помогать', emoji: '🆘' }, look: { ru: 'смотреть', emoji: '👀' },
  open: { ru: 'открыть', emoji: '📂' }, close: { ru: 'закрыть', emoji: '📁' },
  want: { ru: 'хотеть', emoji: '💭' }, come: { ru: 'приходить', emoji: '🫳' },
  love: { ru: 'любить', emoji: '❤️' }, like: { ru: 'нравиться', emoji: '👍' },
  see: { ru: 'видеть', emoji: '👁️' }, go: { ru: 'идти', emoji: '🚶‍♂️' },
  put: { ru: 'класть', emoji: '📥' }, take: { ru: 'брать', emoji: '✋' },
  // Adjectives
  big: { ru: 'большой', emoji: '🐘' }, small: { ru: 'маленький', emoji: '🐭' }, happy: { ru: 'счастливый', emoji: '😊' },
  sad: { ru: 'грустный', emoji: '😢' }, funny: { ru: 'смешной', emoji: '😂' }, clever: { ru: 'умный', emoji: '🧠' },
  strong: { ru: 'сильный', emoji: '💪' }, tall: { ru: 'высокий', emoji: '📏' }, short: { ru: 'короткий', emoji: '📏' },
  old: { ru: 'старый', emoji: '👴' }, new: { ru: 'новый', emoji: '✨' }, hot: { ru: 'горячий', emoji: '🔥' },
  cold: { ru: 'холодный', emoji: '🥶' }, beautiful: { ru: 'красивый', emoji: '🌺' }, cute: { ru: 'милый', emoji: '🥰' },
  brave: { ru: 'смелый', emoji: '🦸' }, scary: { ru: 'страшный', emoji: '😨' }, friendly: { ru: 'дружелюбный', emoji: '🤝' },
  nice: { ru: 'приятный', emoji: '👌' }, great: { ru: 'отличный', emoji: '👍' }, lovely: { ru: 'прекрасный', emoji: '💕' },
  dark: { ru: 'тёмный', emoji: '🌑' }, fair: { ru: 'светлый', emoji: '🌕' },
  long: { ru: 'длинный', emoji: '📏' }, little: { ru: 'маленький', emoji: '🤏' },
  sunny: { ru: 'солнечный', emoji: '☀️' }, windy: { ru: 'ветреный', emoji: '💨' },
  rainy: { ru: 'дождливый', emoji: '🌧️' }, raining: { ru: 'идёт дождь', emoji: '🌧️' },
  // Prepositions & articles
  in: { ru: 'в', emoji: '📦' }, on: { ru: 'на', emoji: '⬆️' }, under: { ru: 'под', emoji: '⬇️' },
  behind: { ru: 'за', emoji: '🔙' }, between: { ru: 'между', emoji: '↔️' },
  // Pronouns & service words
  my: { ru: 'мой', emoji: '👤' }, your: { ru: 'твой', emoji: '🫵' },
  his: { ru: 'его', emoji: '🔵' }, her: { ru: 'её', emoji: '💜' },
  our: { ru: 'наш', emoji: '🏠' }, their: { ru: 'их', emoji: '👥' },
  this: { ru: 'это', emoji: '👆' }, that: { ru: 'тот', emoji: '👈' },
  here: { ru: 'здесь', emoji: '📍' }, there: { ru: 'там', emoji: '📍' },
  now: { ru: 'сейчас', emoji: '⏰' }, too: { ru: 'тоже', emoji: '➕' },
  very: { ru: 'очень', emoji: '❗' }, lots: { ru: 'много', emoji: '📦' },
  yes: { ru: 'да', emoji: '✅' }, no: { ru: 'нет', emoji: '❌' },
  // Grammar / service words (must have tooltips!)
  is: { ru: 'есть/является', emoji: '🔤' }, am: { ru: '(я) есть', emoji: '🔤' }, are: { ru: '(вы/они) есть', emoji: '🔤' },
  was: { ru: 'был/была', emoji: '🔤' }, were: { ru: 'были', emoji: '🔤' },
  he: { ru: 'он', emoji: '🙋‍♂️' }, she: { ru: 'она', emoji: '🙋‍♀️' }, it: { ru: 'оно/это', emoji: '👆' },
  I: { ru: 'я', emoji: '🙋' }, we: { ru: 'мы', emoji: '👫' }, they: { ru: 'они', emoji: '👥' },
  you: { ru: 'ты/вы', emoji: '🫵' },
  the: { ru: '(артикль)', emoji: '📌' }, a: { ru: '(артикль)', emoji: '📌' }, an: { ru: '(артикль)', emoji: '📌' },
  and: { ru: 'и', emoji: '➕' }, but: { ru: 'но', emoji: '↩️' }, or: { ru: 'или', emoji: '↔️' },
  not: { ru: 'не', emoji: '🚫' }, can: { ru: 'могу/умею', emoji: '✅' },
  "can't": { ru: 'не могу', emoji: '🚫' }, "don't": { ru: 'не (делаю)', emoji: '🚫' },
  "doesn't": { ru: 'не (делает)', emoji: '🚫' }, "isn't": { ru: 'не является', emoji: '🚫' },
  "aren't": { ru: 'не являются', emoji: '🚫' }, "haven't": { ru: 'не имею', emoji: '🚫' },
  "hasn't": { ru: 'не имеет', emoji: '🚫' },
  have: { ru: 'иметь', emoji: '✋' }, has: { ru: 'имеет', emoji: '✋' }, got: { ru: 'получил', emoji: '✋' },
  do: { ru: 'делать', emoji: '⚙️' }, does: { ru: 'делает', emoji: '⚙️' },
  what: { ru: 'что', emoji: '❓' }, where: { ru: 'где', emoji: '📍' }, who: { ru: 'кто', emoji: '❓' },
  how: { ru: 'как', emoji: '❓' }, why: { ru: 'почему', emoji: '❓' }, when: { ru: 'когда', emoji: '⏰' },
  at: { ru: 'в/у', emoji: '📍' }, to: { ru: 'к/в', emoji: '➡️' }, for: { ru: 'для', emoji: '➡️' },
  with: { ru: 'с', emoji: '🤝' }, of: { ru: '(предлог)', emoji: '📎' }, from: { ru: 'из/от', emoji: '↩️' },
  about: { ru: 'о/про', emoji: '💬' },
  // People
  mum: { ru: 'мама', emoji: '👩' }, dad: { ru: 'папа', emoji: '👨' }, brother: { ru: 'брат', emoji: '🧑' },
  sister: { ru: 'сестра', emoji: '👱‍♀️' }, friend: { ru: 'друг', emoji: '👋' }, friends: { ru: 'друзья', emoji: '👯' },
  baby: { ru: 'малыш', emoji: '👶' }, grandma: { ru: 'бабушка', emoji: '👵' }, grandpa: { ru: 'дедушка', emoji: '👴' },
  family: { ru: 'семья', emoji: '👨‍👩‍👧‍👦' }, clown: { ru: 'клоун', emoji: '🤡' }, queen: { ru: 'королева', emoji: '👸' },
  king: { ru: 'король', emoji: '👑' },
  // Numbers
  one: { ru: 'один', emoji: '1️⃣' }, two: { ru: 'два', emoji: '2️⃣' }, three: { ru: 'три', emoji: '3️⃣' },
  four: { ru: 'четыре', emoji: '4️⃣' }, five: { ru: 'пять', emoji: '5️⃣' }, six: { ru: 'шесть', emoji: '6️⃣' },
  seven: { ru: 'семь', emoji: '7️⃣' }, eight: { ru: 'восемь', emoji: '8️⃣' }, nine: { ru: 'девять', emoji: '9️⃣' },
  ten: { ru: 'десять', emoji: '🔟' },
  // Time/Days
  morning: { ru: 'утро', emoji: '🌅' }, afternoon: { ru: 'день', emoji: '☀️' }, evening: { ru: 'вечер', emoji: '🌆' },
  night: { ru: 'ночь', emoji: '🌙' }, today: { ru: 'сегодня', emoji: '📅' }, yesterday: { ru: 'вчера', emoji: '📅' },
  summer: { ru: 'лето', emoji: '☀️' }, winter: { ru: 'зима', emoji: '❄️' }, spring: { ru: 'весна', emoji: '🌸' },
  autumn: { ru: 'осень', emoji: '🍂' },
  // Misc
  birthday: { ru: 'день рождения', emoji: '🎂' }, party: { ru: 'вечеринка', emoji: '🎉' }, present: { ru: 'подарок', emoji: '🎁' },
  circus: { ru: 'цирк', emoji: '🎪' }, zoo: { ru: 'зоопарк', emoji: '🦁' }, shop: { ru: 'магазин', emoji: '🏪' },
};

// Lookup word in dictionary (handles plural forms, contractions, etc.)
function lookupWord(word: string): { ru: string; emoji: string } | null {
  const clean = word.toLowerCase().replace(/[.,!?;:'"()]/g, '');
  // Direct match
  if (WORD_DICT[clean]) return WORD_DICT[clean];
  // Case-sensitive single letter (I)
  const raw = word.replace(/[.,!?;:'"()]/g, '');
  if (WORD_DICT[raw]) return WORD_DICT[raw];
  // Handle contractions: He's -> he, I'm -> I, can't -> can't, don't -> don't
  if (clean.includes("'")) {
    const withApostrophe = clean; // try exact: can't, don't
    if (WORD_DICT[withApostrophe]) return WORD_DICT[withApostrophe];
    const base = clean.split("'")[0]; // He's -> he, I'm -> i, it's -> it
    if (WORD_DICT[base]) return WORD_DICT[base];
    if (base === 'i') return WORD_DICT['I'] || { ru: 'я', emoji: '🙋' };
  }
  // Try without trailing 's'
  if (clean.endsWith('s') && clean.length > 2 && WORD_DICT[clean.slice(0, -1)]) return WORD_DICT[clean.slice(0, -1)];
  // Try without -es
  if (clean.endsWith('es') && WORD_DICT[clean.slice(0, -2)]) return WORD_DICT[clean.slice(0, -2)];
  // Try without -ing
  if (clean.endsWith('ing')) {
    const base = clean.slice(0, -3);
    if (WORD_DICT[base]) return WORD_DICT[base];
    if (WORD_DICT[base + 'e']) return WORD_DICT[base + 'e']; // dancing -> dance
    // swimming -> swim (double consonant)
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      if (WORD_DICT[base.slice(0, -1)]) return WORD_DICT[base.slice(0, -1)];
    }
  }
  // Try without -ed
  if (clean.endsWith('ed')) {
    const base = clean.slice(0, -2);
    if (WORD_DICT[base]) return WORD_DICT[base];
    if (WORD_DICT[base + 'e']) return WORD_DICT[base + 'e']; // loved -> love
  }
  // Try without -er/-est
  if (clean.endsWith('er') && WORD_DICT[clean.slice(0, -2)]) return WORD_DICT[clean.slice(0, -2)];
  if (clean.endsWith('est') && WORD_DICT[clean.slice(0, -3)]) return WORD_DICT[clean.slice(0, -3)];
  return null;
}

// Interactive word with hover tooltip
export function InteractiveWord({ word, className }: { word: string; className?: string }) {
  const { speakWord } = useTTS();
  const [show, setShow] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const info = lookupWord(word);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(showTimerRef.current);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleEnter = () => {
    clearTimeout(hideTimerRef.current);
    clearTimeout(showTimerRef.current);
    showTimerRef.current = setTimeout(() => setShow(true), 700);
  };

  const handleLeave = () => {
    clearTimeout(showTimerRef.current);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setShow(false), 100);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    speakWord(word.replace(/[.,!?;:'"()]/g, ''));
  };

  return (
    <span
      className={`relative inline-block ${className || ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        onClick={handleClick}
        className={`cursor-pointer transition-colors ${
          info ? 'hover:text-primary hover:bg-primary/10 rounded px-0.5' : ''
        }`}
      >
        {word}
      </span>

      <AnimatePresence>
        {show && info && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 p-3 min-w-[140px] text-center"
            onMouseEnter={() => { clearTimeout(hideTimerRef.current); clearTimeout(showTimerRef.current); }}
            onMouseLeave={handleLeave}
          >
            <span className="text-3xl block mb-1">{info.emoji}</span>
            <p className="font-bold text-sm text-gray-800">{word.replace(/[.,!?]/g, '')}</p>
            <p className="text-xs text-gray-500">{info.ru}</p>
            <button
              onClick={handleClick}
              className="mt-1 p-1 rounded-full text-primary hover:bg-primary/10 transition-colors"
            >
              <Volume2 size={14} />
            </button>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

// Compound words to check (2-3 word phrases)
const COMPOUND_WORDS = [
  'teddy bear', 'ice cream', 'toy soldier', 'toy box', 'jack-in-the-box',
  'living room', 'tree house', 'ride a bike', 'have fun', 'wake up',
  'get up', 'have breakfast', 'go to school', 'come home', 'do homework',
  'watch TV', 'go to bed', 'have dinner', 'play games', 'read books',
  'bus stop', 'half past', 'quarter past', 'quarter to',
];

// Render text with interactive words (supports compound words)
export function InteractiveText({ text, className }: { text: string; className?: string }) {
  const tokens = text.split(/(\s+)/);
  const result: React.ReactNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const w = tokens[i];
    if (/^\s+$/.test(w)) {
      result.push(<span key={i}>{w}</span>);
      i++;
      continue;
    }

    // Try to match compound words (look ahead 2-4 tokens: word space word [space word])
    let matched = false;
    for (let len = 5; len >= 3; len -= 2) {
      if (i + len <= tokens.length) {
        const phrase = tokens.slice(i, i + len).join('');
        const cleanPhrase = phrase.toLowerCase().replace(/[.,!?;:'"()]/g, '');
        if (WORD_DICT[cleanPhrase]) {
          result.push(<InteractiveWord key={i} word={phrase} />);
          i += len;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      result.push(<InteractiveWord key={i} word={w} />);
      i++;
    }
  }

  return <span className={className}>{result}</span>;
}

export { WORD_DICT, lookupWord };
