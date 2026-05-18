import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { SortingSnapshot } from '@/types/snapshots';
import type { SortingInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function mergeSort(arr, l, r) {
2:    if (l >= r) return;
3:    const mid = Math.floor((l + r) / 2);
4:    mergeSort(arr, l, mid);
5:    mergeSort(arr, mid + 1, r);
6:    merge(arr, l, mid, r);
7:  }
8:  function merge(arr, l, mid, r) {
9:    const left = arr.slice(l, mid + 1);
10:   const right = arr.slice(mid + 1, r + 1);
11:   let i = 0, j = 0, k = l;
12:   while (i < left.length && j < right.length) {
13:     if (left[i] <= right[j]) arr[k++] = left[i++];
14:     else arr[k++] = right[j++];
15:   }
16:   // copy remainder
17: }
*/

export function mergeSort(input: SortingInput): AlgorithmRun<SortingSnapshot> {
  const r = createRunBuilder<SortingSnapshot>('merge-sort', input);
  const arr = [...input.values];
  const n = arr.length;

  function merge(l: number, mid: number, right: number): void {
    const left = arr.slice(l, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    const auxArray = [...left, ...rightArr];

    let i = 0;
    let j = 0;
    let k = l;

    while (i < left.length && j < rightArr.length) {
      if (left[i]! <= rightArr[j]!) {
        arr[k] = left[i]!;
        r.push({
          line: 13,
          narration: `Place left[${i}]=${left[i]} at arr[${k}]`,
          snapshot: {
            values: [...arr],
            comparing: [i + l, j + mid + 1],
            swapped: [k],
            sorted: [],
            subarray: { start: l, end: right },
            auxArray: [...auxArray],
          },
          variables: { l, r: right, mid, 'comparing': `left[${i}] vs right[${j}]` },
        });
        i++;
      } else {
        arr[k] = rightArr[j]!;
        r.push({
          line: 14,
          narration: `Place right[${j}]=${rightArr[j]} at arr[${k}]`,
          snapshot: {
            values: [...arr],
            comparing: [i + l, j + mid + 1],
            swapped: [k],
            sorted: [],
            subarray: { start: l, end: right },
            auxArray: [...auxArray],
          },
          variables: { l, r: right, mid, 'comparing': `left[${i}] vs right[${j}]` },
        });
        j++;
      }
      k++;
    }

    while (i < left.length) {
      arr[k] = left[i]!;
      k++;
      i++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j]!;
      k++;
      j++;
    }
  }

  function sort(l: number, right: number): void {
    if (l >= right) return;
    const mid = Math.floor((l + right) / 2);
    sort(l, mid);
    sort(mid + 1, right);
    merge(l, mid, right);
  }

  sort(0, n - 1);

  r.push({
    line: 6,
    narration: 'Merge sort complete',
    snapshot: {
      values: [...arr],
      comparing: [],
      swapped: [],
      sorted: Array.from({ length: n }, (_, idx) => idx),
    },
    variables: {},
  });

  return r.build([...arr]);
}
