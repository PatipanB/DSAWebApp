import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { usePrefsStore } from '@/store/prefsStore';
import { Tabs } from '@/components/primitives/Tabs';
import { cn } from '@/utils/classNames';

const MODE_OPTIONS = [
  { value: 'guided' as const, label: 'Guided path' },
  { value: 'all' as const, label: 'All topics' },
];

type Mode = (typeof MODE_OPTIONS)[number]['value'];

export function HomePage() {
  const visitedTopics = usePrefsStore((s) => s.visitedTopics);
  const learningMode = usePrefsStore((s) => s.learningMode);
  const setLearningMode = usePrefsStore((s) => s.setLearningMode);

  const firstUnvisitedId = TOPICS.find((t) => !visitedTopics.includes(t.id))?.id;
  const resumeTopic = TOPICS.find((t) => t.id === firstUnvisitedId);
  const showResume = visitedTopics.length > 0 && resumeTopic != null;

  const mode: Mode = learningMode ? 'guided' : 'all';
  const handleModeChange = (v: Mode) => setLearningMode(v === 'guided');

  return (
    <section className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Visualize a data structure.</h1>
        <p className="mt-2 text-text-muted max-w-2xl">
          Step through nine algorithms: one frame, one variable, one line of code at a time.
        </p>
      </div>

      {showResume && (
        <Link
          to={resumeTopic.path}
          aria-label={`Resume at ${resumeTopic.title}`}
          className="group mb-6 flex items-center justify-between gap-3 rounded-lg border border-accent-primary/30 bg-accent-primary/5 hover:bg-accent-primary/10 px-4 py-3 transition"
        >
          <span className="flex items-baseline gap-3 min-w-0">
            <span className="text-xs font-mono font-semibold text-accent-primary uppercase tracking-widest shrink-0">
              Resume
            </span>
            <span className="text-sm font-mono text-text-muted shrink-0">
              #{String(resumeTopic.number).padStart(2, '0')}
            </span>
            <span className="text-base text-text-primary truncate">{resumeTopic.title}</span>
          </span>
          <span className="text-accent-primary font-mono text-sm shrink-0 group-hover:translate-x-0.5 transition">
            →
          </span>
        </Link>
      )}

      {visitedTopics.length > 0 && (
        <div className="mb-8">
          <Tabs value={mode} onChange={handleModeChange} options={MODE_OPTIONS} />
        </div>
      )}

      {learningMode ? (
        <div className="flex flex-col gap-3">
          {TOPICS.map((t) => {
            const isVisited = visitedTopics.includes(t.id);
            const isFirstUnvisited = t.id === firstUnvisitedId && !showResume;
            return (
              <Link
                to={t.path}
                key={t.id}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-lg border transition group',
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
                    {isVisited && (
                      <span aria-label="visited" className="text-status-success text-sm font-mono">
                        ✓
                      </span>
                    )}
                    {isFirstUnvisited && (
                      <span className="text-accent-primary text-xs font-mono">← Start here</span>
                    )}
                  </div>
                  <span className="text-sm text-text-secondary">{t.shortDescription}</span>
                  {t.prereqs && t.prereqs.length > 0 && (
                    <span className="text-xs text-text-muted font-mono mt-0.5">
                      Builds on:{' '}
                      {t.prereqs
                        .map((id) => TOPICS.find((x) => x.id === id)?.title)
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {t.estimatedMinutes && (
                    <span className="text-xs text-text-muted font-mono">~{t.estimatedMinutes} min</span>
                  )}
                  <span className="text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {TOPICS.map((t) => (
            <Link
              key={t.id}
              to={t.path}
              aria-label={`Open ${t.title}`}
              className="group bg-bg-surface border border-border-subtle rounded-lg p-6 hover:border-accent-primary transition flex flex-col gap-3"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-text-muted text-sm">
                  #{String(t.number).padStart(2, '0')}
                </span>
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-lg font-semibold text-text-primary">{t.title}</span>
                {visitedTopics.includes(t.id) && (
                  <span aria-label="visited" className="ml-auto text-status-success text-sm font-mono">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary">{t.longDescription}</p>
              <span className="mt-auto text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">
                Open →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
