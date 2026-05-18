import { cn } from '@/utils/classNames';

interface Props {
  callStack?: string[];
}

export function CallStackPanel({ callStack }: Props) {
  if (!callStack || callStack.length === 0) return null;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Call Stack</p>
      <p className="text-xs text-text-muted font-mono mt-0.5 mb-2">
        Recursion depth — each frame is an active function call
      </p>
      <div className="flex flex-col-reverse gap-1">
        {callStack.map((frame, i) => {
          const isCurrent = i === callStack.length - 1;
          return (
            <div
              key={i}
              data-testid="stack-frame"
              data-current={isCurrent ? 'true' : undefined}
              className={cn(
                'px-3 py-1.5 rounded-md border font-mono text-xs transition',
                isCurrent
                  ? 'bg-accent-primary/10 border-accent-primary text-accent-primary font-bold'
                  : 'bg-bg-elevated border-border-subtle text-text-secondary',
              )}
            >
              {frame}
            </div>
          );
        })}
      </div>
    </div>
  );
}
