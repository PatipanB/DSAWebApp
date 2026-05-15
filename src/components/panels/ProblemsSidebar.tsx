import { NEETCODE_PROBLEMS } from '@/data/neetcodeProblems';
import type { TopicId } from '@/types/topic';

interface Props {
  topicId: TopicId;
}

export function ProblemsSidebar({ topicId }: Props) {
  const problems = NEETCODE_PROBLEMS[topicId];
  if (!problems || problems.length === 0) return null;

  const beginners = problems.filter((p) => p.difficulty === 'beginner');
  const advanced = problems.filter((p) => p.difficulty === 'advanced');

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-text-primary">NeetCode Problems</h2>

      {beginners.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-status-success uppercase tracking-widest mb-2">
            Beginner
          </h3>
          <ul className="flex flex-col gap-1.5">
            {beginners.map((p) => (
              <li key={p.slug}>
                <a
                  href={`https://neetcode.io/problems/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.hint}
                  className="block text-sm text-text-secondary hover:text-accent-primary transition truncate"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {advanced.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-status-warn uppercase tracking-widest mb-2">
            Advanced
          </h3>
          <ul className="flex flex-col gap-1.5">
            {advanced.map((p) => (
              <li key={p.slug}>
                <a
                  href={`https://neetcode.io/problems/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.hint}
                  className="block text-sm text-text-secondary hover:text-accent-primary transition truncate"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
