# VladEnglish — Словарь Spotlight 2 (Part 1 + Part 2)

## Обзор

Лексический материал учебника Spotlight 2 (Быкова, Поспелова, Evans, Dooley), организованный по модулям. Это первый из 7 файлов словаря (Spotlight 2-8). Каждое слово снабжено: переводом, тематической картинкой, примером в предложении, привязкой к phonics-правилу (если применимо).

> Словари Spotlight 3-8 будут в отдельных файлах: `SPOTLIGHT_3_VOCABULARY.md` ... `SPOTLIGHT_8_VOCABULARY.md`

---

## Формат данных

```typescript
interface SpotlightWord {
  word: string;              // Английское слово
  translation: string;       // Перевод на русский
  image: string;             // Путь к SVG-иллюстрации
  audio: string;             // Путь к mp3
  phonicsRule?: string;      // К какому phonics-правилу относится
  partOfSpeech: "noun" | "verb" | "adjective" | "pronoun" | "preposition"
    | "number" | "color" | "phrase" | "adverb" | "conjunction" | "determiner";
  difficulty: 1 | 2 | 3;    // 1=easy, 2=medium, 3=hard
}

interface SpotlightModule {
  id: string;
  title: string;
  titleRu: string;
  part: 1 | 2;              // Часть учебника
  order: number;             // Порядковый номер
  words: SpotlightWord[];
  phrases: SpotlightPhrase[];
  sentences: SpotlightSentence[];
  dialogues: SpotlightDialogue[];
  grammar: string[];         // Грамматические конструкции модуля
}

interface SpotlightPhrase {
  phrase: string;
  translation: string;
  audio: string;
  context: string;           // В какой ситуации используется
}

interface SpotlightSentence {
  sentence: string;
  translation: string;
  audio: string;
  highlightWords: string[];  // Ключевые слова для подсветки
}

interface SpotlightDialogue {
  id: string;
  title: string;
  lines: {
    speaker: "A" | "B";
    text: string;
    translation: string;
    audio: string;
  }[];
}
```

---

## PART 1

---

### Starter Module: My Letters!

```typescript
const STARTER_MY_LETTERS = {
  id: "starter_letters",
  title: "Starter: My Letters!",
  titleRu: "Вводный модуль: Мои буквы!",
  part: 1,
  order: 0,

  // Алфавит + ключевое слово на каждую букву
  words: [
    { word: "ant", translation: "муравей", image: "vocabulary/ant.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "bed", translation: "кровать", image: "vocabulary/bed.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "cat", translation: "кот", image: "vocabulary/cat.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "dog", translation: "собака", image: "vocabulary/dog.svg", phonicsRule: "short_o", partOfSpeech: "noun", difficulty: 1 },
    { word: "egg", translation: "яйцо", image: "vocabulary/egg.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "flag", translation: "флаг", image: "vocabulary/flag.svg", phonicsRule: "consonant_blend_fl", partOfSpeech: "noun", difficulty: 1 },
    { word: "glass", translation: "стакан", image: "vocabulary/glass.svg", phonicsRule: "consonant_blend_gl", partOfSpeech: "noun", difficulty: 1 },
    { word: "horse", translation: "лошадь", image: "vocabulary/horse.svg", phonicsRule: "r_controlled_or", partOfSpeech: "noun", difficulty: 2 },
    { word: "ink", translation: "чернила", image: "vocabulary/ink.svg", phonicsRule: "short_i", partOfSpeech: "noun", difficulty: 1 },
    { word: "jug", translation: "кувшин", image: "vocabulary/jug.svg", phonicsRule: "short_u", partOfSpeech: "noun", difficulty: 1 },
    { word: "kangaroo", translation: "кенгуру", image: "vocabulary/kangaroo.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "lamp", translation: "лампа", image: "vocabulary/lamp.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "mouse", translation: "мышь", image: "vocabulary/mouse.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "nest", translation: "гнездо", image: "vocabulary/nest.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "orange", translation: "апельсин", image: "vocabulary/orange.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "pen", translation: "ручка", image: "vocabulary/pen.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "queen", translation: "королева", image: "vocabulary/queen.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "noun", difficulty: 2 },
    { word: "rabbit", translation: "кролик", image: "vocabulary/rabbit.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "snake", translation: "змея", image: "vocabulary/snake.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 2 },
    { word: "tree", translation: "дерево", image: "vocabulary/tree.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "noun", difficulty: 1 },
    { word: "umbrella", translation: "зонт", image: "vocabulary/umbrella.svg", phonicsRule: "short_u", partOfSpeech: "noun", difficulty: 2 },
    { word: "vest", translation: "жилет", image: "vocabulary/vest.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "window", translation: "окно", image: "vocabulary/window.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "box", translation: "коробка", image: "vocabulary/box.svg", phonicsRule: "short_o", partOfSpeech: "noun", difficulty: 1 },
    { word: "yacht", translation: "яхта", image: "vocabulary/yacht.svg", partOfSpeech: "noun", difficulty: 3 },
    { word: "zip", translation: "молния", image: "vocabulary/zip.svg", phonicsRule: "short_i", partOfSpeech: "noun", difficulty: 1 },
  ],

  // Буквосочетания (letter blends)
  letterBlends: [
    { blend: "sh", word: "sheep", translation: "овца", image: "vocabulary/sheep.svg" },
    { blend: "ch", word: "chimp", translation: "шимпанзе", image: "vocabulary/chimp.svg" },
    { blend: "th", word: "thumb", translation: "большой палец", image: "vocabulary/thumb.svg" },
    { blend: "ph", word: "photo", translation: "фото", image: "vocabulary/photo.svg" },
  ],

  phrases: [
    { phrase: "Hello!", translation: "Привет!", audio: "phrases/hello.mp3", context: "Приветствие" },
    { phrase: "Hi!", translation: "Привет!", audio: "phrases/hi.mp3", context: "Приветствие (неформальное)" },
    { phrase: "Goodbye!", translation: "До свидания!", audio: "phrases/goodbye.mp3", context: "Прощание" },
    { phrase: "Bye!", translation: "Пока!", audio: "phrases/bye.mp3", context: "Прощание (неформальное)" },
    { phrase: "What's your name?", translation: "Как тебя зовут?", audio: "phrases/whats-your-name.mp3", context: "Знакомство" },
    { phrase: "My name is...", translation: "Меня зовут...", audio: "phrases/my-name-is.mp3", context: "Знакомство" },
    { phrase: "How are you?", translation: "Как дела?", audio: "phrases/how-are-you.mp3", context: "Приветствие" },
    { phrase: "I'm fine, thank you!", translation: "У меня всё хорошо, спасибо!", audio: "phrases/im-fine.mp3", context: "Ответ на приветствие" },
  ],

  sentences: [
    { sentence: "Hello! I'm Larry.", translation: "Привет! Я Ларри.", audio: "sentences/s_hello_larry.mp3", highlightWords: ["Hello", "I'm"] },
    { sentence: "Hi! I'm Lulu.", translation: "Привет! Я Лулу.", audio: "sentences/s_hi_lulu.mp3", highlightWords: ["Hi", "I'm"] },
    { sentence: "This is Chuckles.", translation: "Это Чаклз.", audio: "sentences/s_this_is_chuckles.mp3", highlightWords: ["This", "is"] },
  ],

  dialogues: [
    {
      id: "starter_d1",
      title: "Знакомство",
      lines: [
        { speaker: "A", text: "Hello! What's your name?", translation: "Привет! Как тебя зовут?", audio: "dialogues/starter_d1_1.mp3" },
        { speaker: "B", text: "My name is Lulu. What's your name?", translation: "Меня зовут Лулу. А как тебя зовут?", audio: "dialogues/starter_d1_2.mp3" },
        { speaker: "A", text: "I'm Larry. Nice to meet you!", translation: "Я Ларри. Приятно познакомиться!", audio: "dialogues/starter_d1_3.mp3" },
      ],
    },
  ],

  grammar: [
    "I'm = I am",
    "What's = What is",
    "Личные местоимения: I",
    "Указательное: This is...",
  ],
};
```

---

### Starter Module: My Numbers, My Colours

