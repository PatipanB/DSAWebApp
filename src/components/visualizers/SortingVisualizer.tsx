import type { SortingSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: SortingSnapshot | null;
  label?: string;
}

type BarState = 'sorted' | 'swapped' | 'comparing' | 'pivot' | 'idle';

function barState(i: number, snapshot: SortingSnapshot): BarState {
  if (snapshot.sorted.includes(i)) return 'sorted';
  if (snapshot.swapped.includes(i)) return 'swapped';
  if (snapshot.comparing.includes(i)) return 'comparing';
  if (snapshot.pivot === i) return 'pivot';
  return 'idle';
}

function barColorClass(state: BarState): string {
  switch (state) {
    case 'sorted':    return 'bg-status-success';
    case 'swapped':   return 'bg-status-danger';
    case 'comparing': return 'bg-status-warn';
    default:          return 'bg-bg-elevated';
  }
}

export function SortingVisualizer({ snapshot, label }: Props) {
  if (snapshot == null) {
    return <div data-testid="sorting-placeholder" />;
  }

  const { values } = snapshot;
  const maxValue = Math.max(...values, 1);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-end gap-0.5 h-48 w-full">
        {values.map((value, i) => {
          const state = barState(i, snapshot);
          const colorClass = barColorClass(state);
          const pivotClass = snapshot.pivot === i ? ' ring-2 ring-accent-secondary ring-inset' : '';

          return (
            <div
              key={i}
              data-testid={`sorting-bar-${i}`}
              data-state={state}
              className={`flex-1 rounded-t-sm transition-colors duration-150 ${colorClass}${pivotClass}`}
              style={{ height: `${(value / maxValue) * 100}%` }}
            />
          );
        })}
      </div>
      {label != null && (
        <p className="text-xs text-text-muted font-mono text-center">{label}</p>
      )}
    </div>
  );
}
