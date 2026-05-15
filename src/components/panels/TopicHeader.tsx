import { TOPICS } from '@/data/topics';
import type { TopicId } from '@/types/topic';

export function TopicHeader({ topicId }: { topicId: TopicId }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  if (!topic) return null;
  return (
    <header className="flex items-baseline gap-3 px-8 py-6 border-b border-border-subtle">
      <span className="font-mono text-text-muted text-sm">#{String(topic.number).padStart(2, '0')}</span>
      <span className="text-3xl">{topic.emoji}</span>
      <h1 className="text-2xl font-semibold text-text-primary">{topic.title}</h1>
      <p className="text-sm text-text-muted ml-auto max-w-md text-right">{topic.shortDescription}</p>
    </header>
  );
}
