import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { usePrefsStore } from '@/store/prefsStore';
import { cn } from '@/utils/classNames';

export function HomePage() {
  const visitedTopics = usePrefsStore((s) => s.visitedTopics);
  const learningMode = usePrefsStore((s) => s.learningMode);
  const setLearningMode = usePrefsStore((s) => s.setLearningMode);

  const firstUnvisitedId = TOPICS.find(t => !visitedTopics.includes(t.id))?.id;

  return (
    <section className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary">Visualize a data structure.</h1>
        <p className="mt-2 text-text-muted max-w-2xl">
          Nine topics. Step-through animations, your own input, the executing code highlighted in real time,
          Big-O at a glance, and curated NeetCode problems for each pattern.
        </p>
      </div>

      <div className="flex gap-2 mb-8">
        <button onClick={() => setLearningMode(false)}
          className={cn('px-4 py-2 rounded-lg text-sm font-mono border transition',
            !learningMode ? 'bg-accent-primary text-bg-base border-accent-primary'
                          : 'bg-bg-elevated text-text-secondary border-border-strong hover:text-text-primary')}>
          Explore
        </button>
        <button onClick={() => setLearningMode(true)}
          className={cn('px-4 py-2 rounded-lg text-sm font-mono border transition',
            learningMode  ? 'bg-accent-primary text-bg-base border-accent-primary'
                          : 'bg-bg-elevated text-text-secondary border-border-strong hover:text-text-primary')}>
          Learn
        </button>
      </div>

      {!learningMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {TOPICS.map((t) => (
            <Link
              key={t.id}
              to={t.path}
              aria-label={`Open ${t.title}`}
              className="group bg-bg-surface border border-border-subtle rounded-2xl p-6 hover:border-accent-primary transition flex flex-col gap-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-text-muted text-sm">#{String(t.number).padStart(2, '0')}</span>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-lg font-semibold text-text-primary">{t.title}</span>
                {visitedTopics.includes(t.id) && (
                  <span className="ml-auto text-status-success text-xs font-mono">✓</span>
                )}
              </div>
              <p className="text-sm text-text-secondary">{t.longDescription}</p>
              <span className="mt-auto text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">Open →</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {TOPICS.map((t) => {
            const isVisited = visitedTopics.includes(t.id);
            const isFirstUnvisited = t.id === firstUnvisitedId;
            return (
              <Link to={t.path} key={t.id}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-2xl border transition group',
                  isFirstUnvisited
                    ? 'border-accent-primary bg-accent-primary/5 hover:bg-accent-primary/10'
                    : 'border-border-subtle bg-bg-surface hover:border-accent-primary',
                )}
              >
                <span className="font-mono text-text-muted text-sm w-8 shrink-0">
                  #{String(t.number).padStart(2, '0')}
                </span>

                <span className="text-2xl shrink-0">{t.emoji}</span>

                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-text-primary">{t.title}</span>
                    {isVisited && <span className="text-status-success text-xs font-mono">✓</span>}
                    {isFirstUnvisited && <span className="text-accent-primary text-xs font-mono">← Start here</span>}
                  </div>
                  <span className="text-sm text-text-secondary">{t.shortDescription}</span>
                  {t.prereqs && t.prereqs.length > 0 && (
                    <span className="text-xs text-text-muted font-mono mt-0.5">
                      Builds on: {t.prereqs.map(id => TOPICS.find(x => x.id === id)?.title).filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {t.estimatedMinutes && (
                    <span className="text-xs text-text-muted font-mono">~{t.estimatedMinutes} min</span>
                  )}
                  <span className="text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
