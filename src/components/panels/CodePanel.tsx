import { Highlight } from 'prism-react-renderer';
import { cn } from '@/utils/classNames';
import { CODE_SNIPPETS } from '@/data/codeSnippets';
import { usePrefsStore } from '@/store/prefsStore';
import { Tabs } from '@/components/primitives/Tabs';
import type { AlgorithmId } from '@/types/algorithm';

const DSA_THEME = {
  plain: { backgroundColor: 'transparent', color: '#cbd5e1' },
  styles: [
    { types: ['keyword', 'operator', 'builtin'], style: { color: '#fbbf24' } },
    { types: ['string', 'char', 'attr-value'], style: { color: '#34d399' } },
    { types: ['number', 'boolean'], style: { color: '#fb923c' } },
    { types: ['comment'], style: { color: '#64748b', fontStyle: 'italic' as const } },
    { types: ['function', 'class-name', 'tag'], style: { color: '#22d3ee' } },
    { types: ['punctuation', 'plain'], style: { color: '#94a3b8' } },
  ],
};

const LANG_OPTIONS = [
  { value: 'ts' as const, label: 'TS' },
  { value: 'py' as const, label: 'Python' },
];

interface Props {
  algorithmId: AlgorithmId;
  currentLine: number;
}

export function CodePanel({ algorithmId, currentLine }: Props) {
  const snippet = CODE_SNIPPETS[algorithmId];
  const codeLanguage = usePrefsStore((s) => s.codeLanguage);
  const setCodeLanguage = usePrefsStore((s) => s.setCodeLanguage);

  if (!snippet) return null;

  const lines = codeLanguage === 'ts' ? snippet.ts : snippet.py;
  const code = lines.join('\n');
  const highlightLanguage = codeLanguage === 'ts' ? 'typescript' : 'python';

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Code</p>
        <Tabs value={codeLanguage} onChange={setCodeLanguage} options={LANG_OPTIONS} />
      </div>

      <div className="overflow-x-auto">
        <Highlight theme={DSA_THEME} code={code} language={highlightLanguage}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="p-4 text-sm font-mono leading-6 m-0">
              {tokens.map((line, lineIdx) => {
                const isActive = lineIdx === currentLine - 1;
                return (
                  <div
                    key={lineIdx}
                    data-active-line={isActive ? 'true' : undefined}
                    {...getLineProps({ line })}
                    className={cn(
                      'flex transition-colors -ml-4 pl-[14px] border-l-2',
                      isActive
                        ? 'bg-accent-primary/10 border-accent-primary'
                        : 'border-transparent',
                    )}
                  >
                    <span className="w-7 text-right pr-4 select-none text-text-muted shrink-0">
                      {lineIdx + 1}
                    </span>
                    <span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
