import { describe, it, expect, beforeEach } from 'vitest';
import { useRunStore } from '@/store/runStore';

describe('runStore', () => {
  beforeEach(() => useRunStore.setState({ stepIndex: 0, runnerState: 'idle' }));

  it('defaults to stepIndex 0 and idle state', () => {
    expect(useRunStore.getState().stepIndex).toBe(0);
    expect(useRunStore.getState().runnerState).toBe('idle');
  });

  it('setStepIndex updates stepIndex', () => {
    useRunStore.getState().setStepIndex(5);
    expect(useRunStore.getState().stepIndex).toBe(5);
  });

  it('setRunnerState updates runnerState', () => {
    useRunStore.getState().setRunnerState('playing');
    expect(useRunStore.getState().runnerState).toBe('playing');
  });
});
