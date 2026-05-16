import { describe, it, expect } from 'vitest';
import { bstSearch } from '@/algorithms/bst/bstSearch';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { treeValues: [5, 3, 7, 1, 4, 6, 8], target: 4 };

describe('bstSearch', () => {
  it('finalResult is true when target found', () => {
    expect(bstSearch(INPUT).finalResult).toBe(true);
  });

  it('finalResult is false when target not found', () => {
    expect(bstSearch({ treeValues: [5, 3, 7], target: 9 }).finalResult).toBe(false);
  });

  it('search for 4 takes 3 steps (5→3→4)', () => {
    expect(bstSearch(INPUT).steps.length).toBe(3);
  });

  it('final step has found node as comparingWith', () => {
    const run = bstSearch(INPUT);
    const snap = run.steps[2]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(snap.comparingWith).toBeDefined();
    expect(snap.comparingValue).toBe(4);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstSearch(INPUT))).toMatchSnapshot();
  });
});
