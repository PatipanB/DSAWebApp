import type { OpenAddressingSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: OpenAddressingSnapshot | null;
}

export function HashTableOpenAddressingVisualizer({ snapshot }: Props) {
  if (snapshot == null) {
    return <div data-testid="hash-oa-placeholder" />;
  }

  const { slots, inserting, probeIndex, probeSequence } = snapshot;

  return (
    <div className="flex flex-wrap gap-1 p-2">
      {slots.map((entry, i) => {
        let state: 'current-probe' | 'probe-sequence' | 'inserting' | 'tombstone' | 'empty' | 'occupied';
        let classes: string;
        let label: React.ReactNode;

        if (probeIndex === i) {
          state = 'current-probe';
          classes = 'ring-2 ring-accent-primary';
        } else if (probeSequence?.includes(i)) {
          state = 'probe-sequence';
          classes = 'ring-1 ring-status-warn/50';
        } else {
          classes = '';
        }

        if (entry == null) {
          state ??= 'empty';
          classes += ' bg-bg-surface border-border-subtle text-text-muted';
          label = '—';
        } else if (entry.tombstone) {
          state ??= 'tombstone';
          classes += ' bg-status-danger/20 border-status-danger text-text-muted';
          label = '✕';
        } else if (inserting != null && inserting.key === entry.key) {
          state ??= 'inserting';
          classes += ' bg-accent-primary text-bg-base border-accent-primary';
          label = entry.key;
        } else {
          state ??= 'occupied';
          classes += ' bg-bg-elevated border-border-subtle text-text-primary';
          label = entry.key;
        }

        return (
          <div
            key={i}
            data-testid={`oa-slot-${i}`}
            data-state={state}
            className={`w-20 h-14 rounded border flex flex-col items-center justify-center text-xs font-mono ${classes}`}
          >
            <span className="text-[10px] text-text-muted">{i}</span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
