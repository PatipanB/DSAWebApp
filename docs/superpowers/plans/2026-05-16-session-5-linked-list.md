# Session 5 – Linked List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Linked List topic page with three algorithm tabs: Singly Traverse, Insert/Delete, and Doubly Traverse — including snapshot types, algorithm engines, visualizer, data files, and full page wiring.

**Architecture:** Pre-computed Step[] snapshots via createRunBuilder; LinkedListVisualizer renders nodes as boxes in a flex row with data-testid arrows; LinkedListPage replaces the existing stub, following the ArraysPage 4-tab pattern but with 3 tabs.

**Tech Stack:** TypeScript (strict), React 18, Vite, Tailwind CSS (dark semantic tokens), Vitest + @testing-library/react

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/types/snapshots.ts` | Modify | Add `LinkedNode`, `LinkedListSnapshot` |
| `src/types/algorithm.ts` | Modify | Add input interfaces + defaults for all 3 algorithms |
| `src/algorithms/linkedList/singlyTraverse.ts` | Create | Singly traversal engine |
| `src/algorithms/linkedList/singlyInsertDelete.ts` | Create | Insert/delete/reverse engine |
| `src/algorithms/linkedList/doublyTraverse.ts` | Create | Doubly traversal engine |
| `src/components/visualizers/LinkedListVisualizer.tsx` | Create | Shared visualizer for all 3 tabs |
| `src/data/codeSnippets.ts` | Modify | Add 3 code snippet entries |
| `src/data/complexities.ts` | Modify | Add 3 complexity entries |
| `src/data/keyInsights.ts` | Modify | Add 3 insight entries |
| `src/data/neetcodeProblems.ts` | Modify | Add `linked-list` problems |
| `src/routes/LinkedListPage.tsx` | Replace | Full 3-tab page (replaces stub) |
| `tests/algorithms/singlyTraverse.test.ts` | Create | Result + trace tests |
| `tests/algorithms/singlyInsertDelete.test.ts` | Create | Result + trace tests |
| `tests/algorithms/doublyTraverse.test.ts` | Create | Result + trace tests |
| `tests/components/LinkedListVisualizer.test.tsx` | Create | Rendering + data-testid tests |

---

## Task 1: Type Definitions

**Files:**
- Modify: `src/types/snapshots.ts`
- Modify: `src/types/algorithm.ts`

- [ ] **Step 1: Add LinkedNode and LinkedListSnapshot to snapshots.ts**

Read `src/types/snapshots.ts` first, then append after the last interface:

```ts
export interface LinkedNode {
  id: string;
  value: number;
  nextId: string | null;
  prevId?: string | null;
}

export interface LinkedListSnapshot {
  nodes: Record<string, LinkedNode>;
  headId: string | null;
  tailId?: string | null;
  pointers: { name: string; nodeId: string | null; color: 'cyan' | 'amber' | 'rose' }[];
  doubly: boolean;
}
```

- [ ] **Step 2: Add input interfaces and defaults to algorithm.ts**

Read `src/types/algorithm.ts` first, then append after the `DEFAULT_DYNAMIC_WINDOW_INPUT` block (end of file):

```ts
export interface SinglyTraverseInput {
  values: number[];
}

export const DEFAULT_SINGLY_TRAVERSE_INPUT: SinglyTraverseInput = {
  values: [1, 2, 3, 4],
};

export interface SinglyInsertDeleteInput {
  values: number[];
}

export const DEFAULT_SINGLY_INSERT_DELETE_INPUT: SinglyInsertDeleteInput = {
  values: [1, 2, 3, 4],
};

export interface DoublyTraverseInput {
  values: number[];
}

