interface Props {
  stepIndex: number;
  totalSteps: number;
}

export function ProgressBar({ stepIndex, totalSteps }: Props) {
  const pct = totalSteps > 1 ? Math.round((stepIndex / (totalSteps - 1)) * 100) : 0;
  const display = stepIndex + 1;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-mono text-text-muted whitespace-nowrap">
        {display} / {totalSteps}
      </span>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle"
      >
        <div
          data-testid="progress-fill"
          className="h-full bg-accent-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-text-muted whitespace-nowrap">{pct}%</span>
    </div>
  );
}
