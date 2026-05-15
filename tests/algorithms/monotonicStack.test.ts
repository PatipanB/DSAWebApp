import { describe, it, expect } from 'vitest';
import { monotonicStack } from '@/algorithms/stackQueue/monotonicStack';
import { serializeRun } from '@/engine/serializeRun';

describe('monotonicStack', () => {
  describe('result', () => {
    it('returns next-greater array for default input', () => {
      expect(monotonicStack({ values: [2, 1, 2, 4, 3] }).finalResult).toEqual([4, 2, 4, -1, -1]);
    });

    it('all -1 for strictly decreasing input', () => {
      expect(monotonicStack({ values: [5, 4, 3, 2, 1] }).finalResult).toEqual([-1, -1, -1, -1, -1]);
    });

    it('all next-greater for strictly increasing input', () => {
      expect(monotonicStack({ values: [1, 2, 3, 4, 5] }).finalResult).toEqual([2, 3, 4, 5, -1]);
    });

    it('works for single element', () => {
      expect(monotonicStack({ values: [7] }).finalResult).toEqual([-1]);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least n+1 steps for n elements', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      expect(run.steps.length).toBeGreaterThanOrEqual(6);
    });

    it('all steps have valid line numbers', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('result array in last snapshot matches finalResult', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      const last = run.steps[run.steps.length - 1]!;
      const snap = last.snapshot as import('@/types/snapshots').StackSnapshot;
      expect(snap.result).toEqual([4, 2, 4, -1, -1]);
    });
  });
});
