# Session 8 — Sorting (Step Mode + Race Mode)

## Context
Working directory: `/Users/patipanb/Obsidian/DSAWebApp`
Branch: main
Existing AlgorithmIds in `src/types/algorithm.ts`: `'bubble-sort' | 'merge-sort' | 'quick-sort' | 'heap-sort'` (already added)
Existing pattern: `createRunBuilder<Snapshot>(algorithmId, input)` → `.push({line, narration, snapshot, variables})` → `.build(finalResult)`
Template page: `src/routes/GraphPage.tsx` (most recent — use as template for SortingPage)
Template algorithm: `src/algorithms/graph/bfsGrid.ts`
Test pattern: result test + `serializeRun(run).toMatchSnapshot()` trace test in `tests/algorithms/`

## Task 1 — Types + Inputs
**Files:** `src/types/snapshots.ts`, `src/types/algorithm.ts`

Add to `src/types/snapshots.ts` after `AdjacencySnapshot`:
```ts
export interface SortingSnapshot {
  values: number[];
  comparing: number[];   // indices being compared this step
  swapped: number[];     // indices just swapped
  sorted: number[];      // indices in final position (green)
  pivot?: number;        // quicksort: pivot index
  subarray?: { start: number; end: number };
  auxArray?: number[];   // merge sort scratch array
  heapBoundary?: number; // heap sort: last heap element index
}
```

Add to `src/types/algorithm.ts`:
```ts
export interface SortingInput {
  values: number[];
}
export const DEFAULT_SORTING_INPUT: SortingInput = {
  values: [5, 2, 8, 1, 9, 3, 7, 4, 6],
};
```

No test needed (pure type additions). Verify with `pnpm typecheck`.

## Task 2 — bubble.ts + test
**Files:** `src/algorithms/sorting/bubble.ts`, `tests/algorithms/bubble.test.ts`

Algorithm: standard bubble sort, swap adjacent elements.

Displayed snippet (line numbers used in `.push({line: N})`):
```
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
```

Step contract:
- Emit a step for each comparison (`line: 4`) showing `comparing: [j, j+1]`, `swapped: []`
- If swap occurs, emit an additional step (`line: 5`) with `swapped: [j, j+1]`
- After each outer pass, update `sorted` to include the newly settled index (`values.length - 1 - i`)
- Variables: `{ i, j, comparisons }`
- `finalResult`: sorted array copy

Input: `DEFAULT_SORTING_INPUT = [5, 2, 8, 1, 9, 3, 7, 4, 6]`

Tests:
1. Result test: `run.finalResult` deep equals `[1, 2, 3, 4, 5, 6, 7, 8, 9]`
2. Trace test: `expect(serializeRun(run)).toMatchSnapshot()`

serializeRun is at `src/engine/serializeRun.ts` — import and use it.

## Task 3 — merge.ts + test
**Files:** `src/algorithms/sorting/merge.ts`, `tests/algorithms/merge.test.ts`

Algorithm: top-down merge sort using `auxArray`.

Displayed snippet:
```
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
```

Step contract:
- Emit a step each time an element is written back to the array during merge (`line: 13` or `14`)
- `subarray: { start: l, end: r }` — the range being merged
- `auxArray` = current state of the left+right halves being merged
- `comparing: [i+l, j+mid+1]` (original indices)
- `sorted` grows: after merging a range that covers the full array, mark sorted
- After full sort, emit one final step with `sorted: [0..n-1]`
- Variables: `{ l, r, mid }`
- `finalResult`: sorted array

## Task 4 — quick.ts + test
**Files:** `src/algorithms/sorting/quick.ts`, `tests/algorithms/quick.test.ts`

Algorithm: iterative quicksort with last-element pivot. Use an explicit stack to avoid recursion.

Displayed snippet:
```
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
```

Step contract:
- Emit a step for each comparison in partition (`line: 11`) — `pivot: pivotIndex`, `comparing: [j, r]`, `subarray: {start: l, end: r}`
- Emit a step for each swap in partition (`line: 13`) — `swapped: [i, j]`
- Emit a step when pivot is placed (`line: 16`) — `swapped: [i+1, r]`, mark pivot index as `sorted`
- Variables: `{ pivot: pivotValue, i, j }`
- `finalResult`: sorted array

## Task 5 — heap.ts + test
**Files:** `src/algorithms/sorting/heap.ts`, `tests/algorithms/heap.test.ts`

Algorithm: iterative heap sort (build max-heap, then extract-max).

Displayed snippet:
```
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
```

