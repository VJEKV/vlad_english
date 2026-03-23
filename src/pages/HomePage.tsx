import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Languages, GraduationCap, Gamepad2, Trophy } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useProgressStore } from '../store/useProgressStore';

const SECTIONS = [
  { to: '/phonics', icon: Languages, label: 'Phonics', desc: 'Звуки и буквы', color: '#FF6B6B', minGrade: 2, maxGrade: 3 },
  { to: '/spotlight', icon: BookOpen, label: 'Spotlight', desc: 'Уроки по учебнику', color: '#6C5CE7', minGrade: 2, maxGrade: 8 },
  { to: '/grammar', icon: GraduationCap, label: 'Грамматика', desc: 'Правила и практика', color: '#00CEC9', minGrade: 3, maxGrade: 8 },
  { to: '/games', icon: Gamepad2, label: 'Игры', desc: 'Учись играя', color: '#FDCB6E', minGrade: 2, maxGrade: 8 },
  { to: '/achievements', icon: Trophy, label: 'Награды', desc: 'Твои достижения', color: '#FD79A8', minGrade: 2, maxGrade: 8 },
];

export default function HomePage() {
  const grade = useSettingsStore((s) => s.grade) ?? 2;
  const ageGroup = useSettingsStore((s) => s.ageGroup);
  const { totalPoints } = useProgressStore();

  const visible = SECTIONS.filter((s) => grade >= s.minGrade && grade <= s.maxGrade);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-display text-primary">
          {ageGroup === 'junior' ? 'Привет! ' : ''}Spotlight {grade}
        </h2>
        <p className="text-gray-500 mt-1">
          {totalPoints > 0 ? `У тебя ${totalPoints} очков` : 'Начни учиться прямо сейчас!'}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((section, i) => (
          <motion.div
            key={section.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={section.to}
              className="flex items-center gap-4 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: section.color }}
              >
                <section.icon size={28} />
              </div>
              <div>
                <h3 className="font-bold text-lg">{section.label}</h3>
                <p className="text-sm text-gray-400">{section.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
