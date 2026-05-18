import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { DPSnapshot } from '@/types/snapshots';
import type { LCSInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function lcs(a, b) {
2:    const m = a.length, n = b.length;
3:    const dp = Array(m+1).fill(0).map(() => Array(n+1).fill(0));
4:    for (let i = 1; i <= m; i++)
5:      for (let j = 1; j <= n; j++)
6:        if (a[i-1] === b[j-1])
7:          dp[i][j] = dp[i-1][j-1] + 1;
8:        else
9:          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
10:   let i = m, j = n;
11:   while (i > 0 && j > 0) {
12:     if (a[i-1] === b[j-1]) { path.push([i,j]); i--; j--; }
13:     else if (dp[i-1][j] > dp[i][j-1]) i--;
14:     else j--;
15:   }
16:   return path.reverse();
17: }
*/

export function lcs(input: LCSInput): AlgorithmRun<DPSnapshot> {
  const r = createRunBuilder<DPSnapshot>('lcs', input);
  const { a, b } = input;
  const m = a.length;
  const n = b.length;

  // Initialize dp table with null, then set row 0 and col 0 to 0
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(null),
  );
  for (let i = 0; i <= m; i++) dp[i]![0] = 0;
  for (let j = 0; j <= n; j++) dp[0]![j] = 0;

  const rowLabels = ['', ...a.split('')];
  const colLabels = ['', ...b.split('')];

  // Fill phase
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = a[i - 1] === b[j - 1];
      if (match) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }

      r.push({
        line: match ? 7 : 9,
        narration: match
          ? `a[${i - 1}]='${a[i - 1]}' === b[${j - 1}]='${b[j - 1]}', dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i]![j]}`
          : `a[${i - 1}]='${a[i - 1]}' !== b[${j - 1}]='${b[j - 1]}', dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i]![j]}`,
        snapshot: {
          table: dp.map(row => [...row]),
          current: [i, j],
          reading: match ? [[i - 1, j - 1]] : [[i - 1, j], [i, j - 1]],
          rowLabels,
          colLabels,
        },
      });
    }
  }

  // Traceback phase
  const traceback: [number, number][] = [];
  let ti = m;
  let tj = n;

  while (ti > 0 && tj > 0) {
    if (a[ti - 1] === b[tj - 1]) {
      traceback.push([ti, tj]);
      r.push({
        line: 12,
        narration: `a[${ti - 1}]='${a[ti - 1]}' === b[${tj - 1}]='${b[tj - 1]}', add [${ti},${tj}] to path`,
        snapshot: {
          table: dp.map(row => [...row]),
          current: [ti, tj],
          traceback: [...traceback],
          rowLabels,
          colLabels,
          answer: dp[m]![n]!,
        },
      });
      ti--;
      tj--;
    } else if (dp[ti - 1]![tj]! > dp[ti]![tj - 1]!) {
      r.push({
        line: 13,
        narration: `dp[${ti - 1}][${tj}]=${dp[ti - 1]![tj]} > dp[${ti}][${tj - 1}]=${dp[ti]![tj - 1]}, move up`,
        snapshot: {
          table: dp.map(row => [...row]),
          current: [ti, tj],
          traceback: [...traceback],
          rowLabels,
          colLabels,
          answer: dp[m]![n]!,
        },
      });
      ti--;
    } else {
      r.push({
        line: 14,
        narration: `dp[${ti}][${tj - 1}]=${dp[ti]![tj - 1]} >= dp[${ti - 1}][${tj}]=${dp[ti - 1]![tj]}, move left`,
        snapshot: {
          table: dp.map(row => [...row]),
          current: [ti, tj],
          traceback: [...traceback],
          rowLabels,
          colLabels,
          answer: dp[m]![n]!,
        },
      });
      tj--;
    }
  }

  // Build LCS string from traceback (currently in reverse order, need to reverse)
  const lcsString = traceback
    .reverse()
    .map(([i]) => a[i - 1]!)
    .join('');

  return r.build(lcsString);
}
