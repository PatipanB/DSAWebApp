import type { ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-mono bg-bg-elevated border border-border-strong rounded text-text-secondary opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap"
      >
        {label}
      </span>
    </span>
  );
}
