# VladEnglish — Архитектура приложения для изучения английского

## Обзор проекта

**VladEnglish** — десктопное Electron-приложение для изучения английского языка. Целевая аудитория — школьники 7-14 лет (2-8 класс), обучающиеся по линейке учебников Spotlight (Virginia Evans, Jenny Dooley, Nadezhda Bykova, Marina Pospelova, Olga Podolyako, Julia Vaulina). Приложение охватывает Spotlight 2-8 и развивает все языковые навыки: чтение (phonics → тексты), аудирование, говорение, письмо и грамматику. Уровень сложности и визуальный стиль автоматически адаптируются под возраст и класс ученика.

### Поддерживаемые учебники и уровни

| Класс | Учебник    | Уровень CEFR | Возраст | Фокус                           |
|-------|------------|--------------|---------|----------------------------------|
| 2     | Spotlight 2 | Pre-A1       | 7-8     | Phonics, алфавит, базовая лексика |
| 3     | Spotlight 3 | A1           | 8-9     | Чтение, базовая грамматика       |
| 4     | Spotlight 4 | A1+          | 9-10    | Расширенная лексика, письмо      |
| 5     | Spotlight 5 | A1-A2        | 10-11   | Грамматика, тексты, аудирование  |
| 6     | Spotlight 6 | A2           | 11-12   | Развёрнутое чтение, письмо       |
| 7     | Spotlight 7 | A2-B1        | 12-13   | Сложная грамматика, эссе         |
| 8     | Spotlight 8 | B1           | 13-14   | Тексты, дискуссии, проекты       |

---

## 1. Технологический стек

```
Runtime:          Electron 33+
Frontend:         React 18 + TypeScript 5
Bundler:          Vite 6
Styling:          Tailwind CSS 3 + CSS Modules (для анимаций)
Анимации:         Framer Motion 11
Звук:             Howler.js 2.2
TTS (озвучка):    Web Speech API (SpeechSynthesis) + предзаписанные mp3
STT (распознав.): Web Speech API (SpeechRecognition)
Хранение данных:  electron-store (JSON на диске)
Иконки:           Lucide React
Шрифты:           Nunito (основной), Fredoka One (заголовки)
Пакетирование:    electron-builder (NSIS installer для Windows)
```

---

## 2. Структура проекта

```
vlad_english/
├── package.json
├── electron-builder.yml
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
│
├── electron/
│   ├── main.ts                    # Electron main process
│   ├── preload.ts                 # Preload script (IPC bridge)
│   └── store.ts                   # electron-store: чтение/запись прогресса
│
├── src/
│   ├── main.tsx                   # React entry point
│   ├── App.tsx                    # Корневой компонент + Router
│   ├── index.css                  # Tailwind + глобальные стили
│   │
│   ├── types/
│   │   ├── index.ts               # Общие типы
│   │   ├── progress.ts            # Типы прогресса и статистики
│   │   ├── content.ts             # Типы контента (уроки, слова, уровни)
│   │   ├── grammar.ts             # Типы грамматических упражнений
│   │   └── game.ts                # Типы для игр
│   │
│   ├── store/
│   │   ├── useProgressStore.ts    # Zustand store — прогресс ученика
│   │   ├── useSettingsStore.ts    # Настройки (громкость, скорость TTS, тема)
│   │   └── useSessionStore.ts     # Текущая сессия (активный урок, счёт)
│   │
│   ├── hooks/
│   │   ├── useTTS.ts              # Text-to-Speech (произношение слов)
│   │   ├── useSTT.ts              # Speech-to-Text (ребёнок читает вслух)
│   │   ├── useAudio.ts            # Звуковые эффекты (Howler.js)
│   │   ├── useProgress.ts         # Логика прогресса и spaced repetition
│   │   ├── useTimer.ts            # Таймер для упражнений
│   │   └── useKeyboard.ts         # Клавиатурные хоткеи
│   │
│   ├── engine/
│   │   ├── spacedRepetition.ts    # Алгоритм интервального повторения (SM-2 упрощённый)
│   │   ├── difficultyAdapter.ts   # Адаптивная сложность
│   │   ├── scoringEngine.ts       # Подсчёт очков, мультипликаторы
│   │   ├── achievementEngine.ts   # Система достижений (ачивки)
│   │   ├── gradeAdapter.ts        # Адаптация контента и UI под класс (2-8)
│   │   └── contentSelector.ts     # Выбор следующего упражнения
│   │
│   ├── content/
│   │   ├── alphabet.ts            # 26 букв: звук, слово-пример, картинка
│   │   ├── phonics/
│   │   │   ├── shortVowels.ts     # CVC слова: cat, pen, big, dog, cup
│   │   │   ├── longVowels.ts      # CVCe: cake, bike, home, cute, Pete
│   │   │   ├── consonantBlends.ts # bl, br, cl, cr, dr, fl, fr, gl, gr, pl, pr, sk, sl, sm, sn, sp, st, sw, tr
│   │   │   ├── digraphs.ts        # sh, ch, th, ph, wh, ck, ng
│   │   │   ├── vowelTeams.ts      # ee, ea, ai, ay, oa, ow, oo, ou
│   │   │   └── rControlled.ts     # ar, er, ir, or, ur
│   │   ├── sightWords.ts          # 100 самых частых слов (the, is, was, said...)
│   │   ├── spotlight/
│   │   │   ├── spotlight2.ts      # Лексика Spotlight 2 (2 класс)
│   │   │   ├── spotlight3.ts      # Лексика Spotlight 3 (3 класс)
│   │   │   ├── spotlight4.ts      # Лексика Spotlight 4 (4 класс)
│   │   │   ├── spotlight5.ts      # Лексика Spotlight 5 (5 класс)
│   │   │   ├── spotlight6.ts      # Лексика Spotlight 6 (6 класс)
│   │   │   ├── spotlight7.ts      # Лексика Spotlight 7 (7 класс)
│   │   │   └── spotlight8.ts      # Лексика Spotlight 8 (8 класс)
│   │   ├── grammar/
│   │   │   ├── tenses.ts          # Времена глаголов (Present/Past/Future Simple, Continuous, Perfect)
│   │   │   ├── modals.ts          # Модальные глаголы (can, must, should, have to, may, might)
│   │   │   ├── conditionals.ts    # Условные предложения (0, 1, 2 типы)
│   │   │   ├── passive.ts         # Пассивный залог
│   │   │   ├── comparisons.ts     # Степени сравнения
│   │   │   ├── articles.ts        # Артикли
│   │   │   ├── prepositions.ts    # Предлоги
│   │   │   └── wordFormation.ts   # Словообразование (суффиксы, приставки)
│   │   ├── sentences.ts           # Предложения для чтения (по уровням)
│   │   ├── stories.ts             # Истории (от 3 предложений до полных текстов)
│   │   ├── dialogues.ts           # Диалоги из Spotlight 2-8
│   │   └── texts.ts               # Тексты для чтения и аудирования (5-8 класс)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx        # Основной layout (sidebar + content)
│   │   │   ├── TopBar.tsx          # Верхняя панель: аватар, очки, streak
│   │   │   ├── Sidebar.tsx         # Навигация по модулям
│   │   │   └── BottomNav.tsx       # Мобильная навигация (для маленьких экранов)
│   │   │
│   │   ├── common/
│   │   │   ├── Button.tsx          # Кнопка (варианты: primary, secondary, ghost)
│   │   │   ├── Card.tsx            # Карточка контента
│   │   │   ├── ProgressBar.tsx     # Полоска прогресса
│   │   │   ├── StarRating.tsx      # Звёздочки (1-3 за урок)
│   │   │   ├── Avatar.tsx          # Аватар персонажа
│   │   │   ├── Badge.tsx           # Бейдж достижения
│   │   │   ├── Modal.tsx           # Модальное окно
│   │   │   ├── Tooltip.tsx         # Подсказка при наведении
│   │   │   ├── SoundButton.tsx     # Кнопка "прослушать" (иконка динамика)
│   │   │   ├── AnimatedCharacter.tsx # Анимированный персонаж-помощник
│   │   │   └── Confetti.tsx        # Эффект конфетти при победе
│   │   │
│   │   ├── exercises/
│   │   │   ├── LetterSound.tsx        # Покажи букву → нажми → услышь звук (2 кл)
│   │   │   ├── SoundPicker.tsx        # Услышь звук → выбери правильную букву (2 кл)
│   │   │   ├── WordBuilder.tsx        # Собери слово из букв (drag & drop) (2-4 кл)
│   │   │   ├── WordReader.tsx         # Прочитай слово → нажми "проверить" → TTS (2-4 кл)
│   │   │   ├── ReadAloud.tsx          # Прочитай вслух → STT проверяет (2-8 кл)
│   │   │   ├── PictureMatch.tsx       # Соедини картинку со словом (2-4 кл)
│   │   │   ├── SentenceBuilder.tsx    # Составь предложение из слов (2-6 кл)
│   │   │   ├── FillTheGap.tsx         # Вставь пропущенную букву/слово (2-8 кл)
│   │   │   ├── ListenAndChoose.tsx    # Услышь слово → выбери из 3-4 вариантов (2-8 кл)
│   │   │   ├── SpellingBee.tsx        # Услышь слово → напечатай его (2-8 кл)
│   │   │   ├── StoryReader.tsx        # Читай историю, нажимай на слова для озвучки (2-8 кл)
│   │   │   ├── GrammarChoice.tsx      # Выбери правильную форму (3-8 кл)
│   │   │   ├── GrammarTransform.tsx   # Преобразуй предложение (4-8 кл)
│   │   │   ├── TranslationExercise.tsx # Переведи предложение (4-8 кл)
│   │   │   ├── TextComprehension.tsx  # Прочитай текст и ответь на вопросы (5-8 кл)
│   │   │   ├── ListeningComprehension.tsx # Прослушай и ответь (5-8 кл)
│   │   │   ├── EssayWriter.tsx        # Напиши короткое эссе/письмо (6-8 кл)
│   │   │   ├── ErrorCorrection.tsx    # Найди и исправь ошибку (5-8 кл)
│   │   │   └── WordFormation.tsx      # Образуй нужную форму слова (6-8 кл)
│   │   │
│   │   └── games/
│   │       ├── MemoryCards.tsx         # Найди пары: картинка ↔ слово (2-5 кл)
│   │       ├── WordRace.tsx           # Слово падает сверху → успей прочитать (2-6 кл)
│   │       ├── PhonicsWhack.tsx       # Whack-a-mole: нажми на слово с нужным звуком (2-4 кл)
│   │       ├── WordSearch.tsx         # Найди слова в сетке букв (2-8 кл)
│   │       ├── Crossword.tsx          # Кроссворд по теме модуля (4-8 кл)
│   │       ├── GrammarBattle.tsx      # Выбери правильный вариант на скорость (5-8 кл)
│   │       ├── TranslationRace.tsx    # Переведи слова/фразы на скорость (4-8 кл)
│   │       └── DailyChallenge.tsx     # Ежедневное задание (микс упражнений, все кл)
│   │
│   ├── pages/
│   │   ├── HomePage.tsx               # Главный экран — карта (2-4 кл) / хаб (5-8 кл)
│   │   ├── GradeSelectPage.tsx        # Выбор класса (2-8) при первом запуске
│   │   ├── PhonicsPage.tsx            # Модуль Phonics (2-3 кл)
│   │   ├── LessonPage.tsx             # Экран урока (последовательность упражнений)
│   │   ├── ReadingPage.tsx            # Модуль чтения (предложения, истории, тексты)
│   │   ├── ListeningPage.tsx          # Модуль аудирования
│   │   ├── WritingPage.tsx            # Модуль письма
│   │   ├── GrammarPage.tsx            # Модуль грамматики (3-8 кл)
│   │   ├── VocabularyPage.tsx         # Словарь с поиском и карточками
│   │   ├── GamesPage.tsx              # Игровой хаб
│   │   ├── SpotlightPage.tsx          # Привязка к учебнику Spotlight (выбор 2-8)
│   │   ├── AchievementsPage.tsx       # Стена достижений
│   │   ├── ProfilePage.tsx            # Профиль (выбор аватара, статистика)
│   │   ├── ParentDashboard.tsx        # Панель родителя (по паролю)
│   │   └── SettingsPage.tsx           # Настройки
│   │
│   ├── animations/
│   │   ├── transitions.ts             # Варианты анимаций переходов между страницами
│   │   ├── celebrations.ts            # Анимации празднования (звёзды, конфетти)
│   │   └── characters.ts             # Анимации персонажей
│   │
│   └── utils/
│       ├── audio.ts                   # Утилиты для работы со звуком
│       ├── shuffle.ts                 # Перемешивание массивов (Fisher-Yates)
│       ├── random.ts                  # Безопасный random для выбора упражнений
│       ├── format.ts                  # Форматирование времени, чисел
│       └── constants.ts              # Константы приложения
│
├── assets/
│   ├── audio/
│   │   ├── letters/                   # a.mp3, b.mp3, ... z.mp3 (звуки букв)
│   │   ├── words/                     # cat.mp3, dog.mp3, ... (озвучка слов)
│   │   ├── effects/
│   │   │   ├── correct.mp3            # Правильный ответ
│   │   │   ├── wrong.mp3              # Неправильный ответ
│   │   │   ├── star.mp3               # Получение звезды
│   │   │   ├── levelup.mp3            # Новый уровень
│   │   │   ├── click.mp3              # Клик по кнопке
│   │   │   ├── whoosh.mp3             # Переход
│   │   │   └── fanfare.mp3            # Завершение урока
│   │   └── music/
│   │       ├── menu.mp3               # Фоновая музыка меню
│   │       └── lesson.mp3             # Фоновая музыка урока (спокойная)
│   │
│   ├── images/
│   │   ├── characters/
│   │   │   ├── helper-idle.svg        # Персонаж-помощник (ожидание)
│   │   │   ├── helper-happy.svg       # Персонаж (радость)
│   │   │   ├── helper-thinking.svg    # Персонаж (думает)
│   │   │   └── helper-sad.svg         # Персонаж (ошибка)
│   │   ├── avatars/                   # 12 аватаров на выбор
│   │   ├── backgrounds/
│   │   │   ├── map-bg.svg             # Фон карты приключений
│   │   │   ├── lesson-bg.svg          # Фон урока
│   │   │   └── game-bg.svg            # Фон игр
│   │   ├── vocabulary/                # Картинки для слов (cat.svg, dog.svg...)
│   │   ├── badges/                    # Иконки достижений
│   │   └── islands/                   # Острова на карте (Phonics Island и т.д.)
│   │
│   └── fonts/
│       ├── Nunito-Regular.woff2
│       ├── Nunito-Bold.woff2
│       ├── Nunito-ExtraBold.woff2
│       └── FredokaOne-Regular.woff2
│
└── build/
    ├── icon.ico                       # Иконка приложения Windows
    ├── icon.png                       # Иконка 512x512
    └── installer-sidebar.bmp         # Картинка для NSIS installer
```

