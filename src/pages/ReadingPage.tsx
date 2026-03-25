import { useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight } from 'lucide-react';
import { useTTS } from '../hooks/useTTS';
import { InteractiveText } from '../components/common/WordCard';
import AIStoryGenerator from '../components/ai/AIStoryGenerator';

interface ReadingText {
  id: string;
  title: string;
  titleRu: string;
  level: string;
  sentences: { en: string; ru: string }[];
}

const TEXTS: ReadingText[] = [
  {
    id: 'r1',
    title: 'My Cat',
    titleRu: 'Мой кот',
    level: '2 класс',
    sentences: [
      { en: 'I have a cat.', ru: 'У меня есть кот.' },
      { en: 'My cat is big and fat.', ru: 'Мой кот большой и толстый.' },
      { en: 'He is black and white.', ru: 'Он чёрно-белый.' },
      { en: 'He can jump and run.', ru: 'Он умеет прыгать и бегать.' },
      { en: 'I love my cat!', ru: 'Я люблю своего кота!' },
    ],
  },
  {
    id: 'r2',
    title: 'At School',
    titleRu: 'В школе',
    level: '2-3 класс',
    sentences: [
      { en: 'I go to school every day.', ru: 'Я хожу в школу каждый день.' },
      { en: 'My teacher is kind.', ru: 'Мой учитель добрый.' },
      { en: 'I sit next to my friend.', ru: 'Я сижу рядом с другом.' },
      { en: 'We read and write in English.', ru: 'Мы читаем и пишем по-английски.' },
      { en: 'I like English!', ru: 'Мне нравится английский!' },
    ],
  },
  {
    id: 'r3',
    title: 'My Family',
    titleRu: 'Моя семья',
    level: '2-3 класс',
    sentences: [
      { en: 'I have a big family.', ru: 'У меня большая семья.' },
      { en: 'My mum is a doctor.', ru: 'Моя мама врач.' },
      { en: 'My dad is tall and strong.', ru: 'Мой папа высокий и сильный.' },
      { en: 'I have a little sister.', ru: 'У меня есть младшая сестра.' },
      { en: 'She is three years old.', ru: 'Ей три года.' },
      { en: 'We are happy together!', ru: 'Нам хорошо вместе!' },
    ],
  },
  {
    id: 'r4',
    title: 'In the Park',
    titleRu: 'В парке',
    level: '3-4 класс',
    sentences: [
      { en: 'It is sunny today.', ru: 'Сегодня солнечно.' },
      { en: 'We are going to the park.', ru: 'Мы идём в парк.' },
      { en: 'I can see a big tree.', ru: 'Я вижу большое дерево.' },
      { en: 'The birds are singing.', ru: 'Птицы поют.' },
      { en: 'My dog is running on the grass.', ru: 'Моя собака бегает по траве.' },
      { en: 'I am eating ice cream.', ru: 'Я ем мороженое.' },
      { en: 'What a beautiful day!', ru: 'Какой красивый день!' },
    ],
  },
  {
    id: 'r5',
    title: 'My Dog',
    titleRu: 'Моя собака',
    level: '2 класс',
    sentences: [
      { en: 'I have a dog.', ru: 'У меня есть собака.' },
      { en: 'His name is Rex.', ru: 'Его зовут Рекс.' },
      { en: 'He is brown and white.', ru: 'Он коричневый и белый.' },
      { en: 'He can run fast.', ru: 'Он умеет быстро бегать.' },
      { en: 'I walk with Rex every day.', ru: 'Я гуляю с Рексом каждый день.' },
    ],
  },
  {
    id: 'r6',
    title: 'Breakfast',
    titleRu: 'Завтрак',
    level: '2 класс',
    sentences: [
      { en: 'I get up at seven.', ru: 'Я встаю в семь.' },
      { en: 'I have breakfast.', ru: 'Я завтракаю.' },
      { en: 'I eat eggs and toast.', ru: 'Я ем яйца и тосты.' },
      { en: 'I drink milk.', ru: 'Я пью молоко.' },
      { en: 'Then I go to school.', ru: 'Потом я иду в школу.' },
    ],
  },
  {
    id: 'r7',
    title: 'My Room',
    titleRu: 'Моя комната',
    level: '2 класс',
    sentences: [
      { en: 'This is my room.', ru: 'Это моя комната.' },
      { en: 'My bed is big.', ru: 'Моя кровать большая.' },
      { en: 'There is a lamp on the table.', ru: 'На столе стоит лампа.' },
      { en: 'My toys are in the box.', ru: 'Мои игрушки в коробке.' },
      { en: 'I like my room!', ru: 'Мне нравится моя комната!' },
    ],
  },
  {
    id: 'r8',
    title: 'My Toys',
    titleRu: 'Мои игрушки',
    level: '2 класс',
    sentences: [
      { en: 'I have many toys.', ru: 'У меня много игрушек.' },
      { en: 'My teddy bear is brown.', ru: 'Мой плюшевый мишка коричневый.' },
      { en: 'My ball is red and blue.', ru: 'Мой мяч красный и синий.' },
      { en: 'I can play with my train.', ru: 'Я могу играть с моим поездом.' },
      { en: 'I love my toys!', ru: 'Я люблю свои игрушки!' },
    ],
  },
  {
    id: 'r9',
    title: 'At the Beach',
    titleRu: 'На пляже',
    level: '2 класс',
    sentences: [
      { en: 'It is summer.', ru: 'Сейчас лето.' },
      { en: 'We go to the beach.', ru: 'Мы идём на пляж.' },
      { en: 'The sea is blue.', ru: 'Море голубое.' },
      { en: 'I can swim.', ru: 'Я умею плавать.' },
      { en: 'I make a sandcastle.', ru: 'Я строю замок из песка.' },
      { en: 'It is fun!', ru: 'Это весело!' },
    ],
  },
  {
    id: 'r10',
    title: 'My Best Friend',
    titleRu: 'Мой лучший друг',
    level: '2-3 класс',
    sentences: [
      { en: 'My best friend is Tom.', ru: 'Мой лучший друг — Том.' },
      { en: 'He is tall and funny.', ru: 'Он высокий и смешной.' },
      { en: 'We go to school together.', ru: 'Мы ходим в школу вместе.' },
      { en: 'We play football after school.', ru: 'Мы играем в футбол после школы.' },
      { en: 'Tom can run very fast.', ru: 'Том умеет бегать очень быстро.' },
      { en: 'He is a good friend!', ru: 'Он хороший друг!' },
    ],
  },
  {
    id: 'r11',
    title: 'At the Zoo',
    titleRu: 'В зоопарке',
    level: '2-3 класс',
    sentences: [
      { en: 'We go to the zoo.', ru: 'Мы идём в зоопарк.' },
      { en: 'I can see a big elephant.', ru: 'Я вижу большого слона.' },
      { en: 'The monkey is funny.', ru: 'Обезьяна смешная.' },
      { en: 'It can climb.', ru: 'Она умеет лазить.' },
      { en: 'The lion is sleeping.', ru: 'Лев спит.' },
      { en: 'I like the zoo!', ru: 'Мне нравится зоопарк!' },
    ],
  },
  {
    id: 'r12',
    title: 'My Birthday Party',
    titleRu: 'Мой день рождения',
    level: '2-3 класс',
    sentences: [
      { en: 'Today is my birthday!', ru: 'Сегодня мой день рождения!' },
      { en: 'I am eight.', ru: 'Мне восемь лет.' },
      { en: 'My friends are here.', ru: 'Мои друзья здесь.' },
      { en: 'We eat cake and ice cream.', ru: 'Мы едим торт и мороженое.' },
      { en: 'We play games.', ru: 'Мы играем в игры.' },
      { en: 'I get many presents.', ru: 'Я получаю много подарков.' },
      { en: 'I am very happy!', ru: 'Я очень счастлив!' },
    ],
  },
  {
    id: 'r13',
    title: 'Our School',
    titleRu: 'Наша школа',
    level: '3 класс',
    sentences: [
      { en: 'Our school is big.', ru: 'Наша школа большая.' },
      { en: 'There are many classrooms.', ru: 'Там много классов.' },
      { en: 'I like English lessons.', ru: 'Мне нравятся уроки английского.' },
      { en: 'My teacher is kind.', ru: 'Мой учитель добрый.' },
      { en: 'We read books and sing songs.', ru: 'Мы читаем книги и поём песни.' },
      { en: 'In the afternoon we do art.', ru: 'После обеда у нас рисование.' },
      { en: 'After school I play with my friends.', ru: 'После школы я играю с друзьями.' },
    ],
  },
  {
    id: 'r14',
    title: 'A Rainy Day',
    titleRu: 'Дождливый день',
    level: '3 класс',
    sentences: [
      { en: 'It is raining today.', ru: 'Сегодня идёт дождь.' },
      { en: "I can't go to the park.", ru: 'Я не могу пойти в парк.' },
      { en: 'I am at home.', ru: 'Я дома.' },
      { en: 'I am reading a book.', ru: 'Я читаю книгу.' },
      { en: 'My sister is drawing.', ru: 'Моя сестра рисует.' },
      { en: 'Mum is cooking dinner.', ru: 'Мама готовит ужин.' },
      { en: 'It is cosy at home!', ru: 'Дома уютно!' },
    ],
  },
  {
    id: 'r15',
    title: 'Shopping',
    titleRu: 'Покупки',
    level: '3 класс',
    sentences: [
      { en: 'Mum and I go to the shop.', ru: 'Мы с мамой идём в магазин.' },
      { en: 'We buy milk, bread and apples.', ru: 'Мы покупаем молоко, хлеб и яблоки.' },
      { en: 'I want chocolate.', ru: 'Я хочу шоколад.' },
      { en: 'Mum says "OK!"', ru: 'Мама говорит «Хорошо!»' },
      { en: 'I am happy.', ru: 'Я счастлив.' },
      { en: 'We walk home together.', ru: 'Мы идём домой вместе.' },
    ],
  },
  {
    id: 'r16',
    title: 'My Pet Hamster',
    titleRu: 'Мой хомяк',
    level: '3 класс',
    sentences: [
      { en: 'I have a hamster.', ru: 'У меня есть хомяк.' },
      { en: 'His name is Fuzzy.', ru: 'Его зовут Фаззи.' },
      { en: 'He is small and cute.', ru: 'Он маленький и милый.' },
      { en: 'He has got short brown fur.', ru: 'У него короткая коричневая шёрстка.' },
      { en: 'He likes to run in his wheel.', ru: 'Он любит бегать в колесе.' },
      { en: 'I give him food and water every day.', ru: 'Я даю ему еду и воду каждый день.' },
      { en: 'I love Fuzzy!', ru: 'Я люблю Фаззи!' },
    ],
  },
];

