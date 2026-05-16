import type { ArrayOpsSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: ArrayOpsSnapshot | null;
}

export function ArrayOpsVisualizer({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No data
      </div>
    );
  }

  const { values, operation, activeIndex, shiftStart, shiftEnd, cost } = snapshot;
  const hasShift = shiftStart !== undefined && shiftEnd !== undefined;

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {/* Badges row */}
      <div className="flex items-center gap-3">
        <span
          data-testid="op-badge"
          className="px-3 py-1 rounded-full border text-sm font-mono font-medium border-border-strong text-text-primary bg-bg-elevated"
        >
          {operation.charAt(0).toUpperCase() + operation.slice(1)}
        </span>
        {cost && (
          <span
            data-testid="cost-badge"
            className={`px-3 py-1 rounded-full border text-sm font-mono font-medium ${
              cost === 'O(1)'
                ? 'text-status-success border-status-success'
                : 'text-status-warn border-status-warn'
            }`}
          >
            {cost}
          </span>
        )}
      </div>

      {/* Array cells */}
      <div className="flex items-end gap-2">
        {values.map((val, i) => {
          const isActive = activeIndex === i;
          const isShift = hasShift && i >= shiftStart! && i <= shiftEnd!;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                data-testid={`ops-cell-${i}`}
                data-active={isActive ? 'true' : undefined}
                data-shift={isShift ? 'true' : undefined}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                    : isShift
                      ? 'bg-status-warn/20 border-status-warn text-status-warn'
                      : 'bg-bg-elevated border-border-subtle text-text-primary'
                }`}
              >
                {val}
              </div>
              <span
                data-testid={`ops-index-${i}`}
                className="text-xs font-mono text-text-muted"
              >
                {i}
              </span>
            </div>
          );
        })}
      </div>

      {/* Shift annotation */}
      {hasShift && (
        <p data-testid="shift-annotation" className="text-xs font-mono text-status-warn">
          {operation === 'insert'
            ? `indices ${shiftStart}–${shiftEnd} shift right →`
            : `← indices ${shiftStart}–${shiftEnd} shift left`}
        </p>
      )}
    </div>
  );
}
