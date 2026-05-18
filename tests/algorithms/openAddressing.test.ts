import { describe, it, expect } from 'vitest';
import { openAddressing } from '@/algorithms/hashTable/openAddressing';
import { serializeRun } from '@/engine/serializeRun';
import { DEFAULT_HASH_TABLE_INPUT } from '@/types/algorithm';

describe('openAddressing', () => {
  it('places all entries with no collisions lost', () => {
    const run = openAddressing(DEFAULT_HASH_TABLE_INPUT);
    const result = run.finalResult as (import('@/types/snapshots').HashEntry | null)[];
    const keys = result.filter(Boolean).map(e => e!.key);
    expect(keys.sort()).toEqual(['apple', 'banana', 'cherry', 'date', 'elder', 'fig']);
  });
  it('trace matches snapshot', () => {
    expect(serializeRun(openAddressing(DEFAULT_HASH_TABLE_INPUT))).toMatchSnapshot();
  });
});