---

## 3. Модели данных (TypeScript Types)

### 3.1 Контент

```typescript
// === БУКВЫ И ЗВУКИ ===

interface LetterData {
  letter: string;             // "a"
  upperCase: string;          // "A"
  sound: string;              // Транскрипция: "/æ/"
  audioFile: string;          // "letters/a.mp3"
  exampleWord: string;        // "apple"
  exampleWordAudio: string;   // "words/apple.mp3"
  exampleImage: string;       // "vocabulary/apple.svg"
  funFact: string;            // Интересный факт для мотивации
}

// === PHONICS ПРАВИЛА ===

interface PhonicsRule {
  id: string;                 // "short_a", "magic_e", "sh_digraph"
  pattern: string;            // "CVC с a", "CVCe", "sh"
  displayPattern: string;     // "_a_", "_a_e", "sh_"
  sound: string;              // "/æ/", "/eɪ/", "/ʃ/"
  audioFile: string;          // Озвучка звука
  words: PhonicsWord[];       // Слова для практики
  level: PhonicsLevel;
}

interface PhonicsWord {
  word: string;               // "cat"
  phonemes: string[];         // ["c", "a", "t"]
  syllables: string[];        // ["cat"]
  audioFile: string;          // "words/cat.mp3"
  image: string;              // "vocabulary/cat.svg"
  difficulty: 1 | 2 | 3;     // 1=easy, 2=medium, 3=hard
  spotlightModule?: string;   // "Module 11" — привязка к учебнику
}

type PhonicsLevel =
  | "alphabet"          // Level A: Звуки алфавита
  | "short_vowels"      // Level B: Короткие гласные (CVC)
  | "consonant_blends"  // Level C: Сочетания согласных
  | "long_vowels"       // Level D: Долгие гласные + magic e
  | "digraphs"          // Level E: Диграфы
  | "vowel_teams"       // Level F: Сочетания гласных
  | "r_controlled"      // Level G: R-контролируемые гласные
  | "sight_words";      // Level H: Sight words

// Грамматические темы (3-8 класс)
type GrammarTopic =
  // 3-4 класс (A1)
  | "to_be"                // am/is/are
  | "have_got"             // have/has got
  | "can_cant"             // can / can't
  | "present_simple"       // I like, He plays
  | "present_continuous"   // I'm reading
  | "there_is_are"         // There is/are
  | "imperatives"          // Stand up! Don't run!
  | "plurals"              // cats, boxes, children
  | "possessives"          // my, your, 's
  | "prepositions_place"   // in, on, under, behind
  | "demonstratives"       // this/that/these/those
  // 5-6 класс (A1-A2)
  | "past_simple"          // I went, She played
  | "past_continuous"      // I was reading
  | "future_will"          // I will go
  | "going_to"             // I'm going to read
  | "comparatives"         // bigger, more beautiful
  | "superlatives"         // the biggest, the most
  | "must_should"          // must / should / have to
  | "countable_uncountable" // a/an, some/any, much/many
  | "prepositions_time"    // at, in, on (time)
  | "adverbs_frequency"    // always, usually, sometimes
  // 7-8 класс (A2-B1)
  | "present_perfect"      // I have been, She has done
  | "present_perfect_cont" // I have been reading
  | "past_perfect"         // I had done
  | "conditionals_0_1"     // If it rains... / If I go...
  | "conditionals_2"       // If I were...
  | "passive_voice"        // It was built / It is made
  | "reported_speech"      // He said that...
  | "relative_clauses"     // who, which, that, where
  | "gerund_infinitive"    // like doing / want to do
  | "word_formation"       // -tion, -ment, -ful, un-, re-
  | "phrasal_verbs";       // look after, give up, turn on

// === УРОКИ ===

interface Lesson {
  id: string;                 // "phonics-short_a-01"
  title: string;              // "Звук /æ/ — Короткое A"
  titleEn: string;            // "Short A Sound"
  level: PhonicsLevel;
  order: number;              // Порядок в уровне
  exercises: Exercise[];      // 8-12 упражнений за урок
  unlockCondition: {
    lessonId: string;         // ID предыдущего урока
    minStars: number;         // Минимум звёзд (1-3) для разблокировки
  } | null;                   // null = доступен сразу
  estimatedMinutes: number;   // Ожидаемое время: 5-10 мин
}

interface Exercise {
  id: string;
  type: ExerciseType;
  instruction: string;        // "Послушай и выбери правильную букву"
  instructionAudio: string;   // Озвучка инструкции на русском
  data: ExerciseData;         // Данные упражнения (зависят от type)
  points: number;             // Очки за правильный ответ
  hints: string[];            // Подсказки (показываются после 2 ошибок)
}

type ExerciseType =
  // Phonics (2-3 класс)
  | "letter_sound"          // Нажми на букву → услышь звук
  | "sound_picker"          // Услышь звук → выбери букву
  // Лексика (2-8 класс)
  | "word_builder"          // Собери слово из букв
  | "word_reader"           // Прочитай слово (с подсветкой фонем)
  | "picture_match"         // Соедини картинку и слово
  | "spelling_bee"          // Услышь → напечатай
  // Чтение (2-8 класс)
  | "read_aloud"            // Прочитай вслух (STT проверка)
  | "sentence_builder"      // Составь предложение
  | "fill_the_gap"          // Вставь букву/слово
  | "story_reader"          // Прочитай историю
  | "text_comprehension"    // Прочитай текст и ответь на вопросы (5-8)
  // Аудирование (2-8 класс)
  | "listen_and_choose"     // Услышь → выбери
  | "listening_comprehension" // Прослушай текст и ответь (5-8)
  // Грамматика (3-8 класс)
  | "grammar_choice"        // Выбери правильную форму
  | "grammar_transform"     // Преобразуй предложение (время, залог и т.д.)
  | "error_correction"      // Найди и исправь ошибку
  | "word_formation"        // Образуй нужную форму слова
  // Письмо (4-8 класс)
  | "translation"           // Переведи предложение
  | "essay_writer";         // Напиши текст по плану

// === УПРАЖНЕНИЯ: ВАРИАНТЫ ДАННЫХ ===

type ExerciseData =
  | LetterSoundData
  | SoundPickerData
  | WordBuilderData
  | WordReaderData
  | ReadAloudData
  | PictureMatchData
  | SentenceBuilderData
  | FillTheGapData
  | ListenAndChooseData
  | SpellingBeeData
  | StoryReaderData;

interface SoundPickerData {
  targetSound: string;        // "/æ/"
  targetAudio: string;        // Файл озвучки
  options: {
    letter: string;
    isCorrect: boolean;
  }[];                        // 3-4 варианта
}

interface WordBuilderData {
  word: string;               // "cat"
  scrambledLetters: string[]; // ["t", "a", "c", "x"] — с лишними буквами
  image: string;
  audio: string;
  showImage: boolean;         // Показать картинку как подсказку
}

interface PictureMatchData {
  pairs: {
    word: string;
    image: string;
    audio: string;
  }[];                        // 4-6 пар
}

interface ReadAloudData {
  text: string;               // "The cat is big."
  expectedWords: string[];    // ["the", "cat", "is", "big"]
  audio: string;              // Эталонная озвучка
  highlightPhonics: {         // Подсветка фонетических правил
    word: string;
    pattern: string;
    color: string;
  }[];
}

interface FillTheGapData {
  sentence: string;           // "The ___ is red."
  gapIndex: number;           // Индекс пропуска
  correctAnswer: string;      // "hat"
  options: string[];          // ["hat", "hot", "hit"]
  audio: string;
}

interface StoryReaderData {
  title: string;
  sentences: {
    text: string;
    audio: string;
    words: {
      word: string;
      isHighlighted: boolean; // Ключевые слова
      phonicsRule?: string;   // К какому правилу относится
    }[];
  }[];
  comprehensionQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}
```

