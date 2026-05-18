# Session 9 — Hash Table + DP + Final Polish

## Context
Working directory: `/Users/patipanb/Obsidian/DSAWebApp`
Branch: main
AlgorithmIds already in `src/types/algorithm.ts`: `'chaining' | 'open-addressing' | 'fibonacci' | 'knapsack-01' | 'lcs'`
Existing pattern: `createRunBuilder<Snapshot>(algorithmId, input)` → `.push({line, narration, snapshot, variables})` → `.build(finalResult)`
Template page: `src/routes/SortingPage.tsx` (built in Session 8)

## Task 1 — Types + Inputs
**Files:** `src/types/snapshots.ts`, `src/types/algorithm.ts`

Add to `src/types/snapshots.ts`:
```ts
export interface HashEntry {
  key: string;
  value: string;
  hash: number;
  tombstone?: boolean;
}
export interface ChainingSnapshot {
  buckets: HashEntry[][];
  size: number;
  inserting?: HashEntry;
  hashingKey?: string;
  collisionAt?: number;
}
export interface OpenAddressingSnapshot {
  slots: (HashEntry | null)[];
  inserting?: HashEntry;
  probeIndex?: number;
  probeSequence?: number[];
}
export interface DPSnapshot {
  table: (number | null)[][];
  current?: [number, number];
  reading?: [number, number][];
  rowLabels?: string[];
  colLabels?: string[];
  answer?: number;
  traceback?: [number, number][];
}
```

Add to `src/types/algorithm.ts`:
```ts
export interface HashTableInput {
  entries: { key: string; value: string }[];
  bucketCount: number;
}
export const DEFAULT_HASH_TABLE_INPUT: HashTableInput = {
  bucketCount: 7,
  entries: [
    { key: 'apple',  value: '🍎' },
    { key: 'banana', value: '🍌' },
    { key: 'cherry', value: '🍒' },
    { key: 'date',   value: '🌴' },
    { key: 'elder',  value: '🫐' },
    { key: 'fig',    value: '🍇' },
  ],
};

export interface FibonacciInput { n: number; }
export const DEFAULT_FIBONACCI_INPUT: FibonacciInput = { n: 8 };

export interface KnapsackInput {
  weights: number[];
  values: number[];
  capacity: number;
}
export const DEFAULT_KNAPSACK_INPUT: KnapsackInput = {
  weights: [2, 3, 4, 5],
  values:  [3, 4, 5, 6],
  capacity: 5,
};

export interface LCSInput { a: string; b: string; }
export const DEFAULT_LCS_INPUT: LCSInput = { a: 'ABCBDAB', b: 'BDCABA' };
```

## Task 2 — chaining.ts + test
**Files:** `src/algorithms/hashTable/chaining.ts`, `tests/algorithms/chaining.test.ts`

Hash function: `key.charCodeAt(0) % bucketCount`

Displayed snippet:
```
1:  function chaining(entries, bucketCount) {
2:    const table = Array(bucketCount).fill([]);
3:    for (const { key, value } of entries) {
4:      const hash = key.charCodeAt(0) % bucketCount;
5:      const entry = { key, value, hash };
6:      if (table[hash].length > 0) {
7:        // collision: chain onto existing bucket
8:      }
9:      table[hash] = [...table[hash], entry];
10:   }
11:   return table;
12: }
```

Step contract per entry:
1. Step `line:4` — "Hashing key 'X': charCode(X[0]) % N = H" — `hashingKey: key`, `inserting: entry`
2. If collision (bucket non-empty), step `line:6` — "Collision at bucket H — chaining" — `collisionAt: hash`
3. Step `line:9` — "Insert {key} into bucket H" — shows bucket after insertion

`finalResult`: the completed buckets array (array of HashEntry arrays).

Tests: result test (correct bucket contents) + trace snapshot.

## Task 3 — openAddressing.ts + test
**Files:** `src/algorithms/hashTable/openAddressing.ts`, `tests/algorithms/openAddressing.test.ts`

Linear probing. Hash: `key.charCodeAt(0) % slots.length`.

Displayed snippet:
```
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
```

Step contract per entry:
1. Step `line:4` — "Hash 'key' → slot I" — `probeIndex: initialHash`, `probeSequence: [initialHash]`, `inserting: entry`
2. For each probe step (collision), step `line:6` — "Slot I occupied — probe next" — update `probeIndex`, `probeSequence`
3. Step `line:8` — "Place {key} at slot I" — shows slot after insertion

`finalResult`: the completed slots array.

## Task 4 — HashTableChainingVisualizer.tsx + test
**Files:** `src/components/visualizers/HashTableChainingVisualizer.tsx`, `tests/components/HashTableChainingVisualizer.test.tsx`

