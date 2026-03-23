import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Grade } from '../types';

const GRADES: { grade: Grade; label: string; desc: string; color: string }[] = [
  { grade: 2, label: '2 класс', desc: 'Spotlight 2 — Phonics, алфавит', color: '#FF6B6B' },
  { grade: 3, label: '3 класс', desc: 'Spotlight 3 — Чтение, базовая грамматика', color: '#FD79A8' },
  { grade: 4, label: '4 класс', desc: 'Spotlight 4 — Лексика, письмо', color: '#A29BFE' },
  { grade: 5, label: '5 класс', desc: 'Spotlight 5 — Грамматика, тексты', color: '#6C5CE7' },
  { grade: 6, label: '6 класс', desc: 'Spotlight 6 — Чтение, письмо', color: '#00CEC9' },
  { grade: 7, label: '7 класс', desc: 'Spotlight 7 — Сложная грамматика', color: '#00B894' },
  { grade: 8, label: '8 класс', desc: 'Spotlight 8 — Тексты, эссе', color: '#FDCB6E' },
];

export default function GradeSelectPage() {
  const navigate = useNavigate();
  const setGrade = useSettingsStore((s) => s.setGrade);

  const handleSelect = (grade: Grade) => {
    setGrade(grade);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FF] p-8">
      <motion.h1
        className="text-4xl font-display text-primary mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        VladEnglish
      </motion.h1>
      <p className="text-gray-500 mb-10 text-lg">Выбери свой класс</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-3xl">
        {GRADES.map((g, i) => (
          <motion.button
            key={g.grade}
            onClick={() => handleSelect(g.grade)}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ backgroundColor: g.color }}
            >
              {g.grade}
            </div>
            <span className="font-bold text-lg">{g.label}</span>
            <span className="text-xs text-gray-400 text-center">{g.desc}</span>
          </motion.button>
        ))}
      </div>

      <p className="mt-8 text-sm text-gray-400">
        Класс можно изменить в любой момент в настройках
      </p>
    </div>
  );
}
