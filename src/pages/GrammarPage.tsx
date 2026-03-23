import { GRAMMAR_EXPLANATIONS } from '../content/ruExplanations';
import { GrammarRuCard } from '../components/common/RuExplanation';
import { useSettingsStore } from '../store/useSettingsStore';

export default function GrammarPage() {
  const grade = useSettingsStore((s) => s.grade) ?? 2;

  // Filter grammar topics by grade level
  const topics = GRAMMAR_EXPLANATIONS.filter((g) => {
    const [min, max] = g.level.split('-').map(Number);
    return grade >= min && grade <= (max || min + 1);
  });

  return (
    <div>
      <h2 className="text-3xl font-display text-primary mb-2">Грамматика</h2>
      <p className="text-gray-400 mb-6">Правила с объяснениями на русском — нажми, чтобы раскрыть</p>

      {topics.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
          Грамматика для {grade} класса скоро появится!
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {topics.map((topic) => (
            <GrammarRuCard key={topic.id} data={topic} />
          ))}
        </div>
      )}
    </div>
  );
}