### 3.2 Прогресс ученика

```typescript
interface StudentProfile {
  id: string;
  name: string;
  avatarId: string;
  grade: 2 | 3 | 4 | 5 | 6 | 7 | 8;  // Класс обучения
  cefrLevel: "pre-a1" | "a1" | "a1+" | "a1-a2" | "a2" | "a2-b1" | "b1";
  ageGroup: "junior" | "middle" | "senior"; // 2-4, 5-6, 7-8 — влияет на UI тему
  createdAt: string;          // ISO date
  parentPassword: string;     // Простой 4-значный PIN
}

interface StudentProgress {
  profileId: string;

  // Общая статистика
  totalPoints: number;
  currentStreak: number;      // Дней подряд
  longestStreak: number;
  totalTimeMinutes: number;
  totalLessonsCompleted: number;
  totalExercisesCompleted: number;

  // Прогресс по уровням
  levels: Record<PhonicsLevel, LevelProgress>;

  // Прогресс по урокам
  lessons: Record<string, LessonProgress>;

  // Прогресс по словам (для spaced repetition)
  words: Record<string, WordProgress>;

  // Достижения
  achievements: Achievement[];

  // Ежедневная активность
  dailyActivity: DailyActivity[];

  // Проблемные области (для панели родителя)
  troubleAreas: TroubleArea[];
}

interface LevelProgress {
  level: PhonicsLevel;
  status: "locked" | "active" | "completed";
  lessonsTotal: number;
  lessonsCompleted: number;
  bestScore: number;
  averageAccuracy: number;    // 0-100%
}

interface LessonProgress {
  lessonId: string;
  status: "locked" | "available" | "in_progress" | "completed";
  stars: 0 | 1 | 2 | 3;      // 0=не пройден, 1-3=рейтинг
  bestScore: number;
  attempts: number;
  lastAttemptDate: string;
  exerciseResults: {
    exerciseId: string;
    correct: boolean;
    attempts: number;
    timeSeconds: number;
  }[];
}

interface WordProgress {
  word: string;
  // Spaced Repetition (SM-2 simplified)
  easeFactor: number;         // 1.3 - 2.5 (начальное 2.5)
  interval: number;           // Дней до следующего повторения
  repetitions: number;        // Количество успешных повторений подряд
  nextReviewDate: string;     // ISO date
  // Статистика
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;           // correctAttempts / totalAttempts
  lastSeenDate: string;
  // Проблемные звуки
  confusedWith: string[];     // Слова, с которыми путает
}

interface Achievement {
  id: string;
  title: string;              // "Первые шаги"
  titleEn: string;            // "First Steps"
  description: string;        // "Пройди свой первый урок"
  icon: string;               // "badges/first-lesson.svg"
  unlockedAt: string | null;  // null = ещё не получено
  category: "phonics" | "reading" | "streak" | "speed" | "collection";
}

interface DailyActivity {
  date: string;               // "2026-03-22"
  minutesSpent: number;
  lessonsCompleted: number;
  exercisesCompleted: number;
  pointsEarned: number;
  wordsLearned: string[];     // Новые слова
  wordsReviewed: string[];    // Повторённые слова
}

interface TroubleArea {
  type: "letter" | "sound" | "word" | "rule";
  item: string;               // "th", "short_a", "the"
  errorCount: number;
  lastErrorDate: string;
  suggestedExercises: string[]; // ID упражнений для тренировки
}
```

---

## 4. Контент из Spotlight 2, Part 2

### 4.1 Модули учебника → Словарь

