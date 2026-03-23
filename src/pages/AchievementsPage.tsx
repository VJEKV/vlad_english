import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'Первые шаги', desc: 'Пройди первый урок', icon: '🎯' },
  { id: 'alphabet_master', title: 'Знаток алфавита', desc: 'Пройди все буквы', icon: '🔤' },
  { id: 'streak_3', title: 'Три дня подряд!', desc: '3 дня занятий подряд', icon: '🔥' },
  { id: 'streak_7', title: 'Неделя практики', desc: '7 дней подряд', icon: '📅' },
  { id: 'words_50', title: 'Полиглот', desc: 'Выучи 50 слов', icon: '📚' },
  { id: 'words_100', title: 'Книжный червь', desc: 'Выучи 100 слов', icon: '🐛' },
  { id: 'speed_demon', title: 'Быстрее ветра', desc: '10 ответов подряд за <3 сек', icon: '⚡' },
  { id: 'grammar_10', title: 'Грамотей', desc: 'Пройди 10 грамматических тем', icon: '✏️' },
  { id: 'spotlight_complete', title: 'Spotlight Master', desc: 'Все модули учебника', icon: '🏆' },
];

export default function AchievementsPage() {
  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-6">Награды</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center text-center opacity-50"
          >
            <span className="text-4xl mb-2">{a.icon}</span>
            <Lock size={14} className="text-gray-300 mb-1" />
            <h3 className="font-bold text-sm">{a.title}</h3>
            <p className="text-xs text-gray-400 mt-1">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
