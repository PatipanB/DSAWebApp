import { cn } from '@/utils/classNames';
import type { StackSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: StackSnapshot | null;
}

export function StackVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { items, inputTokens, inputCursor, matched, invalid, result } = snapshot;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full" data-invalid={invalid ? 'true' : undefined}>
      {/* Input tokens row */}
      {inputTokens && inputTokens.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Input</p>
          <div className="flex gap-1">
            {inputTokens.map((tok, i) => (
              <div
                key={i}
                data-active={i === inputCursor ? 'true' : undefined}
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded font-mono text-sm border',
                  i === inputCursor
                    ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                    : i < (inputCursor ?? 0)
                    ? 'bg-status-success/10 border-status-success/30 text-text-muted'
                    : 'bg-bg-elevated border-border-subtle text-text-secondary',
                )}
              >
                {tok}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stack */}
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Stack</p>
        <div
          className={cn(
            'flex flex-col-reverse gap-1 p-2 min-h-[48px] min-w-[80px] rounded-lg border',
            invalid ? 'border-status-danger bg-status-danger/5' : 'border-border-subtle bg-bg-surface',
          )}
        >
          {items.length === 0 ? (
            <span className="text-xs text-text-muted font-mono self-center py-1">empty</span>
          ) : (
            items.map((item, idx) => {
              const isTop = idx === items.length - 1;
              const isMatched =
                matched &&
                (item.value === matched.open || item.value === matched.close);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'px-3 py-1.5 rounded font-mono text-sm border text-center min-w-[48px]',
                    isMatched
                      ? 'bg-status-success/20 border-status-success text-status-success'
                      : invalid && isTop
                      ? 'bg-status-danger/20 border-status-danger text-status-danger'
                      : isTop
                      ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                      : 'bg-bg-elevated border-border-subtle text-text-primary',
                  )}
                >
                  {String(item.value)}
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <p className="text-xs font-mono text-text-muted">← top</p>
        )}
      </div>

      {/* Result array (for monotonic stack) */}
      {result && result.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Next Greater</p>
          <div className="flex gap-1">
            {result.map((val, i) => (
              <div
                key={i}
                className={cn(
                  'w-10 h-9 flex items-center justify-center rounded font-mono text-sm border',
                  val === -1
                    ? 'bg-bg-elevated border-border-subtle text-text-muted'
                    : 'bg-status-success/15 border-status-success text-status-success',
                )}
              >
                {val === -1 ? '-1' : String(val)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