export default function ReadingPage() {
  const { speakSentence, speakWord } = useTTS();
  const [activeText, setActiveText] = useState<ReadingText | null>(null);
  const [showTranslation, setShowTranslation] = useState<Record<number, boolean>>({});

  if (!activeText) {
    return (
      <div>
        <h2 className="text-3xl font-display text-primary mb-2">Чтение</h2>
        <p className="text-gray-400 mb-6">Читай тексты, нажимай на предложения для озвучки</p>

        {/* AI Story Generator */}
        <div className="mb-8 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl">
          <AIStoryGenerator />
        </div>

        <div className="space-y-3 max-w-lg">
          {TEXTS.map((text, i) => (
            <motion.button
              key={text.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setActiveText(text); setShowTranslation({}); }}
              className="w-full flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <h3 className="font-bold text-lg">{text.title}</h3>
                <p className="text-sm text-gray-400">{text.titleRu} • {text.level}</p>
              </div>
              <ChevronRight size={20} className="ml-auto text-gray-300" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setActiveText(null)} className="text-gray-500 hover:text-gray-800 mb-4 flex items-center gap-1">
        ← Назад
      </button>

      <h2 className="text-2xl font-display text-primary mb-1">{activeText.title}</h2>
      <p className="text-gray-400 mb-6">{activeText.titleRu}</p>

      {/* Read all button */}
      <button
        onClick={async () => {
          for (const s of activeText.sentences) {
            await speakSentence(s.en);
            await new Promise((r) => setTimeout(r, 600));
          }
        }}
        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl font-bold mb-6 hover:bg-primary/90"
      >
        <Volume2 size={18} /> Послушать весь текст
      </button>

      <div className="space-y-3 max-w-2xl">
        {activeText.sentences.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-xl p-4 shadow-sm"
          >
            <button
              onClick={() => speakSentence(s.en)}
              className="w-full text-left flex items-start gap-3"
            >
              <Volume2 size={18} className="text-gray-300 shrink-0 mt-1" />
              <div>
                <p className="text-2xl font-bold leading-relaxed">
                  <InteractiveText text={s.en} />
                </p>
              </div>
            </button>
            <button
              onClick={() => setShowTranslation({ ...showTranslation, [i]: !showTranslation[i] })}
              className="text-xs text-gray-400 mt-2 ml-9 hover:text-gray-600"
            >
              {showTranslation[i] ? s.ru : 'Показать перевод'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
