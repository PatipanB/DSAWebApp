import { cn } from '@/utils/classNames';
import type { ArraySnapshot, ArrayPointer } from '@/types/snapshots';

const POINTER_COLOR: Record<ArrayPointer['color'], string> = {
  cyan:  'text-accent-secondary border-accent-secondary',
  amber: 'text-accent-primary  border-accent-primary',
  rose:  'text-status-danger   border-status-danger',
};

const CELL_HIGHLIGHT: Record<ArrayPointer['color'], string> = {
  cyan:  'ring-2 ring-accent-secondary bg-accent-secondary/10',
  amber: 'ring-2 ring-accent-primary  bg-accent-primary/10',
  rose:  'ring-2 ring-status-danger   bg-status-danger/10',
};

interface Props {
  snapshot: ArraySnapshot | null;
}

export function ArrayVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { values, pointers, window: win } = snapshot;

  const ptrAt = new Map<number, ArrayPointer>();
  for (const p of pointers) {
    if (!ptrAt.has(p.index)) ptrAt.set(p.index, p);
  }

  const inWindow = (i: number) =>
    win !== undefined && i >= win.start && i <= win.end;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Pointer labels above cells */}
      <div className="flex gap-2">
        {values.map((_, i) => {
          const ptr = ptrAt.get(i);
          return (
            <div key={i} className="w-12 flex flex-col items-center">
              {ptr ? (
                <span className={cn('text-xs font-mono font-bold', POINTER_COLOR[ptr.color])}>
                  {ptr.name}
                </span>
              ) : (
                <span className="text-xs invisible">_</span>
              )}
              {ptr && (
                <div
                  className={cn(
                    'w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-current',
                    POINTER_COLOR[ptr.color].split(' ')[0],
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Cells */}
      <div className="flex gap-2">
        {values.map((v, i) => {
          const ptr = ptrAt.get(i);
          const windowed = inWindow(i);
          return (
            <div
              key={i}
              data-testid={`cell-${i}`}
              data-window={windowed ? 'true' : undefined}
              className={cn(
                'w-12 h-12 flex items-center justify-center text-lg font-mono font-semibold rounded-lg border transition',
                'bg-bg-elevated text-text-primary border-border-subtle',
                windowed && !ptr && 'bg-accent-secondary/10 border-accent-secondary',
                ptr && CELL_HIGHLIGHT[ptr.color],
              )}
            >
              {v}
            </div>
          );
        })}
      </div>

      {/* Index labels below cells */}
      <div className="flex gap-2">
        {values.map((_, i) => (
          <div key={i} className="w-12 text-center text-xs font-mono text-text-muted">
            {i}
          </div>
        ))}
      </div>

      {snapshot.sum !== undefined && (
        <div className="text-sm font-mono text-text-secondary">
          sum = <span className="text-accent-primary font-bold">{snapshot.sum}</span>
          {snapshot.result !== undefined && (
            <span className="ml-4">
              max = <span className="text-status-success font-bold">{String(snapshot.result)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