```typescript
const SPOTLIGHT_MODULES = {
  "module_11_my_body": {
    title: "Module 11: My Body",
    words: [
      { word: "head", image: "vocabulary/head.svg" },
      { word: "body", image: "vocabulary/body.svg" },
      { word: "arms", image: "vocabulary/arms.svg" },
      { word: "legs", image: "vocabulary/legs.svg" },
      { word: "hands", image: "vocabulary/hands.svg" },
      { word: "feet", image: "vocabulary/feet.svg" },
      { word: "tummy", image: "vocabulary/tummy.svg" },
      { word: "face", image: "vocabulary/face.svg" },
      { word: "eyes", image: "vocabulary/eyes.svg" },
      { word: "ears", image: "vocabulary/ears.svg" },
      { word: "nose", image: "vocabulary/nose.svg" },
      { word: "mouth", image: "vocabulary/mouth.svg" },
      { word: "hair", image: "vocabulary/hair.svg" },
    ],
    sentences: [
      "I have two hands.",
      "Touch your nose!",
      "My eyes are blue.",
      "She has long hair.",
    ],
  },

  "module_12_i_can_sing": {
    title: "Module 12: I Can Sing!",
    words: [
      { word: "sing", image: "vocabulary/sing.svg" },
      { word: "dance", image: "vocabulary/dance.svg" },
      { word: "swim", image: "vocabulary/swim.svg" },
      { word: "jump", image: "vocabulary/jump.svg" },
      { word: "run", image: "vocabulary/run.svg" },
      { word: "climb", image: "vocabulary/climb.svg" },
      { word: "fly", image: "vocabulary/fly.svg" },
      { word: "ride", image: "vocabulary/ride.svg" },
    ],
    sentences: [
      "I can jump!",
      "Can you swim?",
      "She can dance.",
      "He can't fly.",
    ],
  },

  "module_13_at_the_circus": {
    title: "Module 13: At the Circus!",
    words: [
      { word: "clown", image: "vocabulary/clown.svg" },
      { word: "circus", image: "vocabulary/circus.svg" },
      { word: "funny", image: "vocabulary/funny.svg" },
      { word: "clever", image: "vocabulary/clever.svg" },
      { word: "seal", image: "vocabulary/seal.svg" },
      { word: "horse", image: "vocabulary/horse.svg" },
      { word: "chimp", image: "vocabulary/chimp.svg" },
    ],
    sentences: [
      "The clown is funny!",
      "Look at the horse!",
      "The chimp can climb.",
    ],
  },

  "module_14_my_toys": {
    title: "Module 14: My Toys!",
    words: [
      { word: "teddy bear", image: "vocabulary/teddy-bear.svg" },
      { word: "toy soldier", image: "vocabulary/toy-soldier.svg" },
      { word: "ballerina", image: "vocabulary/ballerina.svg" },
      { word: "puppet", image: "vocabulary/puppet.svg" },
      { word: "jack-in-the-box", image: "vocabulary/jack-in-the-box.svg" },
      { word: "doll", image: "vocabulary/doll.svg" },
      { word: "toy box", image: "vocabulary/toy-box.svg" },
      { word: "ball", image: "vocabulary/ball.svg" },
    ],
    sentences: [
      "This is my teddy bear.",
      "She has a doll.",
      "Where is the ball?",
      "The puppet is funny.",
    ],
  },

  "module_15_we_love_summer": {
    title: "Module 15: We Love Summer!",
    words: [
      { word: "summer", image: "vocabulary/summer.svg" },
      { word: "hot", image: "vocabulary/hot.svg" },
      { word: "sun", image: "vocabulary/sun.svg" },
      { word: "sea", image: "vocabulary/sea.svg" },
      { word: "sand", image: "vocabulary/sand.svg" },
      { word: "sandcastle", image: "vocabulary/sandcastle.svg" },
      { word: "ice cream", image: "vocabulary/ice-cream.svg" },
      { word: "beach", image: "vocabulary/beach.svg" },
      { word: "shorts", image: "vocabulary/shorts.svg" },
      { word: "hat", image: "vocabulary/hat.svg" },
    ],
    sentences: [
      "I love summer!",
      "The sun is hot.",
      "Let's go to the beach!",
      "I like ice cream.",
    ],
  },
};
```

### 4.2 Phonics-контент (приоритетный модуль)

```typescript
const PHONICS_CONTENT = {
  alphabet: {
    // 26 букв, каждая со звуком, словом и картинкой
    letters: [
      { letter: "a", sound: "/æ/", word: "apple", image: "apple.svg" },
      { letter: "b", sound: "/b/", word: "ball", image: "ball.svg" },
      { letter: "c", sound: "/k/", word: "cat", image: "cat.svg" },
      // ... все 26 букв
    ],
    lessons: 5, // 5 уроков по 5-6 букв
  },

  short_vowels: {
    rules: [
      {
        vowel: "a", sound: "/æ/",
        words: ["cat", "hat", "bat", "man", "can", "van", "map", "bag", "sad", "dad",
                "fan", "pan", "rat", "mat", "tap", "cap", "jam", "ham", "ram", "nap"],
      },
      {
        vowel: "e", sound: "/ɛ/",
        words: ["pen", "hen", "ten", "men", "bed", "red", "leg", "pet", "net", "set",
                "wet", "get", "jet", "vet", "yes", "yet", "beg", "peg", "den", "fed"],
      },
      {
        vowel: "i", sound: "/ɪ/",
        words: ["big", "pig", "dig", "hit", "bit", "sit", "pin", "bin", "win", "tin",
                "lip", "dip", "tip", "zip", "kid", "lid", "hid", "wig", "fig", "mix"],
      },
      {
        vowel: "o", sound: "/ɒ/",
        words: ["dog", "log", "fog", "hot", "pot", "dot", "box", "fox", "hop", "top",
                "mop", "pop", "not", "got", "lot", "cot", "rod", "nod", "job", "rob"],
      },
      {
        vowel: "u", sound: "/ʌ/",
        words: ["cup", "pup", "bus", "mud", "bug", "hug", "rug", "run", "sun", "fun",
                "gun", "bun", "cut", "nut", "hut", "but", "jug", "mug", "tub", "dug"],
      },
    ],
    lessons: 10, // 2 урока на каждую гласную
  },

  consonant_blends: {
    groups: [
      { blend: "bl", words: ["black", "blue", "block", "blank", "blend"] },
      { blend: "br", words: ["brown", "bread", "brick", "bring", "brush"] },
      { blend: "cl", words: ["clap", "clip", "clock", "close", "club"] },
      { blend: "cr", words: ["crab", "cry", "cross", "crown", "crush"] },
      { blend: "dr", words: ["dress", "drink", "drop", "drum", "draw"] },
      { blend: "fl", words: ["flag", "flat", "flip", "fly", "flower"] },
      { blend: "fr", words: ["frog", "free", "from", "fruit", "fresh"] },
      { blend: "gl", words: ["glad", "glass", "glow", "glue", "globe"] },
      { blend: "gr", words: ["green", "grass", "grow", "grape", "gray"] },
      { blend: "pl", words: ["play", "plan", "plant", "plate", "plum"] },
      { blend: "pr", words: ["press", "print", "prize", "pretty"] },
      { blend: "sl", words: ["slim", "slip", "slow", "sleep", "slide"] },
      { blend: "sm", words: ["small", "smell", "smile", "smoke", "smart"] },
      { blend: "sn", words: ["snap", "snip", "snow", "snake", "snack"] },
      { blend: "sp", words: ["spin", "spot", "spell", "spoon", "space"] },
      { blend: "st", words: ["stop", "star", "step", "stick", "stone"] },
      { blend: "sw", words: ["swim", "sweet", "swing", "switch"] },
      { blend: "tr", words: ["tree", "trip", "truck", "train", "trap"] },
    ],
    lessons: 9, // 2 бленда за урок
  },

  long_vowels: {
    rules: [
      { pattern: "a_e", sound: "/eɪ/", words: ["cake", "make", "lake", "game", "name", "face", "race", "gate", "late", "plate"] },
      { pattern: "i_e", sound: "/aɪ/", words: ["bike", "like", "time", "ride", "hide", "line", "nine", "five", "kite", "white"] },
      { pattern: "o_e", sound: "/oʊ/", words: ["home", "bone", "nose", "rope", "hole", "note", "rose", "stone", "phone", "those"] },
      { pattern: "u_e", sound: "/juː/", words: ["cute", "huge", "cube", "tube", "mule", "fuse", "use", "rule", "June", "flute"] },
      { pattern: "e_e", sound: "/iː/", words: ["Pete", "these", "Eve", "Steve", "theme"] },
    ],
    lessons: 5,
  },

  digraphs: {
    groups: [
      { digraph: "sh", sound: "/ʃ/", words: ["ship", "shop", "fish", "dish", "shell", "shoe", "she", "shut", "wish", "push"] },
      { digraph: "ch", sound: "/tʃ/", words: ["chip", "chat", "chin", "chop", "much", "such", "rich", "check", "chest", "lunch"] },
      { digraph: "th", sound: "/θ/, /ð/", words: ["this", "that", "the", "them", "then", "thin", "thick", "three", "bath", "math"] },
      { digraph: "wh", sound: "/w/", words: ["what", "when", "where", "which", "white", "while", "whale", "wheel", "whip"] },
      { digraph: "ph", sound: "/f/", words: ["phone", "photo", "Phil", "phrase"] },
      { digraph: "ck", sound: "/k/", words: ["back", "black", "clock", "duck", "kick", "lock", "neck", "rock", "sick", "sock"] },
      { digraph: "ng", sound: "/ŋ/", words: ["sing", "ring", "king", "long", "song", "thing", "bring", "wing", "bang", "hung"] },
    ],
    lessons: 7,
  },

  vowel_teams: {
    groups: [
      { team: "ee", sound: "/iː/", words: ["tree", "free", "three", "see", "bee", "green", "feet", "sleep", "sheep", "week"] },
      { team: "ea", sound: "/iː/", words: ["sea", "tea", "eat", "read", "meat", "bean", "team", "clean", "dream", "beach"] },
      { team: "ai", sound: "/eɪ/", words: ["rain", "train", "wait", "paint", "tail", "mail", "nail", "sail", "main", "chain"] },
      { team: "ay", sound: "/eɪ/", words: ["play", "day", "say", "way", "may", "stay", "gray", "pray", "tray", "clay"] },
      { team: "oa", sound: "/oʊ/", words: ["boat", "coat", "road", "load", "soap", "oak", "goal", "toast", "foam"] },
      { team: "oo", sound: "/uː/", words: ["moon", "spoon", "zoo", "food", "cool", "pool", "room", "school", "too", "roof"] },
    ],
    lessons: 6,
  },

  r_controlled: {
    groups: [
      { pattern: "ar", sound: "/ɑːr/", words: ["car", "star", "park", "arm", "farm", "dark", "card", "jar", "bar", "hard"] },
      { pattern: "er", sound: "/ɜːr/", words: ["her", "fern", "term", "verb", "serve"] },
      { pattern: "ir", sound: "/ɜːr/", words: ["bird", "girl", "first", "shirt", "dirt", "stir", "sir"] },
      { pattern: "or", sound: "/ɔːr/", words: ["for", "corn", "fork", "horse", "short", "sport", "born", "store", "more", "door"] },
      { pattern: "ur", sound: "/ɜːr/", words: ["fur", "turn", "burn", "hurt", "nurse", "purple", "church", "surf", "curl"] },
    ],
    lessons: 5,
  },

  sight_words: {
    // Высокочастотные слова, которые нельзя "прочитать по правилам"
    // Разбиты на группы по 10 для уроков
    groups: [
      ["the", "a", "is", "it", "in", "I", "to", "and", "we", "he"],
      ["she", "my", "you", "are", "was", "they", "on", "can", "has", "his"],
      ["her", "all", "said", "do", "like", "have", "this", "will", "with", "one"],
      ["no", "go", "so", "not", "but", "what", "there", "out", "be", "up"],
      ["look", "some", "come", "very", "here", "just", "were", "your", "when", "had"],
    ],
    lessons: 5,
  },
};
```

