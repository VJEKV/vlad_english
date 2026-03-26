import { useTTS } from '../../hooks/useTTS';
import { getSyllables } from '../../content/syllables';
import { lookupWord } from './WordCard';

// Render text with syllable dots and clickable words
// "Chuckles" → "Chuck·les" (clickable, shows card + speaks word)
export default function SyllableText({ text, className }: { text: string; className?: string }) {
  const { speakWord } = useTTS();

  const tokens = text.split(/(\s+)/);

  return (
    <span className={className}>
      {tokens.map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;

        const clean = token.replace(/[.,!?;:'"()]/g, '');
        const punct = token.replace(clean, '');
        const syllables = getSyllables(clean);
        const info = lookupWord(clean);

        return (
          <span key={i} className="inline-block cursor-pointer group" onClick={() => speakWord(clean)}>
            {syllables.map((syl, si) => (
              <span key={si}>
                <span className="hover:text-primary hover:bg-primary/10 rounded px-0.5 transition-colors">
                  {syl}
                </span>
                {si < syllables.length - 1 && (
                  <span className="text-gray-300 mx-px">·</span>
                )}
              </span>
            ))}
            {punct && <span>{punct}</span>}
            <span> </span>
          </span>
        );
      })}
    </span>
  );
}
