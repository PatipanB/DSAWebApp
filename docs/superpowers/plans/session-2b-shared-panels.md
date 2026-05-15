# Session 2b — Full Shared Panels + Arrays / Sliding Window

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read `docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md` before starting — canonical on architecture and naming.

**Goal:** Complete the `/arrays` page with all shared panels (CodePanel, ComplexityBadge, ProblemsSidebar, StepNarration, VariableInspector, CallStackPanel, KeyInsightCallout, InputPanel, AlgorithmTabs) and a second algorithm (Sliding Window), locking down the reusable topic-page template for all subsequent sessions.

**Architecture:** All new panels are pure display components receiving props — no internal data fetching. Data files (`codeSnippets`, `complexities`, `neetcodeProblems`, `defaultInputs`, `keyInsights`) are keyed by `AlgorithmId`/`TopicId`. `ArraysPage` is refactored to a two-column layout (main content + `ProblemsSidebar`). `AlgorithmTabs` drives algorithm switching; `InputPanel` is a container with a Run button and error display; algorithm-specific fields are passed as children.

**Tech Stack:** Vitest (TDD throughout), `prism-react-renderer` (syntax highlighting), Tailwind CSS, Zustand (prefsStore extended with `codeLanguage`).

---

## File Plan

```
src/
  types/
    problems.ts          NEW — Problem interface
  data/
    codeSnippets.ts      NEW — TS + Python lines per AlgorithmId
    complexities.ts      NEW — ComplexityEntry + COMPLEXITIES map
    neetcodeProblems.ts  NEW — NEETCODE_PROBLEMS (arrays only)
    defaultInputs.ts     NEW — DEFAULT_INPUTS per AlgorithmId
    keyInsights.ts       NEW — KEY_INSIGHTS per AlgorithmId
  store/
    prefsStore.ts        MODIFY — add codeLanguage / setCodeLanguage
  types/
    algorithm.ts         MODIFY — add SlidingWindowInput
  algorithms/
    arrays/
      slidingWindow.ts   NEW — instrumented sliding-window algorithm
  components/
    controls/
      AlgorithmTabs.tsx  NEW — tab strip wrapping Tabs primitive
      InputPanel.tsx     NEW — Run button + error + children slot
    panels/
      StepNarration.tsx  NEW — aria-live step narration
      VariableInspector.tsx NEW — live variable table
      CallStackPanel.tsx NEW — recursion frame list
      KeyInsightCallout.tsx NEW — collapsible mental-model callout
      CodePanel.tsx      NEW — prism-highlighted code + line highlight + lang toggle
      ComplexityBadge.tsx NEW — best/avg/worst time + space badges
      ProblemsSidebar.tsx NEW — NeetCode links grouped by difficulty
    visualizers/
      ArrayVisualizer.tsx MODIFY — highlight window region for sliding-window
  routes/
    ArraysPage.tsx       MODIFY — full two-column layout with all panels

tests/
  components/
    AlgorithmTabs.test.tsx   NEW
    InputPanel.test.tsx      NEW
    StepNarration.test.tsx   NEW
    VariableInspector.test.tsx NEW
    CallStackPanel.test.tsx  NEW
    KeyInsightCallout.test.tsx NEW
    CodePanel.test.tsx       NEW
    ComplexityBadge.test.tsx NEW
    ProblemsSidebar.test.tsx NEW
    ArrayVisualizer.test.tsx MODIFY — add window-highlighting tests
  algorithms/
    slidingWindow.test.ts    NEW
```

---

## Task 1: Install prism-react-renderer and extend prefsStore + algorithm types

**Files:**
- Modify: `package.json` (via pnpm install)
- Modify: `src/store/prefsStore.ts`
- Modify: `src/types/algorithm.ts`

- [ ] **Step 1.1: Install prism-react-renderer**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && pnpm add prism-react-renderer
```

Expected output: `dependencies: + prism-react-renderer …`

- [ ] **Step 1.2: Extend `src/store/prefsStore.ts`**

Replace the entire file:

```ts
import { create } from 'zustand';

interface PrefsState {
  speedIndex: number;
  setSpeedIndex: (i: number) => void;
  codeLanguage: 'ts' | 'py';
  setCodeLanguage: (l: 'ts' | 'py') => void;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const usePrefsStore = create<PrefsState>((set) => ({
  speedIndex: 2,
  setSpeedIndex: (i) => set({ speedIndex: clamp(i, 0, 4) }),
  codeLanguage: 'ts',
  setCodeLanguage: (l) => set({ codeLanguage: l }),
}));
```

- [ ] **Step 1.3: Add `SlidingWindowInput` to `src/types/algorithm.ts`**

Append to the existing file (do not replace — `AlgorithmId` union is already there):

```ts
export interface SlidingWindowInput {
  values: number[];
  k: number;
}

export const DEFAULT_SLIDING_WINDOW_INPUT: SlidingWindowInput = {
  values: [2, 1, 5, 1, 3, 2],
  k: 3,
};
```

- [ ] **Step 1.4: Verify**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 1.5: Commit**

```bash
git add -A && git commit -m "feat(setup): prism-react-renderer, codeLanguage pref, SlidingWindowInput"
```

---

## Task 2: Create `src/types/problems.ts`

**Files:**
- Create: `src/types/problems.ts`

- [ ] **Step 2.1: Create `src/types/problems.ts`**

```ts
export interface Problem {
  title: string;
  slug: string;
  difficulty: 'beginner' | 'advanced';
  hint: string;
}
```

- [ ] **Step 2.2: Verify**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 2.3: Commit**

```bash
git add src/types/problems.ts && git commit -m "feat(types): Problem interface"
```

---

## Task 3: Populate data files for arrays

**Files:**
- Create: `src/data/codeSnippets.ts`
- Create: `src/data/complexities.ts`
- Create: `src/data/neetcodeProblems.ts`
- Create: `src/data/defaultInputs.ts`
- Create: `src/data/keyInsights.ts`

- [ ] **Step 3.1: Create `src/data/codeSnippets.ts`**

```ts
import type { AlgorithmId } from '@/types/algorithm';

interface CodeSnippet {
  ts: string[];
  py: string[];
}

export const CODE_SNIPPETS: Partial<Record<AlgorithmId, CodeSnippet>> = {
  'two-pointers': {
    ts: [
      'function twoPointers(values: number[], target: number) {',
      '  let l = 0, r = values.length - 1;',
      '  while (l < r) {',
      '    const sum = values[l] + values[r];',
      '    if (sum === target) return [l, r];',
      '    if (sum < target) l++;',
      '    else r--;',
      '  }',
      '  return null;',
      '}',
    ],
    py: [
      'def two_pointers(values, target):',
      '    l, r = 0, len(values) - 1',
      '    while l < r:',
      '        s = values[l] + values[r]',
      '        if s == target:',
      '            return [l, r]',
      '        elif s < target:',
      '            l += 1',
      '        else:',
      '            r -= 1',
      '    return None',
    ],
  },
  'sliding-window': {
    ts: [
      'function slidingWindow(values: number[], k: number) {',
      '  let sum = 0;',
      '  for (let i = 0; i < k; i++) sum += values[i];',
      '  let max = sum;',
      '  for (let r = k; r < values.length; r++) {',
      '    sum += values[r] - values[r - k];',
      '    if (sum > max) max = sum;',
      '  }',
      '  return max;',
      '}',
    ],
    py: [
      'def sliding_window(values, k):',
      '    s = sum(values[:k])',
      '    mx = s',
      '    for r in range(k, len(values)):',
      '        s += values[r] - values[r - k]',
      '        if s > mx:',
      '            mx = s',
      '    return mx',
    ],
  },
};
```

- [ ] **Step 3.2: Create `src/data/complexities.ts`**

```ts
import type { AlgorithmId } from '@/types/algorithm';

export interface ComplexityEntry {
  time: { best: string; average: string; worst: string };
  space: string;
  notes?: string;
}

export const COMPLEXITIES: Partial<Record<AlgorithmId, ComplexityEntry>> = {
  'two-pointers': {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Best case: target pair sits at the outermost positions (immediate match).',
  },
  'sliding-window': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
  },
};
```

- [ ] **Step 3.3: Create `src/data/neetcodeProblems.ts`**

```ts
import type { TopicId } from '@/types/topic';
import type { Problem } from '@/types/problems';