```typescript
const STARTER_NUMBERS_COLOURS = {
  id: "starter_numbers_colours",
  title: "Starter: My Numbers & My Colours!",
  titleRu: "Вводный модуль: Мои числа и цвета!",
  part: 1,
  order: 1,

  words: [
    // Числа 1-10
    { word: "one", translation: "один", image: "vocabulary/number-1.svg", partOfSpeech: "number", difficulty: 1 },
    { word: "two", translation: "два", image: "vocabulary/number-2.svg", partOfSpeech: "number", difficulty: 1 },
    { word: "three", translation: "три", image: "vocabulary/number-3.svg", phonicsRule: "digraph_th", partOfSpeech: "number", difficulty: 1 },
    { word: "four", translation: "четыре", image: "vocabulary/number-4.svg", partOfSpeech: "number", difficulty: 1 },
    { word: "five", translation: "пять", image: "vocabulary/number-5.svg", phonicsRule: "long_i_e", partOfSpeech: "number", difficulty: 1 },
    { word: "six", translation: "шесть", image: "vocabulary/number-6.svg", phonicsRule: "short_i", partOfSpeech: "number", difficulty: 1 },
    { word: "seven", translation: "семь", image: "vocabulary/number-7.svg", partOfSpeech: "number", difficulty: 1 },
    { word: "eight", translation: "восемь", image: "vocabulary/number-8.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "nine", translation: "девять", image: "vocabulary/number-9.svg", phonicsRule: "long_i_e", partOfSpeech: "number", difficulty: 1 },
    { word: "ten", translation: "десять", image: "vocabulary/number-10.svg", phonicsRule: "short_e", partOfSpeech: "number", difficulty: 1 },

    // Цвета
    { word: "red", translation: "красный", image: "vocabulary/color-red.svg", phonicsRule: "short_e", partOfSpeech: "color", difficulty: 1 },
    { word: "blue", translation: "синий", image: "vocabulary/color-blue.svg", partOfSpeech: "color", difficulty: 1 },
    { word: "green", translation: "зелёный", image: "vocabulary/color-green.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "color", difficulty: 1 },
    { word: "yellow", translation: "жёлтый", image: "vocabulary/color-yellow.svg", partOfSpeech: "color", difficulty: 2 },
    { word: "orange", translation: "оранжевый", image: "vocabulary/color-orange.svg", partOfSpeech: "color", difficulty: 2 },
    { word: "pink", translation: "розовый", image: "vocabulary/color-pink.svg", phonicsRule: "short_i", partOfSpeech: "color", difficulty: 1 },
    { word: "black", translation: "чёрный", image: "vocabulary/color-black.svg", phonicsRule: "consonant_blend_bl", partOfSpeech: "color", difficulty: 1 },
    { word: "white", translation: "белый", image: "vocabulary/color-white.svg", phonicsRule: "long_i_e", partOfSpeech: "color", difficulty: 1 },
    { word: "brown", translation: "коричневый", image: "vocabulary/color-brown.svg", phonicsRule: "consonant_blend_br", partOfSpeech: "color", difficulty: 2 },
    { word: "purple", translation: "фиолетовый", image: "vocabulary/color-purple.svg", phonicsRule: "r_controlled_ur", partOfSpeech: "color", difficulty: 2 },
  ],

  phrases: [
    { phrase: "How many?", translation: "Сколько?", audio: "phrases/how-many.mp3", context: "Вопрос о количестве" },
    { phrase: "What colour is it?", translation: "Какого это цвета?", audio: "phrases/what-colour.mp3", context: "Вопрос о цвете" },
    { phrase: "It's red.", translation: "Это красный.", audio: "phrases/its-red.mp3", context: "Ответ о цвете" },
    { phrase: "Count to ten!", translation: "Посчитай до десяти!", audio: "phrases/count-to-ten.mp3", context: "Инструкция" },
  ],

  sentences: [
    { sentence: "I can see three cats.", translation: "Я вижу трёх котов.", audio: "sentences/s_three_cats.mp3", highlightWords: ["three", "cats"] },
    { sentence: "The ball is red.", translation: "Мяч красный.", audio: "sentences/s_ball_red.mp3", highlightWords: ["ball", "red"] },
    { sentence: "I have five pencils.", translation: "У меня пять карандашей.", audio: "sentences/s_five_pencils.mp3", highlightWords: ["five", "pencils"] },
    { sentence: "The frog is green.", translation: "Лягушка зелёная.", audio: "sentences/s_frog_green.mp3", highlightWords: ["frog", "green"] },
    { sentence: "How many birds? Six!", translation: "Сколько птиц? Шесть!", audio: "sentences/s_how_many_birds.mp3", highlightWords: ["How", "many", "Six"] },
  ],

  dialogues: [],

  grammar: [
    "How many + существительное?",
    "What colour is it? — It's...",
    "I can see...",
    "I have...",
  ],
};
```

---

### Module 1: My Home!

```typescript
const MODULE_1 = {
  id: "module_1_my_home",
  title: "Module 1: My Home!",
  titleRu: "Модуль 1: Мой дом!",
  part: 1,
  order: 2,

  words: [
    // 1a: My House
    { word: "house", translation: "дом", image: "vocabulary/house.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "bedroom", translation: "спальня", image: "vocabulary/bedroom.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "kitchen", translation: "кухня", image: "vocabulary/kitchen.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 2 },
    { word: "bathroom", translation: "ванная", image: "vocabulary/bathroom.svg", phonicsRule: "digraph_th", partOfSpeech: "noun", difficulty: 2 },
    { word: "living room", translation: "гостиная", image: "vocabulary/living-room.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "garden", translation: "сад", image: "vocabulary/garden.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 2 },
    { word: "tree house", translation: "домик на дереве", image: "vocabulary/tree-house.svg", partOfSpeech: "noun", difficulty: 2 },

    // 1b: Where's Chuckles?
    { word: "table", translation: "стол", image: "vocabulary/table.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "chair", translation: "стул", image: "vocabulary/chair.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 1 },
    { word: "bed", translation: "кровать", image: "vocabulary/bed.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "radio", translation: "радио", image: "vocabulary/radio.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "door", translation: "дверь", image: "vocabulary/door.svg", phonicsRule: "r_controlled_or", partOfSpeech: "noun", difficulty: 1 },
    { word: "window", translation: "окно", image: "vocabulary/window.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "lamp", translation: "лампа", image: "vocabulary/lamp.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "mirror", translation: "зеркало", image: "vocabulary/mirror.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "cupboard", translation: "шкаф", image: "vocabulary/cupboard.svg", partOfSpeech: "noun", difficulty: 3 },

    // Предлоги
    { word: "in", translation: "в", image: "vocabulary/prep-in.svg", partOfSpeech: "preposition", difficulty: 1 },
    { word: "on", translation: "на", image: "vocabulary/prep-on.svg", partOfSpeech: "preposition", difficulty: 1 },
    { word: "under", translation: "под", image: "vocabulary/prep-under.svg", partOfSpeech: "preposition", difficulty: 1 },
    { word: "behind", translation: "за", image: "vocabulary/prep-behind.svg", partOfSpeech: "preposition", difficulty: 2 },
    { word: "next to", translation: "рядом с", image: "vocabulary/prep-next-to.svg", partOfSpeech: "preposition", difficulty: 2 },
  ],

  phrases: [
    { phrase: "This is my house.", translation: "Это мой дом.", audio: "phrases/this-is-my-house.mp3", context: "Представление дома" },
    { phrase: "Where's Chuckles?", translation: "Где Чаклз?", audio: "phrases/wheres-chuckles.mp3", context: "Вопрос о местоположении" },
    { phrase: "He's in the kitchen.", translation: "Он на кухне.", audio: "phrases/hes-in-kitchen.mp3", context: "Ответ о местоположении" },
    { phrase: "Is he in the bedroom?", translation: "Он в спальне?", audio: "phrases/is-he-in-bedroom.mp3", context: "Вопрос" },
    { phrase: "Yes, he is. / No, he isn't.", translation: "Да. / Нет.", audio: "phrases/yes-no-he-is.mp3", context: "Короткий ответ" },
  ],

  sentences: [
    { sentence: "Mummy is in the kitchen.", translation: "Мама на кухне.", audio: "sentences/s_mummy_kitchen.mp3", highlightWords: ["Mummy", "kitchen"] },
    { sentence: "The cat is under the table.", translation: "Кот под столом.", audio: "sentences/s_cat_under_table.mp3", highlightWords: ["cat", "under", "table"] },
    { sentence: "The lamp is on the table.", translation: "Лампа на столе.", audio: "sentences/s_lamp_on_table.mp3", highlightWords: ["lamp", "on", "table"] },
    { sentence: "Where's daddy? He's in the garden.", translation: "Где папа? Он в саду.", audio: "sentences/s_daddy_garden.mp3", highlightWords: ["Where's", "garden"] },
    { sentence: "The bed is in the bedroom.", translation: "Кровать в спальне.", audio: "sentences/s_bed_bedroom.mp3", highlightWords: ["bed", "bedroom"] },
  ],

  dialogues: [
    {
      id: "m1_d1",
      title: "Где Чаклз?",
      lines: [
        { speaker: "A", text: "Where's Chuckles?", translation: "Где Чаклз?", audio: "dialogues/m1_d1_1.mp3" },
        { speaker: "B", text: "Is he in the kitchen?", translation: "Он на кухне?", audio: "dialogues/m1_d1_2.mp3" },
        { speaker: "A", text: "No, he isn't.", translation: "Нет.", audio: "dialogues/m1_d1_3.mp3" },
        { speaker: "B", text: "Is he in the bedroom?", translation: "Он в спальне?", audio: "dialogues/m1_d1_4.mp3" },
        { speaker: "A", text: "Yes, he is!", translation: "Да!", audio: "dialogues/m1_d1_5.mp3" },
      ],
    },
  ],

  grammar: [
    "Where's = Where is",
    "He's = He is / She's = She is",
    "Is he/she in...? — Yes, he/she is. / No, he/she isn't.",
    "Предлоги места: in, on, under",
    "This is my...",
  ],
};
```

---

### Module 2: My Birthday!