Layout: vertical list of `bucketCount` rows. Each row: bucket index label + horizontal chain of entry boxes.

- Idle entry: `bg-bg-elevated border border-border-subtle text-text-primary`
- `inserting` entry (currently being inserted): `bg-accent-primary text-bg-base`
- `collisionAt` bucket row: highlight bucket label with `text-status-warn`
- Entry box shows `key: value`

`data-testid="chain-bucket-{i}"` on each row.
`data-testid="chain-entry-{bucket}-{j}"` on each entry.

Null snapshot → `<div data-testid="hash-chaining-placeholder" />`

## Task 5 — HashTableOpenAddressingVisualizer.tsx + test
**Files:** `src/components/visualizers/HashTableOpenAddressingVisualizer.tsx`, `tests/components/HashTableOpenAddressingVisualizer.test.tsx`

Layout: horizontal row of `slots.length` fixed-width boxes.

- Null slot: `bg-bg-surface border border-border-subtle` with `—` text
- Occupied slot: `bg-bg-elevated text-text-primary` showing `key`
- `probeIndex` slot: `ring-2 ring-accent-primary`
- Slots in `probeSequence` (not current probe): `ring-1 ring-status-warn/50`
- `inserting` slot (just placed): `bg-accent-primary text-bg-base`
- Tombstone: `bg-status-danger/20` with `✕`

`data-testid="oa-slot-{i}"` on each slot.

Null snapshot → `<div data-testid="hash-oa-placeholder" />`

## Task 6 — fibonacci.ts + test
**Files:** `src/algorithms/dp/fibonacci.ts`, `tests/algorithms/fibonacci.test.ts`

Tabulation bottom-up. Input: `n`.

Displayed snippet:
```
1:  function fibonacci(n) {
2:    const dp = Array(n + 1).fill(0);
3:    dp[0] = 0; dp[1] = 1;
4:    for (let i = 2; i <= n; i++) {
5:      dp[i] = dp[i-1] + dp[i-2];
6:    }
7:    return dp[n];
8: }
```

Snapshot shape: 1D — use `table: [dp]` (single row), `current: [0, i]`, `reading: [[0, i-1], [0, i-2]]`.

Step contract: emit step for each cell fill (`line:5`) — show `current`, `reading`, updated `table`, `answer` once done.
Variables: `{ i, 'dp[i-1]': prev1, 'dp[i-2]': prev2, 'dp[i]': curr }`.
`finalResult`: `dp[n]` (the Fibonacci number).

## Task 7 — knapsack01.ts + test
**Files:** `src/algorithms/dp/knapsack01.ts`, `tests/algorithms/knapsack01.test.ts`

2D table: rows = items (0..n), cols = capacity (0..W).
`dp[i][w] = max(dp[i-1][w], values[i-1] + dp[i-1][w - weights[i-1]])`

Displayed snippet:
```
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
```

Snapshot: `table` = full 2D dp array (null for unfilled), `current: [i, w]`, `reading: [[i-1, w]]` or `[[i-1, w], [i-1, w-weights[i-1]]]`, `rowLabels: ['', 'item1', ...]`, `colLabels: ['0', '1', ...]`.
Step contract: one step per cell fill.
Variables: `{ item: i, capacity: w, take: value, skip: value }`.
`finalResult`: `dp[n][W]`.

## Task 8 — lcs.ts + test
**Files:** `src/algorithms/dp/lcs.ts`, `tests/algorithms/lcs.test.ts`

2D table. After fill, emit traceback steps.

Displayed snippet:
```
1:  function lcs(a, b) {
2:    const m = a.length, n = b.length;
3:    const dp = Array(m+1).fill(0).map(() => Array(n+1).fill(0));
4:    for (let i = 1; i <= m; i++)
5:      for (let j = 1; j <= n; j++)
6:        if (a[i-1] === b[j-1])
7:          dp[i][j] = dp[i-1][j-1] + 1;
8:        else
9:          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
10:   // traceback
11:   let i = m, j = n, path = [];
12:   while (i > 0 && j > 0) {
13:     if (a[i-1] === b[j-1]) { path.push([i,j]); i--; j--; }
14:     else if (dp[i-1][j] > dp[i][j-1]) i--;
15:     else j--;
16:   }
17:   return path.reverse();
18: }
```

Steps:
- Fill phase: one step per cell (`line: 7` or `9`), `current`, `reading`, `rowLabels: ['', ...a]`, `colLabels: ['', ...b]`
- Traceback phase: one step per traceback move (`line: 13-15`), `traceback` array grows, `current` moves
`finalResult`: the LCS string.

