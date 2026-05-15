import { useEffect, useRef } from 'react';
import { Runner } from '@/engine/runner';
import { useRunStore } from '@/store/runStore';
import type { AlgorithmRun } from '@/engine/types';

export function useAlgorithmRun(run: AlgorithmRun<unknown> | null): Runner {
  const runnerRef = useRef<Runner | null>(null);
  if (runnerRef.current === null) runnerRef.current = new Runner();
  const runner = runnerRef.current;

  const setStepIndex = useRunStore((s) => s.setStepIndex);
  const setRunnerState = useRunStore((s) => s.setRunnerState);

  useEffect(() => {
    if (!run) return;
    runner.setSteps(run.steps);
    const unsub = runner.onChange(() => {
      setStepIndex(runner.stepIndex);
      setRunnerState(runner.state);
    });
    // Sync initial state
    setStepIndex(runner.stepIndex);
    setRunnerState(runner.state);
    return unsub;
  }, [run, runner, setStepIndex, setRunnerState]);

  return runner;
}
