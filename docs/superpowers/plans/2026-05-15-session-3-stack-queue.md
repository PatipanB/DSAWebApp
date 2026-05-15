# Session 3 — Stack & Queue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Stack & Queue topic page with three algorithm tabs (Balanced Brackets, Monotonic Stack, Queue Demo), two new visualizers (StackVisualizer, QueueVisualizer), and all supporting data files.

**Architecture:** Follows the exact same pattern as ArraysPage (session 2b). Three algorithms: `balancedBrackets` (bracket-matching demo for StackVisualizer), `monotonicStack` (next-greater-element for monotonic StackVisualizer), `queueDemo` (enqueue/dequeue FIFO demo for QueueVisualizer). The page uses the same shared panels (CodePanel, ComplexityBadge, ProblemsSidebar, StepNarration, etc.) that already exist.

**Tech Stack:** Vite + React + TypeScript (strict) + Tailwind CSS + Zustand + Vitest + Testing Library. All shared infrastructure (engine, runner, panels, controls) is already implemented.

---

## NeetCode Link Decision

**Use NeetCode** — already established in `ProblemsSidebar.tsx` and `neetcodeProblems.ts`. NeetCode is free, curated, and has video explanations.

**CRITICAL RULE:** NeetCode uses custom slugs that differ from LeetCode. NEVER guess a slug. Always verify from `https://neetcode.io/practice/problem-list/[topic]` by clicking the problem to see its actual URL.

**Verified stack-queue slugs for this session (confirmed 2026-05-15 via Playwright):**
| Problem | NeetCode slug |
|---------|--------------|
| Baseball Game | `baseball-game` |
| Valid Parentheses | `validate-parentheses` |
| Min Stack | `minimum-stack` |
| Implement Queue using Stacks | `implement-queue-using-stacks` |
| Evaluate Reverse Polish Notation | `evaluate-reverse-polish-notation` |
| Daily Temperatures | `daily-temperatures` |
| Online Stock Span | `online-stock-span` |
| Car Fleet | `car-fleet` |
| Largest Rectangle In Histogram | `largest-rectangle-in-histogram` |
| Sliding Window Maximum | `sliding-window-maximum` |

---

## File Map

**Modify:**
- `src/types/snapshots.ts` — add `StackItem`, `StackSnapshot`, `QueueSnapshot`
- `src/types/algorithm.ts` — add `BalancedBracketsInput`, `MonotonicStackInput`, `QueueDemoInput` + defaults
- `src/data/codeSnippets.ts` — add entries for `balanced-brackets`, `monotonic-stack`, `queue-demo`
- `src/data/complexities.ts` — add entries for all three algorithms
- `src/data/neetcodeProblems.ts` — add `stack-queue` entry (10 problems, verified slugs)
- `src/data/keyInsights.ts` — add entries for all three algorithms
- `src/routes/StackQueuePage.tsx` — replace stub with full layout

**Create:**
- `src/algorithms/stackQueue/balancedBrackets.ts`
- `src/algorithms/stackQueue/monotonicStack.ts`
- `src/algorithms/stackQueue/queueDemo.ts`
- `src/components/visualizers/StackVisualizer.tsx`
- `src/components/visualizers/QueueVisualizer.tsx`
- `tests/algorithms/balancedBrackets.test.ts`
- `tests/algorithms/monotonicStack.test.ts`
- `tests/algorithms/queueDemo.test.ts`
- `tests/components/StackVisualizer.test.tsx`
- `tests/components/QueueVisualizer.test.tsx`

---

## Task 1: Snapshot types + algorithm input types

**Files:**
- Modify: `src/types/snapshots.ts`
- Modify: `src/types/algorithm.ts`

- [ ] **Step 1.1: Add StackItem, StackSnapshot, QueueSnapshot to snapshots.ts**

Append to the end of `src/types/snapshots.ts`:

```ts
export interface StackItem {
  id: string;
  value: string | number;
}

export interface StackSnapshot {
  items: StackItem[];
  inputCursor?: number;
  inputTokens?: string[];
  matched?: { open: string; close: string };
  invalid?: boolean;
  result?: (number | null)[];
}

export interface QueueSnapshot {
  items: StackItem[];
  head: number;
  tail: number;
  inputValues?: number[];
  inputCursor?: number;
  phase?: 'enqueue' | 'dequeue';
}
```

- [ ] **Step 1.2: Add input types + defaults to algorithm.ts**

Append to the end of `src/types/algorithm.ts`:

```ts
export interface BalancedBracketsInput {
  expression: string;
}

export const DEFAULT_BALANCED_BRACKETS_INPUT: BalancedBracketsInput = {
  expression: '([{}])',
};

export interface MonotonicStackInput {
  values: number[];
}

export const DEFAULT_MONOTONIC_STACK_INPUT: MonotonicStackInput = {
  values: [2, 1, 2, 4, 3],
};

export interface QueueDemoInput {
  values: number[];
}

export const DEFAULT_QUEUE_DEMO_INPUT: QueueDemoInput = {
  values: [3, 1, 2, 4],
};
```

- [ ] **Step 1.3: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 1.4: Commit**

```bash
git add src/types/snapshots.ts src/types/algorithm.ts
git commit -m "feat(types): StackSnapshot, QueueSnapshot, stack-queue input types"
```

---

## Task 2: `balancedBrackets` algorithm (TDD)

**Files:**
- Create: `src/algorithms/stackQueue/balancedBrackets.ts`
- Create: `tests/algorithms/balancedBrackets.test.ts`

- [ ] **Step 2.1: Write failing tests**

