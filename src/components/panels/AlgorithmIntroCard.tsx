import { ALGORITHM_INTROS } from '@/data/algorithmIntros';

interface Props {
  algorithmId: string;
  stepIndex: number;
}

export function AlgorithmIntroCard({ algorithmId, stepIndex }: Props) {
  // Auto-hide once the user has advanced past step 0
  if (stepIndex > 0) return null;
  const text = ALGORITHM_INTROS[algorithmId];
  if (!text) return null;

  return (
    <div
      data-testid="algorithm-intro-card"
      className="rounded-xl border border-accent-primary/30 bg-accent-primary/5 px-4 py-3 text-sm font-mono text-text-secondary"
    >
      <span className="text-accent-primary font-bold mr-2">▶ Before you run:</span>
      {text}
    </div>
  );
}