```typescript
const MODULE_2 = {
  id: "module_2_my_birthday",
  title: "Module 2: My Birthday!",
  titleRu: "Модуль 2: Мой день рождения!",
  part: 1,
  order: 3,

  words: [
    // 2a: I'm Happy!
    { word: "happy", translation: "счастливый", image: "vocabulary/happy.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "sad", translation: "грустный", image: "vocabulary/sad.svg", phonicsRule: "short_a", partOfSpeech: "adjective", difficulty: 1 },
    { word: "birthday", translation: "день рождения", image: "vocabulary/birthday.svg", phonicsRule: "digraph_th", partOfSpeech: "noun", difficulty: 2 },
    { word: "party", translation: "вечеринка", image: "vocabulary/party.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 2 },
    { word: "candle", translation: "свеча", image: "vocabulary/candle.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "cake", translation: "торт", image: "vocabulary/cake.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "present", translation: "подарок", image: "vocabulary/present.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "balloon", translation: "воздушный шар", image: "vocabulary/balloon.svg", partOfSpeech: "noun", difficulty: 2 },

    // 2b: Yummy Chocolate! (еда)
    { word: "chocolate", translation: "шоколад", image: "vocabulary/chocolate.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 2 },
    { word: "cake", translation: "торт", image: "vocabulary/cake.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "biscuit", translation: "печенье", image: "vocabulary/biscuit.svg", partOfSpeech: "noun", difficulty: 3 },
    { word: "ice cream", translation: "мороженое", image: "vocabulary/ice-cream.svg", phonicsRule: "long_i_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "sandwich", translation: "бутерброд", image: "vocabulary/sandwich.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 3 },
    { word: "pizza", translation: "пицца", image: "vocabulary/pizza.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "juice", translation: "сок", image: "vocabulary/juice.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "milk", translation: "молоко", image: "vocabulary/milk.svg", phonicsRule: "short_i", partOfSpeech: "noun", difficulty: 1 },
    { word: "apple", translation: "яблоко", image: "vocabulary/apple.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "banana", translation: "банан", image: "vocabulary/banana.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "chips", translation: "чипсы", image: "vocabulary/chips.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 1 },
    { word: "egg", translation: "яйцо", image: "vocabulary/egg.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "yummy", translation: "вкусный", image: "vocabulary/yummy.svg", partOfSpeech: "adjective", difficulty: 1 },

    // Числа 11-20
    { word: "eleven", translation: "одиннадцать", image: "vocabulary/number-11.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "twelve", translation: "двенадцать", image: "vocabulary/number-12.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "thirteen", translation: "тринадцать", image: "vocabulary/number-13.svg", phonicsRule: "digraph_th", partOfSpeech: "number", difficulty: 2 },
    { word: "fourteen", translation: "четырнадцать", image: "vocabulary/number-14.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "fifteen", translation: "пятнадцать", image: "vocabulary/number-15.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "sixteen", translation: "шестнадцать", image: "vocabulary/number-16.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "seventeen", translation: "семнадцать", image: "vocabulary/number-17.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "eighteen", translation: "восемнадцать", image: "vocabulary/number-18.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "nineteen", translation: "девятнадцать", image: "vocabulary/number-19.svg", partOfSpeech: "number", difficulty: 2 },
    { word: "twenty", translation: "двадцать", image: "vocabulary/number-20.svg", partOfSpeech: "number", difficulty: 2 },
  ],

  phrases: [
    { phrase: "Happy birthday!", translation: "С днём рождения!", audio: "phrases/happy-birthday.mp3", context: "Поздравление" },
    { phrase: "How old are you?", translation: "Сколько тебе лет?", audio: "phrases/how-old.mp3", context: "Вопрос о возрасте" },
    { phrase: "I'm eight.", translation: "Мне восемь.", audio: "phrases/im-eight.mp3", context: "Ответ о возрасте" },
    { phrase: "I like chocolate!", translation: "Я люблю шоколад!", audio: "phrases/i-like-chocolate.mp3", context: "Предпочтения" },
    { phrase: "I don't like eggs.", translation: "Я не люблю яйца.", audio: "phrases/i-dont-like.mp3", context: "Предпочтения (отрицание)" },
    { phrase: "My favourite food is pizza.", translation: "Моя любимая еда — пицца.", audio: "phrases/favourite-food.mp3", context: "Предпочтения" },
    { phrase: "What's your favourite food?", translation: "Какая твоя любимая еда?", audio: "phrases/whats-favourite-food.mp3", context: "Вопрос" },
    { phrase: "Yummy!", translation: "Вкусно!", audio: "phrases/yummy.mp3", context: "Реакция на еду" },
  ],

  sentences: [
    { sentence: "I'm nine years old.", translation: "Мне девять лет.", audio: "sentences/s_im_nine.mp3", highlightWords: ["nine", "years", "old"] },
    { sentence: "I like cake and ice cream.", translation: "Я люблю торт и мороженое.", audio: "sentences/s_like_cake.mp3", highlightWords: ["like", "cake", "ice cream"] },
    { sentence: "I don't like milk.", translation: "Я не люблю молоко.", audio: "sentences/s_dont_like_milk.mp3", highlightWords: ["don't", "like", "milk"] },
    { sentence: "Happy birthday, Lulu!", translation: "С днём рождения, Лулу!", audio: "sentences/s_happy_birthday.mp3", highlightWords: ["Happy", "birthday"] },
    { sentence: "Can I have some chocolate?", translation: "Можно мне шоколад?", audio: "sentences/s_can_i_have.mp3", highlightWords: ["Can", "have", "chocolate"] },
    { sentence: "There are ten candles on the cake.", translation: "На торте десять свечей.", audio: "sentences/s_ten_candles.mp3", highlightWords: ["ten", "candles", "cake"] },
  ],

  dialogues: [
    {
      id: "m2_d1",
      title: "День рождения",
      lines: [
        { speaker: "A", text: "Happy birthday, Larry!", translation: "С днём рождения, Ларри!", audio: "dialogues/m2_d1_1.mp3" },
        { speaker: "B", text: "Thank you!", translation: "Спасибо!", audio: "dialogues/m2_d1_2.mp3" },
        { speaker: "A", text: "How old are you?", translation: "Сколько тебе лет?", audio: "dialogues/m2_d1_3.mp3" },
        { speaker: "B", text: "I'm eight!", translation: "Мне восемь!", audio: "dialogues/m2_d1_4.mp3" },
        { speaker: "A", text: "Do you like your cake?", translation: "Тебе нравится торт?", audio: "dialogues/m2_d1_5.mp3" },
        { speaker: "B", text: "Yes! It's yummy!", translation: "Да! Он вкусный!", audio: "dialogues/m2_d1_6.mp3" },
      ],
    },
  ],

  grammar: [
    "How old are you? — I'm + число.",
    "I like... / I don't like...",
    "My favourite ... is ...",
    "Числа 1-20",
    "Can I have some...?",
  ],
};
```

---

### Module 3: My Animals!

```typescript
const MODULE_3 = {
  id: "module_3_my_animals",
  title: "Module 3: My Animals!",
  titleRu: "Модуль 3: Мои животные!",
  part: 1,
  order: 4,

  words: [
    // 3a: Animals
    { word: "animal", translation: "животное", image: "vocabulary/animal.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "fish", translation: "рыба", image: "vocabulary/fish.svg", phonicsRule: "digraph_sh", partOfSpeech: "noun", difficulty: 1 },
    { word: "frog", translation: "лягушка", image: "vocabulary/frog.svg", phonicsRule: "consonant_blend_fr", partOfSpeech: "noun", difficulty: 1 },
    { word: "bird", translation: "птица", image: "vocabulary/bird.svg", phonicsRule: "r_controlled_ir", partOfSpeech: "noun", difficulty: 1 },
    { word: "chimp", translation: "шимпанзе", image: "vocabulary/chimp.svg", phonicsRule: "digraph_ch", partOfSpeech: "noun", difficulty: 2 },
    { word: "horse", translation: "лошадь", image: "vocabulary/horse.svg", phonicsRule: "r_controlled_or", partOfSpeech: "noun", difficulty: 1 },

    // 3b: I Can Jump!
    { word: "jump", translation: "прыгать", image: "vocabulary/jump.svg", phonicsRule: "short_u", partOfSpeech: "verb", difficulty: 1 },
    { word: "sing", translation: "петь", image: "vocabulary/sing.svg", phonicsRule: "digraph_ng", partOfSpeech: "verb", difficulty: 1 },
    { word: "dance", translation: "танцевать", image: "vocabulary/dance.svg", partOfSpeech: "verb", difficulty: 1 },
    { word: "swim", translation: "плавать", image: "vocabulary/swim.svg", phonicsRule: "consonant_blend_sw", partOfSpeech: "verb", difficulty: 1 },
    { word: "fly", translation: "летать", image: "vocabulary/fly.svg", phonicsRule: "consonant_blend_fl", partOfSpeech: "verb", difficulty: 1 },
    { word: "run", translation: "бегать", image: "vocabulary/run.svg", phonicsRule: "short_u", partOfSpeech: "verb", difficulty: 1 },
    { word: "climb", translation: "лазать", image: "vocabulary/climb.svg", partOfSpeech: "verb", difficulty: 2 },

    // 3c: Pets
    { word: "cat", translation: "кот", image: "vocabulary/cat.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "dog", translation: "собака", image: "vocabulary/dog.svg", phonicsRule: "short_o", partOfSpeech: "noun", difficulty: 1 },
    { word: "rabbit", translation: "кролик", image: "vocabulary/rabbit.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "hamster", translation: "хомяк", image: "vocabulary/hamster.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "turtle", translation: "черепаха", image: "vocabulary/turtle.svg", phonicsRule: "r_controlled_ur", partOfSpeech: "noun", difficulty: 2 },
    { word: "pet", translation: "питомец", image: "vocabulary/pet.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },

    // Описательные
    { word: "big", translation: "большой", image: "vocabulary/big.svg", phonicsRule: "short_i", partOfSpeech: "adjective", difficulty: 1 },
    { word: "small", translation: "маленький", image: "vocabulary/small.svg", phonicsRule: "consonant_blend_sm", partOfSpeech: "adjective", difficulty: 1 },
    { word: "fat", translation: "толстый", image: "vocabulary/fat.svg", phonicsRule: "short_a", partOfSpeech: "adjective", difficulty: 1 },
    { word: "thin", translation: "тонкий/худой", image: "vocabulary/thin.svg", phonicsRule: "digraph_th", partOfSpeech: "adjective", difficulty: 1 },
    { word: "tall", translation: "высокий", image: "vocabulary/tall.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "short", translation: "низкий/короткий", image: "vocabulary/short.svg", phonicsRule: "digraph_sh", partOfSpeech: "adjective", difficulty: 1 },
  ],

  phrases: [
    { phrase: "I can jump!", translation: "Я умею прыгать!", audio: "phrases/i-can-jump.mp3", context: "Говорим об умениях" },
    { phrase: "I can't fly.", translation: "Я не умею летать.", audio: "phrases/i-cant-fly.mp3", context: "Говорим об отсутствии умения" },
    { phrase: "Can you swim?", translation: "Ты умеешь плавать?", audio: "phrases/can-you-swim.mp3", context: "Вопрос об умении" },
    { phrase: "Yes, I can. / No, I can't.", translation: "Да. / Нет.", audio: "phrases/yes-no-can.mp3", context: "Короткий ответ" },
    { phrase: "A fish can swim.", translation: "Рыба умеет плавать.", audio: "phrases/fish-can-swim.mp3", context: "Описание животного" },
    { phrase: "I've got a pet.", translation: "У меня есть питомец.", audio: "phrases/ive-got-pet.mp3", context: "Рассказ о питомце" },
    { phrase: "It's big and brown.", translation: "Он большой и коричневый.", audio: "phrases/its-big-brown.mp3", context: "Описание" },
  ],

  sentences: [
    { sentence: "A frog can jump.", translation: "Лягушка умеет прыгать.", audio: "sentences/s_frog_jump.mp3", highlightWords: ["frog", "can", "jump"] },
    { sentence: "A bird can fly and sing.", translation: "Птица умеет летать и петь.", audio: "sentences/s_bird_fly_sing.mp3", highlightWords: ["bird", "fly", "sing"] },
    { sentence: "I can't climb a tree.", translation: "Я не умею лазить по деревьям.", audio: "sentences/s_cant_climb.mp3", highlightWords: ["can't", "climb", "tree"] },
    { sentence: "My dog is big and fat.", translation: "Моя собака большая и толстая.", audio: "sentences/s_dog_big_fat.mp3", highlightWords: ["dog", "big", "fat"] },
    { sentence: "The fish is small.", translation: "Рыбка маленькая.", audio: "sentences/s_fish_small.mp3", highlightWords: ["fish", "small"] },
    { sentence: "Can a horse swim? Yes, it can!", translation: "Лошадь умеет плавать? Да!", audio: "sentences/s_horse_swim.mp3", highlightWords: ["horse", "swim", "can"] },
  ],

  dialogues: [
    {
      id: "m3_d1",
      title: "Что ты умеешь?",
      lines: [
        { speaker: "A", text: "I can swim! Can you swim?", translation: "Я умею плавать! А ты умеешь?", audio: "dialogues/m3_d1_1.mp3" },
        { speaker: "B", text: "No, I can't. But I can dance!", translation: "Нет. Но я умею танцевать!", audio: "dialogues/m3_d1_2.mp3" },
        { speaker: "A", text: "Look! The chimp can climb!", translation: "Смотри! Шимпанзе умеет лазить!", audio: "dialogues/m3_d1_3.mp3" },
        { speaker: "B", text: "And it can jump, too!", translation: "И ещё прыгать!", audio: "dialogues/m3_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "can / can't (cannot)",
    "Can you...? — Yes, I can. / No, I can't.",
    "A + animal + can + глагол",
    "I've got = I have got",
    "Прилагательные: big, small, tall, short, fat, thin",
  ],
};
```

