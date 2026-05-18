import { describe, it, expect } from 'vitest';
import { lcs } from '@/algorithms/dp/lcs';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_LCS_INPUT } from '@/types/algorithm';

describe('lcs', () => {
  it('returns correct LCS length via answer', () => {
    const run = lcs(DEFAULT_LCS_INPUT);
    // finalResult is the LCS string; its length should be 4
    expect((run.finalResult as string).length).toBe(4);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(lcs(DEFAULT_LCS_INPUT))).toMatchSnapshot();
  });
});
