import { describe, it, expect } from 'vitest';
import { levelOrder } from '@/algorithms/tree/levelOrder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('levelOrder', () => {
  it('finalResult is BFS order [1,2,3,4,5,6]', () => {
    expect(levelOrder(INPUT).finalResult).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('produces n+1 steps (7 for 6 nodes)', () => {
    expect(levelOrder(INPUT).steps.length).toBe(7);
  });

  it('init step has queue=[rootId] and empty visited', () => {
    const run = levelOrder(INPUT);
    const snap = run.steps[0]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.queue).toHaveLength(1);
    expect(snap.visited).toHaveLength(0);
    expect(snap.current).toBeNull();
  });

  it('after dequeuing root, queue has 2 items (children)', () => {
    const run = levelOrder(INPUT);
    const snap = run.steps[1]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
    expect(snap.queue).toHaveLength(2);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(levelOrder(INPUT))).toMatchSnapshot();
  });
});
