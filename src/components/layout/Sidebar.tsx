import { TopicNav } from './TopicNav';

export function Sidebar() {
  return (
    <aside className="h-full bg-bg-surface border-r border-border-subtle overflow-y-auto">
      <h2 className="px-6 pt-6 pb-2 text-xs font-mono uppercase tracking-wider text-text-muted">Topics</h2>
      <TopicNav />
    </aside>
  );
}
