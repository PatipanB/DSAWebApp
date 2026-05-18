import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { DPSnapshot } from '@/types/snapshots';
import type { FibonacciInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function fibonacci(n) {
2:    const dp = Array(n + 1).fill(0);
3:    dp[0] = 0; dp[1] = 1;
4:    for (let i = 2; i <= n; i++) {
5:      dp[i] = dp[i-1] + dp[i-2];
6:    }
7:    return dp[n];
8: }
*/

export function fibonacci(input: FibonacciInput): AlgorithmRun<DPSnapshot> {
  const r = createRunBuilder<DPSnapshot>('fibonacci', input);
  const n = input.n;
  const dp: (number | null)[] = Array(n + 1).fill(null);
  dp[0] = 0;
  dp[1] = 1;

  const colLabels = Array.from({ length: n + 1 }, (_, i) => i.toString());

  // Initial step: initialize dp[0]=0, dp[1]=1
  r.push({
    line: 3,
    narration: 'Initialize dp[0]=0, dp[1]=1',
    snapshot: {
      table: [[...dp]],
      current: [0, 1],
      colLabels,
    },
  });

  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1]! + dp[i - 2]!;

    r.push({
      line: 5,
      narration: `dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${dp[i]}`,
      snapshot: {
        table: [[...dp]],
        current: [0, i],
        reading: [[0, i - 1], [0, i - 2]],
        colLabels,
        ...(i === n ? { answer: dp[i]! } : {}),
      },
      variables: {
        i,
        'dp[i-1]': dp[i - 1],
        'dp[i-2]': dp[i - 2],
        'dp[i]': dp[i],
      },
    });
  }

  return r.build(dp[n]);
}
