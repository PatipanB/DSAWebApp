import { describe, it, expect } from 'vitest';
import { stackDemo } from '@/algorithms/stackQueue/stackDemo';
import { serializeRun } from '@/engine/serializeRun';

describe('stackDemo', () => {
  describe('result', () => {
    it('returns popped values in LIFO order for [3,1,2,4]', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      expect(run.finalResult).toEqual([4, 2, 1, 3]);
    });

    it('returns [1] for single-element input [1]', () => {
      const run = stackDemo({ values: [1] });
      expect(run.finalResult).toEqual([1]);
    });

    it('two elements reversed by LIFO', () => {
      const run = stackDemo({ values: [5, 9] });
      expect(run.finalResult).toEqual([9, 5]);
    });
  });

  describe('trace', () => {
    it('total steps = 2n+1 for n=4', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      expect(run.steps.length).toBe(9); // 2*4+1
    });

    it('total steps = 2n+1 for n=3', () => {
      const run = stackDemo({ values: [10, 20, 30] });
      expect(run.steps.length).toBe(7); // 2*3+1
    });

    it('all steps have valid line numbers', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('push steps have increasing stack size', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      // Steps 1-4 are pushes (after init at index 0)
      const pushSteps = run.steps.slice(1, 5);
      pushSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').StackSnapshot;
        expect(snap.items.length).toBe(idx + 1);
      });
    });

    it('pop steps have decreasing stack size', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      // Steps 5-8 are pops
      const popSteps = run.steps.slice(5, 9);
      popSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').StackSnapshot;
        expect(snap.items.length).toBe(4 - idx - 1);
      });
    });

    it('trace matches snapshot for [3,1,2,4]', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
