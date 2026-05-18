import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { SortingSnapshot } from '@/types/snapshots';
import type { SortingInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function bubbleSort(values) {
2:    for (let i = 0; i < values.length; i++) {
3:      for (let j = 0; j < values.length - i - 1; j++) {
4:        if (values[j] > values[j + 1]) {
5:          [values[j], values[j+1]] = [values[j+1], values[j]];
6:        }
7:      }
8:    }
9:    return values;
10: }
*/

export function bubbleSort(input: SortingInput): AlgorithmRun<SortingSnapshot> {
  const r = createRunBuilder<SortingSnapshot>('bubble-sort', input);
  const values = [...input.values];
  const n = values.length;
  const sorted: number[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Emit comparison step
      r.push({
        line: 4,
        narration: `Compare values[${j}]=${values[j]} and values[${j + 1}]=${values[j + 1]}`,
        snapshot: {
          values: [...values],
          comparing: [j, j + 1],
          swapped: [],
          sorted: [...sorted],
        },
        variables: {
          i,
          j,
          'values[j]': values[j],
          'values[j+1]': values[j + 1],
        },
      });

      if (values[j]! > values[j + 1]!) {
        // Swap
        const tmp = values[j]!;
        values[j] = values[j + 1]!;
        values[j + 1] = tmp;

        // Emit swap step
        r.push({
          line: 5,
          narration: `Swap values[${j}] and values[${j + 1}] → now ${values[j]} < ${values[j + 1]}`,
          snapshot: {
            values: [...values],
            comparing: [],
            swapped: [j, j + 1],
            sorted: [...sorted],
          },
          variables: {
            i,
            j,
            'values[j]': values[j],
            'values[j+1]': values[j + 1],
          },
        });
      }
    }

    // After pass i, index (n - 1 - i) is in its final position
    sorted.push(n - 1 - i);
  }

  return r.build([...values]);
}
