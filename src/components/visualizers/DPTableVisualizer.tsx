import { useMemo } from 'react';
import { cn } from '@/utils/classNames';
import type { DPSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: DPSnapshot | null;
}

function hasTuple(arr: [number, number][] | undefined, r: number, c: number): boolean {
  return arr?.some(([ar, ac]) => ar === r && ac === c) ?? false;
}

type CellState = 'current' | 'traceback' | 'reading' | 'empty' | 'filled';

function getCellState(
  snapshot: DPSnapshot,
  r: number,
  c: number,
): CellState {
  if (snapshot.current && snapshot.current[0] === r && snapshot.current[1] === c) {
    return 'current';
  }
  if (hasTuple(snapshot.traceback, r, c)) return 'traceback';
  if (hasTuple(snapshot.reading, r, c)) return 'reading';
  if (snapshot.table[r]![c] === null) return 'empty';
  return 'filled';
}

export function DPTableVisualizer({ snapshot }: Props) {
  if (!snapshot) return <div data-testid="dp-table-placeholder" />;

  const { table, rowLabels, colLabels } = snapshot;
  const nrows = table.length;
  const ncols = nrows > 0 ? table[0]!.length : 0;
  const hasRowLabels = rowLabels !== undefined && rowLabels.length > 0;
  const hasColLabels = colLabels !== undefined && colLabels.length > 0;
  const totalCols = ncols + (hasRowLabels ? 1 : 0);

  return (
    <DPTableInner
      snapshot={snapshot}
      nrows={nrows}
      ncols={ncols}
      hasRowLabels={hasRowLabels}
      hasColLabels={hasColLabels}
      totalCols={totalCols}
    />
  );
}

interface InnerProps {
  snapshot: DPSnapshot;
  nrows: number;
  ncols: number;
  hasRowLabels: boolean;
  hasColLabels: boolean;
  totalCols: number;
}

function DPTableInner({ snapshot, nrows, ncols, hasRowLabels, hasColLabels, totalCols }: InnerProps) {
  const { table, rowLabels, colLabels } = snapshot;

  const rows = useMemo(() => {
    const result: React.ReactNode[] = [];

    if (hasColLabels && colLabels) {
      if (hasRowLabels) {
        result.push(
          <div key="corner" className="w-10 h-10 flex items-center justify-center text-xs font-mono text-text-muted" />
        );
      }
      for (let c = 0; c < ncols; c++) {
        result.push(
          <div key={`col-label-${c}`} className="w-10 h-10 flex items-center justify-center text-xs font-mono text-text-muted">
            {colLabels[c] ?? c}
          </div>
        );
      }
    }

    for (let r = 0; r < nrows; r++) {
      if (hasRowLabels && rowLabels) {
        result.push(
          <div key={`row-label-${r}`} className="w-10 h-10 flex items-center justify-center text-xs font-mono text-text-muted">
            {rowLabels[r] ?? r}
          </div>
        );
      }
      for (let c = 0; c < ncols; c++) {
        const state: CellState = getCellState(snapshot, r, c);
        const value = table[r]![c];

        result.push(
          <div
            key={`cell-${r}-${c}`}
            data-testid={`dp-cell-${r}-${c}`}
            data-state={state}
            className={cn(
              'w-10 h-10 flex items-center justify-center text-xs font-mono rounded border',
              state === 'current' && 'bg-accent-primary text-bg-base border-accent-primary',
              state === 'traceback' && 'ring-2 ring-status-danger bg-bg-elevated border-border-subtle text-text-primary',
              state === 'reading' && 'ring-2 ring-accent-secondary bg-bg-elevated border-border-subtle text-text-primary',
              state === 'empty' && 'bg-bg-surface border-border-subtle text-text-muted',
              state === 'filled' && 'bg-bg-elevated border-border-subtle text-text-primary',
            )}
          >
            {state === 'empty' ? '—' : value}
          </div>
        );
      }
    }

    return result;
  }, [snapshot, nrows, ncols, hasRowLabels, hasColLabels, rowLabels, colLabels, table]);

  return (
    <div className="overflow-auto p-2">
      <div
        style={{ display: 'grid', gridTemplateColumns: `repeat(${totalCols}, auto)` }}
      >
        {rows}
      </div>
    </div>
  );
}
