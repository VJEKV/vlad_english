// Russian explanations for phonics rules and grammar
// Each has a text explanation + examples + tip

export interface PhonicsExplanation {
  id: string;
  rule: string;          // e.g. "th", "sh", "short_a"
  titleEn: string;
  titleRu: string;
  explanation: string;   // Russian explanation (read by TTS)
  tip: string;           // Mnemonic / physical tip
  examples: { word: string; transcription: string; ru: string; note?: string }[];
  practiceWords: string[];
}

export interface GrammarExplanation {
  id: string;
  topic: string;
  titleEn: string;
  titleRu: string;
  level: string;         // "2-3", "3-4", "5-6", "7-8"
  explanation: string;
  ruAnalogy: string;     // "В русском это как..."
  formula: string;       // "am/is/are + verb-ing"
  examples: { en: string; ru: string; highlight: string }[];
  antiExamples?: { wrong: string; right: string; whyRu: string }[];
  tip: string;
}

export const PHONICS_EXPLANATIONS: PhonicsExplanation[] = [
  {
    id: 'ph_th',
    rule: 'th',
    titleEn: 'TH sound',
    titleRu: 'Звук TH',
    explanation: 'Буквосочетание TH читается как мягкое «з» или «с», но язык нужно поставить между зубами. Это самый необычный звук для русского уха! Попробуй сказать «з», но прикуси кончик языка — получится th! Есть два варианта: звонкий — как в слове this, и глухой — как в слове three.',
    tip: 'Положи кончик языка между зубами и подуй. Если добавишь голос — получится звонкий th (this). Без голоса — глухой th (three).',
    examples: [
      { word: 'this', transcription: '/ðɪs/', ru: 'это', note: 'звонкий th — язык между зубами + голос' },
      { word: 'that', transcription: '/ðæt/', ru: 'тот', note: 'звонкий th' },
      { word: 'the', transcription: '/ðə/', ru: 'определённый артикль', note: 'звонкий th' },
      { word: 'three', transcription: '/θriː/', ru: 'три', note: 'глухой th — язык между зубами, без голоса' },
      { word: 'thin', transcription: '/θɪn/', ru: 'тонкий', note: 'глухой th' },
      { word: 'thick', transcription: '/θɪk/', ru: 'толстый', note: 'глухой th' },
    ],
    practiceWords: ['this', 'that', 'the', 'them', 'three', 'thin', 'thick', 'bath', 'math', 'with'],
  },
  {
    id: 'ph_sh',
    rule: 'sh',
    titleEn: 'SH sound',
    titleRu: 'Звук SH',
    explanation: 'Буквосочетание SH читается как русское «ш», но мягче. Представь что ты просишь кого-то быть тише: «Шшш!». Вот это и есть английский звук sh.',
    tip: 'Скажи русское «ш» и улыбнись — звук станет мягче. Это и будет английское sh!',
    examples: [
      { word: 'ship', transcription: '/ʃɪp/', ru: 'корабль' },
      { word: 'shop', transcription: '/ʃɒp/', ru: 'магазин' },
      { word: 'fish', transcription: '/fɪʃ/', ru: 'рыба' },
      { word: 'she', transcription: '/ʃiː/', ru: 'она' },
      { word: 'shoe', transcription: '/ʃuː/', ru: 'ботинок' },
      { word: 'sheep', transcription: '/ʃiːp/', ru: 'овца' },
    ],
    practiceWords: ['ship', 'shop', 'fish', 'dish', 'she', 'shoe', 'shell', 'shut', 'wish', 'push'],
  },
  {
    id: 'ph_ch',
    rule: 'ch',
    titleEn: 'CH sound',
    titleRu: 'Звук CH',
    explanation: 'Буквосочетание CH читается как русское «ч». Это один из самых простых звуков для русских — у нас точно такой же! Просто говори «ч» как обычно.',
    tip: 'CH = русское «ч». Легко!',
    examples: [
      { word: 'chip', transcription: '/tʃɪp/', ru: 'чипсина' },
      { word: 'chat', transcription: '/tʃæt/', ru: 'болтать' },
      { word: 'much', transcription: '/mʌtʃ/', ru: 'много' },
      { word: 'lunch', transcription: '/lʌntʃ/', ru: 'обед' },
      { word: 'cheese', transcription: '/tʃiːz/', ru: 'сыр' },
      { word: 'chicken', transcription: '/ˈtʃɪkɪn/', ru: 'курица' },
    ],
    practiceWords: ['chip', 'chat', 'chin', 'chop', 'much', 'such', 'rich', 'check', 'chest', 'lunch'],
  },
  {
    id: 'ph_short_a',
    rule: 'short_a',
    titleEn: 'Short A',
    titleRu: 'Короткое A',
    explanation: 'Короткое A читается как звук между русскими «э» и «а». Откройте рот широко, как будто доктор просит сказать «а-а-а», но более коротко и резко. Этот звук встречается в коротких словах вроде cat, hat, man.',
    tip: 'Откройте рот как для «а», но скажите «э». Получится короткое английское a. Как в слове «кэт» — cat.',
    examples: [
      { word: 'cat', transcription: '/kæt/', ru: 'кот' },
      { word: 'hat', transcription: '/hæt/', ru: 'шляпа' },
      { word: 'man', transcription: '/mæn/', ru: 'мужчина' },
      { word: 'bag', transcription: '/bæɡ/', ru: 'сумка' },
      { word: 'map', transcription: '/mæp/', ru: 'карта' },
      { word: 'sad', transcription: '/sæd/', ru: 'грустный' },
    ],
    practiceWords: ['cat', 'hat', 'bat', 'man', 'can', 'van', 'map', 'bag', 'sad', 'dad'],
  },
  {
    id: 'ph_magic_e',
    rule: 'magic_e',
    titleEn: 'Magic E',
    titleRu: 'Волшебная E',
    explanation: 'Волшебная E — это немая буква e в конце слова, которая делает гласную перед ней длинной! Сама E не произносится, но меняет звук. Сравни: can — cane. В can буква a короткая. Добавили e в конец — и a стала длинной, как в алфавите! Вот такое волшебство.',
    tip: 'Буква E в конце слова — как волшебная палочка. Она сама молчит, но делает гласную длинной. cap → cape, not → note, cut → cute.',
    examples: [
      { word: 'cake', transcription: '/keɪk/', ru: 'торт', note: 'a читается как «эй»' },
      { word: 'bike', transcription: '/baɪk/', ru: 'велосипед', note: 'i читается как «ай»' },
      { word: 'home', transcription: '/hoʊm/', ru: 'дом', note: 'o читается как «оу»' },
      { word: 'cute', transcription: '/kjuːt/', ru: 'милый', note: 'u читается как «ю»' },
      { word: 'name', transcription: '/neɪm/', ru: 'имя', note: 'a читается как «эй»' },
      { word: 'like', transcription: '/laɪk/', ru: 'нравиться', note: 'i читается как «ай»' },
    ],
    practiceWords: ['cake', 'make', 'lake', 'bike', 'like', 'time', 'home', 'nose', 'cute', 'name'],
  },
];

