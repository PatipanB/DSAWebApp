import type { StringWindowSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: StringWindowSnapshot | null;
}

export function StringVisualizer({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-sm">
        No data
      </div>
    );
  }

  const { chars, left, right, windowSet, maxLen, phase } = snapshot;

  const inWindow = (i: number): boolean => {
    if (phase === 'init') return false;
    if (phase === 'shrink') return i >= left && i < right;
    return i >= left && i <= right; // expand or done
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 w-full">
      {/* Phase label */}
      <span
        data-testid="phase-label"
        className="text-xs font-mono uppercase tracking-widest text-text-muted"
      >
        {phase.charAt(0).toUpperCase() + phase.slice(1)}
      </span>

      {/* Character cells */}
      <div className="flex items-end gap-2">
        {chars.map((ch, i) => {
          const isLeft = i === left;
          const isRight = i === right;
          const inWin = inWindow(i);

          let cellClass = 'bg-bg-elevated border-border-subtle text-text-primary';
          if (isLeft && isRight) {
            cellClass = 'bg-status-warn/20 border-status-warn text-status-warn';
          } else if (isLeft) {
            cellClass = 'bg-accent-secondary/20 border-accent-secondary text-accent-secondary';
          } else if (isRight) {
            cellClass = 'bg-accent-primary/20 border-accent-primary text-accent-primary';
          } else if (inWin) {
            cellClass = 'bg-accent-primary/10 border-accent-primary/40 text-text-primary';
          }

          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                data-testid={`char-cell-${i}`}
                data-in-window={inWin ? 'true' : undefined}
                data-left={isLeft ? 'true' : undefined}
                data-right={isRight ? 'true' : undefined}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono text-lg font-semibold transition-colors ${cellClass}`}
              >
                {ch}
              </div>
              <span className="text-xs font-mono text-text-muted">
                {isLeft && isRight ? 'L=R' : isLeft ? 'L' : isRight ? 'R' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {/* Window set */}
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-xs font-mono text-text-muted">Window:</span>
        <div data-testid="window-set" className="flex gap-1 flex-wrap">
          {windowSet.map((ch, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded font-mono text-sm bg-accent-primary/10 text-accent-primary border border-accent-primary/30"
            >
              {ch}
            </span>
          ))}
        </div>
      </div>

      {/* Max length */}
      <span data-testid="max-len" className="text-sm font-mono text-text-primary">
        maxLen: {maxLen}
      </span>
    </div>
  );
}