---

## 5. Алгоритмы

### 5.1 Spaced Repetition (упрощённый SM-2)

```typescript
// engine/spacedRepetition.ts

interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5;
  // 0 = полный провал (не узнал слово)
  // 1 = неправильно, но после подсказки вспомнил
  // 2 = неправильно, потом правильно (с трудом)
  // 3 = правильно, но с задержкой
  // 4 = правильно
  // 5 = правильно мгновенно
}

function updateWordProgress(word: WordProgress, result: ReviewResult): WordProgress {
  const { quality } = result;

  if (quality < 3) {
    // Ошибка — сбрасываем интервал
    return {
      ...word,
      repetitions: 0,
      interval: 1, // Показать завтра
      // easeFactor не меняем при ошибке
      totalAttempts: word.totalAttempts + 1,
      nextReviewDate: addDays(new Date(), 1).toISOString(),
    };
  }

  // Правильный ответ
  const newRepetitions = word.repetitions + 1;
  let newInterval: number;

  if (newRepetitions === 1) {
    newInterval = 1;    // Завтра
  } else if (newRepetitions === 2) {
    newInterval = 3;    // Через 3 дня
  } else {
    newInterval = Math.round(word.interval * word.easeFactor);
  }

  // Обновляем ease factor
  const newEase = Math.max(1.3,
    word.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return {
    ...word,
    repetitions: newRepetitions,
    interval: newInterval,
    easeFactor: newEase,
    totalAttempts: word.totalAttempts + 1,
    correctAttempts: word.correctAttempts + 1,
    accuracy: (word.correctAttempts + 1) / (word.totalAttempts + 1),
    nextReviewDate: addDays(new Date(), newInterval).toISOString(),
    lastSeenDate: new Date().toISOString(),
  };
}
```

### 5.2 Адаптивная сложность

```typescript
// engine/difficultyAdapter.ts

interface DifficultyState {
  currentDifficulty: number;  // 1.0 - 5.0 (начинаем с 1.0)
  recentResults: boolean[];   // Последние 10 ответов (true/false)
  consecutiveCorrect: number;
  consecutiveWrong: number;
}

function adaptDifficulty(state: DifficultyState, correct: boolean): DifficultyState {
  const newResults = [...state.recentResults.slice(-9), correct];
  const accuracy = newResults.filter(Boolean).length / newResults.length;

  let newDifficulty = state.currentDifficulty;

  if (accuracy > 0.9 && state.consecutiveCorrect >= 3) {
    // Ребёнок справляется отлично → усложняем
    newDifficulty = Math.min(5.0, state.currentDifficulty + 0.3);
  } else if (accuracy < 0.5 && state.consecutiveWrong >= 2) {
    // Много ошибок → упрощаем
    newDifficulty = Math.max(1.0, state.currentDifficulty - 0.5);
  }

  return {
    currentDifficulty: newDifficulty,
    recentResults: newResults,
    consecutiveCorrect: correct ? state.consecutiveCorrect + 1 : 0,
    consecutiveWrong: correct ? 0 : state.consecutiveWrong + 1,
  };
}

// Что меняется в зависимости от difficulty:
// 1.0-2.0: 3 варианта ответа, картинка-подсказка, медленная озвучка
// 2.0-3.0: 4 варианта, картинка по запросу, нормальная скорость
// 3.0-4.0: 4 варианта без картинки, таймер на ответ
// 4.0-5.0: Свободный ввод, быстрый таймер, бонусные очки
```

### 5.3 Система очков и наград

```typescript
// engine/scoringEngine.ts

const SCORING = {
  // Базовые очки
  correctAnswer: 10,
  perfectLesson: 50,        // Все ответы правильные
  firstTry: 5,              // Бонус за первую попытку

  // Множители
  streakMultiplier: 0.1,    // +10% за каждый правильный подряд (макс 2x)
  speedBonus: 5,            // Бонус за быстрый ответ (< 3 сек)

  // Звёзды за урок
  threeStars: 90,           // ≥90% правильных
  twoStars: 70,             // ≥70%
  oneStar: 50,              // ≥50%

  // Достижения
  achievements: [
    // Общие
    { id: "first_lesson", title: "Первые шаги", condition: "Пройди первый урок" },
    { id: "streak_3", title: "Три дня подряд!", condition: "3 дня подряд" },
    { id: "streak_7", title: "Неделя практики", condition: "7 дней подряд" },
    { id: "streak_30", title: "Месяц без перерыва!", condition: "30 дней подряд" },
    { id: "speed_demon", title: "Быстрее ветра", condition: "10 правильных ответов подряд за <3 сек" },
    { id: "perfect_10", title: "Идеально!", condition: "10 уроков на 3 звезды" },
    // Лексика
    { id: "words_50", title: "Полиглот", condition: "Выучи 50 слов" },
    { id: "words_100", title: "Книжный червь", condition: "Выучи 100 слов" },
    { id: "words_500", title: "Ходячий словарь", condition: "Выучи 500 слов" },
    { id: "words_1000", title: "Лексический титан", condition: "Выучи 1000 слов" },
    // Phonics (2-3 класс)
    { id: "alphabet_master", title: "Знаток алфавита", condition: "Пройди все буквы" },
    { id: "phonics_complete", title: "Мастер звуков", condition: "Пройди все уровни phonics" },
    // Чтение
    { id: "reader_5", title: "Чтец", condition: "Прочитай 5 текстов" },
    { id: "reader_50", title: "Книголюб", condition: "Прочитай 50 текстов" },
    { id: "speaker", title: "Оратор", condition: "Прочитай вслух 20 предложений" },
    // Грамматика (3-8 класс)
    { id: "grammar_10", title: "Грамотей", condition: "Пройди 10 грамматических тем" },
    { id: "grammar_all_tenses", title: "Повелитель времён", condition: "Освой все времена" },
    { id: "grammar_master", title: "Grammar Guru", condition: "Пройди всю грамматику своего класса на 3 звезды" },
    // Письмо (4-8 класс)
    { id: "writer_first", title: "Первое перо", condition: "Напиши первое эссе" },
    { id: "writer_10", title: "Юный писатель", condition: "Напиши 10 текстов" },
    // Spotlight
    { id: "spotlight_complete", title: "Spotlight Master", condition: "Пройди все модули своего учебника" },
    { id: "grade_up", title: "Повышение!", condition: "Перейди на следующий класс" },
    // Мета
    { id: "collector", title: "Коллекционер", condition: "Получи все достижения" },
  ],
};
```

---

## 6. UI/UX Спецификация

### 6.1 Адаптация UI под возрастные группы

```typescript
// engine/gradeAdapter.ts

type AgeGroup = "junior" | "middle" | "senior";

function getAgeGroup(grade: number): AgeGroup {
  if (grade <= 4) return "junior";   // 2-4 класс (7-10 лет)
  if (grade <= 6) return "middle";   // 5-6 класс (10-12 лет)
  return "senior";                    // 7-8 класс (12-14 лет)
}

const UI_PRESETS: Record<AgeGroup, UIPreset> = {
  junior: {
    // Мультяшный, яркий, игровой
    theme: "playful",
    navigation: "island-map",        // Карта с островами
    mascot: true,                     // Персонаж-помощник
    animations: "bouncy",            // Пружинистые анимации
    fontSize: { word: 48, text: 20, ui: 18 },
    buttonSize: 56,                   // Крупные кнопки
    celebrationLevel: "full",        // Конфетти, звёзды, фанфары
    instructionLang: "ru",           // Инструкции на русском
    showTranslation: true,           // Всегда показывать перевод
  },
  middle: {
    // Современный, чистый, но ещё с геймификацией
    theme: "modern",
    navigation: "sidebar",           // Боковая панель с разделами
    mascot: false,                    // Без персонажа
    animations: "smooth",            // Плавные анимации
    fontSize: { word: 36, text: 18, ui: 16 },
    buttonSize: 44,
    celebrationLevel: "moderate",    // Звёзды, без конфетти
    instructionLang: "mixed",        // Инструкции русский + английский
    showTranslation: "on-hover",     // Перевод по наведению
  },
  senior: {
    // Минималистичный, "взрослый"
    theme: "minimal",
    navigation: "tabs",              // Вкладки сверху
    mascot: false,
    animations: "subtle",            // Минимальные анимации
    fontSize: { word: 28, text: 16, ui: 15 },
    buttonSize: 40,
    celebrationLevel: "minimal",     // Только очки и прогресс-бар
    instructionLang: "en",           // Инструкции на английском
    showTranslation: "on-demand",    // Перевод по кнопке
  },
};
```

