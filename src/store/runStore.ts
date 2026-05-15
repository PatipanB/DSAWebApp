import { create } from 'zustand';
import type { RunnerState } from '@/engine/types';

interface RunState {
  stepIndex: number;
  runnerState: RunnerState;
  setStepIndex: (i: number) => void;
  setRunnerState: (s: RunnerState) => void;
}

export const useRunStore = create<RunState>((set) => ({
  stepIndex: 0,
  runnerState: 'idle',
  setStepIndex: (i) => set({ stepIndex: i }),
  setRunnerState: (s) => set({ runnerState: s }),
}));
