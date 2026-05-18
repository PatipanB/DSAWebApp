import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { usePrefsStore } from '@/store/prefsStore';
import type { TopicId } from '@/types/topic';

export function TopicHeader({ topicId }: { topicId: TopicId }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  const visitedTopics = usePrefsStore((s) => s.visitedTopics);
  if (!topic) return null;

  const prereqs = topic.prereqs ?? [];
  const allPrereqsMet = prereqs.length > 0 && prereqs.every((id) => visitedTopics.includes(id));
  const missingPrereqs = prereqs.filter((id) => !visitedTopics.includes(id));

  return (
    <header className="flex flex-wrap items-baseline gap-3 px-8 py-6 border-b border-border-subtle">
      <span className="font-mono text-text-muted text-sm">#{String(topic.number).padStart(2, '0')}</span>
      <span className="text-3xl">{topic.emoji}</span>
      <h1 className="text-2xl font-semibold text-text-primary">{topic.title}</h1>
      <p className="text-sm text-text-muted ml-auto max-w-md text-right">{topic.shortDescription}</p>

      {allPrereqsMet && (
        <span className="w-full text-xs font-mono text-status-success">
          ✓ Prerequisites complete
        </span>
      )}
      {missingPrereqs.length > 0 && (
        <span className="w-full text-xs font-mono text-status-warn flex items-center gap-2 flex-wrap">
          ⚠ Recommended first:{' '}
          {missingPrereqs.map((id) => {
            const t = TOPICS.find((x) => x.id === id);
            if (!t) return null;
            return (
              <Link
                key={id}
                to={t.path}
                className="underline hover:text-accent-primary transition"
              >
                {t.title}
              </Link>
            );
          })
          }
        </span>
      )}
    </header>
  );
}
