import { useId, type KeyboardEvent } from 'react';

interface Props {
  min: number; max: number; value: number; onChange: (v: number) => void;
  label?: string;
}

export function Slider({ min, max, value, onChange, label }: Props) {
  const id = useId();
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, value + 1)); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(min, value - 1)); }
    if (e.key === 'Home') { e.preventDefault(); onChange(min); }
    if (e.key === 'End')  { e.preventDefault(); onChange(max); }
  };
  const ticks = max - min + 1;
  return (
    <div className="flex flex-col gap-1" id={id}>
      {label && <span className="text-xs text-text-muted font-mono">{label}</span>}
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={handleKey}
        className="relative h-2 w-40 bg-bg-elevated rounded-full border border-border-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-primary"
          style={{ left: `calc(${(value - min) / (ticks - 1) * 100}% - 6px)` }}
        />
      </div>
    </div>
  );
}