### 6.2 Цветовые палитры

```typescript
const COLORS = {
  // Основные (общие для всех тем)
  primary: "#6C5CE7",       // Фиолетовый (основные кнопки)
  primaryLight: "#A29BFE",
  secondary: "#00CEC9",     // Бирюзовый (акценты)
  secondaryLight: "#81ECEC",
  accent: "#FD79A8",        // Розовый (награды, звёзды)
  accentLight: "#FDA7DF",

  // Фоны
  bgMain: "#F8F9FF",        // Светло-лавандовый фон
  bgCard: "#FFFFFF",
  bgSidebar: "#2D3436",

  // Текст
  textPrimary: "#2D3436",
  textSecondary: "#636E72",
  textLight: "#B2BEC3",

  // Статусы
  success: "#00B894",       // Правильный ответ
  error: "#FF6B6B",         // Ошибка
  warning: "#FDCB6E",       // Предупреждение
  info: "#74B9FF",          // Информация

  // Фонетика (цвета для подсветки)
  vowelShort: "#FF6B6B",    // Короткие гласные
  vowelLong: "#6C5CE7",     // Долгие гласные
  consonant: "#00B894",     // Согласные
  blend: "#FDCB6E",         // Бленды
  digraph: "#FD79A8",       // Диграфы
  silent: "#B2BEC3",        // Немые буквы

  // Грамматика (цвета подсветки частей речи, 5-8 кл)
  noun: "#74B9FF",
  verb: "#00B894",
  adjective: "#FDCB6E",
  adverb: "#FD79A8",
  preposition: "#A29BFE",
  conjunction: "#636E72",
};

// Тема для старших классов — более сдержанная
const COLORS_SENIOR_OVERRIDE = {
  primary: "#5B6DCD",
  bgMain: "#F5F6FA",
  accent: "#E17055",
};
```

### 6.2 Типографика

```css
/* Заголовки — Fredoka One (игровой, округлый) */
h1 { font-family: 'Fredoka One'; font-size: 36px; }
h2 { font-family: 'Fredoka One'; font-size: 28px; }
h3 { font-family: 'Fredoka One'; font-size: 22px; }

/* Текст — Nunito (читаемый, дружелюбный) */
body { font-family: 'Nunito'; font-size: 18px; line-height: 1.6; }

/* Английские слова в упражнениях — крупно */
.word-display { font-family: 'Nunito'; font-size: 48px; font-weight: 800; letter-spacing: 4px; }

/* Фонетические символы */
.phonetic { font-family: 'Nunito'; font-size: 24px; color: var(--vowelShort); }
```

### 6.3 Ключевые экраны

#### Экран выбора класса (GradeSelectPage) — при первом запуске
```
+-------------------------------------------------------------+
|                                                               |
|              VladEnglish                                  |
|              Выбери свой класс                                |
|                                                               |
|   +-------+  +-------+  +-------+  +-------+                 |
|   |       |  |       |  |       |  |       |                  |
|   |  2 кл |  |  3 кл |  |  4 кл |  |  5 кл |                 |
|   |       |  |       |  |       |  |       |                  |
|   +-------+  +-------+  +-------+  +-------+                 |
|                                                               |
|   +-------+  +-------+  +-------+                             |
|   |       |  |       |  |       |                              |
|   |  6 кл |  |  7 кл |  |  8 кл |                             |
|   |       |  |       |  |       |                              |
|   +-------+  +-------+  +-------+                             |
|                                                               |
|   Класс можно изменить в любой момент в настройках            |
|                                                               |
+-------------------------------------------------------------+
```

#### Главный экран (HomePage) — Junior (2-4 кл)
```
┌─────────────────────────────────────────────────────────┐
│  [🦊 Лиса]  Привет, Ваня!    ⭐ 340  🔥 5 дней       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   ☁️                    ☁️                               │
│        🏝️ Остров Звуков ✅                              │
│             ↓                                           │
│        🏝️ Остров Слов 🔓(3/10)                         │
│             ↓                                           │
│        🏝️ Остров Историй 🔒                            │
│             ↓                                           │
│        🏝️ Остров Игр 🎮                                │
│                                                         │
│  🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊🌊                │
│                                                         │
│  [📖 Spotlight 2]  [🏆 Награды]  [👨‍👩‍👦 Родителям]       │
└─────────────────────────────────────────────────────────┘
```

#### Главный экран (HomePage) — Senior (7-8 кл)
```
+-------------------------------------------------------------+
|  VladEnglish    [Vocabulary] [Grammar] [Reading] [Games] |
+-------------------------------------------------------------+
|                                                               |
|  Spotlight 7              Progress: 45%  |||||||.....  560pts|
|                                                               |
|  +-------------------+  +-------------------+                 |
|  | Grammar           |  | Reading           |                 |
|  | Present Perfect    |  | Technology texts  |                 |
|  | 3/7 topics done    |  | 2/5 texts done    |                 |
|  | [Continue]         |  | [Continue]         |                |
|  +-------------------+  +-------------------+                 |
|                                                               |
|  +-------------------+  +-------------------+                 |
|  | Vocabulary        |  | Writing           |                 |
|  | 180/300 words      |  | Opinion essay     |                 |
|  | 12 due for review  |  | Next: formal letter|                |
|  | [Review now]       |  | [Start]            |                |
|  +-------------------+  +-------------------+                 |
|                                                               |
|  Daily Challenge: Grammar + Reading mix     [Start]           |
|                                                               |
+-------------------------------------------------------------+
```

#### Экран урока (LessonPage)
```
┌─────────────────────────────────────────────────────────┐
│  [← Назад]     Звук /æ/ — Short A     [3/8] ████░░░░  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   🔊 Послушай и выбери правильную букву                 │
│                                                         │
│              [🔊 ▶️ Прослушать]                          │
│                                                         │
│    ┌─────┐    ┌─────┐    ┌─────┐                        │
│    │  a  │    │  e  │    │  i  │                        │
│    └─────┘    └─────┘    └─────┘                        │
│                                                         │
│   [🦊 "Отлично! Это звук /æ/ как в слове apple!"]      │
│                                                         │
│        ⭐ +10       🔥 x3 streak                        │
└─────────────────────────────────────────────────────────┘
```

#### Экран упражнения WordBuilder
```
┌─────────────────────────────────────────────────────────┐
│  [← Назад]      Собери слово       [5/8] █████░░░░░   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│            🖼️ [Картинка кота]                           │
│                                                         │
│          ┌───┐ ┌───┐ ┌───┐                              │
│          │ _ │ │ _ │ │ _ │     ← Целевые слоты          │
│          └───┘ └───┘ └───┘                              │
│                                                         │
│    ┌───┐  ┌───┐  ┌───┐  ┌───┐                           │
│    │ t │  │ a │  │ c │  │ x │  ← Перемешанные буквы    │
│    └───┘  └───┘  └───┘  └───┘                           │
│                                                         │
│   [🔊 Послушать]           [💡 Подсказка]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Панель родителя (ParentDashboard)
```
┌─────────────────────────────────────────────────────────┐
│  Панель родителя                    [🔒 Выйти]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📊 Статистика за неделю                                │
│  ┌─────────────────────────────────────┐                │
│  │  Время: 45 мин  │ Уроков: 8        │                │
│  │  Слов: +23       │ Точность: 78%    │                │
│  └─────────────────────────────────────┘                │
│                                                         │
│  📈 График активности (7 дней, bar chart)               │
│                                                         │
│  ⚠️ Проблемные области:                                 │
│  • Звук /th/ — 6 ошибок (рекомендуем доп. практику)    │
│  • Слово "the" — путает с "that"                        │
│  • Sight words — точность 62%                           │
│                                                         │
│  💡 Рекомендация:                                       │
│  Потренируйте с Ваней слова с "th" —                    │
│  можно поиграть в "Memory Cards" с этими словами        │
│                                                         │
│  [⚙️ Настройки]  [📥 Экспорт отчёта]                   │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Маршрутизация (React Router)