export const GRAMMAR_EXPLANATIONS: GrammarExplanation[] = [
  {
    id: 'gr_to_be',
    topic: 'to_be',
    titleEn: 'To Be — am, is, are',
    titleRu: 'Глагол «быть» — am, is, are',
    level: '2-3',
    explanation: 'В русском мы говорим «Я ученик», «Она красивая» — без глагола. А в английском обязательно нужен глагол «быть»: I am a student, She is beautiful. Нельзя сказать просто «I student» — англичане не поймут!',
    ruAnalogy: 'В русском глагол «есть» обычно пропускается: «Я — ученик». В английском его пропускать нельзя: I AM a student.',
    formula: 'I → am  |  He/She/It → is  |  We/You/They → are',
    examples: [
      { en: 'I am happy.', ru: 'Я счастливый.', highlight: 'am' },
      { en: 'She is a teacher.', ru: 'Она учительница.', highlight: 'is' },
      { en: 'They are friends.', ru: 'Они друзья.', highlight: 'are' },
      { en: 'It is cold.', ru: 'Холодно.', highlight: 'is' },
      { en: 'We are at school.', ru: 'Мы в школе.', highlight: 'are' },
    ],
    antiExamples: [
      { wrong: 'I happy.', right: 'I am happy.', whyRu: 'В английском нельзя без am/is/are!' },
      { wrong: 'She are tall.', right: 'She is tall.', whyRu: 'She — это одна она, значит is, а не are.' },
    ],
    tip: 'Запомни: I — всегда am. He/She/It (один предмет) — is. Мы/Вы/Они (много) — are.',
  },
  {
    id: 'gr_present_simple',
    topic: 'present_simple',
    titleEn: 'Present Simple',
    titleRu: 'Простое настоящее время',
    level: '3-4',
    explanation: 'Present Simple — это то, что ты делаешь обычно, каждый день, всегда. По-русски: «Я хожу в школу», «Мама готовит обед», «Кошки любят рыбу». Это не прямо сейчас, а вообще, обычно.',
    ruAnalogy: 'Русское «Я читаю книги» (вообще, как привычка) = I read books. А «Я сейчас читаю» — это уже другое время!',
    formula: 'I/You/We/They → глагол без изменений  |  He/She/It → глагол + s',
    examples: [
      { en: 'I play football.', ru: 'Я играю в футбол (вообще, как хобби).', highlight: 'play' },
      { en: 'She plays piano.', ru: 'Она играет на пианино (регулярно).', highlight: 'plays' },
      { en: 'We go to school.', ru: 'Мы ходим в школу (каждый день).', highlight: 'go' },
      { en: 'He likes ice cream.', ru: 'Он любит мороженое (всегда).', highlight: 'likes' },
      { en: 'Cats sleep a lot.', ru: 'Кошки много спят (вообще).', highlight: 'sleep' },
    ],
    antiExamples: [
      { wrong: 'She play tennis.', right: 'She plays tennis.', whyRu: 'После he/she/it к глаголу добавляем -s!' },
      { wrong: 'I plays guitar.', right: 'I play guitar.', whyRu: 'После I не нужно -s.' },
    ],
    tip: 'Правило «один он/она/оно — добавь s»: He reads, She eats, It rains. Слова-маркеры: always, usually, every day, often.',
  },
  {
    id: 'gr_present_continuous',
    topic: 'present_continuous',
    titleEn: 'Present Continuous',
    titleRu: 'Настоящее длительное время',
    level: '3-4',
    explanation: 'Present Continuous — это то, что происходит прямо сейчас, в этот момент. По-русски: «Я сейчас читаю», «Мама сейчас готовит», «Смотри, дети играют!». Ключевое слово — СЕЙЧАС.',
    ruAnalogy: 'Русское «Я сейчас читаю книгу» (прямо в этот момент) = I am reading a book. Если без «сейчас» и это привычка — то Present Simple.',
    formula: 'am/is/are + глагол + ing',
    examples: [
      { en: 'I am reading a book.', ru: 'Я читаю книгу (прямо сейчас).', highlight: 'am reading' },
      { en: 'She is cooking dinner.', ru: 'Она готовит обед (прямо сейчас).', highlight: 'is cooking' },
      { en: 'They are playing in the park.', ru: 'Они играют в парке (сейчас, я их вижу).', highlight: 'are playing' },
      { en: 'Look! It is raining!', ru: 'Смотри! Идёт дождь!', highlight: 'is raining' },
      { en: 'We are watching TV.', ru: 'Мы смотрим телевизор (сейчас).', highlight: 'are watching' },
    ],
    antiExamples: [
      { wrong: 'She cooking.', right: 'She is cooking.', whyRu: 'Нужен am/is/are перед глаголом с -ing!' },
      { wrong: 'I am read.', right: 'I am reading.', whyRu: 'Нужно добавить -ing к глаголу!' },
    ],
    tip: 'Слова-подсказки: now, right now, at the moment, Look!, Listen! Если видишь их — это Present Continuous.',
  },
  {
    id: 'gr_past_simple',
    topic: 'past_simple',
    titleEn: 'Past Simple',
    titleRu: 'Простое прошедшее время',
    level: '4-5',
    explanation: 'Past Simple — это то, что уже произошло и закончилось. Вчера, на прошлой неделе, в прошлом году. По-русски: «Я ходил в школу», «Мы играли в парке», «Она купила мороженое».',
    ruAnalogy: 'Русское «Я вчера смотрел фильм» = I watched a film yesterday. Действие закончилось, осталось в прошлом.',
    formula: 'Правильные глаголы: глагол + ed  |  Неправильные: 2-я форма (went, saw, ate...)',
    examples: [
      { en: 'I played football yesterday.', ru: 'Я вчера играл в футбол.', highlight: 'played' },
      { en: 'She watched a film.', ru: 'Она посмотрела фильм.', highlight: 'watched' },
      { en: 'We went to the park.', ru: 'Мы ходили в парк.', highlight: 'went' },
      { en: 'He ate pizza for lunch.', ru: 'Он съел пиццу на обед.', highlight: 'ate' },
      { en: 'They saw a big dog.', ru: 'Они увидели большую собаку.', highlight: 'saw' },
    ],
    antiExamples: [
      { wrong: 'I goed to school.', right: 'I went to school.', whyRu: 'go — неправильный глагол! Прошедшее — went, а не goed.' },
      { wrong: 'She plaied tennis.', right: 'She played tennis.', whyRu: 'play + ed = played (не plaied).' },
    ],
    tip: 'Слова-подсказки: yesterday, last week, last year, ago, in 2020. Неправильные глаголы нужно учить наизусть — go→went, see→saw, eat→ate.',
  },
  {
    id: 'gr_can',
    topic: 'can_cant',
    titleEn: 'Can / Can\'t',
    titleRu: 'Умею / Не умею',
    level: '2-3',
    explanation: 'Can — значит «могу» или «умею». Can\'t — «не могу» или «не умею». Это очень простое слово! После can глагол идёт без изменений — никаких s или to. Просто: I can swim, She can dance, He can\'t fly.',
    ruAnalogy: 'Русское «Я умею плавать» = I can swim. «Я не умею летать» = I can\'t fly. Can одинаковый для всех — I can, he can, they can.',
    formula: 'can + глагол (без to, без s)  |  Вопрос: Can you...?',
    examples: [
      { en: 'I can swim.', ru: 'Я умею плавать.', highlight: 'can swim' },
      { en: 'She can dance very well.', ru: 'Она очень хорошо танцует.', highlight: 'can dance' },
      { en: 'He can\'t fly.', ru: 'Он не умеет летать.', highlight: 'can\'t fly' },
      { en: 'Can you ride a bike?', ru: 'Ты умеешь ездить на велосипеде?', highlight: 'Can you' },
      { en: 'Birds can fly.', ru: 'Птицы умеют летать.', highlight: 'can fly' },
    ],
    tip: 'Can никогда не меняется! Не бывает «cans» или «can to». Просто can + глагол.',
  },
];
