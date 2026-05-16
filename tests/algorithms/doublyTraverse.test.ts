import { describe, it, expect } from 'vitest';
import { doublyTraverse } from '@/algorithms/linkedList/doublyTraverse';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('doublyTraverse', () => {
  describe('result', () => {
    it('returns forward and backward arrays for [1,2,3,4]', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual({ forward: [1, 2, 3, 4], backward: [4, 3, 2, 1] });
    });

    it('returns correct result for single element [5]', () => {
      const run = doublyTraverse({ values: [5] });
      expect(run.finalResult).toEqual({ forward: [5], backward: [5] });
    });
  });

  describe('trace', () => {
    it('has 2n steps for n=4', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(8);
    });

    it('has 2n steps for n=3', () => {
      const run = doublyTraverse({ values: [10, 20, 30] });
      expect(run.steps.length).toBe(6);
    });

    it('snapshot.doubly is true on all steps', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) {
        expect((s.snapshot as LinkedListSnapshot).doubly).toBe(true);
      }
    });

    it('all interior nodes have prevId set', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes['n0']!.prevId).toBeNull();
      expect(snap.nodes['n1']!.prevId).toBe('n0');
      expect(snap.nodes['n3']!.prevId).toBe('n2');
    });

    it('first 4 steps traverse forward (curr=n0..n3)', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (let i = 0; i < 4; i++) {
        const snap = run.steps[i]!.snapshot as LinkedListSnapshot;
        expect(snap.pointers[0]!.nodeId).toBe(`n${i}`);
      }
    });

    it('last 4 steps traverse backward (curr=n3..n0)', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (let i = 0; i < 4; i++) {
        const snap = run.steps[4 + i]!.snapshot as LinkedListSnapshot;
        expect(snap.pointers[0]!.nodeId).toBe(`n${3 - i}`);
      }
    });

    it('all steps have valid line numbers', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