```typescript
const routes = [
  { path: "/",                          component: HomePage },
  { path: "/grade-select",              component: GradeSelectPage },     // Выбор класса
  { path: "/phonics",                   component: PhonicsPage },         // 2-3 класс
  { path: "/phonics/:levelId",          component: PhonicsPage },
  { path: "/lesson/:lessonId",          component: LessonPage },
  { path: "/reading",                   component: ReadingPage },
  { path: "/listening",                 component: ListeningPage },
  { path: "/writing",                   component: WritingPage },
  { path: "/grammar",                   component: GrammarPage },         // 3-8 класс
  { path: "/grammar/:topicId",          component: GrammarPage },
  { path: "/vocabulary",                component: VocabularyPage },      // Словарь
  { path: "/games",                     component: GamesPage },
  { path: "/games/:gameId",             component: GamesPage },
  { path: "/spotlight",                 component: SpotlightPage },       // Выбор Spotlight 2-8
  { path: "/spotlight/:gradeId",        component: SpotlightPage },       // Конкретный класс
  { path: "/spotlight/:gradeId/:moduleId", component: SpotlightPage },    // Конкретный модуль
  { path: "/achievements",             component: AchievementsPage },
  { path: "/profile",                  component: ProfilePage },
  { path: "/parent",                   component: ParentDashboard },
  { path: "/settings",                 component: SettingsPage },
];
```

---

## 8. Electron: Main Process

```typescript
// electron/main.ts

import { app, BrowserWindow, ipcMain } from 'electron';
import Store from 'electron-store';

const store = new Store({
  name: 'vlad-english-data',
  defaults: {
    profiles: [],
    activeProfileId: null,
    settings: {
      volume: 0.7,
      musicVolume: 0.3,
      ttsSpeed: 0.85,        // Чуть медленнее нормы
      ttsVoice: 'en-US',     // Американский английский
      theme: 'auto',         // auto = определяется по ageGroup (playful/modern/minimal)
      parentPin: '0000',
      showTimer: true,
      autoPlayAudio: true,
      defaultGrade: null,    // Устанавливается при первом запуске (2-8)
    },
  },
});

// IPC handlers
ipcMain.handle('store:get', (_, key) => store.get(key));
ipcMain.handle('store:set', (_, key, value) => store.set(key, value));

// Размер окна — не слишком мелко для ребёнка
const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../build/icon.png'),
    title: 'VladEnglish',
    // Без меню (чтобы ребёнок не нажал что-то лишнее)
    autoHideMenuBar: true,
  });

  // В production — загружаем из build
  // В dev — из vite dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};
```

---

## 9. Генерация аудио-контента

### Стратегия озвучки

1. **Буквы и звуки** — предзаписанные mp3 (качество критично). Можно сгенерировать через edge-tts (Microsoft) или записать самостоятельно.

2. **Слова** — Web Speech API (SpeechSynthesis) с fallback на предзаписанные. Для основных 200 слов лучше предзаписать.

3. **Инструкции на русском** — Web Speech API с голосом ru-RU.

4. **Предложения и истории** — Web Speech API в реальном времени.

```typescript
// hooks/useTTS.ts

export function useTTS() {
  const speak = useCallback((text: string, lang: 'en' | 'ru' = 'en') => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'ru-RU';
    utterance.rate = lang === 'en' ? 0.85 : 1.0; // Английский чуть медленнее
    utterance.pitch = 1.0;

    // Выбираем подходящий голос
    const voices = speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.lang.startsWith(utterance.lang) && v.name.includes('Female')
    );
    if (preferred) utterance.voice = preferred;

    speechSynthesis.speak(utterance);
    return utterance;
  }, []);

  const speakSlow = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.6; // Очень медленно — для побуквенного разбора
    speechSynthesis.speak(utterance);
  }, []);

  return { speak, speakSlow };
}
```

### Скрипт генерации mp3 (для предзаписанного аудио)

```bash
# Генерация аудио через edge-tts (бесплатно, высокое качество)
# pip install edge-tts

# Буквы
for letter in a b c d e f g h i j k l m n o p q r s t u v w x y z; do
  edge-tts --voice en-US-JennyNeural --rate=-20% --text "$letter" \
    --write-media "assets/audio/letters/$letter.mp3"
done

# Слова из контента
while IFS= read -r word; do
  edge-tts --voice en-US-JennyNeural --rate=-15% --text "$word" \
    --write-media "assets/audio/words/$word.mp3"
done < wordlist.txt
```

---

## 10. Генерация SVG-изображений

Для картинок словаря (vocabulary/) используем простые SVG-иллюстрации в мультяшном стиле. Можно генерировать через AI или использовать бесплатные наборы. Каждая картинка:

- Размер: 200x200px
- Стиль: flat, яркие цвета, чёткие контуры
- Формат: SVG (масштабируется)
- Фон: прозрачный

Минимальный набор для MVP — ~80 картинок (все слова из phonics + spotlight vocab).

---

## 11. Последовательность урока (Lesson Flow)

```
1. INTRO (5 сек)
   → Анимация: персонаж приветствует
   → Озвучка: "Сегодня мы изучим звук /æ/!"
   → Показ правила с примером

2. LEARN (3-4 упражнения на ознакомление)
   → letter_sound: Нажми на букву — услышь звук
   → sound_picker: Услышь звук — выбери букву
   → word_reader: Посмотри слово с подсветкой фонем

3. PRACTICE (4-5 упражнений на закрепление)
   → word_builder: Собери слово из букв
   → picture_match: Соедини картинку и слово
   → fill_the_gap: Вставь пропущенную букву
   → listen_and_choose: Услышь и выбери

4. CHALLENGE (2-3 упражнения повышенной сложности)
   → read_aloud: Прочитай слово вслух (STT)
   → spelling_bee: Услышь — напечатай
   → sentence_builder: Составь предложение

5. REVIEW (1 упражнение)
   → Микс из слов урока + ранее изученных (spaced repetition)

6. RESULTS
   → Анимация: звёзды, конфетти
   → Показ результата: ⭐⭐⭐ / ⭐⭐ / ⭐
   → Очки и награды
   → Кнопки: "Пройти снова" / "Следующий урок"
```

---

## 12. Порядок уроков (Curriculum Map)

