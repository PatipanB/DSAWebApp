import { cn } from '@/utils/classNames';
import type { ComplexityEntry } from '@/data/complexities';

interface BadgeProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'danger';
}

function TimeBadge({ label, value, variant = 'default' }: BadgeProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center px-3 py-1.5 rounded-md border text-xs font-mono',
        variant === 'default' && 'bg-bg-elevated border-border-subtle text-text-primary',
        variant === 'success' && 'bg-status-success/10 border-status-success text-status-success',
        variant === 'danger' && 'bg-status-danger/10 border-status-danger text-status-danger',
      )}
    >
      <span className="text-text-muted text-[10px] uppercase tracking-wide">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

interface Props {
  entry: ComplexityEntry;
}

export function ComplexityBadge({ entry }: Props) {
  const { best, average, worst } = entry.time;
  const allEqual = best === average && average === worst;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Complexity</p>

      <div>
        <p className="text-xs text-text-muted mb-1.5">Time</p>
        <div className="flex gap-2 flex-wrap">
          {allEqual ? (
            <TimeBadge label="All cases" value={best} />
          ) : (
            <>
              <TimeBadge label="Best" value={best} variant="success" />
              <TimeBadge label="Avg" value={average} />
              <TimeBadge label="Worst" value={worst} variant="danger" />
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted mb-1.5">Space</p>
        <TimeBadge label="Space" value={entry.space} />
      </div>

      {entry.notes && (
        <p className="text-xs text-text-muted italic leading-relaxed">{entry.notes}</p>
      )}
    </div>
  );
}
