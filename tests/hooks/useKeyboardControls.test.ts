import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { Runner } from '@/engine/runner';
import { createRunBuilder } from '@/engine/types';

function makeRunner(steps = 5) {
  const r = createRunBuilder<{ i: number }>('two-pointers', null);
  for (let i = 0; i < steps; i++) r.push({ line: i + 1, narration: `s${i}`, snapshot: { i } });
  const runner = new Runner();
  runner.setSteps(r.build().steps);
  return runner;
}

describe('useKeyboardControls', () => {
  it('ArrowRight calls stepForward', async () => {
    const runner = makeRunner();
    const spy = vi.spyOn(runner, 'stepForward');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard('{ArrowRight}');
    expect(spy).toHaveBeenCalled();
  });

  it('ArrowLeft calls stepBack', async () => {
    const runner = makeRunner();
    const spy = vi.spyOn(runner, 'stepBack');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard('{ArrowLeft}');
    expect(spy).toHaveBeenCalled();
  });

  it('Space toggles play/pause', async () => {
    const runner = makeRunner();
    const playSpy = vi.spyOn(runner, 'play');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard(' ');
    expect(playSpy).toHaveBeenCalled();
    runner.pause();
  });
});
