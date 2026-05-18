import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { SortingSnapshot } from '@/types/snapshots';
import type { SortingInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function heapSort(arr) {
2:    const n = arr.length;
3:    for (let i = Math.floor(n/2) - 1; i >= 0; i--)
4:      heapify(arr, n, i);
5:    for (let i = n - 1; i > 0; i--) {
6:      [arr[0], arr[i]] = [arr[i], arr[0]];
7:      heapify(arr, i, 0);
8:    }
9:  }
10: function heapify(arr, n, i) {
11:   let largest = i, l = 2*i+1, r = 2*i+2;
12:   if (l < n && arr[l] > arr[largest]) largest = l;
13:   if (r < n && arr[r] > arr[largest]) largest = r;
14:   if (largest !== i) {
15:     [arr[i], arr[largest]] = [arr[largest], arr[i]];
16:     heapify(arr, n, largest);
17:   }
18: }
*/

export function heapSort(input: SortingInput): AlgorithmRun<SortingSnapshot> {
  const r = createRunBuilder<SortingSnapshot>('heap-sort', input);
  const arr = [...input.values];
  const n = arr.length;
  const sorted: number[] = [];

  // Helper: heapify subtree rooted at index i within heap of size heapSize
  function heapify(heapSize: number, i: number, phase: 'build' | 'extract') {
    let largest = i;
    const l = 2 * i + 1;
    const right = 2 * i + 2;

    if (l < heapSize && arr[l]! > arr[largest]!) largest = l;
    if (right < heapSize && arr[right]! > arr[largest]!) largest = right;

    if (largest !== i) {
      // Swap
      const tmp = arr[i]!;
      arr[i] = arr[largest]!;
      arr[largest] = tmp;

      r.push({
        line: 15,
        narration: `Heapify (${phase}): swap arr[${i}]=${arr[i]} and arr[${largest}]=${arr[largest]}`,
        snapshot: {
          values: [...arr],
          comparing: [],
          swapped: [i, largest],
          sorted: [...sorted],
          heapBoundary: heapSize,
        },
        variables: {
          phase,
          heapSize,
          swaps: 1,
        },
      });

      heapify(heapSize, largest, phase);
    }
  }

  // Phase 1: Build max-heap (lines 3-4)
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i, 'build');
  }

  // Phase 2: Extract elements one by one (lines 5-8)
  for (let i = n - 1; i > 0; i--) {
    // Swap root (max) with last element in heap
    const tmp = arr[0]!;
    arr[0] = arr[i]!;
    arr[i] = tmp;

    sorted.push(i);

    r.push({
      line: 6,
      narration: `Extract: swap root arr[0]=${arr[0]} with arr[${i}]=${arr[i]}, index ${i} is now sorted`,
      snapshot: {
        values: [...arr],
        comparing: [],
        swapped: [0, i],
        sorted: [...sorted],
        heapBoundary: i,
      },
      variables: {
        phase: 'extract',
        heapSize: i,
        swaps: 1,
      },
    });

    heapify(i, 0, 'extract');
  }

  // Final step: entire array is sorted
  sorted.push(0);
  r.push({
    line: 1,
    narration: 'Heap sort complete — array is fully sorted',
    snapshot: {
      values: [...arr],
      comparing: [],
      swapped: [],
      sorted: [...sorted],
      heapBoundary: 0,
    },
    variables: {
      phase: 'extract',
      heapSize: 0,
      swaps: 0,
    },
  });

  return r.build([...arr]);
}
