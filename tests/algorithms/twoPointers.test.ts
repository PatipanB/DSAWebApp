import { describe, it, expect } from 'vitest';
import { twoPointers } from '@/algorithms/arrays/twoPointers';
import { serializeRun } from '@/engine/serializeRun';

describe('twoPointers', () => {
  describe('result', () => {
    it('finds indices for target=11 in [1,2,3,4,6,8,11,15]', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      expect(run.finalResult).toEqual([2, 5]); // 3+8=11, indices 2 and 5
    });

    it('finds indices for target=9 in [2,7,11,15]', () => {
      const run = twoPointers({ values: [2, 7, 11, 15], target: 9 });
      expect(run.finalResult).toEqual([0, 1]);
    });

    it('returns null when no solution exists', () => {
      const run = twoPointers({ values: [1, 2, 3], target: 100 });
      expect(run.finalResult).toBeNull();
    });
  });

  describe('trace', () => {
    it('matches snapshot for [1,2,3,4,6,8,11,15] target=11', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least one step per pointer move', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      expect(run.steps.length).toBeGreaterThan(3);
    });

    it('all steps have valid line numbers (1-based)', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      for (const step of run.steps) {
        expect(step.line).toBeGreaterThan(0);
      }
    });

    it('all steps have non-empty narration', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      for (const step of run.steps) {
        expect(step.narration.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
