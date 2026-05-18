import { describe, it, expect } from 'vitest';
import { bubbleSort } from '@/algorithms/sorting/bubble';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [5, 2, 8, 1, 9, 3, 7, 4, 6] };

describe('bubbleSort', () => {
  it('sorts correctly', () => {
    const run = bubbleSort(INPUT);
    expect(run.finalResult).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(bubbleSort(INPUT))).toMatchSnapshot();
  });
});
