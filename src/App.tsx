import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSettingsStore } from './store/useSettingsStore';
import { useProgressStore } from './store/useProgressStore';
import AppShell from './components/layout/AppShell';
import GradeSelectPage from './pages/GradeSelectPage';
import HomePage from './pages/HomePage';
import PhonicsPage from './pages/PhonicsPage';
import SpotlightPage from './pages/SpotlightPage';
import GrammarPage from './pages/GrammarPage';
import ReadingPage from './pages/ReadingPage';
import ListeningPage from './pages/ListeningPage';
import WritingPage from './pages/WritingPage';
import GamesPage from './pages/GamesPage';
import AchievementsPage from './pages/AchievementsPage';
import ReviewPage from './pages/ReviewPage';
import SettingsPage from './pages/SettingsPage';
import AIChat from './components/common/AIChat';
import { useWordStore } from './store/useWordStore';

export default function App() {
  const grade = useSettingsStore((s) => s.grade);
  const initialized = useSettingsStore((s) => s.initialized);
  const initSettings = useSettingsStore((s) => s.init);
  const initProgress = useProgressStore((s) => s.init);
  const initWords = useWordStore((s) => s.init);

  useEffect(() => {
    initSettings();
    initProgress();
    initWords();
  }, [initSettings, initProgress, initWords]);

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-2xl font-display text-primary animate-pulse">VladEnglish</div>
      </div>
    );
  }

  // No grade selected — show grade selection
  if (grade === null) {
    return <GradeSelectPage />;
  }

  return (
    <>
    <AIChat />
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/phonics" element={<PhonicsPage />} />
        <Route path="/spotlight" element={<SpotlightPage />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/review" element={<ReviewPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="/grade-select" element={<GradeSelectPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
