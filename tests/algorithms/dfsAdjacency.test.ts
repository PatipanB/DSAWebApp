import { describe, it, expect } from 'vitest';
import { dfsAdjacency } from '@/algorithms/graph/dfsAdjacency';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_ADJACENCY_INPUT } from '@/types/algorithm';

describe('dfsAdjacency', () => {
  describe('result', () => {
    it('finalResult contains all 6 node labels (all nodes reachable from n0)', () => {
      const run = dfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      expect(Array.isArray(run.finalResult)).toBe(true);
      const result = run.finalResult as string[];
      expect(result).toHaveLength(6);
      const expectedLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
      for (const label of expectedLabels) {
        expect(result).toContain(label);
      }
    });

    it('first step has current = n0', () => {
      const run = dfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const firstStep = run.steps[0];
      expect(firstStep).toBeDefined();
      expect(firstStep!.snapshot.current).toBe('n0');
    });

    it('edgeStates: after full run, some edges are tree (not all idle)', () => {
      const run = dfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const lastStep = run.steps[run.steps.length - 1];
      expect(lastStep).toBeDefined();
      const edgeStates = lastStep!.snapshot.edgeStates;
      const hasTree = Object.values(edgeStates).some((s) => s === 'tree');
      expect(hasTree).toBe(true);
    });

    it('variables have callStack key', () => {
      const run = dfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      const firstStep = run.steps[0];
      expect(firstStep).toBeDefined();
      expect(firstStep!.variables).toHaveProperty('callStack');
    });
  });

  describe('trace', () => {
    it('matches snapshot for DEFAULT_ADJACENCY_INPUT', () => {
      const run = dfsAdjacency(DEFAULT_ADJACENCY_INPUT);
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