Create `tests/algorithms/balancedBrackets.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { balancedBrackets } from '@/algorithms/stackQueue/balancedBrackets';
import { serializeRun } from '@/engine/serializeRun';

describe('balancedBrackets', () => {
  describe('result', () => {
    it('returns true for balanced expression', () => {
      expect(balancedBrackets({ expression: '([{}])' }).finalResult).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(balancedBrackets({ expression: '' }).finalResult).toBe(true);
    });

    it('returns false for mismatched brackets', () => {
      expect(balancedBrackets({ expression: '([)]' }).finalResult).toBe(false);
    });

    it('returns false for unclosed bracket', () => {
      expect(balancedBrackets({ expression: '((' }).finalResult).toBe(false);
    });

    it('returns false for extra closing bracket', () => {
      expect(balancedBrackets({ expression: ')' }).finalResult).toBe(false);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least one step per character', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      expect(run.steps.length).toBeGreaterThanOrEqual(6);
    });

    it('all steps have valid line numbers', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('finalResult is true for balanced expression', () => {
      const run = balancedBrackets({ expression: '()' });
      expect(run.finalResult).toBe(true);
    });

    it('early-exit step has invalid=true for mismatch', () => {
      const run = balancedBrackets({ expression: '([)]' });
      const hasInvalid = run.steps.some(
        (s) => (s.snapshot as import('@/types/snapshots').StackSnapshot).invalid === true,
      );
      expect(hasInvalid).toBe(true);
    });
  });
});
```

- [ ] **Step 2.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/balancedBrackets.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/stackQueue/balancedBrackets'"

- [ ] **Step 2.3: Implement balancedBrackets**

Create `src/algorithms/stackQueue/balancedBrackets.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot, StackItem } from '@/types/snapshots';
import type { BalancedBracketsInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function balancedBrackets(s) {
2:   const stack = [];
3:   const map = { ')':'(', ']':'[', '}':'{' };
4:   for (const c of s) {
5:     if ('([{'.includes(c)) stack.push(c);
6:     else if (stack.pop() !== map[c]) return false;
7:   }
8:   return stack.length === 0;
9: }
*/

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const OPENS = new Set(['(', '[', '{']);

export function balancedBrackets(input: BalancedBracketsInput): AlgorithmRun<StackSnapshot> {
  const { expression } = input;
  const tokens = expression.split('');
  const r = createRunBuilder<StackSnapshot>('balanced-brackets', input);
  let idCounter = 0;
  const uid = () => `b${idCounter++}`;

  let items: StackItem[] = [];

  r.push({
    line: 1,
    narration: `Start scanning "${expression || '(empty)'}"`,
    snapshot: { items: [], inputCursor: 0, inputTokens: tokens },
    variables: { expr: expression, stackSize: 0 },
  });

  for (let i = 0; i < tokens.length; i++) {
    const c = tokens[i]!;

    if (OPENS.has(c)) {
      items = [...items, { id: uid(), value: c }];
      r.push({
        line: 5,
        narration: `'${c}' is an opening bracket — push onto stack`,
        snapshot: { items: [...items], inputCursor: i + 1, inputTokens: tokens },
        variables: { char: c, stackSize: items.length },
      });
    } else if (c in PAIRS) {
      const top = items[items.length - 1];
      const expected = PAIRS[c]!;

      if (!top || top.value !== expected) {
        r.push({
          line: 6,
          narration: top
            ? `'${c}' expected '${expected}' on top but found '${String(top.value)}' — mismatch!`
            : `'${c}' expected '${expected}' but stack is empty!`,
          snapshot: { items: [...items], inputCursor: i, inputTokens: tokens, invalid: true },
          variables: { char: c, expected, found: top ? String(top.value) : 'empty' },
        });
        r.push({
          line: 6,
          narration: `"${expression}" is NOT balanced`,
          snapshot: { items: [], inputCursor: i, inputTokens: tokens, invalid: true },
          variables: { result: false },
        });
        return r.build(false);
      }

      const matched = { open: String(top.value), close: c };
      items = items.slice(0, -1);
      r.push({
        line: 6,
        narration: `'${c}' matches '${String(top.value)}' — pop stack`,
        snapshot: { items: [...items], inputCursor: i + 1, inputTokens: tokens, matched },
        variables: { char: c, matched: `${String(top.value)}${c}`, stackSize: items.length },
      });
    }
  }

  const balanced = items.length === 0;
  r.push({
    line: 8,
    narration: balanced
      ? `Stack is empty — "${expression || '(empty)'}" is balanced ✓`
      : `Stack has ${items.length} unmatched bracket(s) — not balanced`,
    snapshot: { items: [...items], inputCursor: tokens.length, inputTokens: tokens },
    variables: { result: balanced, stackSize: items.length },
  });

  return r.build(balanced);
}
```

- [ ] **Step 2.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/balancedBrackets.test.ts --run
```

Expected: all 10 tests pass. A new snapshot file is created at `tests/algorithms/__snapshots__/balancedBrackets.test.ts.snap`.

- [ ] **Step 2.5: Commit**

```bash
git add src/algorithms/stackQueue/balancedBrackets.ts tests/algorithms/balancedBrackets.test.ts
git commit -m "feat(algo): balancedBrackets with TDD — result + trace snapshot tests"
```

---

## Task 3: `monotonicStack` algorithm (TDD)

**Files:**
- Create: `src/algorithms/stackQueue/monotonicStack.ts`
- Create: `tests/algorithms/monotonicStack.test.ts`

- [ ] **Step 3.1: Write failing tests**

Create `tests/algorithms/monotonicStack.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { monotonicStack } from '@/algorithms/stackQueue/monotonicStack';
import { serializeRun } from '@/engine/serializeRun';

