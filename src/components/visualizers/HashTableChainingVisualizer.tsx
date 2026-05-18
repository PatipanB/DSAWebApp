import type { ChainingSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: ChainingSnapshot | null;
}

export function HashTableChainingVisualizer({ snapshot }: Props) {
  if (snapshot == null) {
    return <div data-testid="hash-chaining-placeholder" />;
  }

  const { buckets, inserting, collisionAt } = snapshot;

  return (
    <div className="p-2 bg-bg-surface rounded-xl w-full">
      {buckets.map((entries, i) => (
        <div
          key={i}
          data-testid={`chain-bucket-${i}`}
          className="flex items-center gap-2 mb-1"
        >
          <span
            className={`w-8 text-right text-xs font-mono shrink-0 ${
              collisionAt === i ? 'text-status-warn font-bold' : 'text-text-muted'
            }`}
          >
            {i}
          </span>
          <div className="flex gap-1 flex-wrap">
            {entries.length === 0 ? (
              <span className="text-xs text-text-muted font-mono">—</span>
            ) : (
              entries.map((entry, j) => {
                const isInserting = inserting != null && entry.key === inserting.key;
                return (
                  <div
                    key={j}
                    data-testid={`chain-entry-${i}-${j}`}
                    className={`px-2 py-1 rounded text-xs font-mono border ${
                      isInserting
                        ? 'bg-accent-primary text-bg-base border-accent-primary'
                        : 'bg-bg-elevated border-border-subtle text-text-primary'
                    }`}
                  >
                    {entry.key}: {entry.value}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
