import { describe, it, expect } from 'vitest';
import { chaining } from '@/algorithms/hashTable/chaining';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_HASH_TABLE_INPUT } from '@/types/algorithm';

describe('chaining', () => {
  it('places all entries correctly', () => {
    const run = chaining(DEFAULT_HASH_TABLE_INPUT);
    const result = run.finalResult as import('@/types/snapshots').HashEntry[][];
    const allKeys = result.flat().map(e => e.key);
    expect(allKeys.sort()).toEqual(['apple', 'banana', 'cherry', 'date', 'elder', 'fig']);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(chaining(DEFAULT_HASH_TABLE_INPUT))).toMatchSnapshot();
  });
});