describe('monotonicStack', () => {
  describe('result', () => {
    it('returns next-greater array for default input', () => {
      expect(monotonicStack({ values: [2, 1, 2, 4, 3] }).finalResult).toEqual([4, 2, 4, -1, -1]);
    });

    it('all -1 for strictly decreasing input', () => {
      expect(monotonicStack({ values: [5, 4, 3, 2, 1] }).finalResult).toEqual([-1, -1, -1, -1, -1]);
    });

    it('all next-greater for strictly increasing input', () => {
      expect(monotonicStack({ values: [1, 2, 3, 4, 5] }).finalResult).toEqual([2, 3, 4, 5, -1]);
    });

    it('works for single element', () => {
      expect(monotonicStack({ values: [7] }).finalResult).toEqual([-1]);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least n+1 steps for n elements', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      expect(run.steps.length).toBeGreaterThanOrEqual(6);
    });

    it('all steps have valid line numbers', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('result array in snapshot grows correctly', () => {
      const run = monotonicStack({ values: [2, 1, 2, 4, 3] });
      const last = run.steps[run.steps.length - 1]!;
      const snap = last.snapshot as import('@/types/snapshots').StackSnapshot;
      expect(snap.result).toEqual([4, 2, 4, -1, -1]);
    });
  });
});
```

- [ ] **Step 3.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/monotonicStack.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/stackQueue/monotonicStack'"

- [ ] **Step 3.3: Implement monotonicStack**

Create `src/algorithms/stackQueue/monotonicStack.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot, StackItem } from '@/types/snapshots';
import type { MonotonicStackInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1:  function nextGreater(nums) {
2:    const result = new Array(nums.length).fill(-1);
3:    const stack = [];
4:    for (let i = 0; i < nums.length; i++) {
5:      while (stack.length && nums[stack.at(-1)] < nums[i]) {
6:        result[stack.pop()] = nums[i];
7:      }
8:      stack.push(i);
9:    }
10:   return result;
11: }
*/

export function monotonicStack(input: MonotonicStackInput): AlgorithmRun<StackSnapshot> {
  const { values } = input;
  const n = values.length;
  const r = createRunBuilder<StackSnapshot>('monotonic-stack', input);
  let idCounter = 0;
  const uid = () => `m${idCounter++}`;

  const result: number[] = new Array(n).fill(-1);
  // Stack stores indices; visualStack stores values for display
  let indexStack: number[] = [];
  let visualItems: StackItem[] = [];

  r.push({
    line: 2,
    narration: `Initialize result=[-1,…,-1] (n=${n}) and empty stack`,
    snapshot: { items: [], inputTokens: values.map(String), inputCursor: 0, result: [...result] },
    variables: { result: JSON.stringify(result) },
  });

  for (let i = 0; i < n; i++) {
    const curr = values[i]!;

    while (indexStack.length > 0) {
      const topIdx = indexStack[indexStack.length - 1]!;
      const topVal = values[topIdx]!;
      if (topVal >= curr) break;

      indexStack = indexStack.slice(0, -1);
      visualItems = visualItems.slice(0, -1);
      result[topIdx] = curr;

      r.push({
        line: 6,
        narration: `${topVal} < ${curr}: pop index ${topIdx}, set result[${topIdx}]=${curr}`,
        snapshot: { items: [...visualItems], inputCursor: i, inputTokens: values.map(String), result: [...result] },
        variables: { i, curr, popped: topIdx, 'result[topIdx]': curr },
      });
    }

    indexStack = [...indexStack, i];
    visualItems = [...visualItems, { id: uid(), value: curr }];

    r.push({
      line: 8,
      narration: `Push ${curr} (index ${i}) onto stack`,
      snapshot: { items: [...visualItems], inputCursor: i + 1, inputTokens: values.map(String), result: [...result] },
      variables: { i, curr, stackSize: indexStack.length },
    });
  }

  r.push({
    line: 10,
    narration: `Done — ${indexStack.length} element(s) on stack have no next greater (already -1)`,
    snapshot: { items: [], inputCursor: n, inputTokens: values.map(String), result: [...result] },
    variables: { result: JSON.stringify(result) },
  });

  return r.build([...result]);
}
```

- [ ] **Step 3.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/monotonicStack.test.ts --run
```

Expected: all 8 tests pass.

- [ ] **Step 3.5: Commit**

```bash
git add src/algorithms/stackQueue/monotonicStack.ts tests/algorithms/monotonicStack.test.ts
git commit -m "feat(algo): monotonicStack next-greater with TDD — result + trace snapshot"
```

---

## Task 4: `queueDemo` algorithm (TDD)

**Files:**
- Create: `src/algorithms/stackQueue/queueDemo.ts`
- Create: `tests/algorithms/queueDemo.test.ts`

- [ ] **Step 4.1: Write failing tests**

Create `tests/algorithms/queueDemo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { queueDemo } from '@/algorithms/stackQueue/queueDemo';
import { serializeRun } from '@/engine/serializeRun';

describe('queueDemo', () => {
  describe('result', () => {
    it('returns values in FIFO order', () => {
      expect(queueDemo({ values: [3, 1, 2, 4] }).finalResult).toEqual([3, 1, 2, 4]);
    });

    it('single element enqueue and dequeue', () => {
      expect(queueDemo({ values: [7] }).finalResult).toEqual([7]);
    });

    it('two elements preserve order', () => {
      expect(queueDemo({ values: [5, 9] }).finalResult).toEqual([5, 9]);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits 2n+1 steps for n values (init + n enqueues + n dequeues)', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      expect(run.steps.length).toBe(2 * 4 + 1);
    });

    it('all steps have valid line numbers', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('enqueue steps have increasing queue size', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      // Steps 1-4 are enqueues (after init at index 0)
      const enqueueSteps = run.steps.slice(1, 5);
      enqueueSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').QueueSnapshot;
        expect(snap.items.length).toBe(idx + 1);
      });
    });

    it('dequeue steps have decreasing queue size', () => {
      const run = queueDemo({ values: [3, 1, 2, 4] });
      // Steps 5-8 are dequeues
      const dequeueSteps = run.steps.slice(5, 9);
      dequeueSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').QueueSnapshot;
        expect(snap.items.length).toBe(4 - idx - 1);
      });
    });
  });
});
```

- [ ] **Step 4.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/queueDemo.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/stackQueue/queueDemo'"

- [ ] **Step 4.3: Implement queueDemo**

Create `src/algorithms/stackQueue/queueDemo.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { QueueSnapshot, StackItem } from '@/types/snapshots';
import type { QueueDemoInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: class Queue {
2:   constructor() { this.items = []; }
3:   enqueue(val) { this.items.push(val); }
4:   dequeue() { return this.items.shift(); }
5: }
6: // Enqueue all values, then dequeue to show FIFO
*/

export function queueDemo(input: QueueDemoInput): AlgorithmRun<QueueSnapshot> {
  const { values } = input;
  const r = createRunBuilder<QueueSnapshot>('queue-demo', input);
  let idCounter = 0;
  const uid = () => `q${idCounter++}`;

  let items: StackItem[] = [];
  const dequeued: number[] = [];

  const snap = (extra?: Partial<QueueSnapshot>): QueueSnapshot => ({
    items: [...items],
    head: 0,
    tail: Math.max(0, items.length - 1),
    inputValues: values,
    ...extra,
  });

  // Init step
  r.push({
    line: 2,
    narration: `Create empty queue — items will enqueue from the back, dequeue from the front`,
    snapshot: snap({ phase: 'enqueue', inputCursor: 0 }),
    variables: { size: 0 },
  });

  // Enqueue phase
  for (let i = 0; i < values.length; i++) {
    const val = values[i]!;
    items = [...items, { id: uid(), value: val }];
    r.push({
      line: 3,
      narration: `Enqueue ${val} — added to back of queue`,
      snapshot: snap({ phase: 'enqueue', inputCursor: i + 1 }),
      variables: { enqueued: val, size: items.length },
    });
  }

  // Dequeue phase
  for (let i = 0; i < values.length; i++) {
    const val = items[0]!.value as number;
    items = items.slice(1);
    dequeued.push(val);
    r.push({
      line: 4,
      narration: `Dequeue ${val} from front — FIFO order preserved`,
      snapshot: snap({ phase: 'dequeue', inputCursor: i }),
      variables: { dequeued: val, size: items.length, order: JSON.stringify(dequeued) },
    });
  }

  return r.build([...dequeued]);
}
```

- [ ] **Step 4.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/queueDemo.test.ts --run
```

Expected: all 8 tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add src/algorithms/stackQueue/queueDemo.ts tests/algorithms/queueDemo.test.ts
git commit -m "feat(algo): queueDemo FIFO with TDD — result + trace snapshot"
```

---

## Task 5: StackVisualizer component (TDD)

**Files:**
- Create: `src/components/visualizers/StackVisualizer.tsx`
- Create: `tests/components/StackVisualizer.test.tsx`

- [ ] **Step 5.1: Write failing tests**

Create `tests/components/StackVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StackVisualizer } from '@/components/visualizers/StackVisualizer';
import type { StackSnapshot } from '@/types/snapshots';

const baseSnap: StackSnapshot = {
  items: [
    { id: 'a', value: '(' },
    { id: 'b', value: '[' },
    { id: 'c', value: '{' },
  ],
  inputTokens: ['(', '[', '{', '}', ']', ')'],
  inputCursor: 3,
};

describe('StackVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<StackVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all stack items', () => {
    render(<StackVisualizer snapshot={baseSnap} />);
    expect(screen.getByText('(')).toBeInTheDocument();
    expect(screen.getByText('[')).toBeInTheDocument();
    expect(screen.getByText('{')).toBeInTheDocument();
  });

  it('renders input tokens when provided', () => {
    render(<StackVisualizer snapshot={baseSnap} />);
    // inputTokens row should show all 6 tokens
    const tokenEls = screen.getAllByText(/[()[\]{}]/);
    expect(tokenEls.length).toBeGreaterThanOrEqual(6);
  });

  it('marks active input token with data-active', () => {
    const { container } = render(<StackVisualizer snapshot={baseSnap} />);
    const active = container.querySelector('[data-active="true"]');
    expect(active).toBeInTheDocument();
  });

  it('applies invalid styling when invalid=true', () => {
    const snap: StackSnapshot = { ...baseSnap, invalid: true };
    const { container } = render(<StackVisualizer snapshot={snap} />);
    expect(container.querySelector('[data-invalid="true"]')).toBeInTheDocument();
  });

  it('renders result array when present', () => {
    const snap: StackSnapshot = {
      items: [],
      inputTokens: ['2', '1', '2', '4', '3'],
      inputCursor: 5,
      result: [4, 2, 4, -1, -1],
    };
    render(<StackVisualizer snapshot={snap} />);
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('-1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty stack with placeholder text', () => {
    const snap: StackSnapshot = { items: [], inputTokens: [], inputCursor: 0 };
    render(<StackVisualizer snapshot={snap} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 5.2: Run to confirm failure**

```bash
pnpm test tests/components/StackVisualizer.test.tsx --run
```

Expected: FAIL with "Cannot find module '@/components/visualizers/StackVisualizer'"

- [ ] **Step 5.3: Implement StackVisualizer**

Create `src/components/visualizers/StackVisualizer.tsx`:

```tsx
import { cn } from '@/utils/classNames';
import type { StackSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: StackSnapshot | null;
}

export function StackVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { items, inputTokens, inputCursor, matched, invalid, result } = snapshot;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full" data-invalid={invalid ? 'true' : undefined}>
      {/* Input tokens row */}
      {inputTokens && inputTokens.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Input</p>
          <div className="flex gap-1">
            {inputTokens.map((tok, i) => (
              <div
                key={i}
                data-active={i === inputCursor ? 'true' : undefined}
                className={cn(
                  'w-9 h-9 flex items-center justify-center rounded font-mono text-sm border',
                  i === inputCursor
                    ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                    : i < (inputCursor ?? 0)
                    ? 'bg-status-success/10 border-status-success/30 text-text-muted'
                    : 'bg-bg-elevated border-border-subtle text-text-secondary',
                )}
              >
                {tok}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stack */}
      <div className="flex flex-col items-center gap-1 min-w-[80px]">
        <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Stack</p>
        <div
          className={cn(
            'flex flex-col-reverse gap-1 p-2 min-h-[48px] min-w-[80px] rounded-lg border',
            invalid ? 'border-status-danger bg-status-danger/5' : 'border-border-subtle bg-bg-surface',
          )}
        >
          {items.length === 0 ? (
            <span className="text-xs text-text-muted font-mono self-center py-1">empty</span>
          ) : (
            items.map((item, idx) => {
              const isTop = idx === items.length - 1;
              const isMatched =
                matched &&
                (item.value === matched.open || item.value === matched.close);
              return (
                <div
                  key={item.id}
                  className={cn(
                    'px-3 py-1.5 rounded font-mono text-sm border text-center min-w-[48px]',
                    isMatched
                      ? 'bg-status-success/20 border-status-success text-status-success'
                      : invalid && isTop
                      ? 'bg-status-danger/20 border-status-danger text-status-danger'
                      : isTop
                      ? 'bg-accent-primary/15 border-accent-primary text-accent-primary'
                      : 'bg-bg-elevated border-border-subtle text-text-primary',
                  )}
                >
                  {String(item.value)}
                </div>
              );
            })
          )}
        </div>
        {items.length > 0 && (
          <p className="text-xs font-mono text-text-muted">← top</p>
        )}
      </div>

      {/* Result array (for monotonic stack) */}
      {result && result.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">Next Greater</p>
          <div className="flex gap-1">
            {result.map((val, i) => (
              <div
                key={i}
                className={cn(
                  'w-10 h-9 flex items-center justify-center rounded font-mono text-sm border',
                  val === -1
                    ? 'bg-bg-elevated border-border-subtle text-text-muted'
                    : 'bg-status-success/15 border-status-success text-status-success',
                )}
              >
                {val === -1 ? '-1' : String(val)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5.4: Run tests to confirm pass**

```bash
pnpm test tests/components/StackVisualizer.test.tsx --run
```

Expected: all 7 tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/visualizers/StackVisualizer.tsx tests/components/StackVisualizer.test.tsx
git commit -m "feat(viz): StackVisualizer with input tokens, stack items, result array"
```

---

## Task 6: QueueVisualizer component (TDD)

**Files:**
- Create: `src/components/visualizers/QueueVisualizer.tsx`
- Create: `tests/components/QueueVisualizer.test.tsx`

- [ ] **Step 6.1: Write failing tests**

Create `tests/components/QueueVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueueVisualizer } from '@/components/visualizers/QueueVisualizer';
import type { QueueSnapshot } from '@/types/snapshots';

const baseSnap: QueueSnapshot = {
  items: [
    { id: 'q1', value: 3 },
    { id: 'q2', value: 1 },
    { id: 'q3', value: 2 },
  ],
  head: 0,
  tail: 2,
  inputValues: [3, 1, 2, 4],
  phase: 'enqueue',
};

describe('QueueVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<QueueVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all queue items', () => {
    const { container } = render(<QueueVisualizer snapshot={baseSnap} />);
    expect(container.querySelector('[data-testid="queue-item-0"]')?.textContent).toBe('3');
    expect(container.querySelector('[data-testid="queue-item-1"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="queue-item-2"]')?.textContent).toBe('2');
  });

  it('renders head indicator', () => {
    render(<QueueVisualizer snapshot={baseSnap} />);
    expect(screen.getByText(/front/i)).toBeInTheDocument();
  });

  it('renders tail indicator', () => {
    render(<QueueVisualizer snapshot={baseSnap} />);
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });

  it('renders empty queue with placeholder', () => {
    const snap: QueueSnapshot = { items: [], head: 0, tail: 0 };
    render(<QueueVisualizer snapshot={snap} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('highlights front item (head) in cyan', () => {
    const { container } = render(<QueueVisualizer snapshot={baseSnap} />);
    const frontItem = container.querySelector('[data-testid="queue-item-0"]');
    expect(frontItem?.className).toMatch(/accent-secondary|cyan/);
  });
});
```

- [ ] **Step 6.2: Run to confirm failure**

```bash
pnpm test tests/components/QueueVisualizer.test.tsx --run
```

Expected: FAIL with "Cannot find module '@/components/visualizers/QueueVisualizer'"

- [ ] **Step 6.3: Implement QueueVisualizer**

Create `src/components/visualizers/QueueVisualizer.tsx`:

```tsx
import { cn } from '@/utils/classNames';
import type { QueueSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: QueueSnapshot | null;
}

export function QueueVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { items, inputValues, inputCursor, phase } = snapshot;

  return (
    <div className="flex flex-col items-center gap-4 p-4 w-full">
      {/* Input row */}
      {inputValues && inputValues.length > 0 && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs font-mono text-text-muted uppercase tracking-widest">
            {phase === 'dequeue' ? 'Dequeued' : 'Input'}
          </p>
          <div className="flex gap-1">
            {inputValues.map((val, i) => {
              const isActive = phase === 'enqueue' && i === inputCursor;
              const isDone =
                phase === 'enqueue'
                  ? i < (inputCursor ?? 0)
                  : i <= (inputCursor ?? -1);
              return (
                <div
                  key={i}
                  className={cn(
                    'w-10 h-9 flex items-center justify-center rounded font-mono text-sm border',
                    isActive
                      ? 'bg-accent-primary/20 border-accent-primary text-accent-primary'
                      : isDone
                      ? 'bg-status-success/10 border-status-success/30 text-text-muted'
                      : 'bg-bg-elevated border-border-subtle text-text-secondary',
                  )}
                >
                  {val}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Queue visualization */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-accent-secondary">front →</span>
          <div className="flex gap-1 min-h-[48px] items-center px-2 py-1 rounded-lg border border-border-subtle bg-bg-surface">
            {items.length === 0 ? (
              <span className="text-xs text-text-muted font-mono px-4">empty</span>
            ) : (
              items.map((item, idx) => (
                <div
                  key={item.id}
                  data-testid={`queue-item-${idx}`}
                  className={cn(
                    'w-10 h-10 flex items-center justify-center rounded font-mono text-sm border',
                    idx === 0
                      ? 'bg-accent-secondary/15 border-accent-secondary text-accent-secondary'
                      : idx === items.length - 1
                      ? 'bg-accent-primary/10 border-accent-primary/50 text-accent-primary'
                      : 'bg-bg-elevated border-border-subtle text-text-primary',
                  )}
                >
                  {String(item.value)}
                </div>
              ))
            )}
          </div>
          <span className="text-xs font-mono text-accent-primary">← back</span>
        </div>
        <div className="flex gap-2 text-xs font-mono text-text-muted">
          <span>dequeue ← front</span>
          <span>·</span>
          <span>back → enqueue</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.4: Run tests to confirm pass**

```bash
pnpm test tests/components/QueueVisualizer.test.tsx --run
```

Expected: all 6 tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/visualizers/QueueVisualizer.tsx tests/components/QueueVisualizer.test.tsx
git commit -m "feat(viz): QueueVisualizer with head/tail indicators and input row"
```

---

## Task 7: Data entries (snippets, complexities, problems, insights)

**Files:**
- Modify: `src/data/codeSnippets.ts`
- Modify: `src/data/complexities.ts`
- Modify: `src/data/neetcodeProblems.ts`
- Modify: `src/data/keyInsights.ts`

- [ ] **Step 7.1: Add code snippets**

Append these three entries inside the `CODE_SNIPPETS` object in `src/data/codeSnippets.ts`:

```ts
  'balanced-brackets': {
    ts: [
      'function balancedBrackets(s: string): boolean {',
      '  const stack: string[] = [];',
      "  const map: Record<string,string> = { ')':'(', ']':'[', '}':'{' };",
      '  for (const c of s) {',
      "    if ('([{'.includes(c)) stack.push(c);",
      "    else if (stack.pop() !== map[c]) return false;",
      '  }',
      '  return stack.length === 0;',
      '}',
    ],
    py: [
      'def balanced_brackets(s: str) -> bool:',
      '    stack = []',
      "    pairs = {')': '(', ']': '[', '}': '{'}",
      '    for c in s:',
      "        if c in '([{':",
      '            stack.append(c)',
      '        elif not stack or stack.pop() != pairs[c]:',
      '            return False',
      '    return len(stack) == 0',
    ],
  },
  'monotonic-stack': {
    ts: [
      'function nextGreater(nums: number[]): number[] {',
      '  const result = new Array(nums.length).fill(-1);',
      '  const stack: number[] = [];',
      '  for (let i = 0; i < nums.length; i++) {',
      '    while (stack.length && nums[stack.at(-1)!] < nums[i]) {',
      '      result[stack.pop()!] = nums[i];',
      '    }',
      '    stack.push(i);',
      '  }',
      '  return result;',
      '}',
    ],
    py: [
      'def next_greater(nums: list[int]) -> list[int]:',
      '    result = [-1] * len(nums)',
      '    stack: list[int] = []',
      '    for i, num in enumerate(nums):',
      '        while stack and nums[stack[-1]] < num:',
      '            result[stack.pop()] = num',
      '        stack.append(i)',
      '    return result',
    ],
  },
  'queue-demo': {
    ts: [
      'class Queue<T> {',
      '  private items: T[] = [];',
      '  enqueue(val: T): void { this.items.push(val); }',
      '  dequeue(): T | undefined { return this.items.shift(); }',
      '  peek(): T | undefined { return this.items[0]; }',
      '  get size(): number { return this.items.length; }',
      '}',
    ],
    py: [
      'from collections import deque',
      '',
      'class Queue:',
      '    def __init__(self):',
      '        self._items = deque()',
      '    def enqueue(self, val):',
      '        self._items.append(val)',
      '    def dequeue(self):',
      '        return self._items.popleft()',
    ],
  },
```

- [ ] **Step 7.2: Add complexity entries**

Append these three entries inside the `COMPLEXITIES` object in `src/data/complexities.ts`:

```ts
  'balanced-brackets': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Space is O(n) in the worst case when all brackets are opening (full stack).',
  },
  'monotonic-stack': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Each element is pushed and popped at most once — amortized O(1) per element.',
  },
  'queue-demo': {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Enqueue is O(1). Array-based dequeue (shift) is O(n); deque-based is O(1).',
  },
```

- [ ] **Step 7.3: Add NeetCode problems (verified slugs only)**

Add this entry inside the `NEETCODE_PROBLEMS` object in `src/data/neetcodeProblems.ts`:

```ts
  'stack-queue': [
    {
      title: 'Baseball Game',
      slug: 'baseball-game',
      difficulty: 'beginner',
      hint: 'Push scores; D doubles top, C removes top — pure stack operations.',
    },
    {
      title: 'Valid Parentheses',
      slug: 'validate-parentheses',
      difficulty: 'beginner',
      hint: 'Default balanced-brackets example — watch open brackets push and matching ones pop.',
    },
    {
      title: 'Min Stack',
      slug: 'minimum-stack',
      difficulty: 'beginner',
      hint: 'Auxiliary min-tracking stack shown side-by-side with the main one.',
    },
    {
      title: 'Implement Queue using Stacks',
      slug: 'implement-queue-using-stacks',
      difficulty: 'beginner',
      hint: 'Two-stack queue trick: fill from stack 1 into stack 2 when dequeuing.',
    },
    {
      title: 'Evaluate Reverse Polish Notation',
      slug: 'evaluate-reverse-polish-notation',
      difficulty: 'beginner',
      hint: 'Operand stack — operator pops two, computes, pushes result.',
    },
    {
      title: 'Daily Temperatures',
      slug: 'daily-temperatures',
      difficulty: 'advanced',
      hint: 'Monotonic stack default example — decreasing-temperature variant.',
    },
    {
      title: 'Online Stock Span',
      slug: 'online-stock-span',
      difficulty: 'advanced',
      hint: 'Monotonic stack accumulating spans — pop while top price ≤ current.',
    },
    {
      title: 'Car Fleet',
      slug: 'car-fleet',
      difficulty: 'advanced',
      hint: 'Stack of arrival times; a car that catches the one ahead joins its fleet.',
    },
    {
      title: 'Largest Rectangle in Histogram',
      slug: 'largest-rectangle-in-histogram',
      difficulty: 'advanced',
      hint: 'Monotonic stack tracks pending widths; area computed when a bar is popped.',
    },
    {
      title: 'Sliding Window Maximum',
      slug: 'sliding-window-maximum',
      difficulty: 'advanced',
      hint: 'Monotonic deque — front is window max, stale front is evicted when out of window.',
    },
  ],
```

- [ ] **Step 7.4: Add key insights**

Append these three entries inside `KEY_INSIGHTS` in `src/data/keyInsights.ts`:

```ts
  'balanced-brackets':
    'Use a stack: push opening brackets, and for every closing bracket verify it matches the top — if it does, pop; if not (or stack is empty), the string is unbalanced.',
  'monotonic-stack':
    'Keep a stack of "unanswered" elements in decreasing order — the moment a larger element arrives, everything smaller on the stack finally has its answer.',
  'queue-demo':
    'A queue is FIFO (first in, first out): enqueue at the back, dequeue at the front — the opposite end from a stack.',
```

- [ ] **Step 7.5: Run typecheck + full test suite**

```bash
pnpm typecheck && pnpm test --run
```

Expected: typecheck clean, all existing tests still pass (no regressions from data file changes).

- [ ] **Step 7.6: Commit**

```bash
git add src/data/codeSnippets.ts src/data/complexities.ts src/data/neetcodeProblems.ts src/data/keyInsights.ts
git commit -m "feat(data): stack-queue entries — snippets, complexities, problems, key insights"
```

---

## Task 8: Wire StackQueuePage

**Files:**
- Modify: `src/routes/StackQueuePage.tsx`

- [ ] **Step 8.1: Replace stub with full layout**

Overwrite `src/routes/StackQueuePage.tsx` with the complete implementation:

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { StackVisualizer } from '@/components/visualizers/StackVisualizer';
import { QueueVisualizer } from '@/components/visualizers/QueueVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { balancedBrackets } from '@/algorithms/stackQueue/balancedBrackets';
import { monotonicStack } from '@/algorithms/stackQueue/monotonicStack';
import { queueDemo } from '@/algorithms/stackQueue/queueDemo';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_BALANCED_BRACKETS_INPUT,
  DEFAULT_MONOTONIC_STACK_INPUT,
  DEFAULT_QUEUE_DEMO_INPUT,
} from '@/types/algorithm';
import type { StackSnapshot, QueueSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type StackQueueAlgorithmId = 'balanced-brackets' | 'monotonic-stack' | 'queue-demo';

const ALGO_TABS = [
  { id: 'balanced-brackets' as const, label: 'Balanced Brackets' },
  { id: 'monotonic-stack' as const, label: 'Monotonic Stack' },
  { id: 'queue-demo' as const, label: 'Queue Demo' },
];

export function StackQueuePage() {
  const [activeId, setActiveId] = useState<StackQueueAlgorithmId>('balanced-brackets');

  // Per-algorithm input state
  const [bbExpr, setBbExpr] = useState(DEFAULT_BALANCED_BRACKETS_INPUT.expression);
  const [msValues, setMsValues] = useState(DEFAULT_MONOTONIC_STACK_INPUT.values.join(', '));
  const [qdValues, setQdValues] = useState(DEFAULT_QUEUE_DEMO_INPUT.values.join(', '));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    balancedBrackets(DEFAULT_BALANCED_BRACKETS_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: StackQueueAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'balanced-brackets') {
        setRun(balancedBrackets(DEFAULT_BALANCED_BRACKETS_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'monotonic-stack') {
        setRun(monotonicStack(DEFAULT_MONOTONIC_STACK_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(queueDemo(DEFAULT_QUEUE_DEMO_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);
    runner.reset();

    if (activeId === 'balanced-brackets') {
      const expr = bbExpr.trim();
      if (expr.length > 100) { setParseError('Expression too long (max 100 chars).'); return; }
      const valid = /^[()[\]{}]*$/.test(expr);
      if (!valid) { setParseError('Only ( ) [ ] { } characters allowed.'); return; }
      setRun(balancedBrackets({ expression: expr }) as AlgorithmRun<unknown>);
    } else if (activeId === 'monotonic-stack') {
      const values = msValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(monotonicStack({ values }) as AlgorithmRun<unknown>);
    } else {
      const values = qdValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(queueDemo({ values }) as AlgorithmRun<unknown>);
    }
  }, [activeId, bbExpr, msValues, qdValues, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  const stackSnap =
    activeId !== 'queue-demo'
      ? (currentStep?.snapshot as StackSnapshot | undefined) ?? null
      : null;
  const queueSnap =
    activeId === 'queue-demo'
      ? (currentStep?.snapshot as QueueSnapshot | undefined) ?? null
      : null;

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="stack-queue" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        {/* Visualizer */}
        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          {activeId !== 'queue-demo' ? (
            <StackVisualizer snapshot={stackSnap} />
          ) : (
            <QueueVisualizer snapshot={queueSnap} />
          )}
        </div>

        <StepNarration narration={currentStep?.narration} />

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
          {activeId === 'balanced-brackets' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Bracket expression (only {'( ) [ ] { }'})
              </label>
              <input
                type="text"
                value={bbExpr}
                onChange={(e) => setBbExpr(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="([{}])"
              />
            </div>
          )}
          {activeId === 'monotonic-stack' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={msValues}
                onChange={(e) => setMsValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="2, 1, 2, 4, 3"
              />
            </div>
          )}
          {activeId === 'queue-demo' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Values to enqueue (comma-separated)
              </label>
              <input
                type="text"
                value={qdValues}
                onChange={(e) => setQdValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="3, 1, 2, 4"
              />
            </div>
          )}
        </InputPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
          </div>
        </div>
      </main>

      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="stack-queue" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 8.2: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 8.3: Run full test suite**

```bash
pnpm test --run
```

Expected: all tests pass (previous 110 + new tests from Tasks 2–6).

- [ ] **Step 8.4: Commit**

```bash
git add src/routes/StackQueuePage.tsx
git commit -m "feat(page): StackQueuePage — full layout with 3 algorithm tabs"
```

---

## Task 9: Final verification

- [ ] **Step 9.1: Run all checks**

```bash
pnpm lint && pnpm typecheck && pnpm test --run && pnpm build
```

Expected: lint clean, typecheck clean, all tests pass, build succeeds.

- [ ] **Step 9.2: Start dev server and verify in browser**

```bash
pnpm dev
```

Navigate to `http://localhost:5173/stack-queue` (or whichever port the dev server picks).

Verify:
- [ ] "Balanced Brackets" tab: enter `([{}])` → press Run → step through — each bracket pushes/pops on the stack, final step shows "balanced ✓"
- [ ] Enter `([)]` → press Run → animation shows "mismatch!" with invalid styling (red)
- [ ] "Monotonic Stack" tab: enter `2, 1, 2, 4, 3` → step through — result array shows `[4, 2, 4, -1, -1]` building up
- [ ] "Queue Demo" tab: step through — queue fills left-to-right then empties in FIFO order
- [ ] CodePanel highlights active line for all three algorithms
- [ ] ComplexityBadge shows correct values for each tab
- [ ] ProblemsSidebar shows 5 beginner + 5 advanced problems, all links open correct NeetCode pages
- [ ] KeyInsightCallout shows the mental model for each algorithm
- [ ] Speed slider, play/pause, step forward/back all work
- [ ] Keyboard shortcuts (Space, arrow keys) work

- [ ] **Step 9.3: Final commit**

```bash
git add -A
git commit -m "chore(session-3): stack-queue complete — 3 algorithms, 2 visualizers, verified NeetCode links"
```

---

## Self-Review

**Spec coverage check:**
- [x] `balancedBrackets.ts` — Task 2
- [x] `monotonicStack.ts` — Task 3
- [x] `queueDemo.ts` — Task 4
- [x] `StackVisualizer` — Task 5
- [x] `QueueVisualizer` — Task 6
- [x] Data files (snippets/complexities/problems/insights) — Task 7
- [x] `StackQueuePage.tsx` full layout — Task 8
- [x] All NeetCode slugs verified from NeetCode practice pages — Plan header
- [x] TDD discipline: every algorithm has result + trace snapshot test

**No placeholders:** all code blocks contain complete, runnable implementations.

**Type consistency:**
- `StackSnapshot` used by `balancedBrackets`, `monotonicStack`, and `StackVisualizer` — same import
- `QueueSnapshot` used by `queueDemo` and `QueueVisualizer` — same import
- `StackItem` imported from `@/types/snapshots` in all algorithm files
- `AlgorithmRun<unknown>` cast used consistently in StackQueuePage (same pattern as ArraysPage)