---

### Module 4: My Toys!

```typescript
const MODULE_4 = {
  id: "module_4_my_toys",
  title: "Module 4: My Toys!",
  titleRu: "Модуль 4: Мои игрушки!",
  part: 1,
  order: 5,

  words: [
    // 4a: My Toys
    { word: "teddy bear", translation: "плюшевый мишка", image: "vocabulary/teddy-bear.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "toy soldier", translation: "игрушечный солдатик", image: "vocabulary/toy-soldier.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "ballerina", translation: "балерина", image: "vocabulary/ballerina.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "puppet", translation: "кукла-марионетка", image: "vocabulary/puppet.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "jack-in-the-box", translation: "чёртик из коробки", image: "vocabulary/jack-in-the-box.svg", partOfSpeech: "noun", difficulty: 3 },
    { word: "doll", translation: "кукла", image: "vocabulary/doll.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "ball", translation: "мяч", image: "vocabulary/ball.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "toy box", translation: "коробка для игрушек", image: "vocabulary/toy-box.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "toy", translation: "игрушка", image: "vocabulary/toy.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "train", translation: "поезд", image: "vocabulary/train.svg", phonicsRule: "vowel_team_ai", partOfSpeech: "noun", difficulty: 1 },
    { word: "plane", translation: "самолёт", image: "vocabulary/plane.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "car", translation: "машина", image: "vocabulary/car.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 1 },
    { word: "bike", translation: "велосипед", image: "vocabulary/bike.svg", phonicsRule: "long_i_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "boat", translation: "лодка", image: "vocabulary/boat.svg", phonicsRule: "vowel_team_oa", partOfSpeech: "noun", difficulty: 1 },

    // Прилагательные
    { word: "old", translation: "старый", image: "vocabulary/old.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "new", translation: "новый", image: "vocabulary/new.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "dark", translation: "тёмный", image: "vocabulary/dark.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "adjective", difficulty: 1 },
    { word: "light", translation: "светлый", image: "vocabulary/light.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "lovely", translation: "прекрасный", image: "vocabulary/lovely.svg", partOfSpeech: "adjective", difficulty: 2 },
  ],

  phrases: [
    { phrase: "This is my teddy bear.", translation: "Это мой плюшевый мишка.", audio: "phrases/this-is-my-teddy.mp3", context: "Представление игрушки" },
    { phrase: "She's got blue eyes.", translation: "У неё голубые глаза.", audio: "phrases/shes-got-blue-eyes.mp3", context: "Описание куклы" },
    { phrase: "It's got a big nose.", translation: "У него большой нос.", audio: "phrases/its-got-big-nose.mp3", context: "Описание игрушки" },
    { phrase: "Where's my ball?", translation: "Где мой мяч?", audio: "phrases/wheres-my-ball.mp3", context: "Поиск" },
    { phrase: "It's under the bed.", translation: "Он под кроватью.", audio: "phrases/its-under-bed.mp3", context: "Местоположение" },
    { phrase: "I've got a new bike!", translation: "У меня новый велосипед!", audio: "phrases/ive-got-new-bike.mp3", context: "Рассказ о своём" },
  ],

  sentences: [
    { sentence: "She's got dark hair.", translation: "У неё тёмные волосы.", audio: "sentences/s_dark_hair.mp3", highlightWords: ["She's", "got", "dark", "hair"] },
    { sentence: "My teddy bear has got big eyes.", translation: "У моего мишки большие глаза.", audio: "sentences/s_teddy_eyes.mp3", highlightWords: ["teddy bear", "big", "eyes"] },
    { sentence: "This is my new car. It's red!", translation: "Это моя новая машинка. Она красная!", audio: "sentences/s_new_car.mp3", highlightWords: ["new", "car", "red"] },
    { sentence: "Where's the puppet? It's in the toy box.", translation: "Где марионетка? В коробке с игрушками.", audio: "sentences/s_puppet_toybox.mp3", highlightWords: ["puppet", "toy box"] },
    { sentence: "Look at my plane! It can fly!", translation: "Посмотри на мой самолёт! Он летает!", audio: "sentences/s_plane_fly.mp3", highlightWords: ["plane", "fly"] },
  ],

  dialogues: [
    {
      id: "m4_d1",
      title: "Покажи мне свои игрушки",
      lines: [
        { speaker: "A", text: "Look at my new toy!", translation: "Посмотри на мою новую игрушку!", audio: "dialogues/m4_d1_1.mp3" },
        { speaker: "B", text: "Wow! It's a puppet!", translation: "Вау! Это марионетка!", audio: "dialogues/m4_d1_2.mp3" },
        { speaker: "A", text: "Yes! It's got big eyes and a funny nose!", translation: "Да! У неё большие глаза и смешной нос!", audio: "dialogues/m4_d1_3.mp3" },
        { speaker: "B", text: "I like it! It's lovely!", translation: "Мне нравится! Она замечательная!", audio: "dialogues/m4_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "She's/He's/It's got... (описание)",
    "I've got... / Have you got...?",
    "Предлоги места: in, on, under, behind, next to",
    "Притяжательные: my, your, his, her",
    "Указательные: this, that",
  ],
};
```

---

### Module 5: My Holidays!

