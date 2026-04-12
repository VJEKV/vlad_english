import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import type { Grade } from '../types';
import type { TTSSpeed, SyllableDelay } from '../store/useSettingsStore';
import { useTTS } from '../hooks/useTTS';
import { Key, Eye, EyeOff, Check } from 'lucide-react';

const GRADES: Grade[] = [2, 3, 4, 5, 6, 7, 8];

const SPEED_OPTIONS: { value: TTSSpeed; label: string; desc: string }[] = [
  { value: 'slow', label: 'Медленно', desc: 'Для начинающих — каждый звук чётко' },
  { value: 'normal', label: 'Нормально', desc: 'Для тех кто уже читает' },
  { value: 'fast', label: 'Быстро', desc: 'Естественная скорость речи' },
];

const SYLLABLE_DELAYS: { value: SyllableDelay; label: string }[] = [
  { value: 400, label: 'Быстро (0.4с)' },
  { value: 600, label: 'Нормально (0.6с)' },
  { value: 800, label: 'Медленно (0.8с)' },
  { value: 1000, label: 'Очень медленно (1с)' },
];

export default function SettingsPage() {
  const { grade, volume, ttsSpeed, syllableDelay, setGrade, setVolume, setTTSSpeed, setSyllableDelay } = useSettingsStore();
  const { speakWord, speakSentence } = useTTS();

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-6">Настройки</h2>

      <div className="max-w-lg space-y-6">
        {/* Grade */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="font-bold text-sm text-gray-500 mb-3 block">Класс</label>
          <div className="flex gap-2">
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`w-12 h-12 rounded-xl font-bold text-lg transition-colors ${
                  grade === g
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* TTS Speed */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="font-bold text-sm text-gray-500 mb-3 block">Скорость озвучки</label>
          <div className="space-y-2">
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTTSSpeed(opt.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                  ttsSpeed === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`w-3 h-3 rounded-full shrink-0 ${ttsSpeed === opt.value ? 'bg-white' : 'bg-gray-300'}`} />
                <div>
                  <p className="font-bold">{opt.label}</p>
                  <p className={`text-xs ${ttsSpeed === opt.value ? 'text-white/70' : 'text-gray-400'}`}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => speakWord('beautiful')} className="text-sm text-primary hover:underline">Тест: слово</button>
            <button onClick={() => speakSentence('The cat is sitting on the mat.')} className="text-sm text-primary hover:underline">Тест: предложение</button>
          </div>
        </div>

        {/* Syllable delay */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="font-bold text-sm text-gray-500 mb-3 block">Задержка между слогами</label>
          <div className="flex gap-2">
            {SYLLABLE_DELAYS.map((opt) => (
              <button key={opt.value} onClick={() => setSyllableDelay(opt.value)}
                className={`flex-1 p-2 rounded-xl text-xs font-bold transition-colors ${
                  syllableDelay === opt.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>{opt.label}</button>
            ))}
          </div>
        </div>

        {/* TTS Test */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="font-bold text-sm text-gray-500 mb-3 block">Тест озвучки</label>
          <div className="flex gap-2">
            <button onClick={() => speakWord('beautiful')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20">Слово</button>
            <button onClick={() => speakSentence('The cat is sitting on the table.')} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20">Предложение</button>
            <TTSTestButton />
          </div>
        </div>

        {/* Volume */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="font-bold text-sm text-gray-500 mb-3 block">
            Громкость: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* AI API Key */}
        <AIKeySettings />

        <div className="text-center text-sm text-gray-300 mt-8">
          VladEnglish v3.2.0
        </div>
      </div>
    </div>
  );
}

function APIKeyField({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    window.electronAPI?.apikey?.get(name).then((k: string) => setSavedKey(k || ''));
  }, [name]);

  const handleSave = async () => {
    if (!keyInput.trim()) return;
    const ok = await window.electronAPI?.apikey?.set(name, keyInput.trim());
    if (ok) {
      setSaved(true);
      setSavedKey(keyInput.slice(0, 6) + '...' + keyInput.slice(-4));
      setKeyInput('');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="mb-4">
      <label className="font-bold text-xs text-gray-500 mb-2 block">{label}</label>
      {savedKey && (
        <p className="text-xs text-success mb-2 flex items-center gap-1">
          <Check size={12} /> {savedKey}
        </p>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input type={showKey ? 'text' : 'password'} value={keyInput} onChange={(e) => setKeyInput(e.target.value)}
            placeholder={placeholder} className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-primary pr-8" />
          <button onClick={() => setShowKey(!showKey)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <button onClick={handleSave} disabled={!keyInput.trim()}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-40">
          {saved ? '✓' : 'OK'}
        </button>
      </div>
    </div>
  );
}

function TTSTestButton() {
  const [result, setResult] = useState<string>('');
  const [testing, setTesting] = useState(false);

  const runTest = async () => {
    setTesting(true);
    setResult('Проверяю...');
    try {
      const r = await window.electronAPI?.tts?.test();
      if (r) {
        const parts = [];
        if (r.openai) parts.push('OpenAI Nova ✅');
        else parts.push('OpenAI ❌');
        if (r.edgeTTS) parts.push('Edge-TTS ✅');
        else parts.push('Edge-TTS ❌');
        setResult(parts.join(' | '));
      } else {
        setResult('Web Speech API only');
      }
    } catch {
      setResult('Ошибка теста');
    }
    setTesting(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={runTest} disabled={testing}
        className="px-4 py-2 bg-warning/10 text-warning rounded-xl text-xs font-bold hover:bg-warning/20 disabled:opacity-50">
        {testing ? '...' : 'Тест движков'}
      </button>
      {result && <span className="text-xs text-gray-500">{result}</span>}
    </div>
  );
}

function AIKeySettings() {
  if (!window.electronAPI?.apikey) return null;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <label className="font-bold text-sm text-gray-500 mb-4 flex items-center gap-2">
        <Key size={16} /> API Ключи
      </label>
      <APIKeyField name="openai" label="OpenAI (озвучка + TTS)" placeholder="sk-proj-..." />
      <APIKeyField name="deepseek" label="DeepSeek (AI помощник)" placeholder="sk-..." />
      <p className="text-xs text-gray-400">Ключи хранятся только на этом компьютере</p>
    </div>
  );
}
