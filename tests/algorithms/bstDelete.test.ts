import { describe, it, expect } from 'vitest';
import { bstDelete } from '@/algorithms/bst/bstDelete';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { treeValues: [5, 3, 7, 1, 4, 6, 8], target: 3 };

describe('bstDelete', () => {
  it('finalResult is BST inorder after deletion [1,4,5,6,7,8]', () => {
    expect(bstDelete(INPUT).finalResult).toEqual([1, 4, 5, 6, 7, 8]);
  });

  it('deleting a leaf produces finalResult without that value', () => {
    expect(bstDelete({ treeValues: [5, 3, 7], target: 7 }).finalResult).toEqual([3, 5]);
  });

  it('deleting node with one child replaces it with that child', () => {
    expect(bstDelete({ treeValues: [5, 3], target: 3 }).finalResult).toEqual([5]);
  });

  it('two-children delete includes replacement step', () => {
    const run = bstDelete(INPUT);
    const snaps = run.steps.map((s) => s.snapshot as import('@/types/snapshots').BSTSnapshot);
    expect(snaps.some((s) => s.replacementNode !== undefined)).toBe(true);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstDelete(INPUT))).toMatchSnapshot();
  });
});
