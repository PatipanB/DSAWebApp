import { describe, it, expect } from 'vitest';
import { fibonacci } from '@/algorithms/dp/fibonacci';
import { serializeRun } from '@/engine/serializeRun';

describe('fibonacci', () => {
  it('returns correct Fibonacci number', () => {
    const run = fibonacci({ n: 8 });
    expect(run.finalResult).toBe(21);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(fibonacci({ n: 8 }))).toMatchSnapshot();
  });
});