## Task 9 — DPTableVisualizer.tsx + test
**Files:** `src/components/visualizers/DPTableVisualizer.tsx`, `tests/components/DPTableVisualizer.test.tsx`

Grid layout. Row/col labels on top and left.

Cell states (color):
- `null` (unfilled): `bg-bg-surface text-text-muted` showing `—`
- `current` cell: `bg-accent-primary text-bg-base`
- `reading` cells: `ring-2 ring-accent-secondary`
- `traceback` path cells: `ring-2 ring-status-danger`
- filled (has value): `bg-bg-elevated text-text-primary`

`data-testid="dp-cell-{r}-{c}"` on each cell. `data-state` attribute.
Row/col labels: `text-xs font-mono text-text-muted`.

Null snapshot → `<div data-testid="dp-table-placeholder" />`

## Task 10 — Data files (hash table + DP)
**Files:** `src/data/codeSnippets.ts`, `src/data/complexities.ts`, `src/data/keyInsights.ts`, `src/data/neetcodeProblems.ts`

### complexities.ts:
```ts
'chaining':       { time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' }, space: 'O(n)', notes: 'Worst case when all keys hash to the same bucket.' },
'open-addressing':{ time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' }, space: 'O(n)', notes: 'Performance degrades as load factor approaches 1; rehash at ~70%.' },
'fibonacci':      { time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' }, space: 'O(n)' },
'knapsack-01':    { time: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)' }, space: 'O(nW)', notes: 'n = item count, W = capacity. Space can be reduced to O(W) with 1D rolling array.' },
'lcs':            { time: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' }, space: 'O(mn)', notes: 'm and n are lengths of the two strings.' },
```

### neetcodeProblems.ts — add 'hash-table' and 'dp' keys:

Hash table (10 problems from master plan §5.8):
Beginner: contains-duplicate, valid-anagram, two-sum, group-anagrams, top-k-frequent-elements
Advanced: longest-consecutive-sequence, subarray-sum-equals-k, 4sum-ii, design-hashmap, insert-delete-getrandom-o1

DP (10 problems from master plan §5.9):
Beginner: climbing-stairs, min-cost-climbing-stairs, house-robber, house-robber-ii, maximum-subarray
Advanced: partition-equal-subset-sum, longest-common-subsequence, edit-distance, longest-increasing-subsequence, coin-change

### codeSnippets.ts + keyInsights.ts — add entries for all 5 new algorithm IDs.

## Task 11 — HashTablePage.tsx
**File:** `src/routes/HashTablePage.tsx`

Two tabs: Chaining and Open Addressing. Single visualizer slot — swap based on active tab.

```tsx
const HASH_TABS = [
  { id: 'chaining'        as const, label: 'Chaining' },
  { id: 'open-addressing' as const, label: 'Open Addressing' },
];
```

Pattern: same as `BSTPage.tsx` — single visualizer type changes based on active tab.
InputPanel: user enters `key:value` pairs one per line, or use default. Keep it simple — just a reset button is fine (no custom input parsing needed for now, complex parsing is polish).
ProblemsSidebar topicId: `'hash-table'`.

## Task 12 — DPPage.tsx
**File:** `src/routes/DPPage.tsx`

Three tabs: Fibonacci, Knapsack 0/1, LCS.

```tsx
const DP_TABS = [
  { id: 'fibonacci'    as const, label: 'Fibonacci' },
  { id: 'knapsack-01'  as const, label: 'Knapsack' },
  { id: 'lcs'          as const, label: 'LCS' },
];
```

Pattern: same as `BinaryTreePage.tsx`.
InputPanel: just reset-to-default for now.
ProblemsSidebar topicId: `'dp'`.

## Task 13 — Polish
**Files:** Multiple

1. **Keyboard hint row** — add near `PlaybackControls` in `src/components/controls/PlaybackControls.tsx` or as static text in `SortingPage.tsx`, `HashTablePage.tsx`, `DPPage.tsx`: a small `<p className="text-xs text-text-muted font-mono">space ▶  ← → step  R reset</p>` below PlaybackControls. Actually add it to `PlaybackControls.tsx` component directly so all pages get it.

2. **CallStackPanel subtitle** — in `src/components/panels/CallStackPanel.tsx`, add subtitle `"Recursion depth — each frame is an active function call"` below the panel label.

3. **ProblemsSidebar new-tab links** — verify all `<a>` links in `src/components/panels/ProblemsSidebar.tsx` have `target="_blank" rel="noopener noreferrer"`.

4. **Remove "Coming soon"** from any remaining stub pages (HashTablePage and DPPage are built in tasks 11-12, but verify SortingPage too).

Run `pnpm test --run && pnpm typecheck && pnpm build` to verify all passes.
