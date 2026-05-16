import { describe, it, expect } from 'vitest';
import { arrayOps } from '@/algorithms/arrays/arrayOps';
import { serializeRun } from '@/engine/serializeRun';

describe('arrayOps', () => {
  describe('result', () => {
    it('returns [1,99,3,4] for [1,2,3,4]', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual([1, 99, 3, 4]);
    });

    it('returns [10,99,30] for [10,20,30]', () => {
      const run = arrayOps({ values: [10, 20, 30] });
      expect(run.finalResult).toEqual([10, 99, 30]);
    });

    it('always produces exactly 8 steps', () => {
      expect(arrayOps({ values: [1, 2, 3, 4] }).steps.length).toBe(8);
      expect(arrayOps({ values: [10, 20, 30] }).steps.length).toBe(8);
    });
  });

  describe('operations', () => {
    it('step 1 is push with O(1) cost', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const snap = run.steps[1]!.snapshot as import('@/types/snapshots').ArrayOpsSnapshot;
      expect(snap.operation).toBe('push');
      expect(snap.cost).toBe('O(1)');
      expect(snap.values).toContain(5); // pushVal = max([1,2,3,4])+1 = 5
    });

    it('step 2 is insert-announce with O(n) cost and shiftStart/shiftEnd', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const snap = run.steps[2]!.snapshot as import('@/types/snapshots').ArrayOpsSnapshot;
      expect(snap.operation).toBe('insert');
      expect(snap.cost).toBe('O(n)');
      expect(snap.shiftStart).toBeDefined();
      expect(snap.shiftEnd).toBeDefined();
    });

    it('step 4 is delete-announce with O(n) cost and shiftStart/shiftEnd', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const snap = run.steps[4]!.snapshot as import('@/types/snapshots').ArrayOpsSnapshot;
      expect(snap.operation).toBe('delete');
      expect(snap.cost).toBe('O(n)');
      expect(snap.shiftStart).toBeDefined();
    });

    it('step 6 is pop with O(1) cost', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const snap = run.steps[6]!.snapshot as import('@/types/snapshots').ArrayOpsSnapshot;
      expect(snap.operation).toBe('pop');
      expect(snap.cost).toBe('O(1)');
    });
  });

  describe('trace', () => {
    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