```typescript
const MODULE_5 = {
  id: "module_5_my_holidays",
  title: "Module 5: My Holidays!",
  titleRu: "Модуль 5: Мои каникулы!",
  part: 1,
  order: 6,

  words: [
    // 5a: It's Windy!  (Погода и одежда)
    { word: "sunny", translation: "солнечно", image: "vocabulary/sunny.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "hot", translation: "жарко", image: "vocabulary/hot.svg", phonicsRule: "short_o", partOfSpeech: "adjective", difficulty: 1 },
    { word: "windy", translation: "ветрено", image: "vocabulary/windy.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "cold", translation: "холодно", image: "vocabulary/cold.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "rainy", translation: "дождливо", image: "vocabulary/rainy.svg", phonicsRule: "vowel_team_ai", partOfSpeech: "adjective", difficulty: 2 },
    { word: "cloudy", translation: "облачно", image: "vocabulary/cloudy.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "snowy", translation: "снежно", image: "vocabulary/snowy.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "weather", translation: "погода", image: "vocabulary/weather.svg", phonicsRule: "digraph_th", partOfSpeech: "noun", difficulty: 2 },

    // Одежда
    { word: "coat", translation: "пальто", image: "vocabulary/coat.svg", phonicsRule: "vowel_team_oa", partOfSpeech: "noun", difficulty: 1 },
    { word: "hat", translation: "шапка/шляпа", image: "vocabulary/hat.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "jacket", translation: "куртка", image: "vocabulary/jacket.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "T-shirt", translation: "футболка", image: "vocabulary/t-shirt.svg", phonicsRule: "digraph_sh", partOfSpeech: "noun", difficulty: 1 },
    { word: "shorts", translation: "шорты", image: "vocabulary/shorts.svg", phonicsRule: "digraph_sh", partOfSpeech: "noun", difficulty: 1 },
    { word: "shoes", translation: "туфли/обувь", image: "vocabulary/shoes.svg", phonicsRule: "digraph_sh", partOfSpeech: "noun", difficulty: 1 },
    { word: "skirt", translation: "юбка", image: "vocabulary/skirt.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "dress", translation: "платье", image: "vocabulary/dress.svg", phonicsRule: "consonant_blend_dr", partOfSpeech: "noun", difficulty: 1 },
    { word: "jeans", translation: "джинсы", image: "vocabulary/jeans.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "noun", difficulty: 1 },
    { word: "socks", translation: "носки", image: "vocabulary/socks.svg", phonicsRule: "short_o", partOfSpeech: "noun", difficulty: 1 },
    { word: "boots", translation: "ботинки/сапоги", image: "vocabulary/boots.svg", phonicsRule: "vowel_team_oo", partOfSpeech: "noun", difficulty: 1 },
    { word: "scarf", translation: "шарф", image: "vocabulary/scarf.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 2 },
    { word: "gloves", translation: "перчатки", image: "vocabulary/gloves.svg", phonicsRule: "consonant_blend_gl", partOfSpeech: "noun", difficulty: 2 },

    // 5b: Каникулы
    { word: "island", translation: "остров", image: "vocabulary/island.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "summer", translation: "лето", image: "vocabulary/summer.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "spring", translation: "весна", image: "vocabulary/spring.svg", phonicsRule: "consonant_blend_sp", partOfSpeech: "noun", difficulty: 1 },
    { word: "autumn", translation: "осень", image: "vocabulary/autumn.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "winter", translation: "зима", image: "vocabulary/winter.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "holiday", translation: "каникулы/праздник", image: "vocabulary/holiday.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "sea", translation: "море", image: "vocabulary/sea.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "noun", difficulty: 1 },
    { word: "sand", translation: "песок", image: "vocabulary/sand.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 1 },
    { word: "sandcastle", translation: "замок из песка", image: "vocabulary/sandcastle.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "beach", translation: "пляж", image: "vocabulary/beach.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "noun", difficulty: 1 },
    { word: "sun", translation: "солнце", image: "vocabulary/sun.svg", phonicsRule: "short_u", partOfSpeech: "noun", difficulty: 1 },
  ],

  phrases: [
    { phrase: "What's the weather like?", translation: "Какая погода?", audio: "phrases/whats-the-weather.mp3", context: "Вопрос о погоде" },
    { phrase: "It's sunny and hot.", translation: "Солнечно и жарко.", audio: "phrases/its-sunny-hot.mp3", context: "Описание погоды" },
    { phrase: "I'm wearing a T-shirt.", translation: "На мне футболка.", audio: "phrases/im-wearing.mp3", context: "Описание одежды" },
    { phrase: "Put on your coat!", translation: "Надень пальто!", audio: "phrases/put-on-coat.mp3", context: "Просьба" },
    { phrase: "Take off your hat.", translation: "Сними шапку.", audio: "phrases/take-off-hat.mp3", context: "Просьба" },
    { phrase: "Let's go to the beach!", translation: "Пойдём на пляж!", audio: "phrases/lets-go-beach.mp3", context: "Предложение" },
    { phrase: "I love summer!", translation: "Я люблю лето!", audio: "phrases/i-love-summer.mp3", context: "Время года" },
    { phrase: "It's raining!", translation: "Идёт дождь!", audio: "phrases/its-raining.mp3", context: "Погода" },
  ],

  sentences: [
    { sentence: "It's sunny today. I'm wearing my shorts.", translation: "Сегодня солнечно. Я в шортах.", audio: "sentences/s_sunny_shorts.mp3", highlightWords: ["sunny", "wearing", "shorts"] },
    { sentence: "It's cold and windy. Put on your coat!", translation: "Холодно и ветрено. Надень пальто!", audio: "sentences/s_cold_coat.mp3", highlightWords: ["cold", "windy", "coat"] },
    { sentence: "I love summer! I can swim in the sea.", translation: "Я люблю лето! Я могу плавать в море.", audio: "sentences/s_love_summer.mp3", highlightWords: ["love", "summer", "swim", "sea"] },
    { sentence: "In winter I wear boots, a coat and a scarf.", translation: "Зимой я ношу сапоги, пальто и шарф.", audio: "sentences/s_winter_clothes.mp3", highlightWords: ["winter", "boots", "coat", "scarf"] },
    { sentence: "Look! A sandcastle on the beach!", translation: "Смотри! Замок из песка на пляже!", audio: "sentences/s_sandcastle.mp3", highlightWords: ["sandcastle", "beach"] },
    { sentence: "In spring it's rainy and windy.", translation: "Весной дождливо и ветрено.", audio: "sentences/s_spring_rainy.mp3", highlightWords: ["spring", "rainy", "windy"] },
  ],

  dialogues: [
    {
      id: "m5_d1",
      title: "Какая погода?",
      lines: [
        { speaker: "A", text: "What's the weather like today?", translation: "Какая сегодня погода?", audio: "dialogues/m5_d1_1.mp3" },
        { speaker: "B", text: "It's sunny and hot!", translation: "Солнечно и жарко!", audio: "dialogues/m5_d1_2.mp3" },
        { speaker: "A", text: "Great! Let's go to the beach!", translation: "Отлично! Пойдём на пляж!", audio: "dialogues/m5_d1_3.mp3" },
        { speaker: "B", text: "Yes! I love swimming in the sea!", translation: "Да! Я люблю плавать в море!", audio: "dialogues/m5_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "What's the weather like? — It's sunny/cold/windy...",
    "I'm wearing... (Present Continuous для одежды)",
    "Put on / Take off",
    "Seasons: spring, summer, autumn, winter",
    "Let's + глагол!",
  ],
};
```

---

## PART 2

---

### Module 6 (11): My Body!

```typescript
const MODULE_6 = {
  id: "module_6_my_body",
  title: "Module 6: My Body!",
  titleRu: "Модуль 6: Моё тело!",
  part: 2,
  order: 7,

  words: [
    // Части тела
    { word: "head", translation: "голова", image: "vocabulary/head.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "body", translation: "тело", image: "vocabulary/body.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "arms", translation: "руки", image: "vocabulary/arms.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 1 },
    { word: "legs", translation: "ноги", image: "vocabulary/legs.svg", phonicsRule: "short_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "hands", translation: "ладони/руки", image: "vocabulary/hands.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "feet", translation: "ступни/ноги", image: "vocabulary/feet.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "noun", difficulty: 1 },
    { word: "tummy", translation: "животик", image: "vocabulary/tummy.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "shoulders", translation: "плечи", image: "vocabulary/shoulders.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "knees", translation: "колени", image: "vocabulary/knees.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "noun", difficulty: 2 },
    { word: "toes", translation: "пальцы ног", image: "vocabulary/toes.svg", partOfSpeech: "noun", difficulty: 1 },

    // Лицо
    { word: "face", translation: "лицо", image: "vocabulary/face.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "eyes", translation: "глаза", image: "vocabulary/eyes.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "ears", translation: "уши", image: "vocabulary/ears.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "noun", difficulty: 1 },
    { word: "nose", translation: "нос", image: "vocabulary/nose.svg", phonicsRule: "long_o_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "mouth", translation: "рот", image: "vocabulary/mouth.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "hair", translation: "волосы", image: "vocabulary/hair.svg", phonicsRule: "vowel_team_ai", partOfSpeech: "noun", difficulty: 1 },
    { word: "teeth", translation: "зубы", image: "vocabulary/teeth.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "noun", difficulty: 1 },

    // Описательные
    { word: "long", translation: "длинный", image: "vocabulary/long.svg", phonicsRule: "digraph_ng", partOfSpeech: "adjective", difficulty: 1 },
    { word: "short", translation: "короткий", image: "vocabulary/short-adj.svg", phonicsRule: "digraph_sh", partOfSpeech: "adjective", difficulty: 1 },
    { word: "fair", translation: "светлый (о волосах)", image: "vocabulary/fair.svg", phonicsRule: "vowel_team_ai", partOfSpeech: "adjective", difficulty: 2 },
  ],

  phrases: [
    { phrase: "I've got two eyes.", translation: "У меня два глаза.", audio: "phrases/ive-got-two-eyes.mp3", context: "Описание тела" },
    { phrase: "Touch your nose!", translation: "Дотронься до носа!", audio: "phrases/touch-nose.mp3", context: "Команда/игра" },
    { phrase: "Clap your hands!", translation: "Похлопай в ладоши!", audio: "phrases/clap-hands.mp3", context: "Команда/игра" },
    { phrase: "Stamp your feet!", translation: "Потопай ногами!", audio: "phrases/stamp-feet.mp3", context: "Команда/игра" },
    { phrase: "She's got long fair hair.", translation: "У неё длинные светлые волосы.", audio: "phrases/long-fair-hair.mp3", context: "Описание внешности" },
    { phrase: "He's got big brown eyes.", translation: "У него большие карие глаза.", audio: "phrases/big-brown-eyes.mp3", context: "Описание внешности" },
  ],

  sentences: [
    { sentence: "I've got ten toes and ten fingers.", translation: "У меня десять пальцев на ногах и десять на руках.", audio: "sentences/s_toes_fingers.mp3", highlightWords: ["ten", "toes", "fingers"] },
    { sentence: "Touch your head! Clap your hands!", translation: "Дотронься до головы! Похлопай в ладоши!", audio: "sentences/s_touch_clap.mp3", highlightWords: ["Touch", "head", "Clap", "hands"] },
    { sentence: "She's got long dark hair and blue eyes.", translation: "У неё длинные тёмные волосы и голубые глаза.", audio: "sentences/s_long_dark_hair.mp3", highlightWords: ["long", "dark", "hair", "blue", "eyes"] },
    { sentence: "My mouth is big and my nose is small.", translation: "Мой рот большой, а нос маленький.", audio: "sentences/s_mouth_nose.mp3", highlightWords: ["mouth", "big", "nose", "small"] },
  ],

  dialogues: [
    {
      id: "m6_d1",
      title: "Опиши друга",
      lines: [
        { speaker: "A", text: "Look at my friend! He's got short brown hair.", translation: "Посмотри на моего друга! У него короткие каштановые волосы.", audio: "dialogues/m6_d1_1.mp3" },
        { speaker: "B", text: "Has he got blue eyes?", translation: "У него голубые глаза?", audio: "dialogues/m6_d1_2.mp3" },
        { speaker: "A", text: "No, he's got brown eyes.", translation: "Нет, у него карие глаза.", audio: "dialogues/m6_d1_3.mp3" },
        { speaker: "B", text: "He's very nice!", translation: "Он очень милый!", audio: "dialogues/m6_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "I've got / He's got / She's got",
    "Has he/she got...? — Yes, he/she has. / No, he/she hasn't.",
    "Команды: Touch/Clap/Stamp/Shake + your + часть тела",
    "Описание внешности: She's got + long/short + цвет + hair",
  ],
};
```

