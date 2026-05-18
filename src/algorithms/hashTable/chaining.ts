import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { ChainingSnapshot, HashEntry } from '@/types/snapshots';
import type { HashTableInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function chaining(entries, bucketCount) {
2:    const table = Array(bucketCount).fill([]);
3:    for (const { key, value } of entries) {
4:      const hash = key.charCodeAt(0) % bucketCount;
5:      const entry = { key, value, hash };
6:      if (table[hash].length > 0) {
7:        // collision: chain onto bucket
8:      }
9:      table[hash] = [...table[hash], entry];
10:   }
11:   return table;
12: }
*/

export function chaining(input: HashTableInput): AlgorithmRun<ChainingSnapshot> {
  const r = createRunBuilder<ChainingSnapshot>('chaining', input);
  const { entries, bucketCount } = input;
  const buckets: HashEntry[][] = Array.from({ length: bucketCount }, () => []);
  let size = 0;

  for (const { key, value } of entries) {
    const hash = key.charCodeAt(0) % bucketCount;
    const entry: HashEntry = { key, value, hash };

    // Step 1: hashing step (line 4)
    r.push({
      line: 4,
      narration: `Hashing key '${key}': charCode(${key[0]})=${key.charCodeAt(0)}, ${key.charCodeAt(0)} % ${bucketCount} = ${hash}`,
      snapshot: {
        buckets: buckets.map(b => [...b]),
        size,
        hashingKey: key,
        inserting: entry,
      },
      variables: { key, hash, bucket: hash, size },
    });

    // Step 2: collision step (line 6) — only if bucket is non-empty
    if (buckets[hash]!.length > 0) {
      r.push({
        line: 6,
        narration: `Collision at bucket ${hash} — chaining`,
        snapshot: {
          buckets: buckets.map(b => [...b]),
          size,
          inserting: entry,
          collisionAt: hash,
        },
        variables: { key, hash, bucket: hash, size },
      });
    }

    // Mutate bucket
    buckets[hash] = [...buckets[hash]!, entry];
    size += 1;

    // Step 3: insert step (line 9)
    r.push({
      line: 9,
      narration: `Insert ${key}→${value} into bucket ${hash}`,
      snapshot: {
        buckets: buckets.map(b => [...b]),
        size,
        inserting: undefined,
      },
      variables: { key, hash, bucket: hash, size },
    });
  }

  return r.build(buckets.map(b => [...b]));
}
