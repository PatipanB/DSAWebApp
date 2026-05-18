import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { SortingSnapshot } from '@/types/snapshots';
import type { SortingInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function quickSort(arr, l, r) {
2:    if (l >= r) return;
3:    const p = partition(arr, l, r);
4:    quickSort(arr, l, p - 1);
5:    quickSort(arr, p + 1, r);
6:  }
7:  function partition(arr, l, r) {
8:    const pivot = arr[r];
9:    let i = l - 1;
10:   for (let j = l; j < r; j++) {
11:     if (arr[j] <= pivot) {
12:       i++;
13:       [arr[i], arr[j]] = [arr[j], arr[i]];
14:     }
15:   }
16:   [arr[i+1], arr[r]] = [arr[r], arr[i+1]];
17:   return i + 1;
18: }
*/

export function quickSort(input: SortingInput): AlgorithmRun<SortingSnapshot> {
  const r = createRunBuilder<SortingSnapshot>('quick-sort', input);
  const arr = [...input.values];
  const sorted: number[] = [];

  // Iterative quick sort using explicit stack of [l, r] pairs
  const stack: Array<[number, number]> = [];
  if (arr.length > 1) {
    stack.push([0, arr.length - 1]);
  }

  while (stack.length > 0) {
    const frame = stack.pop()!;
    const l = frame[0];
    const rv = frame[1];

    // partition(arr, l, rv)
    const pivotVal = arr[rv]!;
    let i = l - 1;

    for (let j = l; j < rv; j++) {
      // Comparison step (line 11)
      r.push({
        line: 11,
        narration: `Compare arr[${j}]=${arr[j]} with pivot=${pivotVal}`,
        snapshot: {
          values: [...arr],
          comparing: [j, rv],
          swapped: [],
          sorted: [...sorted],
          pivot: rv,
          subarray: { start: l, end: rv },
        },
        variables: { pivot: pivotVal, i, j },
      });

      if (arr[j]! <= pivotVal) {
        i++;
        [arr[i], arr[j]] = [arr[j]!, arr[i]!];
        if (i !== j) {
          // Swap step (line 13) — skip self-swap
          r.push({
            line: 13,
            narration: `Swap arr[${i}]=${arr[i]} and arr[${j}]=${arr[j]}`,
            snapshot: {
              values: [...arr],
              comparing: [],
              swapped: [i, j],
              sorted: [...sorted],
              pivot: rv,
              subarray: { start: l, end: rv },
            },
            variables: { pivot: pivotVal, i, j },
          });
        }
      }
    }

    // Place pivot (line 16)
    const pivotPos = i + 1;
    [arr[pivotPos], arr[rv]] = [arr[rv]!, arr[pivotPos]!];
    sorted.push(pivotPos);

    r.push({
      line: 16,
      narration: `Place pivot ${arr[pivotPos]} at index ${pivotPos}`,
      snapshot: {
        values: [...arr],
        comparing: [],
        swapped: [pivotPos, rv],
        sorted: [...sorted],
        pivot: pivotPos,
        subarray: { start: l, end: rv },
      },
      variables: { pivot: arr[pivotPos], i, j: rv },
    });

    // Push sub-ranges onto stack
    if (pivotPos - 1 > l) {
      stack.push([l, pivotPos - 1]);
    } else if (pivotPos - 1 === l) {
      sorted.push(l);
    }

    if (pivotPos + 1 < rv) {
      stack.push([pivotPos + 1, rv]);
    } else if (pivotPos + 1 === rv) {
      sorted.push(rv);
    }
  }

  // Mark any remaining single-element subarrays as sorted
  for (let idx = 0; idx < arr.length; idx++) {
    if (!sorted.includes(idx)) {
      sorted.push(idx);
    }
  }

  return r.build([...arr]);
}
