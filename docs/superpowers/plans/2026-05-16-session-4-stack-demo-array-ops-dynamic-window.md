# Session 4 — Stack Demo + Array Operations + Dynamic Sliding Window

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three algorithm tabs — Stack Demo (4th tab on Stack & Queue page), Array Operations (3rd tab on Arrays page), Dynamic Sliding Window / longest-substring-no-repeat (4th tab on Arrays page).

**Architecture:** Stack Demo reuses the existing `StackVisualizer` and `StackSnapshot`. Array Operations introduces `ArrayOpsSnapshot` + `ArrayOpsVisualizer` to visualise push/insert/delete/pop with cost badges and shift-range highlighting. Dynamic Window introduces `StringWindowSnapshot` + `StringVisualizer` to show char cells, left/right pointers, the sliding window, and the current character set. All three algorithms follow the `createRunBuilder` + `r.push()` + `r.build(finalResult)` pattern used throughout the codebase.

**Tech Stack:** Vite + React + TypeScript (strict) + Tailwind CSS + Zustand + Vitest + Testing Library.

---

## File Map

**Create:**
- `src/algorithms/stackQueue/stackDemo.ts`
- `src/algorithms/arrays/arrayOps.ts`
- `src/algorithms/arrays/dynamicWindow.ts`
- `src/components/visualizers/ArrayOpsVisualizer.tsx`
- `src/components/visualizers/StringVisualizer.tsx`
- `tests/algorithms/stackDemo.test.ts`
- `tests/algorithms/arrayOps.test.ts`
- `tests/algorithms/dynamicWindow.test.ts`
- `tests/components/ArrayOpsVisualizer.test.tsx`
- `tests/components/StringVisualizer.test.tsx`

**Modify:**
- `src/types/algorithm.ts` — add `'stack-demo' | 'array-ops' | 'dynamic-window'` to AlgorithmId; add input types + defaults
- `src/types/snapshots.ts` — add `ArrayOpsSnapshot`, `StringWindowSnapshot`
- `src/data/codeSnippets.ts` — 3 new entries
- `src/data/complexities.ts` — 3 new entries
- `src/data/keyInsights.ts` — 3 new entries
- `src/routes/StackQueuePage.tsx` — add 4th tab (stack-demo)
- `src/routes/ArraysPage.tsx` — add 3rd and 4th tabs (array-ops, dynamic-window); change run type to `AlgorithmRun<unknown>`

---

## Task 1: Types

**Files:**
- Modify: `src/types/algorithm.ts`
- Modify: `src/types/snapshots.ts`

- [ ] **Step 1.1: Add algorithm IDs and input types to algorithm.ts**

The `AlgorithmId` union currently ends at `'lcs'`. Add the three new IDs to it:

```ts
  | 'stack-demo'
  | 'array-ops'
  | 'dynamic-window'
```

At the end of `src/types/algorithm.ts` (after `DEFAULT_QUEUE_DEMO_INPUT`), append:

```ts
export interface StackDemoInput {
  values: number[];
}

export const DEFAULT_STACK_DEMO_INPUT: StackDemoInput = {
  values: [3, 1, 2, 4],
};

export interface ArrayOpsInput {
  values: number[];
}

export const DEFAULT_ARRAY_OPS_INPUT: ArrayOpsInput = {
  values: [1, 2, 3, 4],
};

export interface DynamicWindowInput {
  s: string;
}

export const DEFAULT_DYNAMIC_WINDOW_INPUT: DynamicWindowInput = {
  s: 'abcabcbb',
};
```

- [ ] **Step 1.2: Add snapshot types to snapshots.ts**

At the end of `src/types/snapshots.ts` (after `QueueSnapshot`), append:

```ts
export type ArrayOperation = 'idle' | 'push' | 'insert' | 'delete' | 'pop';

export interface ArrayOpsSnapshot {
  values: number[];
  operation: ArrayOperation;
  activeIndex?: number;
  shiftStart?: number;
  shiftEnd?: number;
  cost?: 'O(1)' | 'O(n)';
}

export interface StringWindowSnapshot {
  chars: string[];
  left: number;
  right: number;
  windowSet: string[];
  maxLen: number;
  currentLen: number;
  phase: 'init' | 'shrink' | 'expand' | 'done';
}
```

- [ ] **Step 1.3: Run typecheck**

```bash
pnpm typecheck
```

Expected: no errors.

- [ ] **Step 1.4: Commit**

```bash
git add src/types/algorithm.ts src/types/snapshots.ts
git commit -m "feat(types): stack-demo, array-ops, dynamic-window — IDs, inputs, snapshots"
```

---

## Task 2: stackDemo algorithm (TDD)

**Files:**
- Create: `tests/algorithms/stackDemo.test.ts`
- Create: `src/algorithms/stackQueue/stackDemo.ts`

Stack Demo pushes all values then pops them all, demonstrating LIFO order. For input `[3,1,2,4]`, pop order is `[4,2,1,3]`. Steps = 2n+1 (init + n pushes + n pops).

- [ ] **Step 2.1: Write failing tests**

Create `tests/algorithms/stackDemo.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { stackDemo } from '@/algorithms/stackQueue/stackDemo';
import { serializeRun } from '@/engine/serializeRun';

describe('stackDemo', () => {
  describe('result', () => {
    it('returns values in LIFO order', () => {
      expect(stackDemo({ values: [3, 1, 2, 4] }).finalResult).toEqual([4, 2, 1, 3]);
    });

    it('single element push and pop', () => {
      expect(stackDemo({ values: [7] }).finalResult).toEqual([7]);
    });

    it('two elements are reversed', () => {
      expect(stackDemo({ values: [1, 2] }).finalResult).toEqual([2, 1]);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits 2n+1 steps for n values', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      expect(run.steps.length).toBe(2 * 4 + 1);
    });

    it('all steps have valid line numbers', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('push steps have increasing stack size', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      const pushSteps = run.steps.slice(1, 5);
      pushSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').StackSnapshot;
        expect(snap.items.length).toBe(idx + 1);
      });
    });

    it('pop steps have decreasing stack size', () => {
      const run = stackDemo({ values: [3, 1, 2, 4] });
      const popSteps = run.steps.slice(5, 9);
      popSteps.forEach((s, idx) => {
        const snap = s.snapshot as import('@/types/snapshots').StackSnapshot;
        expect(snap.items.length).toBe(4 - idx - 1);
      });
    });
  });
});
```

- [ ] **Step 2.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/stackDemo.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/stackQueue/stackDemo'"

- [ ] **Step 2.3: Implement stackDemo**

