import { describe, it, expect } from 'vitest';
import { inorder } from '@/algorithms/tree/inorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('inorder', () => {
  it('finalResult is inorder traversal [4,2,5,1,3,6]', () => {
    const run = inorder(INPUT);
    expect(run.finalResult).toEqual([4, 2, 5, 1, 3, 6]);
  });

  it('produces exactly 12 steps (2 per node)', () => {
    const run = inorder(INPUT);
    expect(run.steps.length).toBe(12);
  });

  it('enter steps have current set and callStack growing', () => {
    const run = inorder(INPUT);
    const enterStep = run.steps[0]!;
    const snap = enterStep.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.current).not.toBeNull();
    expect(snap.callStack).toHaveLength(1);
    expect(snap.visited).toHaveLength(0);
  });

  it('visit steps grow the visited array', () => {
    const run = inorder(INPUT);
    const visitStep = run.steps[3]!;
    const snap = visitStep.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(inorder(INPUT))).toMatchSnapshot();
  });
});
