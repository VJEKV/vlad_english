import { NavLink } from 'react-router-dom';
import {
  Home, BookOpen, Headphones, PenTool, Gamepad2, Trophy,
  GraduationCap, Languages, Settings, RotateCcw,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Главная', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/phonics', icon: Languages, label: 'Phonics', grades: [2, 3] },
  { to: '/spotlight', icon: BookOpen, label: 'Spotlight', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/grammar', icon: GraduationCap, label: 'Грамматика', grades: [3, 4, 5, 6, 7, 8] },
  { to: '/reading', icon: BookOpen, label: 'Чтение', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/listening', icon: Headphones, label: 'Аудирование', grades: [3, 4, 5, 6, 7, 8] },
  { to: '/writing', icon: PenTool, label: 'Письмо', grades: [4, 5, 6, 7, 8] },
  { to: '/review', icon: RotateCcw, label: 'Повторение', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/games', icon: Gamepad2, label: 'Игры', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/achievements', icon: Trophy, label: 'Награды', grades: [2, 3, 4, 5, 6, 7, 8] },
  { to: '/settings', icon: Settings, label: 'Настройки', grades: [2, 3, 4, 5, 6, 7, 8] },
];

export default function Sidebar() {
  const grade = useSettingsStore((s) => s.grade) ?? 2;

  const visibleItems = NAV_ITEMS.filter((item) => item.grades.includes(grade));

  return (
    <aside className="w-56 bg-[#2D3436] text-white flex flex-col py-4 shrink-0">
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-white/10 ${
              isActive ? 'bg-primary text-white' : 'text-gray-300'
            }`
          }
        >
          <item.icon size={20} />
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