---

### Module 7 (12): I Can Sing!

```typescript
const MODULE_7 = {
  id: "module_7_i_can_sing",
  title: "Module 7: I Can Sing!",
  titleRu: "Модуль 7: Я умею петь!",
  part: 2,
  order: 8,

  words: [
    { word: "sing", translation: "петь", image: "vocabulary/sing.svg", phonicsRule: "digraph_ng", partOfSpeech: "verb", difficulty: 1 },
    { word: "dance", translation: "танцевать", image: "vocabulary/dance.svg", partOfSpeech: "verb", difficulty: 1 },
    { word: "swim", translation: "плавать", image: "vocabulary/swim.svg", phonicsRule: "consonant_blend_sw", partOfSpeech: "verb", difficulty: 1 },
    { word: "jump", translation: "прыгать", image: "vocabulary/jump.svg", phonicsRule: "short_u", partOfSpeech: "verb", difficulty: 1 },
    { word: "run", translation: "бегать", image: "vocabulary/run.svg", phonicsRule: "short_u", partOfSpeech: "verb", difficulty: 1 },
    { word: "climb", translation: "лазить", image: "vocabulary/climb.svg", partOfSpeech: "verb", difficulty: 2 },
    { word: "fly", translation: "летать", image: "vocabulary/fly.svg", partOfSpeech: "verb", difficulty: 1 },
    { word: "ride a bike", translation: "ездить на велосипеде", image: "vocabulary/ride-bike.svg", phonicsRule: "long_i_e", partOfSpeech: "phrase", difficulty: 2 },
    { word: "paint", translation: "рисовать", image: "vocabulary/paint.svg", phonicsRule: "vowel_team_ai", partOfSpeech: "verb", difficulty: 1 },
    { word: "draw", translation: "рисовать", image: "vocabulary/draw.svg", phonicsRule: "consonant_blend_dr", partOfSpeech: "verb", difficulty: 1 },
    { word: "write", translation: "писать", image: "vocabulary/write.svg", phonicsRule: "long_i_e", partOfSpeech: "verb", difficulty: 1 },
    { word: "read", translation: "читать", image: "vocabulary/read.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "verb", difficulty: 1 },
    { word: "count", translation: "считать", image: "vocabulary/count.svg", partOfSpeech: "verb", difficulty: 2 },
    { word: "play", translation: "играть", image: "vocabulary/play.svg", phonicsRule: "vowel_team_ay", partOfSpeech: "verb", difficulty: 1 },
    { word: "cook", translation: "готовить", image: "vocabulary/cook.svg", phonicsRule: "vowel_team_oo", partOfSpeech: "verb", difficulty: 1 },
  ],

  phrases: [
    { phrase: "I can sing very well!", translation: "Я очень хорошо пою!", audio: "phrases/sing-very-well.mp3", context: "Умения" },
    { phrase: "Can you ride a bike?", translation: "Ты умеешь ездить на велосипеде?", audio: "phrases/can-you-ride.mp3", context: "Вопрос" },
    { phrase: "She can paint but she can't cook.", translation: "Она умеет рисовать, но не умеет готовить.", audio: "phrases/can-but-cant.mp3", context: "Описание умений" },
  ],

  sentences: [
    { sentence: "I can read and write in English.", translation: "Я умею читать и писать по-английски.", audio: "sentences/s_read_write.mp3", highlightWords: ["can", "read", "write", "English"] },
    { sentence: "Larry can't cook.", translation: "Ларри не умеет готовить.", audio: "sentences/s_larry_cant_cook.mp3", highlightWords: ["can't", "cook"] },
    { sentence: "Can she draw? Yes, she can!", translation: "Она умеет рисовать? Да!", audio: "sentences/s_can_draw.mp3", highlightWords: ["Can", "draw", "can"] },
    { sentence: "I can count to twenty.", translation: "Я умею считать до двадцати.", audio: "sentences/s_count_twenty.mp3", highlightWords: ["count", "twenty"] },
  ],

  dialogues: [],

  grammar: [
    "can / can't для умений",
    "Can you...? — Yes, I can. / No, I can't.",
    "He/She can... but he/she can't...",
    "very well",
  ],
};
```

---

### Module 8 (13): At the Circus!

```typescript
const MODULE_8 = {
  id: "module_8_at_the_circus",
  title: "Module 8: At the Circus!",
  titleRu: "Модуль 8: В цирке!",
  part: 2,
  order: 9,

  words: [
    { word: "clown", translation: "клоун", image: "vocabulary/clown.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "circus", translation: "цирк", image: "vocabulary/circus.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "magician", translation: "фокусник", image: "vocabulary/magician.svg", partOfSpeech: "noun", difficulty: 3 },
    { word: "seal", translation: "тюлень", image: "vocabulary/seal.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "noun", difficulty: 1 },
    { word: "elephant", translation: "слон", image: "vocabulary/elephant.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "monkey", translation: "обезьяна", image: "vocabulary/monkey.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "lion", translation: "лев", image: "vocabulary/lion.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "tiger", translation: "тигр", image: "vocabulary/tiger.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "bear", translation: "медведь", image: "vocabulary/bear.svg", partOfSpeech: "noun", difficulty: 1 },

    // Прилагательные
    { word: "funny", translation: "смешной", image: "vocabulary/funny.svg", partOfSpeech: "adjective", difficulty: 1 },
    { word: "clever", translation: "умный", image: "vocabulary/clever.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "scary", translation: "страшный", image: "vocabulary/scary.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "strong", translation: "сильный", image: "vocabulary/strong.svg", phonicsRule: "consonant_blend_st", partOfSpeech: "adjective", difficulty: 1 },
    { word: "friendly", translation: "дружелюбный", image: "vocabulary/friendly.svg", phonicsRule: "consonant_blend_fr", partOfSpeech: "adjective", difficulty: 2 },
    { word: "amazing", translation: "удивительный", image: "vocabulary/amazing.svg", partOfSpeech: "adjective", difficulty: 2 },
    { word: "brave", translation: "смелый", image: "vocabulary/brave.svg", phonicsRule: "consonant_blend_br", partOfSpeech: "adjective", difficulty: 2 },
  ],

  phrases: [
    { phrase: "Look at the clown! He's funny!", translation: "Посмотри на клоуна! Он смешной!", audio: "phrases/look-at-clown.mp3", context: "В цирке" },
    { phrase: "The seal can play with a ball.", translation: "Тюлень умеет играть с мячом.", audio: "phrases/seal-play-ball.mp3", context: "Описание" },
    { phrase: "I like the circus!", translation: "Мне нравится цирк!", audio: "phrases/i-like-circus.mp3", context: "Мнение" },
  ],

  sentences: [
    { sentence: "The clown is funny! He can juggle.", translation: "Клоун смешной! Он умеет жонглировать.", audio: "sentences/s_clown_funny.mp3", highlightWords: ["clown", "funny", "juggle"] },
    { sentence: "The elephant is big and strong.", translation: "Слон большой и сильный.", audio: "sentences/s_elephant_strong.mp3", highlightWords: ["elephant", "big", "strong"] },
    { sentence: "Look at the clever seal!", translation: "Посмотри на умного тюленя!", audio: "sentences/s_clever_seal.mp3", highlightWords: ["clever", "seal"] },
    { sentence: "The lion is scary but the monkey is friendly.", translation: "Лев страшный, а обезьяна дружелюбная.", audio: "sentences/s_lion_monkey.mp3", highlightWords: ["lion", "scary", "monkey", "friendly"] },
  ],

  dialogues: [
    {
      id: "m8_d1",
      title: "В цирке",
      lines: [
        { speaker: "A", text: "I love the circus! Look at the clown!", translation: "Я обожаю цирк! Посмотри на клоуна!", audio: "dialogues/m8_d1_1.mp3" },
        { speaker: "B", text: "He's so funny! And look at the elephant!", translation: "Он такой смешной! А посмотри на слона!", audio: "dialogues/m8_d1_2.mp3" },
        { speaker: "A", text: "Wow! It's amazing! It can dance!", translation: "Вау! Удивительно! Он умеет танцевать!", audio: "dialogues/m8_d1_3.mp3" },
        { speaker: "B", text: "The seal is clever, too. It can play with a ball!", translation: "Тюлень тоже умный. Он умеет играть с мячом!", audio: "dialogues/m8_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "He's/She's/It's + прилагательное (funny, clever, strong...)",
    "Look at the + существительное!",
    "It can + глагол (описание что животное умеет)",
    "I like / I love + существительное",
  ],
};
```