export const NEETCODE_PROBLEMS: Partial<Record<TopicId, Problem[]>> = {
  arrays: [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'beginner',
      hint: 'Cross-references the Hash Table topic.',
    },
    {
      title: 'Valid Palindrome',
      slug: 'valid-palindrome',
      difficulty: 'beginner',
      hint: 'Two cyan/amber pointers converging is exactly the trace you need.',
    },
    {
      title: 'Two Sum II – Input Array Is Sorted',
      slug: 'two-sum-ii-input-array-is-sorted',
      difficulty: 'beginner',
      hint: 'Mirrors the default two-pointer example directly.',
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      slug: 'best-time-to-buy-and-sell-stock',
      difficulty: 'beginner',
      hint: "Visualizer's sliding-window mode shows the running min/max.",
    },
    {
      title: 'Contains Duplicate',
      slug: 'contains-duplicate',
      difficulty: 'beginner',
      hint: 'Cross-references the Hash Table topic.',
    },
    {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      difficulty: 'advanced',
      hint: 'Two pointers + a max-area variable in the inspector.',
    },
    {
      title: '3Sum',
      slug: '3sum',
      difficulty: 'advanced',
      hint: 'Outer loop + inner two-pointer pass, both visible at once.',
    },
    {
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      difficulty: 'advanced',
      hint: 'Left/right running maxima rendered as height bars over the array.',
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      difficulty: 'advanced',
      hint: 'Variable-size window with a set highlighted in VariableInspector.',
    },
    {
      title: 'Minimum Window Substring',
      slug: 'minimum-window-substring',
      difficulty: 'advanced',
      hint: 'Window grows/shrinks; the "need" map is shown live.',
    },
  ],
};
```

- [ ] **Step 3.4: Create `src/data/defaultInputs.ts`**

```ts
import type { AlgorithmId } from '@/types/algorithm';

export const DEFAULT_INPUTS: Partial<Record<AlgorithmId, unknown>> = {
  'two-pointers': { values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 },
  'sliding-window': { values: [2, 1, 5, 1, 3, 2], k: 3 },
};
```

- [ ] **Step 3.5: Create `src/data/keyInsights.ts`**

```ts
import type { AlgorithmId } from '@/types/algorithm';

export const KEY_INSIGHTS: Partial<Record<AlgorithmId, string>> = {
  'two-pointers':
    'Move the pointer with the smaller contribution inward — since the array is sorted, this is the only move guaranteed to shift the sum toward the target.',
  'sliding-window':
    'Keep a fixed-size window by adding the incoming element and dropping the outgoing one each step — one O(n) pass replaces an O(n²) brute force.',
};
```

- [ ] **Step 3.6: Typecheck**

```bash
pnpm typecheck
```

Expected: zero errors.

- [ ] **Step 3.7: Commit**

```bash
git add -A && git commit -m "feat(data): codeSnippets, complexities, neetcodeProblems, defaultInputs, keyInsights for arrays"
```

---

## Task 4: `slidingWindow` algorithm (TDD — result + trace snapshot)

**Files:**
- Test: `tests/algorithms/slidingWindow.test.ts`
- Create: `src/algorithms/arrays/slidingWindow.ts`
- Modify: `src/components/visualizers/ArrayVisualizer.tsx` (add window highlight)
- Modify: `tests/components/ArrayVisualizer.test.tsx` (add window test)

> **Critical contract:** Both a result test AND a trace snapshot test are required per the master plan §3.1.

- [ ] **Step 4.1: Write failing tests**

Create `tests/algorithms/slidingWindow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { slidingWindow } from '@/algorithms/arrays/slidingWindow';
import { serializeRun } from '@/engine/serializeRun';

describe('slidingWindow', () => {
  describe('result', () => {
    it('finds max sum 9 for [2,1,5,1,3,2] k=3', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      expect(run.finalResult).toBe(9);
    });

    it('finds max sum for [1,2,3,4,5] k=2', () => {
      const run = slidingWindow({ values: [1, 2, 3, 4, 5], k: 2 });
      expect(run.finalResult).toBe(9); // 4+5
    });

    it('works when window equals array length', () => {
      const run = slidingWindow({ values: [3, 1, 2], k: 3 });
      expect(run.finalResult).toBe(6);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits steps for both init window and each slide', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      // init (1) + 3 slides (at r=3,4,5) + return (1) = at least 5 steps
      expect(run.steps.length).toBeGreaterThanOrEqual(5);
    });

    it('all steps have valid line numbers (1-based)', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      for (const step of run.steps) {
        expect(step.line).toBeGreaterThan(0);
      }
    });

    it('window field present in every snapshot', () => {
      const run = slidingWindow({ values: [2, 1, 5, 1, 3, 2], k: 3 });
      for (const step of run.steps) {
        expect(step.snapshot.window).toBeDefined();
      }
    });
  });
});
```

- [ ] **Step 4.2: Run (expect fail)**

```bash
pnpm test -- slidingWindow 2>&1 | head -10
```

Expected: FAIL — "Cannot find module '@/algorithms/arrays/slidingWindow'".

- [ ] **Step 4.3: Implement `src/algorithms/arrays/slidingWindow.ts`**

```ts
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
    snapshot: { values, pointers: [], window: { start: values.length - k, end: values.length - 1 }, sum: maxSum, result: maxSum },
    variables: { sum: maxSum, max: maxSum, k },
  });

  return r.build(maxSum);
}
```

- [ ] **Step 4.4: Run result tests (expect pass, snapshot written on first run)**

```bash
pnpm test -- slidingWindow 2>&1 | head -30
```

Expected: result tests pass; snapshot written.

- [ ] **Step 4.5: Run again (expect all pass)**

```bash
pnpm test -- slidingWindow
```

Expected: all 8 tests pass.

- [ ] **Step 4.6: Update `ArrayVisualizer` to highlight window region**

In `src/components/visualizers/ArrayVisualizer.tsx`, add window highlighting. Replace the entire file:

```tsx
import { cn } from '@/utils/classNames';
import type { ArraySnapshot, ArrayPointer } from '@/types/snapshots';

