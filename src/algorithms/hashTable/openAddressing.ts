import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { OpenAddressingSnapshot, HashEntry } from '@/types/snapshots';
import type { HashTableInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function openAddressing(entries, size) {
2:    const slots = Array(size).fill(null);
3:    for (const { key, value } of entries) {
4:      let idx = key.charCodeAt(0) % size;
5:      while (slots[idx] !== null) {
6:        idx = (idx + 1) % size;
7:      }
8:      slots[idx] = { key, value, hash: idx };
9:    }
10:   return slots;
11: }
*/

export function openAddressing(input: HashTableInput): AlgorithmRun<OpenAddressingSnapshot> {
  const r = createRunBuilder<OpenAddressingSnapshot>('open-addressing', input);
  const { entries, bucketCount: size } = input;
  const slots: (HashEntry | null)[] = Array(size).fill(null);

  for (const { key, value } of entries) {
    const initialHash = key.charCodeAt(0) % size;
    let idx = initialHash;
    const probeSequence: number[] = [initialHash];
    const inserting: HashEntry = { key, value, hash: initialHash };

    // Step 1: initial hash (line 4)
    r.push({
      line: 4,
      narration: `Hash '${key}' → slot ${idx}`,
      snapshot: {
        slots: [...slots],
        inserting,
        probeIndex: initialHash,
        probeSequence: [...probeSequence],
      },
      variables: { key, initialHash, probeSteps: probeSequence.length - 1 },
    });

    // Step 2: probe while occupied (line 6)
    while (slots[idx] !== null) {
      const nextIdx = (idx + 1) % size;
      probeSequence.push(nextIdx);
      idx = nextIdx;

      r.push({
        line: 6,
        narration: `Slot ${probeSequence[probeSequence.length - 2]} occupied — probe next`,
        snapshot: {
          slots: [...slots],
          inserting,
          probeIndex: idx,
          probeSequence: [...probeSequence],
        },
        variables: { key, initialHash, probeSteps: probeSequence.length - 1 },
      });
    }

    // Mutate slots
    slots[idx] = { key, value, hash: initialHash };

    // Step 3: place entry (line 8)
    r.push({
      line: 8,
      narration: `Place ${key} at slot ${idx}`,
      snapshot: {
        slots: [...slots],
        inserting: undefined,
        probeIndex: idx,
        probeSequence: [...probeSequence],
      },
      variables: { key, initialHash, probeSteps: probeSequence.length - 1 },
    });
  }

  return r.build([...slots]);
}