```
ISLAND 1: PHONICS (47 уроков)
├── Chapter 1: Алфавит (5 уроков)
│   ├── Lesson 1: A-E (буквы и их звуки)
│   ├── Lesson 2: F-J
│   ├── Lesson 3: K-O
│   ├── Lesson 4: P-T
│   └── Lesson 5: U-Z + Review
│
├── Chapter 2: Короткие гласные (10 уроков)
│   ├── Lesson 6-7: Short A (cat, hat, man...)
│   ├── Lesson 8-9: Short E (pen, bed, red...)
│   ├── Lesson 10-11: Short I (big, sit, pin...)
│   ├── Lesson 12-13: Short O (dog, hot, box...)
│   └── Lesson 14-15: Short U (cup, bus, run...)
│
├── Chapter 3: Consonant Blends (9 уроков)
│   ├── Lesson 16: bl, br
│   ├── Lesson 17: cl, cr
│   ├── Lesson 18: dr, fl
│   ├── Lesson 19: fr, gl
│   ├── Lesson 20: gr, pl
│   ├── Lesson 21: pr, sl
│   ├── Lesson 22: sm, sn
│   ├── Lesson 23: sp, st
│   └── Lesson 24: sw, tr
│
├── Chapter 4: Magic E / Long Vowels (5 уроков)
│   ├── Lesson 25: a_e (cake, make, lake)
│   ├── Lesson 26: i_e (bike, like, time)
│   ├── Lesson 27: o_e (home, bone, nose)
│   ├── Lesson 28: u_e (cute, huge, cube)
│   └── Lesson 29: e_e + Review
│
├── Chapter 5: Digraphs (7 уроков)
│   ├── Lesson 30: sh (ship, shop, fish)
│   ├── Lesson 31: ch (chip, chat, much)
│   ├── Lesson 32: th (this, that, thin)
│   ├── Lesson 33: wh (what, when, where)
│   ├── Lesson 34: ph (phone, photo)
│   ├── Lesson 35: ck (back, clock, duck)
│   └── Lesson 36: ng (sing, ring, king)
│
├── Chapter 6: Vowel Teams (6 уроков)
│   ├── Lesson 37: ee (tree, see, green)
│   ├── Lesson 38: ea (sea, eat, beach)
│   ├── Lesson 39: ai, ay (rain, play)
│   ├── Lesson 40: oa (boat, coat)
│   ├── Lesson 41: oo (moon, food)
│   └── Lesson 42: Review
│
└── Chapter 7: Sight Words (5 уроков)
    ├── Lesson 43: the, a, is, it, in, I, to, and, we, he
    ├── Lesson 44: she, my, you, are, was, they, on, can, has, his
    ├── Lesson 45: her, all, said, do, like, have, this, will, with, one
    ├── Lesson 46: no, go, so, not, but, what, there, out, be, up
    └── Lesson 47: look, some, come, very, here, just, were, your, when, had

ISLAND 2: SPOTLIGHT 2 — READING (привязка к учебнику)
├── Starter: My Letters + My Numbers & Colours (3 урока)
├── Module 1: My Home (3 урока)
├── Module 2: My Birthday (3 урока)
├── Module 3: My Animals (3 урока)
├── Module 4: My Toys (3 урока)
└── Module 5: My Holidays (3 урока)

ISLAND 3: STORIES (после Phonics)
├── Easy Stories (CVC words)
├── Medium Stories (blends + digraphs)
└── Spotlight Stories (адаптированные)

ISLAND 4: GAMES HUB (доступен всегда)
├── Memory Cards
├── Word Race
├── Phonics Whack
├── Word Search
├── Crossword
├── Grammar Battle (5-8 кл)
├── Translation Race (4-8 кл)
└── Daily Challenge

═══════════════════════════════════════════════════════
SPOTLIGHT 3 (3 класс, A1) — ~15 уроков
═══════════════════════════════════════════════════════
├── Modules 1-8 по учебнику
├── Грамматика: to be, have got, can, Present Simple, plurals,
│   this/that/these/those, предлоги места
├── Лексика: школа, семья, еда, игрушки, животные,
│   дом, одежда, каникулы (~200 новых слов)
└── Чтение: короткие тексты, письма, описания

═══════════════════════════════════════════════════════
SPOTLIGHT 4 (4 класс, A1+) — ~15 уроков
═══════════════════════════════════════════════════════
├── Modules 1-8 по учебнику
├── Грамматика: Present Simple vs Continuous, Past Simple (regular),
│   comparatives/superlatives (intro), much/many/a lot of
├── Лексика: профессии, распорядок дня, покупки, природа,
│   сказки, городские места (~200 новых слов)
└── Чтение: рассказы, описания мест, инструкции

═══════════════════════════════════════════════════════
SPOTLIGHT 5 (5 класс, A1-A2) — ~20 уроков
═══════════════════════════════════════════════════════
├── Modules 1-10 по учебнику
├── Грамматика: Past Simple (irregular), Future (will/going to),
│   must/mustn't, adverbs of frequency, countable/uncountable
├── Лексика: школьные предметы, страны, внешность, хобби,
│   здоровье, праздники, путешествия (~250 новых слов)
├── Чтение: тексты с вопросами, true/false, matching
└── Письмо: открытки, email, описания

═══════════════════════════════════════════════════════
SPOTLIGHT 6 (6 класс, A2) — ~20 уроков
═══════════════════════════════════════════════════════
├── Modules 1-10 по учебнику
├── Грамматика: Past Continuous, Present Perfect (intro),
│   should/shouldn't, relative pronouns (who/which/that),
│   comparatives/superlatives (full), some/any/no
├── Лексика: характер, СМИ, культура, еда (расширенно),
│   каникулы, окружающая среда (~250 новых слов)
├── Чтение: статьи, рецепты, биографии
└── Письмо: письма, отзывы, описания событий

═══════════════════════════════════════════════════════
SPOTLIGHT 7 (7 класс, A2-B1) — ~20 уроков
═══════════════════════════════════════════════════════
├── Modules 1-10 по учебнику
├── Грамматика: Present Perfect vs Past Simple, Past Perfect,
│   Passive Voice (Present/Past), Conditionals 0+1,
│   reported speech (intro), gerund/infinitive
├── Лексика: технологии, искусство, наука, экология,
│   путешествия (расширенно), спорт (~300 новых слов)
├── Чтение: статьи, истории, стихи
└── Письмо: эссе (opinion), статьи, formal letters

═══════════════════════════════════════════════════════
SPOTLIGHT 8 (8 класс, B1) — ~20 уроков
═══════════════════════════════════════════════════════
├── Modules 1-8 по учебнику
├── Грамматика: Conditionals 2, Passive (all tenses),
│   reported speech (full), relative clauses (defining/non-defining),
│   phrasal verbs, word formation, causative
├── Лексика: общество, карьера, глобальные проблемы,
│   наука и технологии, литература (~300 новых слов)
├── Чтение: длинные тексты, анализ, аргументация
└── Письмо: for-and-against essays, reviews, formal emails
```

---

## 13. Настройки для electron-builder

```yaml
# electron-builder.yml
appId: com.vlad-english.app
productName: VladEnglish
directories:
  output: release
  buildResources: build

files:
  - dist/**/*
  - electron/**/*
  - assets/**/*
  - package.json

win:
  target:
    - target: nsis
      arch: [x64]
  icon: build/icon.ico

nsis:
  oneClick: true
  perMachine: false
  allowToChangeInstallationDirectory: false
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: VladEnglish
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  installerSidebar: build/installer-sidebar.bmp

mac:
  target: dmg
  icon: build/icon.png

linux:
  target: AppImage
  icon: build/icon.png
```

---

## 14. package.json

```json
{
  "name": "vlad-english",
  "version": "1.0.0",
  "description": "English learning app for school students (Spotlight 2-8, ages 7-14)",
  "main": "electron/main.js",
  "scripts": {
    "dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\"",
    "build": "vite build && tsc -p electron/tsconfig.json",
    "dist": "npm run build && electron-builder",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.28.0",
    "framer-motion": "^11.12.0",
    "howler": "^2.2.4",
    "zustand": "^5.0.0",
    "lucide-react": "^0.460.0",
    "electron-store": "^10.0.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0"
  },
  "devDependencies": {
    "electron": "^33.2.0",
    "electron-builder": "^25.1.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "concurrently": "^9.1.0",
    "wait-on": "^8.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0"
  }
}
```

---

## 15. Инструкции для разработки

### Фаза 1: MVP (Spotlight 2 — Phonics + базовая лексика)

**Цель:** Рабочее приложение для 2 класса (Phonics + Spotlight 2 лексика), которое ученик может запустить и начать учиться.

**Что включить:**
1. Electron shell с React
2. Главный экран (упрощённый — без карты, просто список уровней)
3. Phonics: Chapter 1 (Алфавит, 5 уроков) + Chapter 2 (Short Vowels, 10 уроков)
4. 4 типа упражнений: `letter_sound`, `sound_picker`, `word_builder`, `picture_match`
5. TTS через Web Speech API (без предзаписанного аудио)
6. Простая система очков + звёзды за урок
7. Сохранение прогресса через electron-store
8. SVG-заглушки для картинок (цветные placeholder-ы с текстом)
9. Звуковые эффекты (correct/wrong/levelup)
10. Базовая анимация (Framer Motion)

**Что НЕ включать в MVP:**
- STT (распознавание речи) — добавим позже
- Панель родителя
- Игровой хаб
- Карту приключений (сделать простой sidebar)
- Предзаписанное аудио
- Spaced repetition (добавим в Фазе 2)
- Контент Spotlight 3-8 (добавим поэтапно)
- Грамматический модуль (добавим в Фазе 2)
- Упражнения на письмо/эссе (Фаза 3)

### Фаза 2: Расширение (Spotlight 3-4 + грамматика)

**Что включить:**
1. Экран выбора класса (GradeSelectPage)
2. Контент Spotlight 3 и 4
3. Грамматический модуль (to_be, have_got, Present Simple/Continuous, Past Simple)
4. Новые упражнения: GrammarChoice, GrammarTransform, TranslationExercise
5. Spaced repetition для слов
6. Панель родителя
7. Адаптивный UI (junior тема)

### Фаза 3: Средние классы (Spotlight 5-6)

**Что включить:**
1. Контент Spotlight 5 и 6
2. TextComprehension, ListeningComprehension
3. EssayWriter (базовый)
4. Кроссворды, Grammar Battle
5. Middle-тема UI (sidebar навигация, без персонажа)
6. Более сложные тексты для чтения

### Фаза 4: Старшие классы (Spotlight 7-8)

**Что включить:**
1. Контент Spotlight 7 и 8
2. Полный грамматический модуль (Passive, Conditionals, Reported Speech)
3. ErrorCorrection, WordFormation
4. Senior-тема UI (минималистичная, вкладки)
5. Длинные тексты, эссе, formal letters
6. Phrasal verbs, word formation

### Команда для запуска разработки

```bash
# Инициализация проекта
# Проект уже в /root/vlad_english
cd /root/vlad_english
npm init -y
npm install react react-dom react-router-dom framer-motion howler zustand \
  lucide-react electron-store @dnd-kit/core @dnd-kit/sortable
npm install -D electron electron-builder vite @vitejs/plugin-react \
  typescript tailwindcss postcss autoprefixer concurrently wait-on \
  @types/react @types/react-dom

# Запуск dev-сервера
npm run dev
```

---

## 16. Критерии качества

### Общие
- **Анимации:** не более 300ms для feedback, 500ms для переходов
- **Звук:** каждое действие сопровождается звуком (клик, правильно, неправильно)
- **Цвета:** высокий контраст, WCAG AA минимум
- **Ошибки:** после 2 ошибок — подсказка, после 3 — показать ответ и продолжить

### По возрастным группам

| Параметр            | Junior (2-4 кл) | Middle (5-6 кл) | Senior (7-8 кл) |
|---------------------|------------------|------------------|------------------|
| Размер кнопок       | 56px             | 44px             | 40px             |
| Шрифт текста        | 20px             | 18px             | 16px             |
| Шрифт слов          | 48px             | 36px             | 28px             |
| Время урока         | 5-10 мин         | 10-15 мин        | 15-20 мин        |
| Упражнений в уроке  | 8-12             | 10-15            | 12-20            |
| Празднования        | Конфетти + звук  | Звёзды           | Прогресс-бар     |
| Мотивация           | Каждые 3 ответа  | Каждые 5 ответов | В конце урока    |
| Инструкции          | На русском       | Рус + Англ       | На английском    |
| Перевод             | Всегда виден     | По наведению     | По кнопке        |
