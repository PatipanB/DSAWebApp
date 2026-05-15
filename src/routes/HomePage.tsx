import { Link } from 'react-router-dom';
import { TOPICS } from '@/data/topics';

export function HomePage() {
  return (
    <section className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-text-primary">Visualize a data structure.</h1>
        <p className="mt-2 text-text-muted max-w-2xl">
          Nine topics. Step-through animations, your own input, the executing code highlighted in real time,
          Big-O at a glance, and curated NeetCode problems for each pattern.
        </p>
      </div>
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
            </div>
            <p className="text-sm text-text-secondary">{t.longDescription}</p>
            <span className="mt-auto text-sm font-mono text-accent-primary group-hover:translate-x-0.5 transition">Open →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
