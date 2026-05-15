import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Runner } from '@/engine/runner';
import { createRunBuilder } from '@/engine/types';

function makeSteps(n: number) {
  const r = createRunBuilder<{ i: number }>('two-pointers', null);
  for (let i = 0; i < n; i++) {
    r.push({ line: i + 1, narration: `step ${i}`, snapshot: { i } });
  }
  return r.build();
}

describe('Runner', () => {
  let runner: Runner;
  beforeEach(() => { runner = new Runner(); });

  it('starts idle with stepIndex 0 and no steps', () => {
    expect(runner.state).toBe('idle');
    expect(runner.stepIndex).toBe(0);
    expect(runner.totalSteps).toBe(0);
  });

  it('setSteps resets to stepIndex 0 and state idle', () => {
    runner.setSteps(makeSteps(3).steps);
    expect(runner.totalSteps).toBe(3);
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('idle');
  });

  it('stepForward advances index', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('paused');
  });

  it('stepForward at last step transitions to done', () => {
    runner.setSteps(makeSteps(2).steps);
    runner.stepForward();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('done');
  });

  it('stepForward does nothing when done', () => {
    runner.setSteps(makeSteps(1).steps);
    runner.stepForward();
    runner.stepForward(); // should no-op
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('done');
  });

  it('stepBack decrements index', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    runner.stepForward();
    runner.stepBack();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('paused');
  });

  it('stepBack does nothing at index 0', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepBack();
    expect(runner.stepIndex).toBe(0);
  });

  it('reset returns to index 0 and idle', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    runner.reset();
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('idle');
  });

  it('play sets state to playing', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.play();
    expect(runner.state).toBe('playing');
    runner.pause();
  });

  it('pause from playing sets state to paused', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.play();
    runner.pause();
    expect(runner.state).toBe('paused');
  });

  it('setSpeed updates speedMs', () => {
    runner.setSpeed(250);
    expect(runner.speedMs).toBe(250);
  });

  it('onChange listener fires on state change', () => {
    const cb = vi.fn();
    runner.setSteps(makeSteps(3).steps);
    const unsub = runner.onChange(cb);
    runner.stepForward();
    expect(cb).toHaveBeenCalled();
    unsub();
    cb.mockClear();
    runner.stepForward();
    expect(cb).not.toHaveBeenCalled();
  });
});
