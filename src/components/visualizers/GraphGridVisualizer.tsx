import type { GridSnapshot, GridCell } from '@/types/snapshots';

interface Props {
  snapshot: GridSnapshot | null;
  onCellClick?: (row: number, col: number) => void;
}

function cellColor(cell: GridCell): string {
  switch (cell) {
    case 'open':     return 'bg-bg-elevated';
    case 'wall':     return 'bg-border-strong';
    case 'start':    return 'bg-accent-secondary';
    case 'end':      return 'bg-accent-primary';
    case 'visited':  return 'bg-status-success/30';
    case 'frontier': return 'bg-status-warn/50';
    case 'path':     return 'bg-status-info/40';
    case 'current':  return 'bg-accent-primary';
  }
}

export function GraphGridVisualizer({ snapshot, onCellClick }: Props) {
  if (snapshot == null) {
    return <div data-testid="graph-grid-placeholder" />;
  }

  const { rows, cols, cells } = snapshot;

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      className="gap-0.5 p-2 bg-bg-surface rounded-xl w-full"
      data-testid="graph-grid"
      data-rows={rows}
      data-cols={cols}
    >
      {cells.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            data-testid={`grid-cell-${r}-${c}`}
            data-state={cell}
            className={`aspect-square rounded-sm cursor-pointer ${cellColor(cell)} transition-colors`}
            onClick={() => onCellClick?.(r, c)}
          />
        ))
      )}
    </div>
  );
}
