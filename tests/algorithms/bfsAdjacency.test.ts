import { describe, it, expect } from 'vitest';
import { bfsAdjacency } from '@/algorithms/graph/bfsAdjacency';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_ADJACENCY_INPUT } from '@/types/algorithm';

describe('bfsAdjacency', () => {
  describe('result', () => {
    it('finalResult contains all 6 node labels (all nodes reachable from n0)', () => {
      const run = bfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      expect(Array.isArray(run.finalResult)).toBe(true);
      const result = run.finalResult as string[];
      expect(result).toHaveLength(6);
      // All node labels should be present
      const expectedLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (const label of expectedLabels) {
        expect(result).toContain(label);
      }
    });

    it('first step has current = n0 and frontier is non-empty', () => {
      const run = bfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const firstStep = run.steps[0];
      expect(firstStep).toBeDefined();
      expect(firstStep!.snapshot.current).toBe('n0');
      expect(firstStep!.snapshot.frontier.length).toBeGreaterThan(0);
    });

    it('visited grows: last step snapshot has all 6 nodes in visited', () => {
      const run = bfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const lastStep = run.steps[run.steps.length - 1];
      expect(lastStep).toBeDefined();
      expect(lastStep!.snapshot.visited).toHaveLength(6);
    });

    it('edgeStates: after full run, some edges are tree (not all idle)', () => {
      const run = bfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const lastStep = run.steps[run.steps.length - 1];
      expect(lastStep).toBeDefined();
      const edgeStates = lastStep!.snapshot.edgeStates;
      const hasTree = Object.values(edgeStates).some((s) => s === 'tree');
      expect(hasTree).toBe(true);
    });
  });

  describe('trace', () => {
    it('matches snapshot for DEFAULT_ADJACENCY_INPUT', () => {
      const run = bfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