const POINTER_COLOR: Record<ArrayPointer['color'], string> = {
  cyan:  'text-accent-secondary border-accent-secondary',
  amber: 'text-accent-primary  border-accent-primary',
  rose:  'text-status-danger   border-status-danger',
};

const CELL_HIGHLIGHT: Record<ArrayPointer['color'], string> = {
  cyan:  'ring-2 ring-accent-secondary bg-accent-secondary/10',
  amber: 'ring-2 ring-accent-primary  bg-accent-primary/10',
  rose:  'ring-2 ring-status-danger   bg-status-danger/10',
};

interface Props {
  snapshot: ArraySnapshot | null;
}

export function ArrayVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { values, pointers, window: win } = snapshot;

  const ptrAt = new Map<number, ArrayPointer>();
  for (const p of pointers) {
    if (!ptrAt.has(p.index)) ptrAt.set(p.index, p);
  }

  const inWindow = (i: number) =>
    win !== undefined && i >= win.start && i <= win.end;

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Pointer labels above cells */}
      <div className="flex gap-2">
        {values.map((_, i) => {
          const ptr = ptrAt.get(i);
          return (
            <div key={i} className="w-12 flex flex-col items-center">
              {ptr ? (
                <span className={cn('text-xs font-mono font-bold', POINTER_COLOR[ptr.color])}>
                  {ptr.name}
                </span>
              ) : (
                <span className="text-xs invisible">_</span>
              )}
              {ptr && (
                <div
                  className={cn(
                    'w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent',
                    `border-t-current`,
                    POINTER_COLOR[ptr.color].split(' ')[0],
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Cells */}
      <div className="flex gap-2">
        {values.map((v, i) => {
          const ptr = ptrAt.get(i);
          const windowed = inWindow(i);
          return (
            <div
              key={i}
              data-testid={`cell-${i}`}
              data-window={windowed ? 'true' : undefined}
              className={cn(
                'w-12 h-12 flex items-center justify-center text-lg font-mono font-semibold rounded-lg border transition',
                'bg-bg-elevated text-text-primary border-border-subtle',
                windowed && !ptr && 'bg-accent-secondary/10 border-accent-secondary',
                ptr && CELL_HIGHLIGHT[ptr.color],
              )}
            >
              {v}
            </div>
          );
        })}
      </div>

      {/* Index labels below cells */}
      <div className="flex gap-2">
        {values.map((_, i) => (
          <div key={i} className="w-12 text-center text-xs font-mono text-text-muted">
            {i}
          </div>
        ))}
      </div>

      {snapshot.sum !== undefined && (
        <div className="text-sm font-mono text-text-secondary">
          sum = <span className="text-accent-primary font-bold">{snapshot.sum}</span>
          {snapshot.result !== undefined && (
            <span className="ml-4">
              max = <span className="text-status-success font-bold">{String(snapshot.result)}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.7: Update `tests/components/ArrayVisualizer.test.tsx` — add window test**

Append these tests to the existing describe block in `tests/components/ArrayVisualizer.test.tsx`:

```tsx
it('highlights window cells when window is set', () => {
  const snap: ArraySnapshot = {
    values: [2, 1, 5, 1, 3, 2],
    pointers: [],
    window: { start: 1, end: 3 },
  };
  const { container } = render(<ArrayVisualizer snapshot={snap} />);
  const windowed = container.querySelectorAll('[data-window="true"]');
  expect(windowed.length).toBe(3); // cells 1, 2, 3
});

it('does not mark cells outside window', () => {
  const snap: ArraySnapshot = {
    values: [2, 1, 5, 1, 3, 2],
    pointers: [],
    window: { start: 1, end: 3 },
  };
  const { container } = render(<ArrayVisualizer snapshot={snap} />);
  const cell0 = container.querySelector('[data-testid="cell-0"]');
  expect(cell0?.getAttribute('data-window')).toBeNull();
});
```

- [ ] **Step 4.8: Run full suite**

```bash
pnpm test
```

Expected: all tests pass (prior 64 + new sliding window + visualizer window tests).

- [ ] **Step 4.9: Commit**

```bash
git add -A && git commit -m "feat(algo): slidingWindow with TDD + ArrayVisualizer window highlight"
```

---

## Task 5: `AlgorithmTabs` component (TDD)

**Files:**
- Test: `tests/components/AlgorithmTabs.test.tsx`
- Create: `src/components/controls/AlgorithmTabs.tsx`

- [ ] **Step 5.1: Write failing test**

Create `tests/components/AlgorithmTabs.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';

const TABS = [
  { id: 'two-pointers' as const, label: 'Two Pointers' },
  { id: 'sliding-window' as const, label: 'Sliding Window' },
];

describe('AlgorithmTabs', () => {
  it('renders a tab for each entry', () => {
    render(<AlgorithmTabs tabs={TABS} selectedId="two-pointers" onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /two pointers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sliding window/i })).toBeInTheDocument();
  });

  it('marks the selected tab as aria-selected', () => {
    render(<AlgorithmTabs tabs={TABS} selectedId="sliding-window" onSelect={vi.fn()} />);
    const tab = screen.getByRole('tab', { name: /sliding window/i });
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect with the tab id when clicked', async () => {
    const onSelect = vi.fn();
    render(<AlgorithmTabs tabs={TABS} selectedId="two-pointers" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('tab', { name: /sliding window/i }));
    expect(onSelect).toHaveBeenCalledWith('sliding-window');
  });
});
```

- [ ] **Step 5.2: Run (expect fail)**

```bash
pnpm test -- AlgorithmTabs 2>&1 | head -10
```

Expected: FAIL — "Cannot find module '@/components/controls/AlgorithmTabs'".

- [ ] **Step 5.3: Implement `src/components/controls/AlgorithmTabs.tsx`**

```tsx
import { Tabs } from '@/components/primitives/Tabs';
import type { AlgorithmId } from '@/types/algorithm';

interface AlgorithmTab {
  id: AlgorithmId;
  label: string;
}

interface Props {
  tabs: AlgorithmTab[];
  selectedId: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
}

export function AlgorithmTabs({ tabs, selectedId, onSelect }: Props) {
  return (
    <Tabs
      value={selectedId}
      onChange={onSelect}
      options={tabs.map((t) => ({ value: t.id, label: t.label }))}
    />
  );
}
```

- [ ] **Step 5.4: Run (expect pass)**

```bash
pnpm test -- AlgorithmTabs 2>&1 | head -10
```

Expected: 3 passed.

- [ ] **Step 5.5: Commit**

```bash
git add -A && git commit -m "feat(controls): AlgorithmTabs wrapping Tabs primitive"
```

---

## Task 6: `InputPanel` component (TDD)

**Files:**
- Test: `tests/components/InputPanel.test.tsx`
- Create: `src/components/controls/InputPanel.tsx`

- [ ] **Step 6.1: Write failing test**

Create `tests/components/InputPanel.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputPanel } from '@/components/controls/InputPanel';

describe('InputPanel', () => {
  it('renders children', () => {
    render(
      <InputPanel onRun={vi.fn()}>
        <input data-testid="custom-field" />
      </InputPanel>,
    );
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();
  });

  it('renders a Run button', () => {
    render(<InputPanel onRun={vi.fn()}><span /></InputPanel>);
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('calls onRun when Run clicked', async () => {
    const onRun = vi.fn();
    render(<InputPanel onRun={onRun}><span /></InputPanel>);
    await userEvent.click(screen.getByRole('button', { name: /run/i }));
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('shows error message when provided', () => {
    render(
      <InputPanel onRun={vi.fn()} error="Too many values.">
        <span />
      </InputPanel>,
    );
    expect(screen.getByText('Too many values.')).toBeInTheDocument();
  });

  it('does not show error container when error is null', () => {
    const { container } = render(
      <InputPanel onRun={vi.fn()} error={null}><span /></InputPanel>,
    );
    expect(container.querySelector('[data-testid="input-error"]')).toBeNull();
  });
});
```

- [ ] **Step 6.2: Run (expect fail)**

```bash
pnpm test -- InputPanel 2>&1 | head -10
```

Expected: FAIL — "Cannot find module '@/components/controls/InputPanel'".

- [ ] **Step 6.3: Implement `src/components/controls/InputPanel.tsx`**

```tsx
import type { ReactNode } from 'react';

interface Props {
  onRun: () => void;
  error?: string | null;
  children: ReactNode;
}

export function InputPanel({ onRun, error, children }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-4">
        {children}
        <button
          onClick={onRun}
          className="h-10 px-4 bg-accent-primary text-bg-base text-sm font-medium rounded-lg hover:brightness-110 transition"
        >
          Run
        </button>
      </div>
      {error && (
        <p data-testid="input-error" className="text-sm text-status-danger font-mono">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6.4: Run (expect pass)**

```bash
pnpm test -- InputPanel 2>&1 | head -10
```

Expected: 5 passed.

- [ ] **Step 6.5: Commit**

```bash
git add -A && git commit -m "feat(controls): InputPanel with children slot, Run button, error display"
```

---

## Task 7: `StepNarration` component (TDD)

**Files:**
- Test: `tests/components/StepNarration.test.tsx`
- Create: `src/components/panels/StepNarration.tsx`

- [ ] **Step 7.1: Write failing test**

Create `tests/components/StepNarration.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepNarration } from '@/components/panels/StepNarration';

describe('StepNarration', () => {
  it('renders the narration text', () => {
    render(<StepNarration narration="Compare: 3 + 8 = 11 vs target 11" />);
    expect(screen.getByText(/compare: 3 \+ 8/i)).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    const { container } = render(<StepNarration narration="some step" />);
    const el = container.querySelector('[aria-live="polite"]');
    expect(el).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<StepNarration narration="some step" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders nothing meaningful for empty narration', () => {
    const { container } = render(<StepNarration narration="" />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 7.2: Run (expect fail)**

```bash
pnpm test -- StepNarration 2>&1 | head -10
```

- [ ] **Step 7.3: Implement `src/components/panels/StepNarration.tsx`**

```tsx
interface Props {
  narration: string | undefined;
}

export function StepNarration({ narration }: Props) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-sm font-mono text-text-secondary border-l-2 border-accent-primary pl-3 min-h-[1.5rem]"
    >
      {narration ?? ''}
    </p>
  );
}
```

- [ ] **Step 7.4: Run (expect pass)**

```bash
pnpm test -- StepNarration 2>&1 | head -10
```

Expected: 4 passed.

- [ ] **Step 7.5: Commit**

```bash
git add -A && git commit -m "feat(panels): StepNarration with aria-live polite"
```

---

## Task 8: `VariableInspector` component (TDD)

**Files:**
- Test: `tests/components/VariableInspector.test.tsx`
- Create: `src/components/panels/VariableInspector.tsx`

- [ ] **Step 8.1: Write failing test**

Create `tests/components/VariableInspector.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VariableInspector } from '@/components/panels/VariableInspector';

describe('VariableInspector', () => {
  it('renders variable names and values', () => {
    render(<VariableInspector variables={{ l: 0, r: 7, sum: 14 }} />);
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('sum')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('renders nothing when variables is undefined', () => {
    const { container } = render(<VariableInspector variables={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when variables is empty', () => {
    const { container } = render(<VariableInspector variables={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('stringifies object values with JSON', () => {
    render(<VariableInspector variables={{ arr: [1, 2, 3] }} />);
    expect(screen.getByText('[1,2,3]')).toBeInTheDocument();
  });
});
```

- [ ] **Step 8.2: Run (expect fail)**

```bash
pnpm test -- VariableInspector 2>&1 | head -10
```

- [ ] **Step 8.3: Implement `src/components/panels/VariableInspector.tsx`**

```tsx
interface Props {
  variables: Record<string, unknown> | undefined;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function VariableInspector({ variables }: Props) {
  if (!variables || Object.keys(variables).length === 0) return null;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted mb-2 uppercase tracking-widest">Variables</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(variables).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle rounded-md px-2 py-1"
          >
            <span className="text-xs font-mono text-text-muted">{k}</span>
            <span className="text-xs font-mono font-bold text-accent-primary">
              {formatValue(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8.4: Run (expect pass)**

```bash
pnpm test -- VariableInspector 2>&1 | head -10
```

Expected: 4 passed.

- [ ] **Step 8.5: Commit**

```bash
git add -A && git commit -m "feat(panels): VariableInspector live variable table"
```

---

## Task 9: `CallStackPanel` component (TDD)

**Files:**
- Test: `tests/components/CallStackPanel.test.tsx`
- Create: `src/components/panels/CallStackPanel.tsx`

- [ ] **Step 9.1: Write failing test**

Create `tests/components/CallStackPanel.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallStackPanel } from '@/components/panels/CallStackPanel';

describe('CallStackPanel', () => {
  it('renders frame labels', () => {
    render(<CallStackPanel callStack={['dfs(3)', 'dfs(1)', 'dfs(0)']} />);
    expect(screen.getByText('dfs(3)')).toBeInTheDocument();
    expect(screen.getByText('dfs(1)')).toBeInTheDocument();
    expect(screen.getByText('dfs(0)')).toBeInTheDocument();
  });

  it('highlights the top (last) frame as current', () => {
    const { container } = render(
      <CallStackPanel callStack={['dfs(3)', 'dfs(1)', 'dfs(0)']} />,
    );
    const frames = container.querySelectorAll('[data-testid="stack-frame"]');
    // last element is the top of the stack (most recent call)
    expect(frames[frames.length - 1]).toHaveAttribute('data-current', 'true');
  });

  it('renders nothing when callStack is undefined', () => {
    const { container } = render(<CallStackPanel callStack={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when callStack is empty', () => {
    const { container } = render(<CallStackPanel callStack={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 9.2: Run (expect fail)**

```bash
pnpm test -- CallStackPanel 2>&1 | head -10
```

- [ ] **Step 9.3: Implement `src/components/panels/CallStackPanel.tsx`**

```tsx
import { cn } from '@/utils/classNames';

interface Props {
  callStack?: string[];
}

export function CallStackPanel({ callStack }: Props) {
  if (!callStack || callStack.length === 0) return null;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted mb-2 uppercase tracking-widest">Call Stack</p>
      <div className="flex flex-col-reverse gap-1">
        {callStack.map((frame, i) => {
          const isCurrent = i === callStack.length - 1;
          return (
            <div
              key={i}
              data-testid="stack-frame"
              data-current={isCurrent ? 'true' : undefined}
              className={cn(
                'px-3 py-1.5 rounded-md border font-mono text-xs transition',
                isCurrent
                  ? 'bg-accent-primary/10 border-accent-primary text-accent-primary font-bold'
                  : 'bg-bg-elevated border-border-subtle text-text-secondary',
              )}
            >
              {frame}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 9.4: Run (expect pass)**

```bash
pnpm test -- CallStackPanel 2>&1 | head -10
```

Expected: 4 passed.

- [ ] **Step 9.5: Commit**

```bash
git add -A && git commit -m "feat(panels): CallStackPanel for recursion frame display"
```

---

## Task 10: `KeyInsightCallout` component (TDD)

**Files:**
- Test: `tests/components/KeyInsightCallout.test.tsx`
- Create: `src/components/panels/KeyInsightCallout.tsx`

- [ ] **Step 10.1: Write failing test**

Create `tests/components/KeyInsightCallout.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';

describe('KeyInsightCallout', () => {
  it('shows the insight text', () => {
    render(<KeyInsightCallout algorithmId="two-pointers" />);
    expect(screen.getByText(/move the pointer/i)).toBeInTheDocument();
  });

  it('renders nothing for an algorithmId with no insight', () => {
    const { container } = render(<KeyInsightCallout algorithmId="bubble-sort" />);
    expect(container.firstChild).toBeNull();
  });

  it('is collapsible — clicking the header toggles visibility', async () => {
    render(<KeyInsightCallout algorithmId="two-pointers" />);
    // Initially expanded — text is visible
    expect(screen.getByText(/move the pointer/i)).toBeVisible();
    // Click to collapse
    await userEvent.click(screen.getByRole('button', { name: /key insight/i }));
    expect(screen.queryByText(/move the pointer/i)).not.toBeVisible();
    // Click to expand again
    await userEvent.click(screen.getByRole('button', { name: /key insight/i }));
    expect(screen.getByText(/move the pointer/i)).toBeVisible();
  });
});
```

- [ ] **Step 10.2: Run (expect fail)**

```bash
pnpm test -- KeyInsightCallout 2>&1 | head -10
```

- [ ] **Step 10.3: Implement `src/components/panels/KeyInsightCallout.tsx`**

```tsx
import { useState } from 'react';
import { KEY_INSIGHTS } from '@/data/keyInsights';
import type { AlgorithmId } from '@/types/algorithm';

interface Props {
  algorithmId: AlgorithmId;
}

export function KeyInsightCallout({ algorithmId }: Props) {
  const [open, setOpen] = useState(true);
  const insight = KEY_INSIGHTS[algorithmId];

  if (!insight) return null;

  return (
    <div className="rounded-lg border border-accent-primary/30 bg-accent-primary/5">
      <button
        aria-label="Key insight"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs font-mono font-semibold text-accent-primary uppercase tracking-widest"
      >
        <span>Key Insight</span>
        <span aria-hidden>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <p className="px-4 pb-3 text-sm text-text-secondary font-mono leading-relaxed">
          {insight}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 10.4: Run (expect pass)**

```bash
pnpm test -- KeyInsightCallout 2>&1 | head -10
```

Expected: 3 passed.

- [ ] **Step 10.5: Commit**

```bash
git add -A && git commit -m "feat(panels): KeyInsightCallout collapsible mental-model callout"
```

---

## Task 11: `ComplexityBadge` component (TDD)

**Files:**
- Test: `tests/components/ComplexityBadge.test.tsx`
- Create: `src/components/panels/ComplexityBadge.tsx`

- [ ] **Step 11.1: Write failing test**

Create `tests/components/ComplexityBadge.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import type { ComplexityEntry } from '@/data/complexities';

const TWO_POINTER_ENTRY: ComplexityEntry = {
  time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(1)',
  notes: 'Best case: outermost pair is the answer.',
};

const UNIFORM_ENTRY: ComplexityEntry = {
  time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(1)',
};

describe('ComplexityBadge', () => {
  it('renders best, avg, worst time badges when values differ', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    expect(screen.getByText('O(1)')).toBeInTheDocument(); // best
    expect(screen.getAllByText('O(n)').length).toBeGreaterThanOrEqual(1); // avg + worst
  });

  it('renders a single time badge when all three are equal', () => {
    render(<ComplexityBadge entry={UNIFORM_ENTRY} />);
    // Only one O(n) for time; one O(1) for space
    const on = screen.getAllByText('O(n)');
    expect(on.length).toBe(1);
  });

  it('renders space complexity', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    expect(screen.getByText(/space/i)).toBeInTheDocument();
  });

  it('renders notes when present', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    expect(screen.getByText(/best case/i)).toBeInTheDocument();
  });

  it('does not render notes section when notes absent', () => {
    render(<ComplexityBadge entry={UNIFORM_ENTRY} />);
    expect(screen.queryByText(/best case/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 11.2: Run (expect fail)**

```bash
pnpm test -- ComplexityBadge 2>&1 | head -10
```

- [ ] **Step 11.3: Implement `src/components/panels/ComplexityBadge.tsx`**

```tsx
import { cn } from '@/utils/classNames';
import type { ComplexityEntry } from '@/data/complexities';

const TIME_LABELS: Record<keyof ComplexityEntry['time'], string> = {
  best: 'Best',
  average: 'Avg',
  worst: 'Worst',
};

interface BadgeProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warn' | 'danger';
}

function TimeBadge({ label, value, variant = 'default' }: BadgeProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center px-3 py-1.5 rounded-md border text-xs font-mono',
        variant === 'default' && 'bg-bg-elevated border-border-subtle text-text-primary',
        variant === 'success' && 'bg-status-success/10 border-status-success text-status-success',
        variant === 'warn' && 'bg-status-warn/10 border-status-warn text-status-warn',
        variant === 'danger' && 'bg-status-danger/10 border-status-danger text-status-danger',
      )}
    >
      <span className="text-text-muted text-[10px] uppercase tracking-wide">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

interface Props {
  entry: ComplexityEntry;
}

export function ComplexityBadge({ entry }: Props) {
  const { best, average, worst } = entry.time;
  const allEqual = best === average && average === worst;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Complexity</p>

      <div>
        <p className="text-xs text-text-muted mb-1.5">Time</p>
        <div className="flex gap-2 flex-wrap">
          {allEqual ? (
            <TimeBadge label="All cases" value={best} />
          ) : (
            <>
              <TimeBadge label={TIME_LABELS.best} value={best} variant="success" />
              <TimeBadge label={TIME_LABELS.average} value={average} />
              <TimeBadge label={TIME_LABELS.worst} value={worst} variant="danger" />
            </>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted mb-1.5">Space</p>
        <TimeBadge label="Space" value={entry.space} />
      </div>

      {entry.notes && (
        <p className="text-xs text-text-muted italic leading-relaxed">{entry.notes}</p>
      )}
    </div>
  );
}
```

- [ ] **Step 11.4: Run (expect pass)**

```bash
pnpm test -- ComplexityBadge 2>&1 | head -10
```

Expected: 5 passed.

- [ ] **Step 11.5: Commit**

```bash
git add -A && git commit -m "feat(panels): ComplexityBadge best/avg/worst time + space"
```

---

## Task 12: `ProblemsSidebar` component (TDD)

**Files:**
- Test: `tests/components/ProblemsSidebar.test.tsx`
- Create: `src/components/panels/ProblemsSidebar.tsx`

- [ ] **Step 12.1: Write failing test**

Create `tests/components/ProblemsSidebar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';

describe('ProblemsSidebar', () => {
  it('renders beginner and advanced sections for arrays', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced/i)).toBeInTheDocument();
  });

  it('renders all 10 problem links for arrays', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(10);
  });

  it('links point to neetcode.io with the correct slug', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const link = screen.getByRole('link', { name: /valid palindrome/i });
    expect(link).toHaveAttribute('href', 'https://neetcode.io/problems/valid-palindrome');
  });

  it('links open in a new tab with noopener noreferrer', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('renders nothing for a topic with no problems yet', () => {
    const { container } = render(<ProblemsSidebar topicId="sorting" />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 12.2: Run (expect fail)**

```bash
pnpm test -- ProblemsSidebar 2>&1 | head -10
```

- [ ] **Step 12.3: Implement `src/components/panels/ProblemsSidebar.tsx`**

```tsx
import { NEETCODE_PROBLEMS } from '@/data/neetcodeProblems';
import type { TopicId } from '@/types/topic';

interface Props {
  topicId: TopicId;
}

export function ProblemsSidebar({ topicId }: Props) {
  const problems = NEETCODE_PROBLEMS[topicId];
  if (!problems || problems.length === 0) return null;

  const beginners = problems.filter((p) => p.difficulty === 'beginner');
  const advanced = problems.filter((p) => p.difficulty === 'advanced');

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-text-primary">NeetCode Problems</h2>

      {beginners.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-status-success uppercase tracking-widest mb-2">
            Beginner
          </h3>
          <ul className="flex flex-col gap-1.5">
            {beginners.map((p) => (
              <li key={p.slug}>
                <a
                  href={`https://neetcode.io/problems/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.hint}
                  className="block text-sm text-text-secondary hover:text-accent-primary transition truncate"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {advanced.length > 0 && (
        <section>
          <h3 className="text-xs font-mono text-status-warn uppercase tracking-widest mb-2">
            Advanced
          </h3>
          <ul className="flex flex-col gap-1.5">
            {advanced.map((p) => (
              <li key={p.slug}>
                <a
                  href={`https://neetcode.io/problems/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={p.hint}
                  className="block text-sm text-text-secondary hover:text-accent-primary transition truncate"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 12.4: Run (expect pass)**

```bash
pnpm test -- ProblemsSidebar 2>&1 | head -10
```

Expected: 5 passed.

- [ ] **Step 12.5: Commit**

```bash
git add -A && git commit -m "feat(panels): ProblemsSidebar NeetCode links"
```

---

## Task 13: `CodePanel` component (TDD)

**Files:**
- Test: `tests/components/CodePanel.test.tsx`
- Create: `src/components/panels/CodePanel.tsx`

- [ ] **Step 13.1: Write failing test**

Create `tests/components/CodePanel.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CodePanel } from '@/components/panels/CodePanel';

// prefsStore uses zustand; mock it so tests are isolated
vi.mock('@/store/prefsStore', () => ({
  usePrefsStore: (sel: (s: { codeLanguage: 'ts' | 'py'; setCodeLanguage: (l: 'ts' | 'py') => void }) => unknown) =>
    sel({ codeLanguage: 'ts', setCodeLanguage: vi.fn() }),
}));

describe('CodePanel', () => {
  it('renders code lines for the given algorithm', () => {
    render(<CodePanel algorithmId="two-pointers" currentLine={1} />);
    expect(screen.getByText(/twoPointers/)).toBeInTheDocument();
  });

  it('renders the TS/Python language toggle tabs', () => {
    render(<CodePanel algorithmId="two-pointers" currentLine={1} />);
    expect(screen.getByRole('tab', { name: /ts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /python/i })).toBeInTheDocument();
  });

  it('marks the active line with data-active', () => {
    const { container } = render(<CodePanel algorithmId="two-pointers" currentLine={2} />);
    const activeLine = container.querySelector('[data-active-line="true"]');
    expect(activeLine).toBeInTheDocument();
  });

  it('renders nothing when algorithmId has no snippet', () => {
    const { container } = render(<CodePanel algorithmId="bubble-sort" currentLine={1} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 13.2: Run (expect fail)**

```bash
pnpm test -- CodePanel 2>&1 | head -10
```

Expected: FAIL — "Cannot find module '@/components/panels/CodePanel'".

- [ ] **Step 13.3: Implement `src/components/panels/CodePanel.tsx`**

```tsx
import { Highlight } from 'prism-react-renderer';
import { cn } from '@/utils/classNames';
import { CODE_SNIPPETS } from '@/data/codeSnippets';
import { usePrefsStore } from '@/store/prefsStore';
import { Tabs } from '@/components/primitives/Tabs';
import type { AlgorithmId } from '@/types/algorithm';

// Custom theme matching the dark palette — plain background is transparent
// so the parent container's bg shows through.
const DSA_THEME = {
  plain: { backgroundColor: 'transparent', color: '#cbd5e1' },
  styles: [
    { types: ['keyword', 'operator', 'builtin'], style: { color: '#fbbf24' } },
    { types: ['string', 'char', 'attr-value'], style: { color: '#34d399' } },
    { types: ['number', 'boolean'], style: { color: '#fb923c' } },
    { types: ['comment'], style: { color: '#64748b', fontStyle: 'italic' as const } },
    { types: ['function', 'class-name', 'tag'], style: { color: '#22d3ee' } },
    { types: ['punctuation', 'plain'], style: { color: '#94a3b8' } },
  ],
};

const LANG_OPTIONS = [
  { value: 'ts' as const, label: 'TS' },
  { value: 'py' as const, label: 'Python' },
];

interface Props {
  algorithmId: AlgorithmId;
  currentLine: number;
}

export function CodePanel({ algorithmId, currentLine }: Props) {
  const snippet = CODE_SNIPPETS[algorithmId];
  const codeLanguage = usePrefsStore((s) => s.codeLanguage);
  const setCodeLanguage = usePrefsStore((s) => s.setCodeLanguage);

  if (!snippet) return null;

  const lines = codeLanguage === 'ts' ? snippet.ts : snippet.py;
  const code = lines.join('\n');
  const highlightLanguage = codeLanguage === 'ts' ? 'typescript' : 'python';

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface overflow-hidden">
      {/* Header: title + language toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle">
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Code</p>
        <Tabs value={codeLanguage} onChange={setCodeLanguage} options={LANG_OPTIONS} />
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <Highlight theme={DSA_THEME} code={code} language={highlightLanguage}>
          {({ tokens, getLineProps, getTokenProps }) => (
            <pre className="p-4 text-sm font-mono leading-6 m-0">
              {tokens.map((line, lineIdx) => {
                const isActive = lineIdx === currentLine - 1;
                return (
                  <div
                    key={lineIdx}
                    data-active-line={isActive ? 'true' : undefined}
                    {...getLineProps({ line })}
                    className={cn(
                      'flex transition-colors',
                      isActive && 'bg-accent-primary/10 border-l-2 border-accent-primary -ml-4 pl-[14px]',
                      !isActive && 'border-l-2 border-transparent -ml-4 pl-[14px]',
                    )}
                  >
                    <span className="w-7 text-right pr-4 select-none text-text-muted shrink-0">
                      {lineIdx + 1}
                    </span>
                    <span>
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
      </div>
    </div>
  );
}
```

- [ ] **Step 13.4: Run (expect pass)**

```bash
pnpm test -- CodePanel 2>&1 | head -15
```

Expected: 4 passed.

- [ ] **Step 13.5: Run full suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 13.6: Commit**

```bash
git add -A && git commit -m "feat(panels): CodePanel with prism highlighting + TS/Python toggle + line highlight"
```

---

## Task 14: Wire `ArraysPage` — full layout with all panels

**Files:**
- Modify: `src/routes/ArraysPage.tsx`

This task replaces the entire `ArraysPage` with the complete two-column layout. Read through the full replacement before applying it.

- [ ] **Step 14.1: Replace `src/routes/ArraysPage.tsx`**

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { CallStackPanel } from '@/components/panels/CallStackPanel';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { twoPointers } from '@/algorithms/arrays/twoPointers';
import { slidingWindow } from '@/algorithms/arrays/slidingWindow';
import { COMPLEXITIES } from '@/data/complexities';
import { DEFAULT_TWO_POINTERS_INPUT, DEFAULT_SLIDING_WINDOW_INPUT } from '@/types/algorithm';
import type { ArraySnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'two-pointers' as const, label: 'Two Pointers' },
  { id: 'sliding-window' as const, label: 'Sliding Window' },
];

type ArraysAlgorithmId = 'two-pointers' | 'sliding-window';

export function ArraysPage() {
  const [activeId, setActiveId] = useState<ArraysAlgorithmId>('two-pointers');

  // Two-pointers input state
  const [tpValues, setTpValues] = useState(DEFAULT_TWO_POINTERS_INPUT.values.join(', '));
  const [tpTarget, setTpTarget] = useState(String(DEFAULT_TWO_POINTERS_INPUT.target));

  // Sliding window input state
  const [swValues, setSwValues] = useState(DEFAULT_SLIDING_WINDOW_INPUT.values.join(', '));
  const [swK, setSwK] = useState(String(DEFAULT_SLIDING_WINDOW_INPUT.k));

  const [run, setRun] = useState<AlgorithmRun<ArraySnapshot> | null>(() =>
    twoPointers(DEFAULT_TWO_POINTERS_INPUT),
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run as AlgorithmRun<unknown> | null);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: ArraysAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'two-pointers') {
        setRun(twoPointers(DEFAULT_TWO_POINTERS_INPUT) as AlgorithmRun<ArraySnapshot>);
      } else {
        setRun(slidingWindow(DEFAULT_SLIDING_WINDOW_INPUT) as AlgorithmRun<ArraySnapshot>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'two-pointers') {
      const values = tpValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const target = parseInt(tpTarget.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(twoPointers({ values, target }) as AlgorithmRun<ArraySnapshot>);
    } else {
      const values = swValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const k = parseInt(swK.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(k) || k < 1) { setParseError('k must be a positive number.'); return; }
      if (k > values.length) { setParseError('k cannot exceed array length.'); return; }
      runner.reset();
      setRun(slidingWindow({ values, k }) as AlgorithmRun<ArraySnapshot>);
    }
  }, [activeId, tpValues, tpTarget, swValues, swK, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentSnap = (currentStep?.snapshot as ArraySnapshot) ?? null;
  const currentVars = currentStep?.variables;
  const callStack = (currentSnap as unknown as { callStack?: string[] })?.callStack;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main scrollable content ── */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="arrays" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs
          tabs={ALGO_TABS}
          selectedId={activeId}
          onSelect={handleAlgorithmChange}
        />

        {/* Visualizer */}
        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          <ArrayVisualizer snapshot={currentSnap} />
        </div>

        <StepNarration narration={currentStep?.narration} />

        {/* Playback controls */}
        <div className="flex flex-col gap-3">
          <ProgressBar stepIndex={stepIndex} totalSteps={totalSteps} />
          <div className="flex items-center gap-6 flex-wrap">
            <PlaybackControls
              runnerState={runnerState}
              onPlay={() => runner.play()}
              onPause={() => runner.pause()}
              onStepBack={() => runner.stepBack()}
              onStepForward={() => runner.stepForward()}
              onReset={() => runner.reset()}
            />
            <SpeedSlider runner={runner} />
          </div>
        </div>

        {/* Algorithm-specific inputs */}
        <InputPanel onRun={handleRun} error={parseError}>
          {activeId === 'two-pointers' ? (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Array (sorted, comma-separated)</label>
                <input
                  type="text"
                  value={tpValues}
                  onChange={(e) => setTpValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="1, 2, 3, 4, 6, 8, 11, 15"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Target</label>
                <input
                  type="number"
                  value={tpTarget}
                  onChange={(e) => setTpTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="11"
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
                <input
                  type="text"
                  value={swValues}
                  onChange={(e) => setSwValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="2, 1, 5, 1, 3, 2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Window size (k)</label>
                <input
                  type="number"
                  value={swK}
                  onChange={(e) => setSwK(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="3"
                />
              </div>
            </>
          )}
        </InputPanel>

        {/* Code + complexity + variable inspector */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
            <CallStackPanel callStack={callStack} />
          </div>
        </div>
      </main>

      {/* ── Problems sidebar (fixed right column) ── */}
      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="arrays" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 14.2: Typecheck**

```bash
pnpm typecheck
```

Fix any type errors before continuing.

- [ ] **Step 14.3: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass (no regressions).

- [ ] **Step 14.4: Manual browser verification**

```bash
pnpm dev &
sleep 3
```

Open `http://localhost:5173/arrays` and verify:

1. **Two Pointers tab (default):**
   - Array cells visible with `l` (cyan) and `r` (amber) pointers
   - Key insight callout shows and is collapsible
   - Code panel shows TypeScript code with line 2 highlighted (amber band)
   - Language toggle switches to Python and back
   - Complexity badge shows Best: O(1), Avg: O(n), Worst: O(n) + Space: O(1) + note
   - ProblemsSidebar shows 5 beginner + 5 advanced NeetCode links on the right
   - All links open in new tab

2. **Press Play:**
   - Pointers animate, progress bar advances
   - Step narration updates each step
   - Variable inspector shows live `l`, `r`, `sum`, `target` values
   - Code panel highlights the active line

3. **Switch to Sliding Window tab:**
   - Input changes to array + k inputs
   - Default array `2, 1, 5, 1, 3, 2`, k=`3`
   - Press Run, then Play
   - Window cells highlight in cyan as the window slides
   - Sum and max are shown
   - Key insight updates to sliding-window text

4. **Space bar / arrow keys still work for play/pause/step**

Kill dev server: `kill %1`

- [ ] **Step 14.5: Commit**

```bash
git add -A && git commit -m "feat(arrays): full layout — AlgorithmTabs, InputPanel, CodePanel, ComplexityBadge, VariableInspector, ProblemsSidebar wired"
```

---

## Task 15: Update `engine/README.md` with data-file checklist

**Files:**
- Modify: `src/engine/README.md`

- [ ] **Step 15.1: Append data-file checklist to `src/engine/README.md`**

Append the following block to the end of the file:

```markdown

## Data-file checklist for each algorithm

When adding a new algorithm, these files must be populated (or the UI will silently degrade):

| File | Key | Required |
|---|---|---|
| `src/data/codeSnippets.ts` | `AlgorithmId` | Yes — CodePanel shows nothing without it |
| `src/data/complexities.ts` | `AlgorithmId` | Yes — ComplexityBadge shows nothing without it |
| `src/data/keyInsights.ts` | `AlgorithmId` | Yes — KeyInsightCallout shows nothing without it |
| `src/data/defaultInputs.ts` | `AlgorithmId` | Recommended — lets algorithm tabs reset to a sensible input |
| `src/data/neetcodeProblems.ts` | `TopicId` | Once per topic (not per algorithm) |

A topic page template is:
1. Algorithm files with `r.push(...)` instrumentation (each with DISPLAYED SNIPPET comment)
2. One or more visualizer components
3. Above data-file entries
4. Topic route file (mostly a copy of ArraysPage)
```

- [ ] **Step 15.2: Final verification**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

All must pass.

- [ ] **Step 15.3: Final commit**

```bash
git add -A && git commit -m "docs(engine): data-file checklist + session 2b complete"
```

---

## Final Verification Checklist

- [ ] `pnpm test` — all tests pass (prior 64 + ~40 new panel/algorithm tests)
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero warnings
- [ ] `pnpm build` — production build succeeds
- [ ] Browser: `/arrays` has Two Pointers + Sliding Window tabs, both animate end-to-end
- [ ] CodePanel highlights active line, TS/Python toggle works
- [ ] ComplexityBadge shows correct values for both algorithms
- [ ] ProblemsSidebar lists 10 problems with correct links opening in new tab
- [ ] StepNarration has `aria-live="polite"` and `role="status"` in DOM
- [ ] VariableInspector shows live variables during playback
- [ ] KeyInsightCallout collapses/expands on click
- [ ] Use `superpowers:verification-before-completion` before declaring done

---

## Out of Scope (defer to Session 3)

- Any Stack & Queue components, algorithms, or data entries
- `CallStackPanel` visibility for arrays (arrays have no recursion — the panel will remain hidden since `callStack` is never set)
- `useRafTicker` hook (not needed — RAF is internal to `Runner`)
- URL `?input=` query parameter state (Session 8 polish)
