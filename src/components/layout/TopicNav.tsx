import { NavLink } from 'react-router-dom';
import { TOPICS } from '@/data/topics';
import { cn } from '@/utils/classNames';
import { usePrefsStore } from '@/store/prefsStore';

export function TopicNav() {
  const visitedTopics = usePrefsStore((s) => s.visitedTopics);

  return (
    <nav aria-label="Topics" className="flex flex-col gap-0.5 p-3">
      {TOPICS.map((t) => (
        <NavLink
          key={t.id}
          to={t.path}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 h-10 rounded-lg border-l-2 transition',
              isActive
                ? 'bg-bg-elevated text-accent-primary border-accent-primary'
                : 'text-text-secondary border-transparent hover:bg-bg-elevated hover:text-text-primary',
            )
          }
        >
          <span className="font-mono text-xs text-text-muted w-6">#{String(t.number).padStart(2, '0')}</span>
          <span className="text-base">{t.emoji}</span>
          <span className="text-sm font-medium">{t.title}</span>
          {visitedTopics.includes(t.id) && (
            <span className="ml-auto w-2 h-2 rounded-full bg-status-success" />
          )}
        </NavLink>
      ))}
    </nav>
  );
}
