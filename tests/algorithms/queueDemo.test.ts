import { describe, it, expect } from 'vitest';
import { queueDemo } from '@/algorithms/stackQueue/queueDemo';
import { serializeRun } from '@/engine/serializeRun';

describe('queueDemo', () => {
  describe('result', () => {
    it('returns values in FIFO order', () => {
      expect(queueDemo({ values: [3, 1, 2, 4] }).finalResult).toEqual([3, 1, 2, 4]);
    });

    it('single element enqueue and dequeue', () => {
      expect(queueDemo({ values: [7] }).finalResult).toEqual([7]);
    });

    it('two elements preserve order', () => {
      expect(queueDemo({ values: [5, 9] }).finalResult).toEqual([5, 9]);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits 2n+1 steps for n values (init + n enqueues + n dequeues)', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      expect(run.steps.length).toBe(2 * 4 + 1);
    });

    it('all steps have valid line numbers', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('enqueue steps have increasing queue size', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      // Steps 1-4 are enqueues (after init at index 0)
      const enqueueSteps = run.steps.slice(1, 5);
      enqueueSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').QueueSnapshot;
        expect(snap.items.length).toBe(idx + 1);
      });
    });

    it('dequeue steps have decreasing queue size', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      // Steps 5-8 are dequeues
      const dequeueSteps = run.steps.slice(5, 9);
      dequeueSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').QueueSnapshot;
        expect(snap.items.length).toBe(4 - idx - 1);
      });
    });
  });
});
