import type { ReactNode } from 'react';

interface Props {
  onRun: () => void;
  error?: string | null;
  children: ReactNode;
}

export function InputPanel({ onRun, error, children }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        {children}
        <button
          onClick={onRun}
          className="h-10 px-4 bg-accent-primary text-bg-base text-sm font-medium rounded-lg hover:brightness-110 transition"
        >
          Run
        </button>
      </div>
      {error && (
        <p data-testid="input-error" className="text-sm text-status-danger font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
