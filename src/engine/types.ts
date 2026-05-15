import type { AlgorithmId } from '@/types/algorithm';

export type RunnerState = 'idle' | 'playing' | 'paused' | 'done';

export interface Step<Snapshot> {
  snapshot: Snapshot;
  line: number;
  narration: string;
  variables?: Record<string, unknown>;
}

export interface AlgorithmRun<Snapshot> {
  algorithmId: AlgorithmId;
  steps: Step<Snapshot>[];
  initialInput: unknown;
  finalResult?: unknown;
}

export type AlgorithmRunner<Input, Snapshot> = (input: Input) => AlgorithmRun<Snapshot>;

interface RunBuilder<Snapshot> {
  push(step: Step<Snapshot>): void;
  build(finalResult?: unknown): AlgorithmRun<Snapshot>;
}

export function createRunBuilder<Snapshot>(
  algorithmId: AlgorithmId,
  initialInput: unknown,
): RunBuilder<Snapshot> {
  const steps: Step<Snapshot>[] = [];
  return {
    push(step) { steps.push(step); },
    build(finalResult) { return { algorithmId, steps, initialInput, finalResult }; },
  };
}
