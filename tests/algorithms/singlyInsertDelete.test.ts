import { describe, it, expect } from 'vitest';
import { singlyInsertDelete } from '@/algorithms/linkedList/singlyInsertDelete';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('singlyInsertDelete', () => {
  describe('result', () => {
    it('returns [5,4,3,1,0] for default input [1,2,3,4]', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual([5, 4, 3, 1, 0]);
    });
  });

  describe('trace', () => {
    it('has 9 steps (1 init + 2 per operation × 4 ops)', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(9);
    });

    it('all steps have valid line numbers', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('step 2 (insertAtHead done) has newNode pointer on new head with value 0', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[2]!.snapshot as LinkedListSnapshot;
      const newNode = snap.pointers.find((p) => p.name === 'newNode');
      expect(newNode).toBeDefined();
      expect(snap.nodes[newNode!.nodeId!]!.value).toBe(0);
    });

    it('step 4 (insertAtTail done) has newNode pointer on new tail with value 5', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[4]!.snapshot as LinkedListSnapshot;
      const newNode = snap.pointers.find((p) => p.name === 'newNode');
      expect(newNode).toBeDefined();
      expect(snap.nodes[newNode!.nodeId!]!.value).toBe(5);
    });

    it('step 6 (deleteByValue done) has 5 nodes and none with value 2', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[6]!.snapshot as LinkedListSnapshot;
      const nodeValues = Object.values(snap.nodes).map((n) => n.value);
      expect(nodeValues).not.toContain(2);
      expect(Object.keys(snap.nodes).length).toBe(5);
    });

    it('step 8 (reverse done) head has value 5', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[8]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes[snap.headId!]!.value).toBe(5);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
