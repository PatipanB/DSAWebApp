import { useState } from 'react';
import { KEY_INSIGHTS } from '@/data/keyInsights';
import type { AlgorithmId } from '@/types/algorithm';

interface Props {
  algorithmId: AlgorithmId;
}

export function KeyInsightCallout({ algorithmId }: Props) {
  const [open, setOpen] = useState(true);
  const insight = KEY_INSIGHTS[algorithmId];

  if (!insight) return null;

  return (
    <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/5">
      <button
        aria-label="Key insight"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-mono font-semibold text-accent-primary uppercase tracking-widest"
      >
        <span>Key Insight</span>
        <span aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      <p hidden={!open} className="px-4 pb-3 text-sm text-text-secondary font-mono leading-relaxed">
        {insight}
      </p>
    </div>
  );
}