---

### Module 9 (14): My Toys! (Part 2 — расширенный)

```typescript
const MODULE_9 = {
  id: "module_9_my_toys_p2",
  title: "Module 9: My Toys! (Continued)",
  titleRu: "Модуль 9: Мои игрушки! (Продолжение)",
  part: 2,
  order: 10,

  words: [
    // Дополнительные игрушки и описания
    { word: "robot", translation: "робот", image: "vocabulary/robot.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "aeroplane", translation: "самолёт", image: "vocabulary/aeroplane.svg", partOfSpeech: "noun", difficulty: 3 },
    { word: "rocking horse", translation: "лошадка-качалка", image: "vocabulary/rocking-horse.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "drum", translation: "барабан", image: "vocabulary/drum.svg", phonicsRule: "consonant_blend_dr", partOfSpeech: "noun", difficulty: 1 },
    { word: "guitar", translation: "гитара", image: "vocabulary/guitar.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "piano", translation: "пианино", image: "vocabulary/piano.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "kite", translation: "воздушный змей", image: "vocabulary/kite.svg", phonicsRule: "long_i_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "puzzle", translation: "пазл", image: "vocabulary/puzzle.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "game", translation: "игра", image: "vocabulary/game.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "computer", translation: "компьютер", image: "vocabulary/computer.svg", partOfSpeech: "noun", difficulty: 2 },

    // Чьё это?
    { word: "my", translation: "мой/моя/моё", image: "vocabulary/pron-my.svg", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "your", translation: "твой/твоя/твоё", image: "vocabulary/pron-your.svg", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "his", translation: "его", image: "vocabulary/pron-his.svg", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "her", translation: "её", image: "vocabulary/pron-her.svg", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "our", translation: "наш/наша/наше", image: "vocabulary/pron-our.svg", partOfSpeech: "pronoun", difficulty: 2 },
    { word: "their", translation: "их", image: "vocabulary/pron-their.svg", phonicsRule: "digraph_th", partOfSpeech: "pronoun", difficulty: 2 },
  ],

  phrases: [
    { phrase: "Whose is this?", translation: "Чьё это?", audio: "phrases/whose-is-this.mp3", context: "Принадлежность" },
    { phrase: "It's Larry's robot.", translation: "Это робот Ларри.", audio: "phrases/larrys-robot.mp3", context: "Притяжательный падеж" },
    { phrase: "Is this your kite?", translation: "Это твой воздушный змей?", audio: "phrases/is-this-your-kite.mp3", context: "Вопрос" },
    { phrase: "No, it's her kite.", translation: "Нет, это её воздушный змей.", audio: "phrases/her-kite.mp3", context: "Ответ" },
  ],

  sentences: [
    { sentence: "This is my robot. It's new!", translation: "Это мой робот. Он новый!", audio: "sentences/s_my_robot.mp3", highlightWords: ["my", "robot", "new"] },
    { sentence: "Whose is this kite? It's his.", translation: "Чей это воздушный змей? Его.", audio: "sentences/s_whose_kite.mp3", highlightWords: ["Whose", "kite", "his"] },
    { sentence: "She plays the piano very well.", translation: "Она очень хорошо играет на пианино.", audio: "sentences/s_plays_piano.mp3", highlightWords: ["plays", "piano", "well"] },
    { sentence: "Our puzzle is on the table.", translation: "Наш пазл на столе.", audio: "sentences/s_our_puzzle.mp3", highlightWords: ["Our", "puzzle", "table"] },
  ],

  dialogues: [],

  grammar: [
    "Whose is this? — It's my/your/his/her/our/their + существительное",
    "Притяжательный падеж: Larry's, Lulu's",
    "This is + my/his/her... + существительное",
  ],
};
```

---

### Module 10 (15): We Love Summer!

```typescript
const MODULE_10 = {
  id: "module_10_we_love_summer",
  title: "Module 10: We Love Summer!",
  titleRu: "Модуль 10: Мы любим лето!",
  part: 2,
  order: 11,

  words: [
    // Летние занятия
    { word: "swim", translation: "плавать", image: "vocabulary/swim.svg", phonicsRule: "consonant_blend_sw", partOfSpeech: "verb", difficulty: 1 },
    { word: "play", translation: "играть", image: "vocabulary/play.svg", phonicsRule: "vowel_team_ay", partOfSpeech: "verb", difficulty: 1 },
    { word: "eat", translation: "есть/кушать", image: "vocabulary/eat.svg", phonicsRule: "vowel_team_ea", partOfSpeech: "verb", difficulty: 1 },
    { word: "drink", translation: "пить", image: "vocabulary/drink.svg", phonicsRule: "consonant_blend_dr", partOfSpeech: "verb", difficulty: 1 },
    { word: "make", translation: "делать", image: "vocabulary/make.svg", phonicsRule: "long_a_e", partOfSpeech: "verb", difficulty: 1 },
    { word: "help", translation: "помогать", image: "vocabulary/help.svg", phonicsRule: "short_e", partOfSpeech: "verb", difficulty: 1 },
    { word: "sleep", translation: "спать", image: "vocabulary/sleep.svg", phonicsRule: "vowel_team_ee", partOfSpeech: "verb", difficulty: 1 },
    { word: "wake up", translation: "просыпаться", image: "vocabulary/wake-up.svg", phonicsRule: "long_a_e", partOfSpeech: "verb", difficulty: 2 },
    { word: "have fun", translation: "веселиться", image: "vocabulary/have-fun.svg", partOfSpeech: "phrase", difficulty: 2 },

    // Еда и напитки (летние)
    { word: "ice cream", translation: "мороженое", image: "vocabulary/ice-cream.svg", phonicsRule: "long_i_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "lemonade", translation: "лимонад", image: "vocabulary/lemonade.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "water", translation: "вода", image: "vocabulary/water.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "fruit", translation: "фрукты", image: "vocabulary/fruit.svg", partOfSpeech: "noun", difficulty: 1 },
    { word: "watermelon", translation: "арбуз", image: "vocabulary/watermelon.svg", partOfSpeech: "noun", difficulty: 2 },

    // Места
    { word: "park", translation: "парк", image: "vocabulary/park.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 1 },
    { word: "pool", translation: "бассейн", image: "vocabulary/pool.svg", phonicsRule: "vowel_team_oo", partOfSpeech: "noun", difficulty: 1 },
    { word: "playground", translation: "детская площадка", image: "vocabulary/playground.svg", phonicsRule: "vowel_team_ay", partOfSpeech: "noun", difficulty: 2 },
    { word: "camp", translation: "лагерь", image: "vocabulary/camp.svg", phonicsRule: "short_a", partOfSpeech: "noun", difficulty: 2 },
    { word: "garden", translation: "сад", image: "vocabulary/garden.svg", phonicsRule: "r_controlled_ar", partOfSpeech: "noun", difficulty: 1 },
    { word: "forest", translation: "лес", image: "vocabulary/forest.svg", phonicsRule: "r_controlled_or", partOfSpeech: "noun", difficulty: 2 },
    { word: "mountain", translation: "гора", image: "vocabulary/mountain.svg", partOfSpeech: "noun", difficulty: 2 },
    { word: "lake", translation: "озеро", image: "vocabulary/lake.svg", phonicsRule: "long_a_e", partOfSpeech: "noun", difficulty: 1 },
    { word: "river", translation: "река", image: "vocabulary/river.svg", partOfSpeech: "noun", difficulty: 2 },
  ],

  phrases: [
    { phrase: "I'm playing in the garden.", translation: "Я играю в саду.", audio: "phrases/playing-garden.mp3", context: "Настоящее время" },
    { phrase: "We're swimming in the sea.", translation: "Мы плаваем в море.", audio: "phrases/swimming-sea.mp3", context: "Настоящее время" },
    { phrase: "What are you doing?", translation: "Что ты делаешь?", audio: "phrases/what-are-you-doing.mp3", context: "Вопрос" },
    { phrase: "She's eating ice cream.", translation: "Она ест мороженое.", audio: "phrases/shes-eating.mp3", context: "Описание действия" },
    { phrase: "We're having fun!", translation: "Нам весело!", audio: "phrases/having-fun.mp3", context: "Эмоция" },
    { phrase: "Let's go to the park!", translation: "Пойдём в парк!", audio: "phrases/lets-go-park.mp3", context: "Предложение" },
    { phrase: "In summer I go to camp.", translation: "Летом я езжу в лагерь.", audio: "phrases/summer-camp.mp3", context: "Рассказ" },
  ],

  sentences: [
    { sentence: "In summer we swim in the lake.", translation: "Летом мы плаваем в озере.", audio: "sentences/s_swim_lake.mp3", highlightWords: ["summer", "swim", "lake"] },
    { sentence: "I'm eating a watermelon. Yummy!", translation: "Я ем арбуз. Вкусно!", audio: "sentences/s_eating_watermelon.mp3", highlightWords: ["eating", "watermelon", "Yummy"] },
    { sentence: "The children are playing in the park.", translation: "Дети играют в парке.", audio: "sentences/s_playing_park.mp3", highlightWords: ["children", "playing", "park"] },
    { sentence: "We love summer! We have fun every day.", translation: "Мы любим лето! Мы веселимся каждый день.", audio: "sentences/s_love_summer_fun.mp3", highlightWords: ["love", "summer", "fun"] },
    { sentence: "Look at the mountains and the forest!", translation: "Посмотри на горы и лес!", audio: "sentences/s_mountains_forest.mp3", highlightWords: ["mountains", "forest"] },
    { sentence: "She's drinking lemonade by the pool.", translation: "Она пьёт лимонад у бассейна.", audio: "sentences/s_lemonade_pool.mp3", highlightWords: ["drinking", "lemonade", "pool"] },
  ],

  dialogues: [
    {
      id: "m10_d1",
      title: "Летние каникулы",
      lines: [
        { speaker: "A", text: "What are you doing?", translation: "Что ты делаешь?", audio: "dialogues/m10_d1_1.mp3" },
        { speaker: "B", text: "I'm swimming in the pool! Come on!", translation: "Я плаваю в бассейне! Давай!", audio: "dialogues/m10_d1_2.mp3" },
        { speaker: "A", text: "OK! And then let's eat some ice cream!", translation: "Ладно! А потом давай съедим мороженое!", audio: "dialogues/m10_d1_3.mp3" },
        { speaker: "B", text: "Great idea! I love summer!", translation: "Отличная идея! Я люблю лето!", audio: "dialogues/m10_d1_4.mp3" },
      ],
    },
  ],

  grammar: [
    "Present Continuous: I'm swimming / She's eating / They're playing",
    "What are you doing? — I'm + verb + -ing",
    "Let's + глагол!",
    "In summer / In winter...",
    "go to the park / beach / camp",
  ],
};
```