Create `src/algorithms/stackQueue/stackDemo.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot, StackItem } from '@/types/snapshots';
import type { StackDemoInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: class Stack {
2:   constructor() { this.items = []; }
3:   push(val) { this.items.push(val); }
4:   pop() { return this.items.pop(); }
5: }
6: // Push all values, then pop to show LIFO
*/

export function stackDemo(input: StackDemoInput): AlgorithmRun<StackSnapshot> {
  const { values } = input;
  const r = createRunBuilder<StackSnapshot>('stack-demo', input);
  let idCounter = 0;
  const uid = () => `s${idCounter++}`;

  let items: StackItem[] = [];
  const popped: number[] = [];

  r.push({
    line: 2,
    narration: `Create empty stack — items will push and pop from the top`,
    snapshot: { items: [], inputTokens: values.map(String), inputCursor: 0 },
    variables: { size: 0 },
  });

  for (let i = 0; i < values.length; i++) {
    const val = values[i]!;
    items = [...items, { id: uid(), value: val }];
    r.push({
      line: 3,
      narration: `Push ${val} — added to top of stack (LIFO)`,
      snapshot: { items: [...items], inputTokens: values.map(String), inputCursor: i + 1 },
      variables: { pushed: val, size: items.length },
    });
  }

  for (let i = 0; i < values.length; i++) {
    const top = items[items.length - 1]!;
    const val = top.value as number;
    items = items.slice(0, -1);
    popped.push(val);
    r.push({
      line: 4,
      narration: `Pop ${val} from top — last in, first out`,
      snapshot: { items: [...items], inputTokens: values.map(String), inputCursor: i },
      variables: { popped: val, size: items.length, order: JSON.stringify(popped) },
    });
  }

  return r.build([...popped]);
}
```

- [ ] **Step 2.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/stackDemo.test.ts --run
```

Expected: all 8 tests pass, 1 snapshot written.

- [ ] **Step 2.5: Commit**

```bash
git add src/algorithms/stackQueue/stackDemo.ts tests/algorithms/stackDemo.test.ts tests/algorithms/__snapshots__/stackDemo.test.ts.snap
git commit -m "feat(algo): stackDemo LIFO with TDD — result + trace snapshot"
```

---

## Task 3: arrayOps algorithm (TDD)

**Files:**
- Create: `tests/algorithms/arrayOps.test.ts`
- Create: `src/algorithms/arrays/arrayOps.ts`

The algorithm performs a **fixed 4-operation sequence** on whatever starting array the user provides:
1. **Push** `max(values) + 1` to end — O(1)
2. **Insert** 99 at `Math.floor(currentLength / 2)` — O(n), emits a "shift announce" step then a "done" step
3. **Delete** at index 1 — O(n), emits a "shift announce" step then a "done" step
4. **Pop** last element — O(1)

Total steps: always **8** (init + push + insert-announce + insert-done + delete-announce + delete-done + pop + final).

For default input `[1, 2, 3, 4]`:
- After push 5: `[1, 2, 3, 4, 5]`
- After insert 99 at index 2: `[1, 2, 99, 3, 4, 5]`
- After delete index 1 (removes `2`): `[1, 99, 3, 4, 5]`
- After pop: `[1, 99, 3, 4]`
- `finalResult`: `[1, 99, 3, 4]`

- [ ] **Step 3.1: Write failing tests**

Create `tests/algorithms/arrayOps.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { arrayOps } from '@/algorithms/arrays/arrayOps';
import { serializeRun } from '@/engine/serializeRun';
import type { ArrayOpsSnapshot } from '@/types/snapshots';

