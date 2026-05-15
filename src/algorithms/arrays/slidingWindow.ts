import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { ArraySnapshot } from '@/types/snapshots';
import type { SlidingWindowInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1:  function slidingWindow(values, k) {
2:    let sum = 0;
3:    for (let i = 0; i < k; i++) sum += values[i];
4:    let max = sum;
5:    for (let r = k; r < values.length; r++) {
6:      sum += values[r] - values[r - k];
7:      if (sum > max) max = sum;
8:    }
9:    return max;
10: }
*/

export function slidingWindow(input: SlidingWindowInput): AlgorithmRun<ArraySnapshot> {
  const { values, k } = input;
  const r = createRunBuilder<ArraySnapshot>('sliding-window', input);

  // Build initial window sum
  let sum = 0;
  for (let i = 0; i < k; i++) sum += values[i] ?? 0;
  let maxSum = sum;

  r.push({
    line: 3,
    narration: `Build initial window [0..${k - 1}]: sum = ${sum}`,
    snapshot: { values, pointers: [], window: { start: 0, end: k - 1 }, sum },
    variables: { sum, max: maxSum, l: 0, r: k - 1, k },
  });

  r.push({
    line: 4,
    narration: `Initial max = ${maxSum}`,
    snapshot: { values, pointers: [], window: { start: 0, end: k - 1 }, sum, result: maxSum },
    variables: { sum, max: maxSum, l: 0, r: k - 1, k },
  });

  for (let right = k; right < values.length; right++) {
    const dropped = values[right - k] ?? 0;
    const added = values[right] ?? 0;
    sum = sum + added - dropped;
    const left = right - k + 1;

    r.push({
      line: 6,
      narration: `Slide: add ${added}, drop ${dropped} → window [${left}..${right}], sum = ${sum}`,
      snapshot: { values, pointers: [], window: { start: left, end: right }, sum },
      variables: { sum, max: maxSum, l: left, r: right, k },
    });

    if (sum > maxSum) {
      maxSum = sum;
      r.push({
        line: 7,
        narration: `New max found: ${maxSum}`,
        snapshot: { values, pointers: [], window: { start: left, end: right }, sum, result: maxSum },
        variables: { sum, max: maxSum, l: left, r: right, k },
      });
    }
  }

  r.push({
    line: 9,
    narration: `Return max = ${maxSum}`,
    snapshot: {
      values,
      pointers: [],
      window: { start: values.length - k, end: values.length - 1 },
      sum: maxSum,
      result: maxSum,
    },
    variables: { sum: maxSum, max: maxSum, k },
  });

  return r.build(maxSum);
}