export const DEFAULT_DOUBLY_TRAVERSE_INPUT: DoublyTraverseInput = {
  values: [1, 2, 3, 4],
};
```

Note: `AlgorithmId` already contains `'singly-traverse' | 'singly-insert-delete' | 'doubly-traverse'` — do NOT add them again.

- [ ] **Step 3: Run typecheck**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors on the modified files.

- [ ] **Step 4: Commit**

```bash
git add src/types/snapshots.ts src/types/algorithm.ts
git commit -m "feat: add LinkedNode, LinkedListSnapshot types and linked list input types"
```

---

## Task 2: singlyTraverse Algorithm

**Files:**
- Create: `src/algorithms/linkedList/singlyTraverse.ts`
- Create: `tests/algorithms/singlyTraverse.test.ts`

**Algorithm spec:**
- Input: `SinglyTraverseInput { values: number[] }`
- Build linked list: node IDs = 'n0', 'n1', … nodes linked in order
- Steps: n+1 total — one per value (curr at that node) + one final (curr=null)
- finalResult: `[...values]` (same order as input)
- Snapshot pointer: `[{ name: 'curr', nodeId, color: 'amber' }]`

**Step count verification for [1,2,3,4]:**
- Step 0: curr=n0 (init, line 1)
- Step 1: curr=n1 (line 4)
- Step 2: curr=n2 (line 4)
- Step 3: curr=n3 (line 4)
- Step 4: curr=null (done, line 2)
- Total: 5 = n+1 ✓

**Code snippet line mapping:**
```
Line 1: let curr = head;
Line 2: while (curr !== null) {
Line 3:   visit(curr.value);
Line 4:   curr = curr.next;
Line 5: }
```

- [ ] **Step 1: Write the failing test**

Create `tests/algorithms/singlyTraverse.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { singlyTraverse } from '@/algorithms/linkedList/singlyTraverse';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('singlyTraverse', () => {
  describe('result', () => {
    it('returns values in order for [1,2,3,4]', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual([1, 2, 3, 4]);
    });

    it('returns [5] for single-element input [5]', () => {
      const run = singlyTraverse({ values: [5] });
      expect(run.finalResult).toEqual([5]);
    });
  });

  describe('trace', () => {
    it('total steps = n+1 for n=4', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(5);
    });

    it('total steps = n+1 for n=3', () => {
      const run = singlyTraverse({ values: [10, 20, 30] });
      expect(run.steps.length).toBe(4);
    });

    it('first step has curr pointing to head node n0', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.pointers[0]!.nodeId).toBe('n0');
    });

    it('last step has curr=null', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[4]!.snapshot as LinkedListSnapshot;
      expect(snap.pointers[0]!.nodeId).toBeNull();
    });

    it('nodes build correct linked chain', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes['n0']!.nextId).toBe('n1');
      expect(snap.nodes['n3']!.nextId).toBeNull();
      expect(snap.headId).toBe('n0');
    });

    it('all steps have valid line numbers', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = singlyTraverse({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/singlyTraverse.test.ts 2>&1 | tail -20
```

Expected: FAIL — "Cannot find module '@/algorithms/linkedList/singlyTraverse'"

- [ ] **Step 3: Implement singlyTraverse**

Create `src/algorithms/linkedList/singlyTraverse.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { SinglyTraverseInput } from '@/types/algorithm';

export function singlyTraverse(input: SinglyTraverseInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('singly-traverse', input);

  const nodeIds = values.map((_, i) => `n${i}`);
  const nodes: Record<string, LinkedNode> = {};
  for (let i = 0; i < values.length; i++) {
    nodes[nodeIds[i]!] = {
      id: nodeIds[i]!,
      value: values[i]!,
      nextId: i + 1 < values.length ? nodeIds[i + 1]! : null,
    };
  }
  const headId = values.length > 0 ? nodeIds[0]! : null;
  const tailId = values.length > 0 ? nodeIds[values.length - 1]! : null;

  for (let i = 0; i <= values.length; i++) {
    const currId = i < values.length ? nodeIds[i]! : null;
    const isInit = i === 0;
    const isDone = i === values.length;
    r.push({
      line: isInit ? 1 : isDone ? 2 : 4,
      narration: isDone
        ? 'curr is null — traversal complete.'
        : isInit
          ? `Initialize curr to head (value = ${values[i]}).`
          : `Move curr to next node (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: currId, color: 'amber' }],
        doubly: false,
      },
      variables: { curr: currId === null ? 'null' : String(values[i]) },
    });
  }

  return r.build([...values]);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/singlyTraverse.test.ts 2>&1 | tail -20
```

Expected: all tests PASS (snapshot will be written on first run).

- [ ] **Step 5: Commit**

```bash
git add src/algorithms/linkedList/singlyTraverse.ts tests/algorithms/singlyTraverse.test.ts tests/algorithms/__snapshots__/
git commit -m "feat: add singlyTraverse algorithm with tests"
```

---

## Task 3: singlyInsertDelete Algorithm

**Files:**
- Create: `src/algorithms/linkedList/singlyInsertDelete.ts`
- Create: `tests/algorithms/singlyInsertDelete.test.ts`

**Algorithm spec:**
- Input: `SinglyInsertDeleteInput { values: number[] }` — used as initial list
- Fixed operation sequence (regardless of input): insertAtHead(0), insertAtTail(5), deleteByValue(2), reverse()
- Steps: 9 total = 1 init + 2 per operation × 4 operations
- For input [1,2,3,4]: finalResult = [5,4,3,1,0]
- Node IDs: monotonically increasing counter n0,n1,… Initial list gets n0..n(len-1), new nodes get subsequent IDs

**Step-by-step for [1,2,3,4]:**
- Step 0 (init): list = 1→2→3→4 (nodes n0,n1,n2,n3), line 1
- Step 1 (announce insertAtHead): same list, line 1
- Step 2 (done insertAtHead): list = 0→1→2→3→4 (n4 is new head), newNode pointer on n4, line 2
- Step 3 (announce insertAtTail): same list, line 3
- Step 4 (done insertAtTail): list = 0→1→2→3→4→5 (n5 is new tail), newNode pointer on n5, line 4
- Step 5 (announce deleteByValue): same list, line 5
- Step 6 (done deleteByValue): list = 0→1→3→4→5 (n1 deleted), line 6
- Step 7 (announce reverse): same list, line 7
- Step 8 (done reverse): list = 5→4→3→1→0 (n5→n3→n2→n0→n4), line 9

**finalResult = [5,4,3,1,0]**

**Code snippet line mapping:**
```
Line 1: // insertAtHead(0)
Line 2: newNode.next = head; head = newNode;
Line 3: // insertAtTail(5)
Line 4: tail.next = newNode; tail = newNode;
Line 5: // deleteByValue(2)
Line 6: prev.next = curr.next;
Line 7: // reverse()
Line 8: let prev = null, curr = head;
Line 9: while (curr) { next=curr.next; curr.next=prev; prev=curr; curr=next; }
```

- [ ] **Step 1: Write the failing test**

Create `tests/algorithms/singlyInsertDelete.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { singlyInsertDelete } from '@/algorithms/linkedList/singlyInsertDelete';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('singlyInsertDelete', () => {
  describe('result', () => {
    it('returns [5,4,3,1,0] for default input [1,2,3,4]', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual([5, 4, 3, 1, 0]);
    });
  });

  describe('trace', () => {
    it('has 9 steps (1 init + 2 per operation × 4 ops)', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(9);
    });

    it('all steps have valid line numbers', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('step 2 (insertAtHead done) has newNode pointer on new head', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[2]!.snapshot as LinkedListSnapshot;
      const newNode = snap.pointers.find((p) => p.name === 'newNode');
      expect(newNode).toBeDefined();
      expect(snap.nodes[newNode!.nodeId!]!.value).toBe(0);
    });

    it('step 4 (insertAtTail done) has newNode pointer on new tail', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[4]!.snapshot as LinkedListSnapshot;
      const newNode = snap.pointers.find((p) => p.name === 'newNode');
      expect(newNode).toBeDefined();
      expect(snap.nodes[newNode!.nodeId!]!.value).toBe(5);
    });

    it('step 6 (deleteByValue done) has 5 nodes (no value 2)', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[6]!.snapshot as LinkedListSnapshot;
      const nodeValues = Object.values(snap.nodes).map((n) => n.value);
      expect(nodeValues).not.toContain(2);
      expect(Object.keys(snap.nodes).length).toBe(5);
    });

    it('step 8 (reverse done) head has value 5', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      const snap = run.steps[8]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes[snap.headId!]!.value).toBe(5);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = singlyInsertDelete({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/singlyInsertDelete.test.ts 2>&1 | tail -20
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement singlyInsertDelete**

Create `src/algorithms/linkedList/singlyInsertDelete.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { SinglyInsertDeleteInput } from '@/types/algorithm';

export function singlyInsertDelete(input: SinglyInsertDeleteInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('singly-insert-delete', input);

  let idCounter = 0;
  const uid = () => `n${idCounter++}`;

  // Mutable linked list state
  let nodeMap: Record<string, LinkedNode> = {};
  let headId: string | null = null;
  let tailId: string | null = null;

  // Build initial list from values
  let prevId: string | null = null;
  for (const val of values) {
    const id = uid();
    nodeMap[id] = { id, value: val, nextId: null };
    if (prevId !== null) nodeMap[prevId]!.nextId = id;
    else headId = id;
    tailId = id;
    prevId = id;
  }

  const snap = (pointers: LinkedListSnapshot['pointers'] = []): LinkedListSnapshot => ({
    nodes: Object.fromEntries(Object.entries(nodeMap).map(([k, v]) => [k, { ...v }])),
    headId,
    tailId,
    pointers,
    doubly: false,
  });

  // Step 0: init
  r.push({
    line: 1,
    narration: `Initial list: [${values.join(' → ')}].`,
    snapshot: snap(),
    variables: { head: headId ?? 'null', tail: tailId ?? 'null' },
  });

  // Operation 1: insertAtHead(0)
  r.push({
    line: 1,
    narration: 'insertAtHead(0): new node will become the head.',
    snapshot: snap(),
    variables: { op: 'insertAtHead(0)' },
  });
  const newHeadId = uid();
  nodeMap[newHeadId] = { id: newHeadId, value: 0, nextId: headId };
  headId = newHeadId;
  r.push({
    line: 2,
    narration: 'Node 0 inserted at head.',
    snapshot: snap([{ name: 'newNode', nodeId: newHeadId, color: 'cyan' }]),
    variables: { head: headId },
  });

  // Operation 2: insertAtTail(5)
  r.push({
    line: 3,
    narration: 'insertAtTail(5): new node will become the tail.',
    snapshot: snap(),
    variables: { op: 'insertAtTail(5)' },
  });
  const newTailId = uid();
  nodeMap[newTailId] = { id: newTailId, value: 5, nextId: null };
  if (tailId !== null) nodeMap[tailId]!.nextId = newTailId;
  tailId = newTailId;
  r.push({
    line: 4,
    narration: 'Node 5 inserted at tail.',
    snapshot: snap([{ name: 'newNode', nodeId: newTailId, color: 'cyan' }]),
    variables: { tail: tailId },
  });

  // Operation 3: deleteByValue(2)
  r.push({
    line: 5,
    narration: 'deleteByValue(2): find and unlink the node with value 2.',
    snapshot: snap(),
    variables: { op: 'deleteByValue(2)' },
  });
  {
    let delPrev: string | null = null;
    let delCurr: string | null = headId;
    while (delCurr !== null && nodeMap[delCurr]!.value !== 2) {
      delPrev = delCurr;
      delCurr = nodeMap[delCurr]!.nextId;
    }
    if (delCurr !== null) {
      const nextOfDeleted = nodeMap[delCurr]!.nextId;
      if (delPrev !== null) nodeMap[delPrev]!.nextId = nextOfDeleted;
      else headId = nextOfDeleted;
      if (tailId === delCurr) tailId = delPrev;
      delete nodeMap[delCurr];
    }
  }
  r.push({
    line: 6,
    narration: 'Node with value 2 removed.',
    snapshot: snap(),
    variables: { head: headId ?? 'null' },
  });

  // Operation 4: reverse()
  r.push({
    line: 7,
    narration: 'reverse(): flip all next pointers to reverse the list.',
    snapshot: snap(),
    variables: { op: 'reverse()' },
  });
  {
    const oldHead = headId;
    let revPrev: string | null = null;
    let revCurr: string | null = headId;
    while (revCurr !== null) {
      const revNext = nodeMap[revCurr]!.nextId;
      nodeMap[revCurr]!.nextId = revPrev;
      revPrev = revCurr;
      revCurr = revNext;
    }
    tailId = oldHead;
    headId = revPrev;
  }
  r.push({
    line: 9,
    narration: 'List reversed — all next pointers flipped.',
    snapshot: snap(),
    variables: { head: headId ?? 'null', tail: tailId ?? 'null' },
  });

  // Walk final list to build result
  const finalResult: number[] = [];
  let walkId: string | null = headId;
  while (walkId !== null) {
    finalResult.push(nodeMap[walkId]!.value);
    walkId = nodeMap[walkId]!.nextId;
  }

  return r.build(finalResult);
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/singlyInsertDelete.test.ts 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/algorithms/linkedList/singlyInsertDelete.ts tests/algorithms/singlyInsertDelete.test.ts tests/algorithms/__snapshots__/
git commit -m "feat: add singlyInsertDelete algorithm with tests"
```

---

## Task 4: doublyTraverse Algorithm

**Files:**
- Create: `src/algorithms/linkedList/doublyTraverse.ts`
- Create: `tests/algorithms/doublyTraverse.test.ts`

**Algorithm spec:**
- Input: `DoublyTraverseInput { values: number[] }`
- Build doubly linked list: each node has both nextId and prevId
- Forward pass: curr at each node head→tail (n steps)
- Backward pass: curr at each node tail→head (n steps)
- Total: 2n steps
- finalResult: `{ forward: number[], backward: number[] }`
- snapshot.doubly = true

**Step count verification for [1,2,3,4]:**
- Steps 0–3: forward curr=n0,n1,n2,n3
- Steps 4–7: backward curr=n3,n2,n1,n0
- Total: 8 = 2×4 ✓

**Code snippet line mapping:**
```
Line 1: // forward traversal
Line 2: let curr = head;
Line 3: while (curr) { visit(curr.val); curr = curr.next; }
Line 4: // backward traversal
Line 5: curr = tail;
Line 6: while (curr) { visit(curr.val); curr = curr.prev; }
```

- [ ] **Step 1: Write the failing test**

Create `tests/algorithms/doublyTraverse.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { doublyTraverse } from '@/algorithms/linkedList/doublyTraverse';
import { serializeRun } from '@/engine/serializeRun';
import type { LinkedListSnapshot } from '@/types/snapshots';

describe('doublyTraverse', () => {
  describe('result', () => {
    it('returns forward and backward arrays for [1,2,3,4]', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(run.finalResult).toEqual({ forward: [1, 2, 3, 4], backward: [4, 3, 2, 1] });
    });

    it('returns correct result for [5]', () => {
      const run = doublyTraverse({ values: [5] });
      expect(run.finalResult).toEqual({ forward: [5], backward: [5] });
    });
  });

  describe('trace', () => {
    it('has 2n steps for n=4', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(run.steps.length).toBe(8);
    });

    it('has 2n steps for n=3', () => {
      const run = doublyTraverse({ values: [10, 20, 30] });
      expect(run.steps.length).toBe(6);
    });

    it('snapshot.doubly is true on all steps', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) {
        expect((s.snapshot as LinkedListSnapshot).doubly).toBe(true);
      }
    });

    it('all interior nodes have prevId set', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      const snap = run.steps[0]!.snapshot as LinkedListSnapshot;
      expect(snap.nodes['n0']!.prevId).toBeNull();
      expect(snap.nodes['n1']!.prevId).toBe('n0');
      expect(snap.nodes['n3']!.prevId).toBe('n2');
    });

    it('first 4 steps traverse forward (curr=n0..n3)', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (let i = 0; i < 4; i++) {
        const snap = run.steps[i]!.snapshot as LinkedListSnapshot;
        expect(snap.pointers[0]!.nodeId).toBe(`n${i}`);
      }
    });

    it('last 4 steps traverse backward (curr=n3..n0)', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (let i = 0; i < 4; i++) {
        const snap = run.steps[4 + i]!.snapshot as LinkedListSnapshot;
        expect(snap.pointers[0]!.nodeId).toBe(`n${3 - i}`);
      }
    });

    it('all steps have valid line numbers', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('trace matches snapshot for [1,2,3,4]', () => {
      const run = doublyTraverse({ values: [1, 2, 3, 4] });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/doublyTraverse.test.ts 2>&1 | tail -20
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement doublyTraverse**

Create `src/algorithms/linkedList/doublyTraverse.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { DoublyTraverseInput } from '@/types/algorithm';

export function doublyTraverse(input: DoublyTraverseInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('doubly-traverse', input);

  const nodeIds = values.map((_, i) => `n${i}`);
  const nodes: Record<string, LinkedNode> = {};
  for (let i = 0; i < values.length; i++) {
    nodes[nodeIds[i]!] = {
      id: nodeIds[i]!,
      value: values[i]!,
      nextId: i + 1 < values.length ? nodeIds[i + 1]! : null,
      prevId: i > 0 ? nodeIds[i - 1]! : null,
    };
  }
  const headId = values.length > 0 ? nodeIds[0]! : null;
  const tailId = values.length > 0 ? nodeIds[values.length - 1]! : null;

  // Forward traversal
  for (let i = 0; i < values.length; i++) {
    r.push({
      line: i === 0 ? 2 : 3,
      narration:
        i === 0
          ? `Forward pass — curr starts at head (value = ${values[i]}).`
          : `Forward: curr moves to next (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: nodeIds[i]!, color: 'amber' }],
        doubly: true,
      },
      variables: { curr: String(values[i]), direction: 'forward' },
    });
  }

  // Backward traversal
  for (let i = values.length - 1; i >= 0; i--) {
    r.push({
      line: i === values.length - 1 ? 5 : 6,
      narration:
        i === values.length - 1
          ? `Backward pass — curr starts at tail (value = ${values[i]}).`
          : `Backward: curr moves to prev (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: nodeIds[i]!, color: 'amber' }],
        doubly: true,
      },
      variables: { curr: String(values[i]), direction: 'backward' },
    });
  }

  return r.build({ forward: [...values], backward: [...values].reverse() });
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/algorithms/doublyTraverse.test.ts 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/algorithms/linkedList/doublyTraverse.ts tests/algorithms/doublyTraverse.test.ts tests/algorithms/__snapshots__/
git commit -m "feat: add doublyTraverse algorithm with tests"
```

---

## Task 5: LinkedListVisualizer

**Files:**
- Create: `src/components/visualizers/LinkedListVisualizer.tsx`
- Create: `tests/components/LinkedListVisualizer.test.tsx`

**Rendering spec:**
- Build ordered node array by following headId→nextId chain
- Each node: rounded box with value, `data-testid="ll-node-{id}"`, `data-active="true"` when any amber pointer points to it
- Gap between each node and next: forward arrow `→` with `data-testid="ll-arrow-{nodeId}-{node.nextId ?? 'null'}"` (always rendered including tail→null)
- Gap between node[idx] and node[idx+1] also includes backward arrow `←` with `data-testid="ll-arrow-{orderedNodes[idx+1]}-{orderedNodes[idx]}"` when `snapshot.doubly === true` AND `idx+1 < orderedNodes.length`
- Pointer badges above each node, colored by `pointer.color`
- Null sentinel text "null" at the end
- Color tokens: cyan→`text-accent-primary border-accent-primary`, amber→`text-status-warn border-status-warn`, rose→`text-status-danger border-status-danger`
- Active node: `bg-status-warn/10 border-status-warn text-status-warn`; inactive: `bg-bg-elevated border-border-strong text-text-primary`

- [ ] **Step 1: Write the failing test**

Create `tests/components/LinkedListVisualizer.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer';
import type { LinkedListSnapshot } from '@/types/snapshots';

const singlySnap: LinkedListSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, nextId: 'n1' },
    n1: { id: 'n1', value: 2, nextId: 'n2' },
    n2: { id: 'n2', value: 3, nextId: null },
  },
  headId: 'n0',
  tailId: 'n2',
  pointers: [{ name: 'curr', nodeId: 'n1', color: 'amber' }],
  doubly: false,
};

const doublySnap: LinkedListSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, nextId: 'n1', prevId: null },
    n1: { id: 'n1', value: 2, nextId: 'n2', prevId: 'n0' },
    n2: { id: 'n2', value: 3, nextId: null, prevId: 'n1' },
  },
  headId: 'n0',
  tailId: 'n2',
  pointers: [{ name: 'curr', nodeId: 'n0', color: 'amber' }],
  doubly: true,
};

describe('LinkedListVisualizer', () => {
  it('renders placeholder when snapshot is null', () => {
    render(<LinkedListVisualizer snapshot={null} />);
    expect(screen.getByText(/press run/i)).toBeInTheDocument();
  });

  it('renders all nodes with correct testids', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-node-n0')).toBeInTheDocument();
    expect(screen.getByTestId('ll-node-n1')).toBeInTheDocument();
    expect(screen.getByTestId('ll-node-n2')).toBeInTheDocument();
  });

  it('sets data-active on amber pointer node only', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-node-n1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('ll-node-n0')).not.toHaveAttribute('data-active');
    expect(screen.getByTestId('ll-node-n2')).not.toHaveAttribute('data-active');
  });

  it('renders forward arrows including tail-to-null', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-arrow-n0-n1')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n1-n2')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n2-null')).toBeInTheDocument();
  });

  it('renders backward arrows for doubly linked list', () => {
    render(<LinkedListVisualizer snapshot={doublySnap} />);
    expect(screen.getByTestId('ll-arrow-n1-n0')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n2-n1')).toBeInTheDocument();
  });

  it('does not render backward arrows for singly linked list', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.queryByTestId('ll-arrow-n1-n0')).not.toBeInTheDocument();
  });

  it('renders pointer badge with correct name', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('curr')).toBeInTheDocument();
  });

  it('renders null sentinel', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('node values are visible', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/components/LinkedListVisualizer.test.tsx 2>&1 | tail -20
```

Expected: FAIL — "Cannot find module"

- [ ] **Step 3: Implement LinkedListVisualizer**

Create `src/components/visualizers/LinkedListVisualizer.tsx`:

```tsx
import type { LinkedListSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: LinkedListSnapshot | null;
}

const COLOR_CLASSES: Record<'cyan' | 'amber' | 'rose', string> = {
  cyan: 'text-accent-primary border-accent-primary',
  amber: 'text-status-warn border-status-warn',
  rose: 'text-status-danger border-status-danger',
};

export function LinkedListVisualizer({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted font-mono text-sm">
        Press Run to start
      </div>
    );
  }

  // Build ordered node list by following head chain
  const ordered: string[] = [];
  let curr: string | null = snapshot.headId;
  while (curr !== null && snapshot.nodes[curr]) {
    ordered.push(curr);
    curr = snapshot.nodes[curr]!.nextId;
  }

  // Map nodeId → pointers pointing to it
  const pointersByNode = new Map<string | null, typeof snapshot.pointers>();
  for (const ptr of snapshot.pointers) {
    if (!pointersByNode.has(ptr.nodeId)) pointersByNode.set(ptr.nodeId, []);
    pointersByNode.get(ptr.nodeId)!.push(ptr);
  }

  return (
    <div className="flex items-start justify-center p-6 gap-0 flex-wrap">
      {ordered.map((nodeId, idx) => {
        const node = snapshot.nodes[nodeId]!;
        const ptrs = pointersByNode.get(nodeId) ?? [];
        const isActive = ptrs.some((p) => p.color === 'amber');
        const nextNodeId = ordered[idx + 1] ?? null;

        return (
          <div key={nodeId} className="flex items-center">
            {/* Node column: badges above, box below */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1 min-h-5 items-center">
                {ptrs.map((ptr) => (
                  <span
                    key={ptr.name}
                    className={`text-xs font-mono px-1 rounded border ${COLOR_CLASSES[ptr.color]}`}
                  >
                    {ptr.name}
                  </span>
                ))}
              </div>
              <div
                data-testid={`ll-node-${nodeId}`}
                data-active={isActive ? 'true' : undefined}
                className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-status-warn/10 border-status-warn text-status-warn'
                    : 'bg-bg-elevated border-border-strong text-text-primary'
                }`}
              >
                {node.value}
              </div>
            </div>

            {/* Arrow column */}
            <div className="flex flex-col items-center justify-center mx-1 gap-0.5 mt-5">
              {/* Forward arrow: nodeId → node.nextId (or null) */}
              <span
                data-testid={`ll-arrow-${nodeId}-${node.nextId ?? 'null'}`}
                className="text-text-muted font-mono text-sm"
              >
                →
              </span>
              {/* Backward arrow: nextNode → this node (doubly only, not after last node) */}
              {snapshot.doubly && nextNodeId !== null && (
                <span
                  data-testid={`ll-arrow-${nextNodeId}-${nodeId}`}
                  className="text-text-muted font-mono text-sm"
                >
                  ←
                </span>
              )}
            </div>
          </div>
        );
      })}
      {/* Null sentinel */}
      <div className="flex items-center mt-5">
        <span className="text-text-muted font-mono text-sm">null</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run tests/components/LinkedListVisualizer.test.tsx 2>&1 | tail -20
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/visualizers/LinkedListVisualizer.tsx tests/components/LinkedListVisualizer.test.tsx
git commit -m "feat: add LinkedListVisualizer component with tests"
```

---

## Task 6: Data Files

**Files:**
- Modify: `src/data/codeSnippets.ts`
- Modify: `src/data/complexities.ts`
- Modify: `src/data/keyInsights.ts`
- Modify: `src/data/neetcodeProblems.ts`

**IMPORTANT: NeetCode slug policy** — NeetCode uses custom slugs. Before adding to `neetcodeProblems.ts`, verify the `slug` field by opening `https://neetcode.io/practice` and confirming the actual URL slugs used for linked list problems.

- [ ] **Step 1: Read all 4 data files before editing**

Read each file to know where to add entries:
- `src/data/codeSnippets.ts` — append before the closing `};`
- `src/data/complexities.ts` — append before the closing `};`
- `src/data/keyInsights.ts` — append before the closing `};`
- `src/data/neetcodeProblems.ts` — append a new `'linked-list': [...]` entry before the closing `};`

- [ ] **Step 2: Add code snippets**

In `src/data/codeSnippets.ts`, add before the closing `};`:

```ts
  'singly-traverse': {
    ts: [
      'let curr = head;',
      'while (curr !== null) {',
      '  visit(curr.value);',
      '  curr = curr.next;',
      '}',
    ],
    py: [
      'curr = head',
      'while curr is not None:',
      '    visit(curr.value)',
      '    curr = curr.next',
    ],
  },
  'singly-insert-delete': {
    ts: [
      '// insertAtHead(0)',
      'newNode.next = head; head = newNode;',
      '// insertAtTail(5)',
      'tail.next = newNode; tail = newNode;',
      '// deleteByValue(2)',
      'prev.next = curr.next;',
      '// reverse()',
      'let prev = null, curr = head;',
      'while (curr) { next=curr.next; curr.next=prev; prev=curr; curr=next; }',
    ],
    py: [
      '# insertAtHead(0)',
      'new_node.next = head; head = new_node',
      '# insertAtTail(5)',
      'tail.next = new_node; tail = new_node',
      '# deleteByValue(2)',
      'prev.next = curr.next',
      '# reverse()',
      'prev, curr = None, head',
      'while curr: nxt=curr.next; curr.next=prev; prev=curr; curr=nxt',
    ],
  },
  'doubly-traverse': {
    ts: [
      '// forward traversal',
      'let curr = head;',
      'while (curr) { visit(curr.val); curr = curr.next; }',
      '// backward traversal',
      'curr = tail;',
      'while (curr) { visit(curr.val); curr = curr.prev; }',
    ],
    py: [
      '# forward traversal',
      'curr = head',
      'while curr: visit(curr.val); curr = curr.next',
      '# backward traversal',
      'curr = tail',
      'while curr: visit(curr.val); curr = curr.prev',
    ],
  },
```

- [ ] **Step 3: Add complexity entries**

In `src/data/complexities.ts`, add before the closing `};`:

```ts
  'singly-traverse': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Visit each node once; only the curr pointer is needed as extra space.',
  },
  'singly-insert-delete': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Head insert is O(1); tail insert and deleteByValue need traversal O(n); reversal is O(n).',
  },
  'doubly-traverse': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Forward and backward traversals each visit n nodes; only the curr pointer is used as extra space.',
  },
```

- [ ] **Step 4: Add key insights**

In `src/data/keyInsights.ts`, add before the closing `};`:

```ts
  'singly-traverse':
    'Follow the chain: start curr=head, advance curr=curr.next each step, stop when curr is null — O(n) with O(1) space.',
  'singly-insert-delete':
    'Head insert is O(1) (redirect head); tail insert needs the tail pointer; delete requires tracking prev so prev.next can skip the removed node; reversal flips every next pointer in one pass.',
  'doubly-traverse':
    'The extra prev pointer enables O(1) backward navigation — forward: curr=curr.next; backward: curr=curr.prev. No copying or reversal needed.',
```

- [ ] **Step 5: Verify NeetCode slugs and add problems**

Visit `https://neetcode.io/practice` to verify the exact slugs for linked list problems, then add before the closing `};` in `src/data/neetcodeProblems.ts`:

Use the WebFetch tool to load the page and confirm slugs. The expected problems are:
- Reverse Linked List (beginner)
- Merge Two Sorted Lists (beginner)
- Linked List Cycle (beginner)
- Reorder List (advanced)
- Remove Nth Node From End of List (advanced)
- Add Two Numbers (advanced)
- Find the Duplicate Number (advanced)
- LRU Cache (advanced)

After verifying slugs from NeetCode, add the entry. Example structure (verify slugs before using):

```ts
  'linked-list': [
    {
      title: 'Reverse Linked List',
      slug: '<verify-from-neetcode>',
      difficulty: 'beginner',
      hint: 'Mirrors the reverse() step in the Insert/Delete demo — watch prev/curr pointers flip.',
    },
    {
      title: 'Merge Two Sorted Lists',
      slug: '<verify-from-neetcode>',
      difficulty: 'beginner',
      hint: 'Two curr pointers advance through each list; the smaller value gets appended.',
    },
    {
      title: 'Linked List Cycle Detection',
      slug: '<verify-from-neetcode>',
      difficulty: 'beginner',
      hint: 'Fast and slow pointers — if they meet, a cycle exists.',
    },
    {
      title: 'Reorder List',
      slug: '<verify-from-neetcode>',
      difficulty: 'advanced',
      hint: 'Split at midpoint, reverse the second half, then merge the two halves.',
    },
    {
      title: 'Remove Nth Node From End of List',
      slug: '<verify-from-neetcode>',
      difficulty: 'advanced',
      hint: 'Two pointers n apart so when the fast one reaches null the slow one is at the target.',
    },
    {
      title: 'Add Two Numbers',
      slug: '<verify-from-neetcode>',
      difficulty: 'advanced',
      hint: 'Walk both lists simultaneously, carrying the overflow to the next node.',
    },
  ],
```

- [ ] **Step 6: Run typecheck**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 7: Run full test suite**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/data/codeSnippets.ts src/data/complexities.ts src/data/keyInsights.ts src/data/neetcodeProblems.ts
git commit -m "feat: add linked list data entries (snippets, complexities, insights, problems)"
```

---

## Task 7: Wire LinkedListPage

**Files:**
- Replace: `src/routes/LinkedListPage.tsx` (currently a stub)

**Spec:**
- 3 tabs: `singly-traverse` (Singly Traverse), `singly-insert-delete` (Insert / Delete), `doubly-traverse` (Doubly Traverse)
- All 3 tabs use `LinkedListVisualizer` with `LinkedListSnapshot`
- Input state: separate value strings for each tab (stValues, sidValues, dtValues)
- Validation: 1–20 values for singly-traverse and doubly-traverse; 1–10 values for singly-insert-delete
- No CallStackPanel (linked list algorithms don't produce a call stack)
- Follows ArraysPage layout: flex h-full, main scrollable + aside ProblemsSidebar

- [ ] **Step 1: Write LinkedListPage**

Replace entire contents of `src/routes/LinkedListPage.tsx` with:

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer';
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
import { singlyTraverse } from '@/algorithms/linkedList/singlyTraverse';
import { singlyInsertDelete } from '@/algorithms/linkedList/singlyInsertDelete';
import { doublyTraverse } from '@/algorithms/linkedList/doublyTraverse';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_SINGLY_TRAVERSE_INPUT,
  DEFAULT_SINGLY_INSERT_DELETE_INPUT,
  DEFAULT_DOUBLY_TRAVERSE_INPUT,
} from '@/types/algorithm';
import type { LinkedListSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'singly-traverse' as const, label: 'Singly Traverse' },
  { id: 'singly-insert-delete' as const, label: 'Insert / Delete' },
  { id: 'doubly-traverse' as const, label: 'Doubly Traverse' },
];

type LinkedListAlgorithmId = 'singly-traverse' | 'singly-insert-delete' | 'doubly-traverse';

export function LinkedListPage() {
  const [activeId, setActiveId] = useState<LinkedListAlgorithmId>('singly-traverse');

  const [stValues, setStValues] = useState(DEFAULT_SINGLY_TRAVERSE_INPUT.values.join(', '));
  const [sidValues, setSidValues] = useState(DEFAULT_SINGLY_INSERT_DELETE_INPUT.values.join(', '));
  const [dtValues, setDtValues] = useState(DEFAULT_DOUBLY_TRAVERSE_INPUT.values.join(', '));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    singlyTraverse(DEFAULT_SINGLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: LinkedListAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'singly-traverse') {
        setRun(singlyTraverse(DEFAULT_SINGLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'singly-insert-delete') {
        setRun(singlyInsertDelete(DEFAULT_SINGLY_INSERT_DELETE_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(doublyTraverse(DEFAULT_DOUBLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'singly-traverse') {
      const values = stValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(singlyTraverse({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'singly-insert-delete') {
      const values = sidValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 10) { setParseError('Maximum 10 values.'); return; }
      runner.reset();
      setRun(singlyInsertDelete({ values }) as AlgorithmRun<unknown>);
    } else {
      const values = dtValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(doublyTraverse({ values }) as AlgorithmRun<unknown>);
    }
  }, [activeId, stValues, sidValues, dtValues, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const llSnap = (currentStep?.snapshot as LinkedListSnapshot | undefined) ?? null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="linked-list" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs
          tabs={ALGO_TABS}
          selectedId={activeId}
          onSelect={handleAlgorithmChange}
        />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          <LinkedListVisualizer snapshot={llSnap} />
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
          {activeId === 'singly-traverse' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={stValues}
                onChange={(e) => setStValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'singly-insert-delete' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Initial list (comma-separated, max 10)</label>
              <input
                type="text"
                value={sidValues}
                onChange={(e) => setSidValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'doubly-traverse' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={dtValues}
                onChange={(e) => setDtValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
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
        <ProblemsSidebar topicId="linked-list" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run full test suite**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run 2>&1 | tail -30
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/routes/LinkedListPage.tsx
git commit -m "feat: wire LinkedListPage with 3 algorithm tabs"
```

---

## Task 8: Final Verification

- [ ] **Step 1: Full typecheck**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx tsc --noEmit 2>&1
```

Expected: zero errors.

- [ ] **Step 2: Full test suite**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vitest run 2>&1 | tail -30
```

Expected: all tests pass, no failures.

- [ ] **Step 3: Lint check**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx eslint src/algorithms/linkedList/ src/components/visualizers/LinkedListVisualizer.tsx src/routes/LinkedListPage.tsx --max-warnings 0 2>&1 | tail -20
```

Expected: no lint errors or warnings.

- [ ] **Step 4: Build check**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vite build 2>&1 | tail -20
```

Expected: build succeeds with no errors.

- [ ] **Step 5: Dev server smoke test**

```bash
cd /Users/patipanb/Obsidian/DSAWebApp && npx vite --port 5175 &
```

Navigate to http://localhost:5175, go to the Linked List page, and verify:
- All 3 tabs render without errors
- Nodes display as rounded boxes in a row
- Arrows (→) appear between nodes and to null
- Backward arrows (←) appear on the Doubly Traverse tab
- Pointer badge "curr" appears above the active node
- Stepping through shows curr moving node by node
- Insert/Delete tab shows 9 steps with node mutations visible
- Code panel highlights the correct line for each step

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "session 5: linked list — singly traverse, insert/delete, doubly traverse complete"
```
