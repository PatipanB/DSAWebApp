import { describe, it, expect } from 'vitest';
import { preorder } from '@/algorithms/tree/preorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('preorder', () => {
  it('finalResult is [1,2,4,5,3,6]', () => {
    expect(preorder(INPUT).finalResult).toEqual([1, 2, 4, 5, 3, 6]);
  });

  it('produces 12 steps', () => {
    expect(preorder(INPUT).steps.length).toBe(12);
  });

  it('first visit step is node 1 (root visited first)', () => {
    const run = preorder(INPUT);
    const snap = run.steps[1]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(preorder(INPUT))).toMatchSnapshot();
  });
});
