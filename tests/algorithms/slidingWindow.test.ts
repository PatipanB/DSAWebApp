import { describe, it, expect } from 'vitest';
import { slidingWindow } from '@/algorithms/arrays/slidingWindow';
import { serializeRun } from '@/engine/serializeRun';

describe('slidingWindow', () => {
  describe('result', () => {
    it('finds max sum 9 for [2,1,5,1,3,2] k=3', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      expect(run.finalResult).toBe(9);
    });

    it('finds max sum for [1,2,3,4,5] k=2', () => {
      const run = slidingWindow({ values: [1, 2, 3, 4, 5], k: 2 });
      expect(run.finalResult).toBe(9); // 4+5
    });

    it('works when window equals array length', () => {
      const run = slidingWindow({ values: [3, 1, 2], k: 3 });
      expect(run.finalResult).toBe(6);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits steps for both init window and each slide', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      // init (1) + initial max (1) + 3 slides (at r=3,4,5) + return (1) = at least 5 steps
      expect(run.steps.length).toBeGreaterThanOrEqual(5);
    });

    it('all steps have valid line numbers (1-based)', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      for (const step of run.steps) {
        expect(step.line).toBeGreaterThan(0);
      }
    });

    it('window field present in every snapshot', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      for (const step of run.steps) {
        expect(step.snapshot.window).toBeDefined();
      }
    });
  });
});