Step contract:
- Build phase: emit step for each heapify swap (`line: 15`) — `swapped: [i, largest]`, `heapBoundary: n`
- Extract phase: emit step for each root swap (`line: 6`) — `swapped: [0, i]`, `heapBoundary: i`; mark `i` as sorted
- Variables: `{ heapSize, swaps }`
- `finalResult`: sorted array

## Task 6 — SortingVisualizer.tsx + test
**Files:** `src/components/visualizers/SortingVisualizer.tsx`, `tests/components/SortingVisualizer.test.tsx`

Vertical bar chart. One `div` per value. Bar height = `(value / max) * 100%`.

Color priority (highest wins):
- `sorted.includes(i)` → `bg-status-success`
- `swapped.includes(i)` → `bg-status-danger`
- `comparing.includes(i)` → `bg-status-warn`
- `i === pivot` → ring `ring-2 ring-accent-secondary` on top of default color
- default → `bg-bg-elevated`

Props:
```tsx
interface Props {
  snapshot: SortingSnapshot | null;
  label?: string; // for race mode: "Bubble Sort" etc.
}
```

Layout: `flex items-end gap-0.5 h-48 w-full` container, each bar is `flex-1 rounded-t-sm transition-all`.
Add `data-testid="sorting-bar-{i}"` and `data-state` on each bar.
Show `label` as `text-xs text-text-muted font-mono` below the chart if provided.

Test: renders correct number of bars, active bar has correct data-state, null snapshot shows placeholder.

## Task 7 — Data files (sorting)
**Files:** `src/data/codeSnippets.ts`, `src/data/complexities.ts`, `src/data/keyInsights.ts`, `src/data/neetcodeProblems.ts`

Add entries for `'bubble-sort'`, `'merge-sort'`, `'quick-sort'`, `'heap-sort'`.

### codeSnippets.ts — add 4 entries matching the displayed snippets from tasks 2-5 exactly.

### complexities.ts:
```ts
'bubble-sort': { time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' }, space: 'O(1)', notes: 'Best case when array is already sorted (no swaps in any pass).' },
'merge-sort':  { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(n)', notes: 'Auxiliary array required for merging. Stable sort.' },
'quick-sort':  { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' }, space: 'O(log n)', notes: 'Worst case on already-sorted input with last-element pivot; mitigated by randomized pivot.' },
'heap-sort':   { time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' }, space: 'O(1)', notes: 'In-place. Not stable. Build heap is O(n); each of n extractions is O(log n).' },
```

### keyInsights.ts — add 4 entries (one-sentence mental models).

### neetcodeProblems.ts — add 'sorting' key with 10 problems (5 beginner + 5 advanced from master plan §5.7):
Beginner: sort-an-array, sort-colors, merge-sorted-array, height-checker, relative-sort-array
Advanced: kth-largest-element-in-an-array, merge-intervals, largest-number, count-of-smaller-numbers-after-self, reverse-pairs

## Task 8 — SortingPage.tsx
**File:** `src/routes/SortingPage.tsx`

Two modes: Step and Race. Toggle button like GraphPage's view-mode toggle.

**Step mode** (default): single algorithm, full controls. Tabs: Bubble, Merge, Quick, Heap.
- Uses `useAlgorithmRun(run)` + `useKeyboardControls(runner)` + `useRunStore`
- Layout matches `GraphPage.tsx` pattern: TopicHeader → toggle button → KeyInsightCallout → AlgorithmTabs → visualizer-slot → StepNarration → PlaybackControls+SpeedSlider → InputPanel → CodePanel+ComplexityBadge+VariableInspector
- InputPanel: user pastes comma-separated numbers, parse with `src/utils/parseArray.ts`
- ProblemsSidebar in the right aside

**Race mode**: 4 independent runners (bubble, merge, quick, heap) on the same input, wall-clock normalized.
- Each runner: `useAlgorithmRun(run)` but speed = `totalDurationMs / steps.length` where `totalDurationMs = 4000`
- Single shared Play/Pause/Reset button row
- No step-back, no scrubbing in race mode
- 2×2 grid of SortingVisualizer with `label` prop showing algorithm name
- No CodePanel/ComplexityBadge/VariableInspector in race mode (too cluttered)

```tsx
const ALGO_TABS = [
  { id: 'bubble-sort' as const, label: 'Bubble' },
  { id: 'merge-sort'  as const, label: 'Merge'  },
  { id: 'quick-sort'  as const, label: 'Quick'  },
  { id: 'heap-sort'   as const, label: 'Heap'   },
];
```

Input parsing: use `parseArray` from `src/utils/parseArray.ts`. If parse fails show error in InputPanel.
Default input: `DEFAULT_SORTING_INPUT`.

No new tests needed for SortingPage (integration is covered by algorithm + visualizer tests).
Run `pnpm test --run && pnpm typecheck` at end.
