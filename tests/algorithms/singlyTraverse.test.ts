import { describe, it, expect } from 'vitest';
import { singlyTraverse } from '@/algorithms/linkedList/singlyTraverse';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('singlyTraverse', () => {
  describe('result', () => {
    it('returns values in order for [1,2,3,4]', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual([1, 2, 3, 4]);
    });

    it('returns [5] for single-element input [5]', () => {
      const run = singlyTraverse({ values: [5] });
      expect(run.finalResult).toEqual([5]);
    });
  });

  describe('trace', () => {
    it('total steps = n+1 for n=4', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(5);
    });

    it('total steps = n+1 for n=3', () => {
      const run = singlyTraverse({ values: [10, 20, 30] });
      expect(run.steps.length).toBe(4);
    });

    it('first step has curr pointing to head node n0', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.pointers[0]!.nodeId).toBe('n0');
    });

    it('last step has curr=null', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[4]!.snapshot as LinkedListSnapshot;
      expect(snap.pointers[0]!.nodeId).toBeNull();
    });

    it('nodes build correct linked chain', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes['n0']!.nextId).toBe('n1');
      expect(snap.nodes['n3']!.nextId).toBeNull();
      expect(snap.headId).toBe('n0');
    });

    it('all steps have valid line numbers', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
