import { describe, it, expect } from 'vitest';
import { postorder } from '@/algorithms/tree/postorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('postorder', () => {
  it('finalResult is [4,5,2,6,3,1]', () => {
    expect(postorder(INPUT).finalResult).toEqual([4, 5, 2, 6, 3, 1]);
  });

  it('produces 12 steps', () => {
    expect(postorder(INPUT).steps.length).toBe(12);
  });

  it('root (n0) is last in visited', () => {
    const run = postorder(INPUT);
    const lastVisit = run.steps[11]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(lastVisit.visited).toHaveLength(6);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(postorder(INPUT))).toMatchSnapshot();
  });
});
