import { describe, it, expect } from 'vitest';
import { heapSort } from '@/algorithms/sorting/heap';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [5, 2, 8, 1, 9, 3, 7, 4, 6] };

describe('heapSort', () => {
  it('sorts correctly', () => {
    const run = heapSort(INPUT);
    expect(run.finalResult).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(heapSort(INPUT))).toMatchSnapshot();
  });
});
