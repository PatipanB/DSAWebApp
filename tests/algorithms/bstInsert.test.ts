import { describe, it, expect } from 'vitest';
import { bstInsert } from '@/algorithms/bst/bstInsert';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [5, 3, 7, 1, 4, 6, 8] };

describe('bstInsert', () => {
  it('finalResult is BST inorder [1,3,4,5,6,7,8]', () => {
    expect(bstInsert(INPUT).finalResult).toEqual([1, 3, 4, 5, 6, 7, 8]);
  });

  it('produces 17 steps for 7-value input', () => {
    expect(bstInsert(INPUT).steps.length).toBe(17);
  });

  it('first step inserts root 5 (no comparison)', () => {
    const run = bstInsert(INPUT);
    const snap = run.steps[0]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(snap.inserted).toBeDefined();
    expect(snap.comparingWith).toBeUndefined();
  });

  it('second value (3) has one comparison step then insert', () => {
    const run = bstInsert(INPUT);
    const compareSnap = run.steps[1]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(compareSnap.comparingWith).toBeDefined();
    expect(compareSnap.comparingValue).toBe(3);
    const insertSnap = run.steps[2]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(insertSnap.inserted).toBeDefined();
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstInsert(INPUT))).toMatchSnapshot();
  });
});
