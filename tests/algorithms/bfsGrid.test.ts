import { describe, it, expect } from 'vitest';
import { bfsGrid } from '@/algorithms/graph/bfsGrid';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_GRID_INPUT } from '@/types/algorithm';
import type { GridInput } from '@/types/algorithm';

describe('bfsGrid', () => {
  describe('result', () => {
    it('finalResult is true for DEFAULT_GRID_INPUT (end is reachable)', () => {
      const run = bfsGrid(DEFAULT_GRID_INPUT);
      expect(run.finalResult).toBe(true);
    });

    it('step count is greater than 0', () => {
      const run = bfsGrid(DEFAULT_GRID_INPUT);
      expect(run.steps.length).toBeGreaterThan(0);
    });

    it('first step snapshot has current set and cells is 8x8', () => {
      const run = bfsGrid(DEFAULT_GRID_INPUT);
      const firstStep = run.steps[0];
      expect(firstStep).toBeDefined();
      expect(firstStep!.snapshot.current).toBeDefined();
      expect(firstStep!.snapshot.rows).toBe(8);
      expect(firstStep!.snapshot.cols).toBe(8);
      expect(firstStep!.snapshot.cells).toHaveLength(8);
      for (const row of firstStep!.snapshot.cells) {
        expect(row).toHaveLength(8);
      }
    });

    it('finalResult is false when end is walled off (3x3 blocked grid)', () => {
      const blockedGrid: GridInput = {
        rows: 3,
        cols: 3,
        start: [0, 0],
        end: [2, 2],
        cells: [
          ['start', 'open',  'open'],
          ['open',  'wall',  'wall'],
          ['open',  'wall',  'end' ],
        ],
      };
      const run = bfsGrid(blockedGrid);
      expect(run.finalResult).toBe(false);
    });
  });

  describe('trace', () => {
    it('matches snapshot for DEFAULT_GRID_INPUT', () => {
      const run = bfsGrid(DEFAULT_GRID_INPUT);
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
