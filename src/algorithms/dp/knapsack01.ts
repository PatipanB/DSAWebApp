import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { DPSnapshot } from '@/types/snapshots';
import type { KnapsackInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function knapsack(weights, values, W) {
2:    const n = weights.length;
3:    const dp = Array(n+1).fill(0).map(() => Array(W+1).fill(0));
4:    for (let i = 1; i <= n; i++) {
5:      for (let w = 0; w <= W; w++) {
6:        if (weights[i-1] > w)
7:          dp[i][w] = dp[i-1][w];
8:        else
9:          dp[i][w] = Math.max(dp[i-1][w], values[i-1] + dp[i-1][w-weights[i-1]]);
10:       }
11:     }
12:   return dp[n][W];
13: }
*/

export function knapsack01(input: KnapsackInput): AlgorithmRun<DPSnapshot> {
  const r = createRunBuilder<DPSnapshot>('knapsack-01', input);
  const { weights, values, capacity: W } = input;
  const n = weights.length;

  const dp: (number | null)[][] = Array(n + 1).fill(null).map(() => Array(W + 1).fill(null));

  // Base case: row 0 all zeros
  for (let w = 0; w <= W; w++) {
    dp[0]![w] = 0;
  }

  const rowLabels = ['', ...weights.map((wt, i) => `item${i + 1} (w=${wt})`)];
  const colLabels = Array.from({ length: W + 1 }, (_, i) => i.toString());

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= W; w++) {
      const isSkip = weights[i - 1]! > w;
      if (isSkip) {
        dp[i]![w] = dp[i - 1]![w]!;
      } else {
        dp[i]![w] = Math.max(
          dp[i - 1]![w]!,
          values[i - 1]! + dp[i - 1]![w - weights[i - 1]!]!,
        );
      }

      const isLast = i === n && w === W;

      r.push({
        line: isSkip ? 7 : 9,
        narration: isSkip
          ? `Item ${i} weight ${weights[i - 1]} > capacity ${w}, skip → dp[${i}][${w}] = dp[${i - 1}][${w}] = ${dp[i]![w]}`
          : `Item ${i}: take (${values[i - 1]} + dp[${i - 1}][${w - weights[i - 1]!}]) vs skip (dp[${i - 1}][${w}]) → dp[${i}][${w}] = ${dp[i]![w]}`,
        snapshot: {
          table: dp.map(row => [...row]),
          current: [i, w],
          reading: isSkip
            ? [[i - 1, w]]
            : [[i - 1, w], [i - 1, w - weights[i - 1]!]],
          rowLabels,
          colLabels,
          ...(isLast ? { answer: dp[n]![W]! } : {}),
        },
        variables: {
          item: i,
          weight: weights[i - 1],
          capacity: w,
          skip: dp[i - 1]![w],
          take: isSkip ? null : values[i - 1]! + dp[i - 1]![w - weights[i - 1]!]!,
        },
      });
    }
  }

  return r.build(dp[n]![W]);
}