describe('arrayOps', () => {
  describe('result', () => {
    it('finalResult is [1,99,3,4] for default [1,2,3,4]', () => {
      expect(arrayOps({ values: [1, 2, 3, 4] }).finalResult).toEqual([1, 99, 3, 4]);
    });

    it('finalResult is [10,99,30] for [10,20,30]', () => {
      // push 31 → [10,20,30,31]; insert 99 at 2 → [10,20,99,30,31]; delete idx 1 → [10,99,30,31]; pop → [10,99,30]
      expect(arrayOps({ values: [10, 20, 30] }).finalResult).toEqual([10, 99, 30]);
    });

    it('finalResult contains 99 (insert always uses 99)', () => {
      const result = arrayOps({ values: [5, 6, 7, 8] }).finalResult as number[];
      expect(result).toContain(99);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits exactly 8 steps for any input', () => {
      expect(arrayOps({ values: [1, 2, 3, 4] }).steps.length).toBe(8);
      expect(arrayOps({ values: [10, 20, 30] }).steps.length).toBe(8);
    });

    it('all steps have valid line numbers', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('has a step with operation=push and cost=O(1)', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const step = run.steps.find(
        (s) => (s.snapshot as ArrayOpsSnapshot).operation === 'push',
      );
      expect(step).toBeDefined();
      expect((step!.snapshot as ArrayOpsSnapshot).cost).toBe('O(1)');
    });

    it('has a step with operation=insert and cost=O(n)', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const step = run.steps.find(
        (s) => (s.snapshot as ArrayOpsSnapshot).operation === 'insert',
      );
      expect(step).toBeDefined();
      expect((step!.snapshot as ArrayOpsSnapshot).cost).toBe('O(n)');
    });

    it('insert-announce step has shiftStart and shiftEnd defined', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const announceStep = run.steps.find(
        (s) => {
          const snap = s.snapshot as ArrayOpsSnapshot;
          return snap.operation === 'insert' && snap.shiftStart !== undefined;
        },
      );
      expect(announceStep).toBeDefined();
      const snap = announceStep!.snapshot as ArrayOpsSnapshot;
      expect(snap.shiftStart).toBeDefined();
      expect(snap.shiftEnd).toBeDefined();
    });

    it('last step has operation=pop and values matching finalResult', () => {
      const run = arrayOps({ values: [1, 2, 3, 4] });
      const last = run.steps[run.steps.length - 1]!;
      const snap = last.snapshot as ArrayOpsSnapshot;
      expect(snap.operation).toBe('pop');
      expect(snap.values).toEqual([1, 99, 3, 4]);
    });
  });
});
```

- [ ] **Step 3.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/arrayOps.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/arrays/arrayOps'"

- [ ] **Step 3.3: Implement arrayOps**

Create `src/algorithms/arrays/arrayOps.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { ArrayOpsSnapshot } from '@/types/snapshots';
import type { ArrayOpsInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function arrayOps(arr) {
2:   arr.push(val);            // append to end    — O(1)
3:   arr.splice(i, 0, 99);    // insert at middle — O(n) shift
4:   arr.splice(1, 1);         // delete at idx 1  — O(n) shift
5:   arr.pop();                // remove from end  — O(1)
6:   return arr;
7: }
*/

export function arrayOps(input: ArrayOpsInput): AlgorithmRun<ArrayOpsSnapshot> {
  const r = createRunBuilder<ArrayOpsSnapshot>('array-ops', input);
  let arr = [...input.values];

  const snap = (
    operation: ArrayOpsSnapshot['operation'],
    extra?: Partial<ArrayOpsSnapshot>,
  ): ArrayOpsSnapshot => ({ values: [...arr], operation, ...extra });

  // Step 1: Init
  r.push({
    line: 1,
    narration: `Starting array: [${arr.join(', ')}]`,
    snapshot: snap('idle'),
    variables: { length: arr.length },
  });

  // Step 2: Push
  const pushVal = Math.max(...arr) + 1;
  arr = [...arr, pushVal];
  r.push({
    line: 2,
    narration: `Push ${pushVal} to end — O(1): no elements shift`,
    snapshot: snap('push', { activeIndex: arr.length - 1, cost: 'O(1)' }),
    variables: { pushed: pushVal, length: arr.length },
  });

  // Step 3a: Insert announce (show shift range before mutation)
  const insertIdx = Math.floor(arr.length / 2);
  const shiftEndBefore = arr.length - 1;
  r.push({
    line: 3,
    narration: `Insert 99 at index ${insertIdx} — must shift ${arr.length - insertIdx} element(s) right`,
    snapshot: snap('insert', {
      activeIndex: insertIdx,
      shiftStart: insertIdx,
      shiftEnd: shiftEndBefore,
      cost: 'O(n)',
    }),
    variables: { insertAt: insertIdx, shifting: arr.length - insertIdx },
  });

  // Step 3b: Insert done
  arr = [...arr.slice(0, insertIdx), 99, ...arr.slice(insertIdx)];
  r.push({
    line: 3,
    narration: `Inserted 99 at index ${insertIdx} — array is now length ${arr.length}`,
    snapshot: snap('insert', { activeIndex: insertIdx, cost: 'O(n)' }),
    variables: { inserted: 99, at: insertIdx, length: arr.length },
  });

  // Step 4a: Delete announce
  r.push({
    line: 4,
    narration: `Delete index 1 — must shift ${arr.length - 2} element(s) left`,
    snapshot: snap('delete', {
      activeIndex: 1,
      shiftStart: 2,
      shiftEnd: arr.length - 1,
      cost: 'O(n)',
    }),
    variables: { deleteAt: 1, shifting: arr.length - 2 },
  });

  // Step 4b: Delete done
  const deleted = arr[1]!;
  arr = [...arr.slice(0, 1), ...arr.slice(2)];
  r.push({
    line: 4,
    narration: `Deleted ${deleted} from index 1 — array is now length ${arr.length}`,
    snapshot: snap('delete', { cost: 'O(n)' }),
    variables: { deleted, length: arr.length },
  });

  // Step 5: Pop
  const popped = arr[arr.length - 1]!;
  arr = arr.slice(0, -1);
  r.push({
    line: 5,
    narration: `Pop ${popped} from end — O(1): no elements shift`,
    snapshot: snap('pop', { activeIndex: arr.length, cost: 'O(1)' }),
    variables: { popped, length: arr.length },
  });

  // Step 6: Final
  r.push({
    line: 6,
    narration: `Done — final array: [${arr.join(', ')}]`,
    snapshot: snap('idle'),
    variables: { length: arr.length },
  });

  return r.build([...arr]);
}
```

- [ ] **Step 3.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/arrayOps.test.ts --run
```

Expected: all 9 tests pass, 1 snapshot written.

- [ ] **Step 3.5: Commit**

```bash
git add src/algorithms/arrays/arrayOps.ts tests/algorithms/arrayOps.test.ts tests/algorithms/__snapshots__/arrayOps.test.ts.snap
git commit -m "feat(algo): arrayOps — push/insert/delete/pop with O(1) vs O(n) cost trace"
```

---

## Task 4: dynamicWindow algorithm (TDD)

**Files:**
- Create: `tests/algorithms/dynamicWindow.test.ts`
- Create: `src/algorithms/arrays/dynamicWindow.ts`

Longest substring without repeating characters. For `"abcabcbb"` → 3 (`"abc"`). Uses a Set-based sliding window: grow right, shrink from left whenever a duplicate is detected.

Steps emitted per character `right`:
- One **shrink** step per `left++` (when duplicate found)
- One **expand** step after the character is added to the window

Plus one **init** step and one **done** step.

For `"abcabcbb"`:
- right=0 (a): expand → [a], len=1
- right=1 (b): expand → [a,b], len=2
- right=2 (c): expand → [a,b,c], len=3, maxLen=3
- right=3 (a): shrink (remove a, left=1) → expand (add a) → [b,c,a], len=3
- right=4 (b): shrink (remove b, left=2) → expand (add b) → [c,a,b], len=3
- right=5 (c): shrink (remove c, left=3) → expand (add c) → [a,b,c], len=3
- right=6 (b): shrink (remove a, left=4), shrink (remove b, left=5) → expand (add b) → [c,b], len=2
- right=7 (b): shrink (remove c, left=6), shrink (remove b, left=7) → expand (add b) → [b], len=1
- Final → maxLen=3

- [ ] **Step 4.1: Write failing tests**

Create `tests/algorithms/dynamicWindow.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { dynamicWindow } from '@/algorithms/arrays/dynamicWindow';
import { serializeRun } from '@/engine/serializeRun';
import type { StringWindowSnapshot } from '@/types/snapshots';

describe('dynamicWindow', () => {
  describe('result', () => {
    it('returns 3 for "abcabcbb"', () => {
      expect(dynamicWindow({ s: 'abcabcbb' }).finalResult).toBe(3);
    });

    it('returns 1 for "bbbbb"', () => {
      expect(dynamicWindow({ s: 'bbbbb' }).finalResult).toBe(1);
    });

    it('returns 3 for "pwwkew"', () => {
      expect(dynamicWindow({ s: 'pwwkew' }).finalResult).toBe(3);
    });

    it('returns 0 for empty string', () => {
      expect(dynamicWindow({ s: '' }).finalResult).toBe(0);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = dynamicWindow({ s: 'abcabcbb' });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least n+2 steps for n-character string', () => {
      const run = dynamicWindow({ s: 'abcabcbb' });
      expect(run.steps.length).toBeGreaterThanOrEqual(10); // init + 8 expand + done
    });

    it('all steps have valid line numbers', () => {
      const run = dynamicWindow({ s: 'abcabcbb' });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('last step has phase=done and maxLen=finalResult', () => {
      const run = dynamicWindow({ s: 'abcabcbb' });
      const last = run.steps[run.steps.length - 1]!;
      const snap = last.snapshot as StringWindowSnapshot;
      expect(snap.phase).toBe('done');
      expect(snap.maxLen).toBe(run.finalResult);
    });

    it('all expand steps have phase=expand', () => {
      const run = dynamicWindow({ s: 'abc' });
      const expandSteps = run.steps.filter(
        (s) => (s.snapshot as StringWindowSnapshot).phase === 'expand',
      );
      expect(expandSteps.length).toBe(3);
    });

    it('windowSet grows then shrinks correctly for "abca"', () => {
      const run = dynamicWindow({ s: 'abca' });
      const expandSteps = run.steps.filter(
        (s) => (s.snapshot as StringWindowSnapshot).phase === 'expand',
      );
      // After "abc": windowSet has 3 chars; after shrink+expand for second 'a': windowSet has 3 chars
      expect(expandSteps[2]!.snapshot as StringWindowSnapshot).toMatchObject({
        windowSet: expect.arrayContaining(['a', 'b', 'c']),
        maxLen: 3,
      });
    });
  });
});
```

- [ ] **Step 4.2: Run to confirm failure**

```bash
pnpm test tests/algorithms/dynamicWindow.test.ts --run
```

Expected: FAIL with "Cannot find module '@/algorithms/arrays/dynamicWindow'"

- [ ] **Step 4.3: Implement dynamicWindow**

Create `src/algorithms/arrays/dynamicWindow.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StringWindowSnapshot } from '@/types/snapshots';
import type { DynamicWindowInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function lengthOfLongestSubstring(s) {
2:   let left = 0, maxLen = 0;
3:   const seen = new Set();
4:   for (let right = 0; right < s.length; right++) {
5:     while (seen.has(s[right])) {
6:       seen.delete(s[left]);
7:       left++;
8:     }
9:     seen.add(s[right]);
10:    maxLen = Math.max(maxLen, right - left + 1);
11:  }
12:  return maxLen;
13: }
*/

export function dynamicWindow(input: DynamicWindowInput): AlgorithmRun<StringWindowSnapshot> {
  const { s } = input;
  const chars = s.split('');
  const r = createRunBuilder<StringWindowSnapshot>('dynamic-window', input);

  let left = 0;
  let maxLen = 0;
  const seen = new Set<string>();

  const snap = (
    right: number,
    phase: StringWindowSnapshot['phase'],
  ): StringWindowSnapshot => ({
    chars,
    left,
    right,
    windowSet: [...seen],
    maxLen,
    currentLen: right >= left ? right - left + 1 : 0,
    phase,
  });

  r.push({
    line: 2,
    narration: `Initialize left=0, empty window — scanning "${s || '(empty)'}"`,
    snapshot: snap(-1, 'init'),
    variables: { left: 0, maxLen: 0 },
  });

  if (chars.length === 0) {
    r.push({
      line: 12,
      narration: `Empty string — maxLen = 0`,
      snapshot: snap(-1, 'done'),
      variables: { maxLen: 0 },
    });
    return r.build(0);
  }

  for (let right = 0; right < chars.length; right++) {
    const c = chars[right]!;

    while (seen.has(c)) {
      const removed = chars[left]!;
      seen.delete(removed);
      r.push({
        line: 6,
        narration: `'${c}' already in window — remove '${removed}' from left, shrink`,
        snapshot: snap(right, 'shrink'),
        variables: { left, removing: removed, right, windowSize: seen.size },
      });
      left++;
    }

    seen.add(c);
    maxLen = Math.max(maxLen, right - left + 1);
    r.push({
      line: 9,
      narration: `Add '${c}' — window "${chars.slice(left, right + 1).join('')}", len=${right - left + 1}, maxLen=${maxLen}`,
      snapshot: snap(right, 'expand'),
      variables: { left, right, char: c, currentLen: right - left + 1, maxLen },
    });
  }

  r.push({
    line: 12,
    narration: `Done — longest substring without repeating chars has length ${maxLen}`,
    snapshot: snap(chars.length - 1, 'done'),
    variables: { maxLen },
  });

  return r.build(maxLen);
}
```

- [ ] **Step 4.4: Run tests to confirm pass**

```bash
pnpm test tests/algorithms/dynamicWindow.test.ts --run
```

Expected: all 9 tests pass, 1 snapshot written.

- [ ] **Step 4.5: Commit**

```bash
git add src/algorithms/arrays/dynamicWindow.ts tests/algorithms/dynamicWindow.test.ts tests/algorithms/__snapshots__/dynamicWindow.test.ts.snap
git commit -m "feat(algo): dynamicWindow — longest substring no-repeat with shrink/expand trace"
```

---

## Task 5: ArrayOpsVisualizer component (TDD)

**Files:**
- Create: `tests/components/ArrayOpsVisualizer.test.tsx`
- Create: `src/components/visualizers/ArrayOpsVisualizer.tsx`

Shows: operation badge with cost, array cells with index labels, active cell highlighted amber, shift range highlighted cyan.

- [ ] **Step 5.1: Write failing tests**

Create `tests/components/ArrayOpsVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArrayOpsVisualizer } from '@/components/visualizers/ArrayOpsVisualizer';
import type { ArrayOpsSnapshot } from '@/types/snapshots';

const idleSnap: ArrayOpsSnapshot = {
  values: [1, 2, 3, 4],
  operation: 'idle',
};

const pushSnap: ArrayOpsSnapshot = {
  values: [1, 2, 3, 4, 5],
  operation: 'push',
  activeIndex: 4,
  cost: 'O(1)',
};

const insertSnap: ArrayOpsSnapshot = {
  values: [1, 2, 3, 4, 5],
  operation: 'insert',
  activeIndex: 2,
  shiftStart: 2,
  shiftEnd: 4,
  cost: 'O(n)',
};

describe('ArrayOpsVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<ArrayOpsVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all array values', () => {
    render(<ArrayOpsVisualizer snapshot={idleSnap} />);
    expect(screen.getByTestId('ops-cell-0')).toHaveTextContent('1');
    expect(screen.getByTestId('ops-cell-1')).toHaveTextContent('2');
    expect(screen.getByTestId('ops-cell-2')).toHaveTextContent('3');
    expect(screen.getByTestId('ops-cell-3')).toHaveTextContent('4');
  });

  it('renders cost badge for O(1) operation', () => {
    render(<ArrayOpsVisualizer snapshot={pushSnap} />);
    expect(screen.getByTestId('cost-badge')).toHaveTextContent('O(1)');
  });

  it('renders cost badge for O(n) operation', () => {
    render(<ArrayOpsVisualizer snapshot={insertSnap} />);
    expect(screen.getByTestId('cost-badge')).toHaveTextContent('O(n)');
  });

  it('marks activeIndex cell with data-active', () => {
    const { container } = render(<ArrayOpsVisualizer snapshot={pushSnap} />);
    expect(container.querySelector('[data-active="true"]')).toBeInTheDocument();
  });

  it('marks shift range cells with data-shift', () => {
    const { container } = render(<ArrayOpsVisualizer snapshot={insertSnap} />);
    const shiftCells = container.querySelectorAll('[data-shift="true"]');
    expect(shiftCells.length).toBe(3); // indices 2,3,4
  });

  it('renders index labels', () => {
    render(<ArrayOpsVisualizer snapshot={idleSnap} />);
    expect(screen.getByTestId('ops-index-0')).toHaveTextContent('0');
    expect(screen.getByTestId('ops-index-3')).toHaveTextContent('3');
  });
});
```

- [ ] **Step 5.2: Run to confirm failure**

```bash
pnpm test tests/components/ArrayOpsVisualizer.test.tsx --run
```

Expected: FAIL with "Cannot find module '@/components/visualizers/ArrayOpsVisualizer'"

- [ ] **Step 5.3: Implement ArrayOpsVisualizer**

Create `src/components/visualizers/ArrayOpsVisualizer.tsx`:

```tsx
import { cn } from '@/utils/classNames';
import type { ArrayOpsSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: ArrayOpsSnapshot | null;
}

const OPERATION_LABEL: Record<string, string> = {
  idle: 'Array',
  push: 'PUSH — append to end',
  insert: 'INSERT — at middle',
  delete: 'DELETE — at index',
  pop: 'POP — remove from end',
};

export function ArrayOpsVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { values, operation, activeIndex, shiftStart, shiftEnd, cost } = snapshot;

  const inShiftRange = (i: number) =>
    shiftStart !== undefined && shiftEnd !== undefined && i >= shiftStart && i <= shiftEnd;

  return (
    <div className="flex flex-col items-center gap-4 py-6 w-full">
      {/* Operation badge row */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono text-text-secondary">
          {OPERATION_LABEL[operation] ?? operation}
        </span>
        {cost && (
          <span
            data-testid="cost-badge"
            className={cn(
              'px-2 py-0.5 rounded text-xs font-mono font-bold border',
              cost === 'O(1)'
                ? 'bg-status-success/15 border-status-success text-status-success'
                : 'bg-status-warn/15 border-status-warn text-status-warn',
            )}
          >
            {cost}
          </span>
        )}
      </div>

      {/* Cells */}
      <div className="flex gap-2">
        {values.map((v, i) => {
          const isActive = i === activeIndex;
          const isShift = inShiftRange(i);
          return (
            <div
              key={i}
              data-testid={`ops-cell-${i}`}
              data-active={isActive ? 'true' : undefined}
              data-shift={isShift ? 'true' : undefined}
              className={cn(
                'w-12 h-12 flex items-center justify-center text-lg font-mono font-semibold rounded-lg border transition',
                isActive
                  ? 'ring-2 ring-accent-primary bg-accent-primary/15 border-accent-primary text-accent-primary'
                  : isShift
                  ? 'ring-2 ring-accent-secondary bg-accent-secondary/10 border-accent-secondary text-accent-secondary'
                  : 'bg-bg-elevated border-border-subtle text-text-primary',
              )}
            >
              {v}
            </div>
          );
        })}
      </div>

      {/* Shift range annotation */}
      {shiftStart !== undefined && shiftEnd !== undefined && (
        <div className="flex gap-2 items-center text-xs font-mono text-accent-secondary">
          <span>↑ indices {shiftStart}–{shiftEnd} shift {operation === 'insert' ? 'right →' : '← left'}</span>
        </div>
      )}

      {/* Index labels */}
      <div className="flex gap-2">
        {values.map((_, i) => (
          <div
            key={i}
            data-testid={`ops-index-${i}`}
            className="w-12 text-center text-xs font-mono text-text-muted"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5.4: Run tests to confirm pass**

```bash
pnpm test tests/components/ArrayOpsVisualizer.test.tsx --run
```

Expected: all 7 tests pass.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/visualizers/ArrayOpsVisualizer.tsx tests/components/ArrayOpsVisualizer.test.tsx
git commit -m "feat(viz): ArrayOpsVisualizer — operation badge, shift range highlight, cost"
```

---

## Task 6: StringVisualizer component (TDD)

**Files:**
- Create: `tests/components/StringVisualizer.test.tsx`
- Create: `src/components/visualizers/StringVisualizer.tsx`

Shows: character cells, `L` pointer (cyan) above `left` cell, `R` pointer (amber) above `right` cell, window highlighted between `left` and `right`, window set badges, max length display.

- [ ] **Step 6.1: Write failing tests**

Create `tests/components/StringVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StringVisualizer } from '@/components/visualizers/StringVisualizer';
import type { StringWindowSnapshot } from '@/types/snapshots';

const expandSnap: StringWindowSnapshot = {
  chars: ['a', 'b', 'c', 'a', 'b', 'c', 'b', 'b'],
  left: 0,
  right: 2,
  windowSet: ['a', 'b', 'c'],
  maxLen: 3,
  currentLen: 3,
  phase: 'expand',
};

const shrinkSnap: StringWindowSnapshot = {
  chars: ['a', 'b', 'c', 'a'],
  left: 1,
  right: 3,
  windowSet: ['b', 'c'],
  maxLen: 3,
  currentLen: 2,
  phase: 'shrink',
};

describe('StringVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<StringVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all character cells', () => {
    const { container } = render(<StringVisualizer snapshot={expandSnap} />);
    expect(container.querySelector('[data-testid="char-cell-0"]')?.textContent).toBe('a');
    expect(container.querySelector('[data-testid="char-cell-2"]')?.textContent).toBe('c');
  });

  it('marks window cells with data-in-window', () => {
    const { container } = render(<StringVisualizer snapshot={expandSnap} />);
    const windowCells = container.querySelectorAll('[data-in-window="true"]');
    expect(windowCells.length).toBe(3); // left=0 right=2 → indices 0,1,2
  });

  it('marks left cell with data-left', () => {
    const { container } = render(<StringVisualizer snapshot={expandSnap} />);
    expect(container.querySelector('[data-left="true"]')).toBeInTheDocument();
  });

  it('marks right cell with data-right', () => {
    const { container } = render(<StringVisualizer snapshot={expandSnap} />);
    expect(container.querySelector('[data-right="true"]')).toBeInTheDocument();
  });

  it('renders window set badges', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('window-set')).toBeInTheDocument();
  });

  it('renders max length display', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('max-len')).toHaveTextContent('3');
  });

  it('renders shrink phase without right in window', () => {
    const { container } = render(<StringVisualizer snapshot={shrinkSnap} />);
    // left=1, right=3 in shrink phase: window is left..right-1 = 1..2 (2 cells in window)
    const windowCells = container.querySelectorAll('[data-in-window="true"]');
    expect(windowCells.length).toBe(2);
  });
});
```

- [ ] **Step 6.2: Run to confirm failure**

```bash
pnpm test tests/components/StringVisualizer.test.tsx --run
```

Expected: FAIL with "Cannot find module '@/components/visualizers/StringVisualizer'"

- [ ] **Step 6.3: Implement StringVisualizer**

Create `src/components/visualizers/StringVisualizer.tsx`:

```tsx
import { cn } from '@/utils/classNames';
import type { StringWindowSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: StringWindowSnapshot | null;
}

export function StringVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { chars, left, right, windowSet, maxLen, currentLen, phase } = snapshot;

  // During shrink, right is the "target" not yet added — window is left..right-1
  // During expand/done, window is left..right
  const windowEnd = phase === 'shrink' ? right - 1 : right;

  const inWindow = (i: number) =>
    right >= 0 && left <= windowEnd && i >= left && i <= windowEnd;

  return (
    <div className="flex flex-col items-center gap-4 py-6 w-full">
      {/* Pointer labels */}
      <div className="flex gap-2">
        {chars.map((_, i) => {
          const isLeft = i === left;
          const isRight = i === right && right >= 0;
          return (
            <div key={i} className="w-10 flex flex-col items-center gap-0.5">
              {isLeft && (
                <span className="text-xs font-mono font-bold text-accent-secondary">L</span>
              )}
              {isRight && !isLeft && (
                <span className="text-xs font-mono font-bold text-accent-primary">R</span>
              )}
              {isRight && isLeft && (
                <span className="text-xs font-mono font-bold text-status-warn">L=R</span>
              )}
              {!isLeft && !isRight && (
                <span className="text-xs invisible">_</span>
              )}
              {(isLeft || isRight) && (
                <div
                  className={cn(
                    'w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent',
                    isLeft && isRight
                      ? 'border-t-status-warn'
                      : isLeft
                      ? 'border-t-accent-secondary'
                      : 'border-t-accent-primary',
                  )}
                />
              )}
              {!isLeft && !isRight && <div className="h-4" />}
            </div>
          );
        })}
      </div>

      {/* Character cells */}
      <div className="flex gap-2">
        {chars.map((c, i) => {
          const isInWin = inWindow(i);
          const isLeft = i === left;
          const isRight = i === right && right >= 0;
          return (
            <div
              key={i}
              data-testid={`char-cell-${i}`}
              data-in-window={isInWin ? 'true' : undefined}
              data-left={isLeft ? 'true' : undefined}
              data-right={isRight ? 'true' : undefined}
              className={cn(
                'w-10 h-10 flex items-center justify-center text-base font-mono font-semibold rounded-lg border transition',
                isLeft && isRight
                  ? 'ring-2 ring-status-warn bg-status-warn/15 border-status-warn text-status-warn'
                  : isLeft
                  ? 'ring-2 ring-accent-secondary bg-accent-secondary/15 border-accent-secondary text-accent-secondary'
                  : isRight
                  ? 'ring-2 ring-accent-primary bg-accent-primary/15 border-accent-primary text-accent-primary'
                  : isInWin
                  ? 'bg-accent-secondary/10 border-accent-secondary/50 text-text-primary'
                  : 'bg-bg-elevated border-border-subtle text-text-secondary',
              )}
            >
              {c}
            </div>
          );
        })}
      </div>

      {/* Window set + stats row */}
      <div className="flex items-center gap-6 flex-wrap justify-center">
        <div
          data-testid="window-set"
          className="flex items-center gap-2"
        >
          <span className="text-xs font-mono text-text-muted">window:</span>
          <div className="flex gap-1">
            {windowSet.length === 0 ? (
              <span className="text-xs font-mono text-text-muted italic">∅</span>
            ) : (
              windowSet.map((ch, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-xs font-mono bg-accent-secondary/15 border border-accent-secondary/50 text-accent-secondary"
                >
                  {ch}
                </span>
              ))
            )}
          </div>
          <span className="text-xs font-mono text-text-muted">len={currentLen}</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono">
          <span className="text-text-muted">maxLen =</span>
          <span data-testid="max-len" className="text-status-success font-bold">
            {maxLen}
          </span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6.4: Run tests to confirm pass**

```bash
pnpm test tests/components/StringVisualizer.test.tsx --run
```

Expected: all 8 tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/visualizers/StringVisualizer.tsx tests/components/StringVisualizer.test.tsx
git commit -m "feat(viz): StringVisualizer — char cells, L/R pointers, window set, maxLen"
```

---

## Task 7: Data entries

**Files:**
- Modify: `src/data/codeSnippets.ts`
- Modify: `src/data/complexities.ts`
- Modify: `src/data/keyInsights.ts`

No new NeetCode problems needed — arrays page already has 10 problems (including longest-substring), stack-queue page already has 10 problems.

- [ ] **Step 7.1: Add code snippets**

Append inside the `CODE_SNIPPETS` object in `src/data/codeSnippets.ts` (before the closing `};`):

```ts
  'stack-demo': {
    ts: [
      'class Stack<T> {',
      '  private items: T[] = [];',
      '  push(val: T): void { this.items.push(val); }',
      '  pop(): T | undefined { return this.items.pop(); }',
      '  peek(): T | undefined { return this.items[this.items.length - 1]; }',
      '  get size(): number { return this.items.length; }',
      '}',
    ],
    py: [
      'class Stack:',
      '    def __init__(self):',
      '        self._items = []',
      '    def push(self, val):',
      '        self._items.append(val)',
      '    def pop(self):',
      '        return self._items.pop()',
      '    def peek(self):',
      '        return self._items[-1] if self._items else None',
    ],
  },
  'array-ops': {
    ts: [
      'const arr = [1, 2, 3, 4];',
      'arr.push(5);           // O(1) — append',
      'arr.splice(2, 0, 99);  // O(n) — insert, shifts right',
      'arr.splice(1, 1);      // O(n) — delete, shifts left',
      'arr.pop();             // O(1) — remove last',
    ],
    py: [
      'arr = [1, 2, 3, 4]',
      'arr.append(5)          # O(1) — append',
      'arr.insert(2, 99)      # O(n) — insert, shifts right',
      'del arr[1]             # O(n) — delete, shifts left',
      'arr.pop()              # O(1) — remove last',
    ],
  },
  'dynamic-window': {
    ts: [
      'function lengthOfLongestSubstring(s: string): number {',
      '  let left = 0, maxLen = 0;',
      '  const seen = new Set<string>();',
      '  for (let right = 0; right < s.length; right++) {',
      '    while (seen.has(s[right]!)) {',
      '      seen.delete(s[left++]!);',
      '    }',
      '    seen.add(s[right]!);',
      '    maxLen = Math.max(maxLen, right - left + 1);',
      '  }',
      '  return maxLen;',
      '}',
    ],
    py: [
      'def length_of_longest_substring(s: str) -> int:',
      '    left = max_len = 0',
      '    seen: set[str] = set()',
      '    for right, c in enumerate(s):',
      '        while c in seen:',
      '            seen.discard(s[left])',
      '            left += 1',
      '        seen.add(c)',
      '        max_len = max(max_len, right - left + 1)',
      '    return max_len',
    ],
  },
```

- [ ] **Step 7.2: Add complexity entries**

Append inside the `COMPLEXITIES` object in `src/data/complexities.ts`:

```ts
  'stack-demo': {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(1)' },
    space: 'O(n)',
    notes: 'Push and pop are both O(1). Space is O(n) for n elements on the stack.',
  },
  'array-ops': {
    time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Append and pop are O(1). Insert/delete in the middle are O(n) due to element shifting.',
  },
  'dynamic-window': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(min(n, k))',
    notes: 'Each character is added and removed from the Set at most once — amortized O(1) per step. k = alphabet size.',
  },
```

- [ ] **Step 7.3: Add key insights**

Append inside `KEY_INSIGHTS` in `src/data/keyInsights.ts`:

```ts
  'stack-demo':
    'A stack is LIFO (last in, first out): the last item pushed is always the first to be popped — the opposite order from a queue.',
  'array-ops':
    'Array random access is O(1), but inserting or deleting in the middle is O(n) because every element after the target must shift — this is why linked lists trade O(1) insert/delete for O(n) access.',
  'dynamic-window':
    'Grow the right pointer to expand the window, shrink the left pointer when the window becomes invalid (duplicate found) — each character enters and leaves the window at most once, giving O(n) overall.',
```

- [ ] **Step 7.4: Run typecheck + full test suite**

```bash
pnpm typecheck && pnpm test --run
```

Expected: typecheck clean, all existing tests still pass.

- [ ] **Step 7.5: Commit**

```bash
git add src/data/codeSnippets.ts src/data/complexities.ts src/data/keyInsights.ts
git commit -m "feat(data): stack-demo, array-ops, dynamic-window — snippets, complexities, insights"
```

---

## Task 8: Wire StackQueuePage (add Stack Demo tab)

**Files:**
- Modify: `src/routes/StackQueuePage.tsx`

Add `'stack-demo'` as the 4th tab. The existing three tabs (balanced-brackets, monotonic-stack, queue-demo) remain unchanged. Stack Demo uses `StackVisualizer` (same as balanced-brackets and monotonic-stack). Only the `StackQueueAlgorithmId` type, `ALGO_TABS`, `handleAlgorithmChange`, `handleRun`, `stackSnap`, and the `InputPanel` need updating.

- [ ] **Step 8.1: Update StackQueuePage.tsx**

Replace the full file content with the updated version below. All changes vs the current version are: (a) new import for `stackDemo` and `DEFAULT_STACK_DEMO_INPUT`, (b) `StackQueueAlgorithmId` extended with `'stack-demo'`, (c) `ALGO_TABS` has a 4th entry, (d) `qdValues` state renamed to `qdValues` (unchanged), (e) `sdValues` state added, (f) `handleAlgorithmChange` gets `stack-demo` branch, (g) `handleRun` gets `stack-demo` branch, (h) `InputPanel` gets a 4th conditional input:

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
import { stackDemo } from '@/algorithms/stackQueue/stackDemo';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_BALANCED_BRACKETS_INPUT,
  DEFAULT_MONOTONIC_STACK_INPUT,
  DEFAULT_QUEUE_DEMO_INPUT,
  DEFAULT_STACK_DEMO_INPUT,
} from '@/types/algorithm';
import type { StackSnapshot, QueueSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type StackQueueAlgorithmId = 'balanced-brackets' | 'monotonic-stack' | 'queue-demo' | 'stack-demo';

const ALGO_TABS = [
  { id: 'balanced-brackets' as const, label: 'Balanced Brackets' },
  { id: 'monotonic-stack' as const, label: 'Monotonic Stack' },
  { id: 'queue-demo' as const, label: 'Queue Demo' },
  { id: 'stack-demo' as const, label: 'Stack Demo' },
];

export function StackQueuePage() {
  const [activeId, setActiveId] = useState<StackQueueAlgorithmId>('balanced-brackets');

  const [bbExpr, setBbExpr] = useState(DEFAULT_BALANCED_BRACKETS_INPUT.expression);
  const [msValues, setMsValues] = useState(DEFAULT_MONOTONIC_STACK_INPUT.values.join(', '));
  const [qdValues, setQdValues] = useState(DEFAULT_QUEUE_DEMO_INPUT.values.join(', '));
  const [sdValues, setSdValues] = useState(DEFAULT_STACK_DEMO_INPUT.values.join(', '));

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
      } else if (id === 'queue-demo') {
        setRun(queueDemo(DEFAULT_QUEUE_DEMO_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(stackDemo(DEFAULT_STACK_DEMO_INPUT) as AlgorithmRun<unknown>);
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
      if (!/^[()[\]{}]*$/.test(expr)) { setParseError('Only ( ) [ ] { } characters allowed.'); return; }
      setRun(balancedBrackets({ expression: expr }) as AlgorithmRun<unknown>);
    } else if (activeId === 'monotonic-stack') {
      const values = msValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(monotonicStack({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'queue-demo') {
      const values = qdValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(queueDemo({ values }) as AlgorithmRun<unknown>);
    } else {
      const values = sdValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(stackDemo({ values }) as AlgorithmRun<unknown>);
    }
  }, [activeId, bbExpr, msValues, qdValues, sdValues, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  const stackSnap =
    activeId === 'queue-demo'
      ? null
      : (currentStep?.snapshot as StackSnapshot | undefined) ?? null;
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
          {activeId === 'stack-demo' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Values to push (comma-separated)
              </label>
              <input
                type="text"
                value={sdValues}
                onChange={(e) => setSdValues(e.target.value)}
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

- [ ] **Step 8.3: Commit**

```bash
git add src/routes/StackQueuePage.tsx
git commit -m "feat(page): StackQueuePage — add Stack Demo as 4th tab"
```

---

## Task 9: Wire ArraysPage (add Array Operations + Dynamic Window tabs)

**Files:**
- Modify: `src/routes/ArraysPage.tsx`

Add two new tabs. The run type must change from `AlgorithmRun<ArraySnapshot>` to `AlgorithmRun<unknown>` (the new algorithms use different snapshot types). Add imports for the three new components and algorithms.

- [ ] **Step 9.1: Replace ArraysPage.tsx**

Replace the full file with the updated version:

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { ArrayOpsVisualizer } from '@/components/visualizers/ArrayOpsVisualizer';
import { StringVisualizer } from '@/components/visualizers/StringVisualizer';
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
import { arrayOps } from '@/algorithms/arrays/arrayOps';
import { dynamicWindow } from '@/algorithms/arrays/dynamicWindow';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_TWO_POINTERS_INPUT,
  DEFAULT_SLIDING_WINDOW_INPUT,
  DEFAULT_ARRAY_OPS_INPUT,
  DEFAULT_DYNAMIC_WINDOW_INPUT,
} from '@/types/algorithm';
import type { ArraySnapshot, ArrayOpsSnapshot, StringWindowSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'two-pointers' as const, label: 'Two Pointers' },
  { id: 'sliding-window' as const, label: 'Sliding Window' },
  { id: 'array-ops' as const, label: 'Array Operations' },
  { id: 'dynamic-window' as const, label: 'Dynamic Window' },
];

type ArraysAlgorithmId = 'two-pointers' | 'sliding-window' | 'array-ops' | 'dynamic-window';

export function ArraysPage() {
  const [activeId, setActiveId] = useState<ArraysAlgorithmId>('two-pointers');

  const [tpValues, setTpValues] = useState(DEFAULT_TWO_POINTERS_INPUT.values.join(', '));
  const [tpTarget, setTpTarget] = useState(String(DEFAULT_TWO_POINTERS_INPUT.target));
  const [swValues, setSwValues] = useState(DEFAULT_SLIDING_WINDOW_INPUT.values.join(', '));
  const [swK, setSwK] = useState(String(DEFAULT_SLIDING_WINDOW_INPUT.k));
  const [aoValues, setAoValues] = useState(DEFAULT_ARRAY_OPS_INPUT.values.join(', '));
  const [dwString, setDwString] = useState(DEFAULT_DYNAMIC_WINDOW_INPUT.s);

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    twoPointers(DEFAULT_TWO_POINTERS_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: ArraysAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'two-pointers') {
        setRun(twoPointers(DEFAULT_TWO_POINTERS_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'sliding-window') {
        setRun(slidingWindow(DEFAULT_SLIDING_WINDOW_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'array-ops') {
        setRun(arrayOps(DEFAULT_ARRAY_OPS_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(dynamicWindow(DEFAULT_DYNAMIC_WINDOW_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);
    runner.reset();

    if (activeId === 'two-pointers') {
      const values = tpValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      const target = parseInt(tpTarget.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      setRun(twoPointers({ values, target }) as AlgorithmRun<unknown>);
    } else if (activeId === 'sliding-window') {
      const values = swValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      const k = parseInt(swK.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(k) || k < 1) { setParseError('k must be a positive number.'); return; }
      if (k > values.length) { setParseError('k cannot exceed array length.'); return; }
      setRun(slidingWindow({ values, k }) as AlgorithmRun<unknown>);
    } else if (activeId === 'array-ops') {
      const values = aoValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 15) { setParseError('Maximum 15 values.'); return; }
      setRun(arrayOps({ values }) as AlgorithmRun<unknown>);
    } else {
      const s = dwString.trim();
      if (s.length > 50) { setParseError('Maximum 50 characters.'); return; }
      setRun(dynamicWindow({ s }) as AlgorithmRun<unknown>);
    }
  }, [activeId, tpValues, tpTarget, swValues, swK, aoValues, dwString, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  const arraySnap =
    activeId === 'two-pointers' || activeId === 'sliding-window'
      ? (currentStep?.snapshot as ArraySnapshot | undefined) ?? null
      : null;
  const arrayOpsSnap =
    activeId === 'array-ops'
      ? (currentStep?.snapshot as ArrayOpsSnapshot | undefined) ?? null
      : null;
  const stringSnap =
    activeId === 'dynamic-window'
      ? (currentStep?.snapshot as StringWindowSnapshot | undefined) ?? null
      : null;

  const callStack = (arraySnap as unknown as { callStack?: string[] })?.callStack;

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="arrays" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          {activeId === 'array-ops' ? (
            <ArrayOpsVisualizer snapshot={arrayOpsSnap} />
          ) : activeId === 'dynamic-window' ? (
            <StringVisualizer snapshot={stringSnap} />
          ) : (
            <ArrayVisualizer snapshot={arraySnap} />
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

        <InputPanel onRun={handleRun} error={parseError}>
          {activeId === 'two-pointers' && (
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
          )}
          {activeId === 'sliding-window' && (
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
          {activeId === 'array-ops' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Starting array (comma-separated, min 2)
              </label>
              <input
                type="text"
                value={aoValues}
                onChange={(e) => setAoValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'dynamic-window' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Input string (max 50 chars)
              </label>
              <input
                type="text"
                value={dwString}
                onChange={(e) => setDwString(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="abcabcbb"
              />
            </div>
          )}
        </InputPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
            <CallStackPanel callStack={callStack} />
          </div>
        </div>
      </main>

      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="arrays" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 9.2: Run typecheck + full test suite**

```bash
pnpm typecheck && pnpm test --run
```

Expected: typecheck clean, all tests pass.

- [ ] **Step 9.3: Commit**

```bash
git add src/routes/ArraysPage.tsx
git commit -m "feat(page): ArraysPage — add Array Operations and Dynamic Window tabs"
```

---

## Task 10: Final verification

- [ ] **Step 10.1: Run all checks**

```bash
pnpm lint && pnpm typecheck && pnpm test --run && pnpm build
```

Expected: lint clean, typecheck clean, all tests pass, build succeeds.

- [ ] **Step 10.2: Start dev server and smoke test in browser**

```bash
pnpm dev
```

Navigate to `http://localhost:5175` (or whichever port the dev server uses).

**Stack & Queue page** (`/stack-queue`):
- [ ] Click "Stack Demo" tab: step through — values push onto stack top-first, then pop in reverse order (LIFO)
- [ ] LIFO vs FIFO contrast clear: push [3,1,2,4], pop gives [4,2,1,3] vs queue's [3,1,2,4]
- [ ] CodePanel highlights line 3 on push, line 4 on pop
- [ ] ComplexityBadge shows O(1)/O(1) for push/pop
- [ ] Key Insight shows LIFO explanation

**Arrays page** (`/arrays`):
- [ ] Click "Array Operations" tab: step through — see PUSH badge (green O(1)), INSERT badge (amber O(n)) with cyan shift range, DELETE with shift range, POP (green O(1))
- [ ] Shift range annotation text explains why O(n)
- [ ] Click "Dynamic Window" tab: enter "abcabcbb", step through — L and R pointers move, window chars shown as badges, maxLen updates to 3
- [ ] Try "bbbbb" → shrinks every step, maxLen stays 1
- [ ] Try "" → immediately shows maxLen=0
- [ ] Speed slider, play/pause, keyboard controls work on all tabs

- [ ] **Step 10.3: Final commit**

```bash
git add -A
git commit -m "chore(session-4): stack demo + array ops + dynamic window — complete"
```

---

## Self-Review

**Spec coverage:**
- [x] Stack Demo (4th tab, Stack & Queue page) — Tasks 2, 7, 8
- [x] Array Operations (3rd tab, Arrays page) — Tasks 3, 5, 7, 9
- [x] Dynamic Sliding Window / longest-substr-no-repeat (4th tab, Arrays page) — Tasks 4, 6, 7, 9
- [x] TDD: result tests + trace snapshot for all 3 algorithms
- [x] Visualizer tests for both new components
- [x] No new NeetCode slugs needed — existing problem lists cover all three algorithms

**Placeholder scan:** All code blocks contain complete, runnable code. No TBD, no "handle edge cases" without implementation.

**Type consistency:**
- `StackDemoInput`, `ArrayOpsInput`, `DynamicWindowInput` defined in Task 1, used in Tasks 2/3/4 and pages
- `ArrayOpsSnapshot` defined in Task 1, used in `arrayOps.ts` (Task 3) and `ArrayOpsVisualizer.tsx` (Task 5) and `ArraysPage.tsx` (Task 9)
- `StringWindowSnapshot` defined in Task 1, used in `dynamicWindow.ts` (Task 4) and `StringVisualizer.tsx` (Task 6) and `ArraysPage.tsx` (Task 9)
- `DEFAULT_STACK_DEMO_INPUT` / `DEFAULT_ARRAY_OPS_INPUT` / `DEFAULT_DYNAMIC_WINDOW_INPUT` defined in Task 1, imported in Tasks 8/9
- `stackDemo` exported from `src/algorithms/stackQueue/stackDemo.ts`, imported in `StackQueuePage.tsx`
- `arrayOps` exported from `src/algorithms/arrays/arrayOps.ts`, imported in `ArraysPage.tsx`
- `dynamicWindow` exported from `src/algorithms/arrays/dynamicWindow.ts`, imported in `ArraysPage.tsx`
- `ArrayOpsVisualizer` exported from `src/components/visualizers/ArrayOpsVisualizer.tsx`, imported in `ArraysPage.tsx`
- `StringVisualizer` exported from `src/components/visualizers/StringVisualizer.tsx`, imported in `ArraysPage.tsx`