---

## Общие структуры и глаголы (Across All Modules)

```typescript
const COMMON_STRUCTURES = {
  // Слова, которые встречаются во всех модулях
  commonWords: [
    // Местоимения
    { word: "I", translation: "я", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "you", translation: "ты/вы", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "he", translation: "он", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "she", translation: "она", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "it", translation: "оно/это", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "we", translation: "мы", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "they", translation: "они", partOfSpeech: "pronoun", difficulty: 1 },

    // Глаголы-связки и вспомогательные
    { word: "is", translation: "есть/является", partOfSpeech: "verb", difficulty: 1 },
    { word: "am", translation: "(я) есть", partOfSpeech: "verb", difficulty: 1 },
    { word: "are", translation: "(мы/вы/они) есть", partOfSpeech: "verb", difficulty: 1 },
    { word: "have", translation: "иметь", partOfSpeech: "verb", difficulty: 1 },
    { word: "has", translation: "имеет", partOfSpeech: "verb", difficulty: 1 },
    { word: "can", translation: "могу/умею", partOfSpeech: "verb", difficulty: 1 },
    { word: "like", translation: "любить/нравиться", partOfSpeech: "verb", difficulty: 1 },
    { word: "love", translation: "обожать", partOfSpeech: "verb", difficulty: 1 },
    { word: "want", translation: "хотеть", partOfSpeech: "verb", difficulty: 1 },
    { word: "go", translation: "идти", partOfSpeech: "verb", difficulty: 1 },
    { word: "come", translation: "приходить", partOfSpeech: "verb", difficulty: 1 },
    { word: "see", translation: "видеть", partOfSpeech: "verb", difficulty: 1 },
    { word: "look", translation: "смотреть", partOfSpeech: "verb", difficulty: 1 },
    { word: "put", translation: "класть", partOfSpeech: "verb", difficulty: 1 },
    { word: "take", translation: "брать", partOfSpeech: "verb", difficulty: 1 },
    { word: "give", translation: "давать", partOfSpeech: "verb", difficulty: 1 },
    { word: "say", translation: "говорить", partOfSpeech: "verb", difficulty: 1 },
    { word: "get", translation: "получать", partOfSpeech: "verb", difficulty: 1 },

    // Вопросительные слова
    { word: "what", translation: "что", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "where", translation: "где", partOfSpeech: "adverb", difficulty: 1 },
    { word: "who", translation: "кто", partOfSpeech: "pronoun", difficulty: 1 },
    { word: "how", translation: "как", partOfSpeech: "adverb", difficulty: 1 },
    { word: "how many", translation: "сколько", partOfSpeech: "phrase", difficulty: 1 },
    { word: "how old", translation: "сколько лет", partOfSpeech: "phrase", difficulty: 1 },

    // Союзы и частицы
    { word: "and", translation: "и", partOfSpeech: "conjunction", difficulty: 1 },
    { word: "but", translation: "но", partOfSpeech: "conjunction", difficulty: 1 },
    { word: "or", translation: "или", partOfSpeech: "conjunction", difficulty: 1 },
    { word: "too", translation: "тоже", partOfSpeech: "adverb", difficulty: 1 },
    { word: "very", translation: "очень", partOfSpeech: "adverb", difficulty: 1 },
    { word: "not", translation: "не", partOfSpeech: "adverb", difficulty: 1 },
    { word: "yes", translation: "да", partOfSpeech: "adverb", difficulty: 1 },
    { word: "no", translation: "нет", partOfSpeech: "adverb", difficulty: 1 },
    { word: "please", translation: "пожалуйста", partOfSpeech: "adverb", difficulty: 1 },
    { word: "thank you", translation: "спасибо", partOfSpeech: "phrase", difficulty: 1 },

    // Артикли и определители
    { word: "a", translation: "(артикль)", partOfSpeech: "determiner", difficulty: 1 },
    { word: "an", translation: "(артикль перед гласной)", partOfSpeech: "determiner", difficulty: 1 },
    { word: "the", translation: "(определённый артикль)", partOfSpeech: "determiner", difficulty: 1 },
    { word: "this", translation: "это/этот", partOfSpeech: "determiner", difficulty: 1 },
    { word: "that", translation: "тот/та/то", partOfSpeech: "determiner", difficulty: 1 },
    { word: "some", translation: "немного/несколько", partOfSpeech: "determiner", difficulty: 2 },
  ],

  // Ключевые фразы класса (classroom language)
  classroomPhrases: [
    { phrase: "Open your books.", translation: "Откройте книги." },
    { phrase: "Close your books.", translation: "Закройте книги." },
    { phrase: "Listen!", translation: "Слушайте!" },
    { phrase: "Look!", translation: "Смотрите!" },
    { phrase: "Read!", translation: "Читайте!" },
    { phrase: "Write!", translation: "Пишите!" },
    { phrase: "Repeat, please.", translation: "Повторите, пожалуйста." },
    { phrase: "Well done!", translation: "Молодец!" },
    { phrase: "Very good!", translation: "Очень хорошо!" },
    { phrase: "Let's sing!", translation: "Давайте споём!" },
    { phrase: "Stand up!", translation: "Встаньте!" },
    { phrase: "Sit down!", translation: "Садитесь!" },
    { phrase: "Come here!", translation: "Иди сюда!" },
    { phrase: "Be quiet, please.", translation: "Тихо, пожалуйста." },
    { phrase: "I don't understand.", translation: "Я не понимаю." },
    { phrase: "Can you help me?", translation: "Можешь мне помочь?" },
  ],
};
```

---

## Статистика контента — Spotlight 2

```
╔══════════════════════════════════════════════════════════╗
║              ИТОГО ПО КОНТЕНТУ — SPOTLIGHT 2            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Модулей:           12 (Starter x2 + Module 1-10)       ║
║  Уникальных слов:   ~350                                 ║
║  Фраз:              ~70                                  ║
║  Предложений:       ~60                                  ║
║  Диалогов:          ~10                                  ║
║  Грамматических     ~40 конструкций                      ║
║  конструкций:                                            ║
║                                                          ║
║  PART 1: ~180 слов (Starter + Modules 1-5)              ║
║  PART 2: ~170 слов (Modules 6-10)                       ║
║  Common:  ~70 служебных слов и фраз                     ║
║                                                          ║
║  SVG-иллюстраций:   ~300                                 ║
║  Аудиофайлов:       ~500 (слова + фразы + предложения)  ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║           ПЛАН ОБЩЕГО КОНТЕНТА (Spotlight 2-8)          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Spotlight 2: ~350 слов  (этот файл)                    ║
║  Spotlight 3: ~200 слов  (TODO)                          ║
║  Spotlight 4: ~200 слов  (TODO)                          ║
║  Spotlight 5: ~250 слов  (TODO)                          ║
║  Spotlight 6: ~250 слов  (TODO)                          ║
║  Spotlight 7: ~300 слов  (TODO)                          ║
║  Spotlight 8: ~300 слов  (TODO)                          ║
║  ─────────────────────────────────────                   ║
║  ИТОГО:       ~1850 уникальных слов                      ║
║                                                          ║
║  Грамм. тем:  ~30 (от to be до Conditionals 2)          ║
║  Текстов:     ~100 (от 3 предложений до полных статей)  ║
║  Аудио:       ~2000 файлов                               ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

---

## Инструкция для Claude Code

При генерации файлов `src/content/spotlight/spotlight2.ts` (и далее spotlight3.ts ... spotlight8.ts):

1. Импортировать все модули из соответствующего файла словаря
2. Каждый файл spotlightN.ts экспортирует массив `SPOTLIGHT_N_MODULES`
3. Общий файл `src/content/spotlight/index.ts` объединяет все словари
4. Создать вспомогательные функции:
   - `getWordsByModule(moduleId)` — слова модуля
   - `getWordsByGrade(grade)` — все слова для класса
   - `getWordsByPhonicsRule(rule)` — слова по phonics-правилу
   - `getWordsByDifficulty(level)` — слова по сложности
   - `getWordsByPartOfSpeech(pos)` — слова по части речи
   - `getWordsByCEFR(level)` — слова по уровню CEFR
   - `getAllWords()` — все уникальные слова из всех классов
   - `getSentencesByModule(moduleId)` — предложения модуля
   - `getDialoguesByModule(moduleId)` — диалоги модуля
   - `getGrammarByGrade(grade)` — грамматические темы для класса
   - `searchWords(query)` — поиск по слову или переводу
5. Каждое слово должно иметь путь к SVG и mp3 (даже если файлов ещё нет — будут placeholder-ы)
6. Слова из младших классов доступны для повторения в старших
