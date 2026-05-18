import { describe, it, expect } from 'vitest';
import { knapsack01 } from '@/algorithms/dp/knapsack01';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_KNAPSACK_INPUT } from '@/types/algorithm';

describe('knapsack01', () => {
  it('returns optimal value', () => {
    const run = knapsack01(DEFAULT_KNAPSACK_INPUT);
    expect(run.finalResult).toBe(7);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(knapsack01(DEFAULT_KNAPSACK_INPUT))).toMatchSnapshot();
  });
});
