import { cn } from '@/utils/classNames';
import type { QueueSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: QueueSnapshot | null;
}

export function QueueVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { items, inputValues, inputCursor, phase } = snapshot;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      {/* Input row */}
      {inputValues && inputValues.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">
            {phase === 'dequeue' ? 'Dequeued' : 'Input'}
          </p>
          <div className="flex gap-1">
            {inputValues.map((val, i) => {
              const isActive = phase === 'enqueue' && i === inputCursor;
              const isDone =
                phase === 'enqueue'
                  ? i < (inputCursor ?? 0)
                  : i <= (inputCursor ?? -1);
              return (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-9 flex items-center justify-center rounded font-mono text-sm border',
                    isActive
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                      : isDone
                      ? 'bg-status-success/10 border-status-success/30 text-text-muted'
                      : 'bg-bg-elevated border-border-subtle text-text-secondary',
                  )}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Queue visualization */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent-secondary">front →</span>
          <div className="flex gap-1 min-h-[48px] items-center px-2 py-1 rounded-lg border border-border-subtle bg-bg-surface">
            {items.length === 0 ? (
              <span className="text-xs text-text-muted font-mono px-4">empty</span>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  data-testid={`queue-item-${idx}`}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded font-mono text-sm border',
                    idx === 0
                      ? 'bg-accent-secondary/15 border-accent-secondary text-accent-secondary'
                      : idx === items.length - 1
                      ? 'bg-accent-primary/10 border-accent-primary/50 text-accent-primary'
                      : 'bg-bg-elevated border-border-subtle text-text-primary',
                  )}
                >
                  {String(item.value)}
                </div>
              ))
            )}
          </div>
          <span className="text-xs font-mono text-accent-primary">← back</span>
        </div>
        <div className="flex gap-2 text-xs font-mono text-text-muted">
          <span>dequeue ← front</span>
          <span>·</span>
          <span>back → enqueue</span>
        </div>
      </div>
    </div>
  );
}
