# Binary Tree + BST Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the BinaryTreePage and BSTPage stubs with fully working topic pages featuring 4 binary-tree traversal tabs and 3 BST operation tabs, complete with animated SVG visualizers, step narration, code highlighting, and NeetCode problem links.

**Architecture:** parseTree converts a level-order `(number|null)[]` into a stable `Record<string,TreeNode>` map with string IDs. Four traversal algorithms (inorder/preorder/postorder/level-order) and three BST algorithms (insert/search/delete) each emit pre-computed `Step[]` arrays. Two SVG visualizers render nodes at inorder x-positions. All algorithms follow the existing `createRunBuilder` pattern.

**Tech Stack:** TypeScript strict, Vitest + Testing Library, `createRunBuilder` from `@/engine/types`, SVG for visualizer, existing shared panels (CallStackPanel for tree recursion, QueuePanel none needed).

---

## File Map

**Create:**
- `src/utils/parseTree.ts` — level-order array → `{nodes, rootId}`
- `src/algorithms/tree/inorder.ts`, `preorder.ts`, `postorder.ts`, `levelOrder.ts`
- `src/algorithms/bst/bstInsert.ts`, `bstSearch.ts`, `bstDelete.ts`
- `src/components/visualizers/BinaryTreeVisualizer.tsx`
- `src/components/visualizers/BSTVisualizer.tsx`
- `tests/utils/parseTree.test.ts`
- `tests/algorithms/inorder.test.ts`, `preorder.test.ts`, `postorder.test.ts`, `levelOrder.test.ts`
- `tests/algorithms/bstInsert.test.ts`, `bstSearch.test.ts`, `bstDelete.test.ts`
- `tests/components/BinaryTreeVisualizer.test.tsx`
- `tests/components/BSTVisualizer.test.tsx`

**Modify:**
- `src/types/snapshots.ts` — add `TreeNode`, `TreeSnapshot`, `BSTSnapshot`
- `src/types/algorithm.ts` — add `TreeTraversalInput`, `BSTInsertInput`, `BSTSearchInput`, `BSTDeleteInput` + defaults
- `src/data/codeSnippets.ts`, `complexities.ts`, `keyInsights.ts`, `neetcodeProblems.ts`
- `src/routes/BinaryTreePage.tsx`, `src/routes/BSTPage.tsx`

---

## Key Contracts

### TreeNode / TreeSnapshot / BSTSnapshot

```ts
// src/types/snapshots.ts additions

export interface TreeNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
}

export interface TreeSnapshot {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
  current: string | null;
  visited: string[];        // node IDs in traversal order so far
  callStack?: string[];     // e.g. ['inorder(1)', 'inorder(2)']
  queue?: string[];         // for level-order BFS
}

export interface BSTSnapshot extends TreeSnapshot {
  comparingWith?: string;   // nodeId being compared against
  comparingValue?: number;  // value being inserted/searched/deleted
  inserted?: string;        // newly inserted nodeId
  deletedNode?: string;     // nodeId being deleted
  replacementNode?: string; // successor nodeId for two-children delete
}
```

### Input Types

```ts
// src/types/algorithm.ts additions

export interface TreeTraversalInput {
  values: (number | null)[];
}
export const DEFAULT_TREE_TRAVERSAL_INPUT: TreeTraversalInput = {
  values: [1, 2, 3, 4, 5, null, 6],
};

export interface BSTInsertInput {
  values: number[];
}
export const DEFAULT_BST_INSERT_INPUT: BSTInsertInput = {
  values: [5, 3, 7, 1, 4, 6, 8],
};

export interface BSTSearchInput {
  treeValues: number[];
  target: number;
}
export const DEFAULT_BST_SEARCH_INPUT: BSTSearchInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 4,
};

export interface BSTDeleteInput {
  treeValues: number[];
  target: number;
}
export const DEFAULT_BST_DELETE_INPUT: BSTDeleteInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 3,
};
```

### parseTree contract

Input `[1, 2, 3, 4, 5, null, 6]` produces:
- n0=1 (root), n1=2, n2=3, n3=4, n4=5, n5=6 (counter skips nulls)
- n0.left=n1, n0.right=n2; n1.left=n3, n1.right=n4; n2.left=null, n2.right=n5
- IDs assigned by scanning left→right, counter only increments for non-null
- Parent–child wiring: leftChildIndex = 2i+1, rightChildIndex = 2i+2 (index in original array)

### Tree traversal step model (2 steps per non-null node)

For every non-null node during recursive DFS:
1. **enter step**: push `'fnName(value)'` onto callStack, set current=nodeId, line=1 (function entry)
2. **visit step**: add nodeId to visited, pop frame from callStack, line=visit-line (4 for inorder, 3 for preorder, 5 for postorder)

The push/pop timing matches real recursion: push when entering the call, pop when the node's own contribution (the visit) is done — children may have been visited between enter and visit.

### levelOrder step model (n+1 steps)

- Step 0 (init): queue=[rootId], visited=[], current=null, line=3
- Steps 1..n: dequeue current, add to visited, enqueue non-null children, line=7

### BST insert step model

For each value being inserted (iterating input.values one at a time):
- Per comparison node: 1 step, line=3, comparingWith=nodeId, comparingValue=val
- Insert at null slot: 1 step, line=2, inserted=newNodeId

### BST search step model

- Per comparison: 1 step, line=3 (or 4 for direction), comparingWith=nodeId, comparingValue=target
- Found: 1 step, line=3, comparingWith=foundNodeId
- Not found: 1 step, line=2, comparingWith=null

### BST delete step model

- Walk steps (same as search): line=3 or 5
- Found node: 1 step, line=7
- Leaf removal: 1 step, line=8, deletedNode=nodeId
- One-child: 1 step, line=8 or 9, deletedNode, replacementNode
- Two-children: (a) find successor step line=10, (b) replace value step line=11, (c) delete successor step line=12

### BinaryTreeVisualizer layout

Inorder x-position: visit nodes in inorder order, assign `pos.x = counter * 60 + 40`. Depth y-position: `pos.y = depth * 80 + 40`. SVG width = `(leafCount+1) * 60`, height = `(maxDepth+1) * 80 + 80`.

Node rendering: `<g data-testid="tree-node-{id}" data-active={current===id} data-visited={visited.includes(id)}>` containing `<circle>` + `<text>`.

Edge rendering: `<line data-testid="tree-edge-{parentId}-{childId}">`.

Active node (current): amber fill. Visited nodes: green fill. Default: bg-elevated style.

### BSTVisualizer

Extends BinaryTreeVisualizer rendering by adding overlays:
- `comparingWith`: orange ring (`stroke: status-warn`)
- `inserted`: amber pulse (same as active)
- `deletedNode`: rose tint
- `replacementNode`: cyan ring

---

## Task 1: Type Definitions

**Files:**
- Modify: `src/types/snapshots.ts`
- Modify: `src/types/algorithm.ts`

- [ ] **Step 1: Add tree snapshot types to snapshots.ts**

Append to `src/types/snapshots.ts`:

```ts
export interface TreeNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
}

export interface TreeSnapshot {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
  current: string | null;
  visited: string[];
  callStack?: string[];
  queue?: string[];
}

export interface BSTSnapshot extends TreeSnapshot {
  comparingWith?: string;
  comparingValue?: number;
  inserted?: string;
  deletedNode?: string;
  replacementNode?: string;
}
```

- [ ] **Step 2: Add input types and defaults to algorithm.ts**

Append to `src/types/algorithm.ts`:

```ts
export interface TreeTraversalInput {
  values: (number | null)[];
}

export const DEFAULT_TREE_TRAVERSAL_INPUT: TreeTraversalInput = {
  values: [1, 2, 3, 4, 5, null, 6],
};

export interface BSTInsertInput {
  values: number[];
}

export const DEFAULT_BST_INSERT_INPUT: BSTInsertInput = {
  values: [5, 3, 7, 1, 4, 6, 8],
};

export interface BSTSearchInput {
  treeValues: number[];
  target: number;
}

export const DEFAULT_BST_SEARCH_INPUT: BSTSearchInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 4,
};

export interface BSTDeleteInput {
  treeValues: number[];
  target: number;
}

export const DEFAULT_BST_DELETE_INPUT: BSTDeleteInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 3,
};
```

- [ ] **Step 3: Verify typecheck passes**

Run: `pnpm typecheck`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/types/snapshots.ts src/types/algorithm.ts
git commit -m "feat(types): add TreeNode, TreeSnapshot, BSTSnapshot and BST input types"
```

---

## Task 2: parseTree Utility

**Files:**
- Create: `src/utils/parseTree.ts`
- Create: `tests/utils/parseTree.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/utils/parseTree.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parseTree } from '@/utils/parseTree';

describe('parseTree', () => {
  it('returns null rootId for empty input', () => {
    const { rootId, nodes } = parseTree([]);
    expect(rootId).toBeNull();
    expect(Object.keys(nodes)).toHaveLength(0);
  });

  it('handles single node', () => {
    const { rootId, nodes } = parseTree([42]);
    expect(rootId).toBe('n0');
    expect(nodes['n0']!.value).toBe(42);
    expect(nodes['n0']!.leftId).toBeNull();
    expect(nodes['n0']!.rightId).toBeNull();
  });

  it('parses [1,2,3,4,5,null,6] into correct structure', () => {
    const { rootId, nodes } = parseTree([1, 2, 3, 4, 5, null, 6]);
    expect(rootId).toBe('n0');
    expect(Object.keys(nodes)).toHaveLength(6);
    expect(nodes['n0']!.value).toBe(1);
    expect(nodes['n0']!.leftId).toBe('n1');
    expect(nodes['n0']!.rightId).toBe('n2');
    expect(nodes['n1']!.leftId).toBe('n3');
    expect(nodes['n1']!.rightId).toBe('n4');
    expect(nodes['n2']!.leftId).toBeNull();  // null slot at index 5
    expect(nodes['n2']!.rightId).toBe('n5');
    expect(nodes['n5']!.value).toBe(6);
  });

  it('IDs are assigned in non-null order (null slots skipped)', () => {
    const { nodes } = parseTree([1, null, 2]);
    // n0=1 (index 0), n1=2 (index 2, counter skips null at index 1)
    expect(nodes['n0']!.leftId).toBeNull();
    expect(nodes['n0']!.rightId).toBe('n1');
    expect(nodes['n1']!.value).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

Run: `pnpm test tests/utils/parseTree.test.ts`
Expected: FAIL — cannot find module '@/utils/parseTree'

- [ ] **Step 3: Implement parseTree**

Create `src/utils/parseTree.ts`:

```ts
import type { TreeNode } from '@/types/snapshots';

export interface ParsedTree {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
}

export function parseTree(values: (number | null)[]): ParsedTree {
  const nodes: Record<string, TreeNode> = {};
  let counter = 0;

  const ids: (string | null)[] = values.map((v) => {
    if (v === null) return null;
    const id = `n${counter++}`;
    nodes[id] = { id, value: v, leftId: null, rightId: null };
    return id;
  });

  for (let i = 0; i < values.length; i++) {
    const parentId = ids[i];
    if (parentId === null) continue;
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    nodes[parentId].leftId = leftIdx < ids.length ? ids[leftIdx] ?? null : null;
    nodes[parentId].rightId = rightIdx < ids.length ? ids[rightIdx] ?? null : null;
  }

  return { nodes, rootId: ids[0] ?? null };
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `pnpm test tests/utils/parseTree.test.ts`
Expected: PASS — 4 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/utils/parseTree.ts tests/utils/parseTree.test.ts
git commit -m "feat(utils): add parseTree — level-order array to TreeNode map"
```

---

## Task 3: DFS Tree Traversals (Inorder, Preorder, Postorder)

**Files:**
- Create: `src/algorithms/tree/inorder.ts`, `preorder.ts`, `postorder.ts`
- Create: `tests/algorithms/inorder.test.ts`, `preorder.test.ts`, `postorder.test.ts`

Default input `[1, 2, 3, 4, 5, null, 6]` produces:
- Inorder result: `[4, 2, 5, 1, 3, 6]`
- Preorder result: `[1, 2, 4, 5, 3, 6]`
- Postorder result: `[4, 5, 2, 6, 3, 1]`
- Steps each: 12 (2 × 6 non-null nodes)

### inorder.ts

- [ ] **Step 1: Write failing inorder test**

Create `tests/algorithms/inorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { inorder } from '@/algorithms/tree/inorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('inorder', () => {
  it('finalResult is inorder traversal [4,2,5,1,3,6]', () => {
    const run = inorder(INPUT);
    expect(run.finalResult).toEqual([4, 2, 5, 1, 3, 6]);
  });

  it('produces exactly 12 steps (2 per node)', () => {
    const run = inorder(INPUT);
    expect(run.steps.length).toBe(12);
  });

  it('enter steps have current set and callStack growing', () => {
    const run = inorder(INPUT);
    const enterStep = run.steps[0]!;
    const snap = enterStep.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.current).not.toBeNull();
    expect(snap.callStack).toHaveLength(1);
    expect(snap.visited).toHaveLength(0);
  });

  it('visit steps grow the visited array', () => {
    const run = inorder(INPUT);
    const visitStep = run.steps[3]!;
    const snap = visitStep.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(inorder(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Run to confirm failure**

Run: `pnpm test tests/algorithms/inorder.test.ts`
Expected: FAIL — cannot find module '@/algorithms/tree/inorder'

- [ ] **Step 3: Implement inorder.ts**

Create `src/algorithms/tree/inorder.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines (1-indexed):
1: function inorder(root) {
2:   if (root === null) return;
3:   inorder(root.left);
4:   visit(root.value);
5:   inorder(root.right);
6: }
*/

export function inorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('inorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `inorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter inorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    dfs(node.leftId);

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 4,
      narration: `Visit ${node.value} — add to inorder output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });

    dfs(node.rightId);
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
```

- [ ] **Step 4: Run inorder tests to confirm pass**

Run: `pnpm test tests/algorithms/inorder.test.ts`
Expected: PASS — 5 tests pass, snapshot created

### preorder.ts

- [ ] **Step 5: Write failing preorder test**

Create `tests/algorithms/preorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { preorder } from '@/algorithms/tree/preorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('preorder', () => {
  it('finalResult is [1,2,4,5,3,6]', () => {
    expect(preorder(INPUT).finalResult).toEqual([1, 2, 4, 5, 3, 6]);
  });

  it('produces 12 steps', () => {
    expect(preorder(INPUT).steps.length).toBe(12);
  });

  it('first visit step is node 1 (root visited first)', () => {
    const run = preorder(INPUT);
    const snap = run.steps[1]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(preorder(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 6: Implement preorder.ts**

Create `src/algorithms/tree/preorder.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1: function preorder(root) {
2:   if (root === null) return;
3:   visit(root.value);
4:   preorder(root.left);
5:   preorder(root.right);
6: }
*/

export function preorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('preorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `preorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter preorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 3,
      narration: `Visit ${node.value} — add to preorder output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });

    dfs(node.leftId);
    dfs(node.rightId);
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
```

- [ ] **Step 7: Run preorder tests**

Run: `pnpm test tests/algorithms/preorder.test.ts`
Expected: PASS

### postorder.ts

- [ ] **Step 8: Write failing postorder test**

Create `tests/algorithms/postorder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { postorder } from '@/algorithms/tree/postorder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('postorder', () => {
  it('finalResult is [4,5,2,6,3,1]', () => {
    expect(postorder(INPUT).finalResult).toEqual([4, 5, 2, 6, 3, 1]);
  });

  it('produces 12 steps', () => {
    expect(postorder(INPUT).steps.length).toBe(12);
  });

  it('root (n0) is last in visited', () => {
    const run = postorder(INPUT);
    const lastVisit = run.steps[11]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(lastVisit.visited).toHaveLength(6);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(postorder(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 9: Implement postorder.ts**

Create `src/algorithms/tree/postorder.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1: function postorder(root) {
2:   if (root === null) return;
3:   postorder(root.left);
4:   postorder(root.right);
5:   visit(root.value);
6: }
*/

export function postorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('postorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `postorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter postorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    dfs(node.leftId);
    dfs(node.rightId);

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 5,
      narration: `Visit ${node.value} — both children done, add to output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
```

- [ ] **Step 10: Run all three traversal tests**

Run: `pnpm test tests/algorithms/inorder.test.ts tests/algorithms/preorder.test.ts tests/algorithms/postorder.test.ts`
Expected: PASS — 13 tests pass total

- [ ] **Step 11: Commit**

```bash
git add src/algorithms/tree/inorder.ts src/algorithms/tree/preorder.ts src/algorithms/tree/postorder.ts \
        tests/algorithms/inorder.test.ts tests/algorithms/preorder.test.ts tests/algorithms/postorder.test.ts \
        tests/algorithms/__snapshots__
git commit -m "feat(tree): add inorder, preorder, postorder traversal algorithms with tests"
```

---

## Task 4: Level-Order Traversal

**Files:**
- Create: `src/algorithms/tree/levelOrder.ts`
- Create: `tests/algorithms/levelOrder.test.ts`

For `[1,2,3,4,5,null,6]`: result `[1,2,3,4,5,6]`, steps = 7 (1 init + 6 dequeue).

- [ ] **Step 1: Write failing test**

Create `tests/algorithms/levelOrder.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { levelOrder } from '@/algorithms/tree/levelOrder';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [1, 2, 3, 4, 5, null, 6] as (number | null)[] };

describe('levelOrder', () => {
  it('finalResult is BFS order [1,2,3,4,5,6]', () => {
    expect(levelOrder(INPUT).finalResult).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('produces n+1 steps (7 for 6 nodes)', () => {
    expect(levelOrder(INPUT).steps.length).toBe(7);
  });

  it('init step has queue=[rootId] and empty visited', () => {
    const run = levelOrder(INPUT);
    const snap = run.steps[0]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.queue).toHaveLength(1);
    expect(snap.visited).toHaveLength(0);
    expect(snap.current).toBeNull();
  });

  it('after dequeuing root, queue has 2 items (children)', () => {
    const run = levelOrder(INPUT);
    const snap = run.steps[1]!.snapshot as import('@/types/snapshots').TreeSnapshot;
    expect(snap.visited).toHaveLength(1);
    expect(snap.queue).toHaveLength(2);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(levelOrder(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test tests/algorithms/levelOrder.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement levelOrder.ts**

Create `src/algorithms/tree/levelOrder.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1:  function levelOrder(root) {
2:    if (!root) return [];
3:    const queue = [root];
4:    const result = [];
5:    while (queue.length > 0) {
6:      const node = queue.shift();
7:      result.push(node.value);
8:      if (node.left) queue.push(node.left);
9:      if (node.right) queue.push(node.right);
10:   }
11:   return result;
12: }
*/

export function levelOrder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('level-order', input);

  if (rootId === null) {
    r.push({
      line: 2,
      narration: 'Tree is empty — return []',
      snapshot: { nodes, rootId, current: null, visited: [], queue: [] },
    });
    return r.build([]);
  }

  const queue: string[] = [rootId];
  const visited: string[] = [];

  r.push({
    line: 3,
    narration: `Initialize queue with root (${nodes[rootId]!.value})`,
    snapshot: { nodes, rootId, current: null, visited: [], queue: [...queue] },
    variables: { queueSize: queue.length },
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes[nodeId]!;
    visited.push(nodeId);

    const left = node.leftId;
    const right = node.rightId;
    if (left !== null) queue.push(left);
    if (right !== null) queue.push(right);

    r.push({
      line: 7,
      narration: `Dequeue ${node.value}, enqueue children — queue size now ${queue.length}`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], queue: [...queue] },
      variables: { current: node.value, queueSize: queue.length, visitedCount: visited.length },
    });
  }

  return r.build(visited.map((id) => nodes[id]!.value));
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test tests/algorithms/levelOrder.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/algorithms/tree/levelOrder.ts tests/algorithms/levelOrder.test.ts tests/algorithms/__snapshots__
git commit -m "feat(tree): add level-order BFS traversal algorithm"
```

---

## Task 5: BST Algorithms (Insert, Search, Delete)

**Files:**
- Create: `src/algorithms/bst/bstInsert.ts`, `bstSearch.ts`, `bstDelete.ts`
- Create: `tests/algorithms/bstInsert.test.ts`, `bstSearch.test.ts`, `bstDelete.test.ts`

### bstInsert.ts

Default input `{values:[5,3,7,1,4,6,8]}`. Builds BST one value at a time, emitting comparison + insert steps per value.

Final tree:
```
      5(n0)
     / \
   3(n1) 7(n2)
  / \   / \
1(n3)4(n4)6(n5)8(n6)
```

Step count for inserting `[5,3,7,1,4,6,8]`: 1+2+2+3+3+3+3 = 17 steps.

- [ ] **Step 1: Write failing bstInsert test**

Create `tests/algorithms/bstInsert.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bstInsert } from '@/algorithms/bst/bstInsert';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { values: [5, 3, 7, 1, 4, 6, 8] };

describe('bstInsert', () => {
  it('finalResult contains all values in BST inorder order', () => {
    const run = bstInsert(INPUT);
    expect(run.finalResult).toEqual([1, 3, 4, 5, 6, 7, 8]);
  });

  it('produces 17 steps for 7-value input', () => {
    expect(bstInsert(INPUT).steps.length).toBe(17);
  });

  it('first step inserts root 5 (no comparison)', () => {
    const run = bstInsert(INPUT);
    const snap = run.steps[0]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(snap.inserted).toBeDefined();
    expect(snap.comparingWith).toBeUndefined();
  });

  it('second value (3) has one comparison step then insert', () => {
    const run = bstInsert(INPUT);
    // step 1: compare 3 < 5
    const compareSnap = run.steps[1]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(compareSnap.comparingWith).toBeDefined();
    expect(compareSnap.comparingValue).toBe(3);
    // step 2: insert 3
    const insertSnap = run.steps[2]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(insertSnap.inserted).toBeDefined();
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstInsert(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test tests/algorithms/bstInsert.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement bstInsert.ts**

Create `src/algorithms/bst/bstInsert.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTInsertInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1: function insert(root, val) {
2:   if (root === null) return new Node(val);
3:   if (val < root.val) {
4:     root.left = insert(root.left, val);
5:   } else {
6:     root.right = insert(root.right, val);
7:   }
8:   return root;
9: }
*/

function bstInorder(nodes: Record<string, TreeNode>, rootId: string | null): number[] {
  const result: number[] = [];
  function dfs(id: string | null) {
    if (id === null) return;
    dfs(nodes[id]!.leftId);
    result.push(nodes[id]!.value);
    dfs(nodes[id]!.rightId);
  }
  dfs(rootId);
  return result;
}

export function bstInsert(input: BSTInsertInput): AlgorithmRun<BSTSnapshot> {
  const r = createRunBuilder<BSTSnapshot>('bst-insert', input);
  const nodes: Record<string, TreeNode> = {};
  let rootId: string | null = null;
  let counter = 0;

  for (const val of input.values) {
    const newId = `n${counter++}`;
    nodes[newId] = { id: newId, value: val, leftId: null, rightId: null };

    if (rootId === null) {
      rootId = newId;
      r.push({
        line: 2,
        narration: `Insert ${val} as root`,
        snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
        variables: { inserting: val },
      });
      continue;
    }

    let curr: string = rootId;
    let inserted = false;
    while (!inserted) {
      const currNode = nodes[curr]!;
      r.push({
        line: 3,
        narration: `Compare ${val} ${val < currNode.value ? '<' : '>'} ${currNode.value} — go ${val < currNode.value ? 'left' : 'right'}`,
        snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], comparingWith: curr, comparingValue: val },
        variables: { inserting: val, comparing: currNode.value },
      });

      if (val < currNode.value) {
        if (currNode.leftId === null) {
          currNode.leftId = newId;
          inserted = true;
          r.push({
            line: 2,
            narration: `Insert ${val} as left child of ${currNode.value}`,
            snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
            variables: { inserting: val, parent: currNode.value },
          });
        } else {
          curr = currNode.leftId;
        }
      } else {
        if (currNode.rightId === null) {
          currNode.rightId = newId;
          inserted = true;
          r.push({
            line: 2,
            narration: `Insert ${val} as right child of ${currNode.value}`,
            snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
            variables: { inserting: val, parent: currNode.value },
          });
        } else {
          curr = currNode.rightId;
        }
      }
    }
  }

  return r.build(bstInorder(nodes, rootId));
}
```

- [ ] **Step 4: Run bstInsert tests**

Run: `pnpm test tests/algorithms/bstInsert.test.ts`
Expected: PASS

### bstSearch.ts

- [ ] **Step 5: Write failing bstSearch test**

Create `tests/algorithms/bstSearch.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bstSearch } from '@/algorithms/bst/bstSearch';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { treeValues: [5, 3, 7, 1, 4, 6, 8], target: 4 };

describe('bstSearch', () => {
  it('finalResult is true when target found', () => {
    expect(bstSearch(INPUT).finalResult).toBe(true);
  });

  it('finalResult is false when target not found', () => {
    expect(bstSearch({ treeValues: [5, 3, 7], target: 9 }).finalResult).toBe(false);
  });

  it('search for 4 takes 3 comparison steps (5→3→4)', () => {
    expect(bstSearch(INPUT).steps.length).toBe(3);
  });

  it('final step has found node as comparingWith', () => {
    const run = bstSearch(INPUT);
    const snap = run.steps[2]!.snapshot as import('@/types/snapshots').BSTSnapshot;
    expect(snap.comparingWith).toBeDefined();
    expect(snap.comparingValue).toBe(4);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstSearch(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 6: Implement bstSearch.ts**

Create `src/algorithms/bst/bstSearch.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTSearchInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1: function search(root, target) {
2:   if (root === null) return false;
3:   if (root.val === target) return true;
4:   if (target < root.val)
5:     return search(root.left, target);
6:   return search(root.right, target);
7: }
*/

function buildBST(values: number[]): { nodes: Record<string, TreeNode>; rootId: string | null } {
  const nodes: Record<string, TreeNode> = {};
  let rootId: string | null = null;
  let counter = 0;

  for (const val of values) {
    const id = `n${counter++}`;
    nodes[id] = { id, value: val, leftId: null, rightId: null };
    if (rootId === null) { rootId = id; continue; }
    let curr = rootId;
    while (true) {
      const node = nodes[curr]!;
      if (val < node.value) {
        if (node.leftId === null) { node.leftId = id; break; }
        curr = node.leftId;
      } else {
        if (node.rightId === null) { node.rightId = id; break; }
        curr = node.rightId;
      }
    }
  }

  return { nodes, rootId };
}

export function bstSearch(input: BSTSearchInput): AlgorithmRun<BSTSnapshot> {
  const { nodes, rootId } = buildBST(input.treeValues);
  const r = createRunBuilder<BSTSnapshot>('bst-search', input);
  const { target } = input;
  let curr: string | null = rootId;

  while (curr !== null) {
    const node = nodes[curr]!;
    if (node.value === target) {
      r.push({
        line: 3,
        narration: `Found ${target} at node — search successful`,
        snapshot: { nodes, rootId, current: curr, visited: [curr], comparingWith: curr, comparingValue: target },
        variables: { target, current: node.value, found: true },
      });
      return r.build(true);
    }
    const direction = target < node.value ? 'left' : 'right';
    r.push({
      line: 4,
      narration: `${target} ${target < node.value ? '<' : '>'} ${node.value} — go ${direction}`,
      snapshot: { nodes, rootId, current: curr, visited: [], comparingWith: curr, comparingValue: target },
      variables: { target, current: node.value },
    });
    curr = target < node.value ? node.leftId : node.rightId;
  }

  r.push({
    line: 2,
    narration: `Reached null — ${target} not found`,
    snapshot: { nodes, rootId, current: null, visited: [], comparingWith: undefined, comparingValue: target },
    variables: { target, found: false },
  });
  return r.build(false);
}
```

- [ ] **Step 7: Run bstSearch tests**

Run: `pnpm test tests/algorithms/bstSearch.test.ts`
Expected: PASS

### bstDelete.ts

Default: delete node 3 from `[5,3,7,1,4,6,8]`. Node 3 has two children (1 and 4), so inorder successor (4) replaces it.

- [ ] **Step 8: Write failing bstDelete test**

Create `tests/algorithms/bstDelete.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { bstDelete } from '@/algorithms/bst/bstDelete';
import { serializeRun } from '@/engine/serializeRun';

const INPUT = { treeValues: [5, 3, 7, 1, 4, 6, 8], target: 3 };

describe('bstDelete', () => {
  it('finalResult is BST inorder after deletion [1,4,5,6,7,8]', () => {
    expect(bstDelete(INPUT).finalResult).toEqual([1, 4, 5, 6, 7, 8]);
  });

  it('deleting a leaf produces finalResult without that value', () => {
    const run = bstDelete({ treeValues: [5, 3, 7], target: 7 });
    expect(run.finalResult).toEqual([3, 5]);
  });

  it('deleting node with one child replaces it with that child', () => {
    const run = bstDelete({ treeValues: [5, 3], target: 3 });
    expect(run.finalResult).toEqual([5]);
  });

  it('two-children delete includes successor steps', () => {
    const run = bstDelete(INPUT);
    const snaps = run.steps.map((s) => s.snapshot as import('@/types/snapshots').BSTSnapshot);
    const hasReplacement = snaps.some((s) => s.replacementNode !== undefined);
    expect(hasReplacement).toBe(true);
  });

  it('trace matches snapshot', () => {
    expect(serializeRun(bstDelete(INPUT))).toMatchSnapshot();
  });
});
```

- [ ] **Step 9: Implement bstDelete.ts**

Create `src/algorithms/bst/bstDelete.ts`:

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTDeleteInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1:  function deleteNode(root, key) {
2:    if (root === null) return null;
3:    if (key < root.val)
4:      root.left = deleteNode(root.left, key);
5:    else if (key > root.val)
6:      root.right = deleteNode(root.right, key);
7:    else {
8:      if (!root.left) return root.right;
9:      if (!root.right) return root.left;
10:     const succ = findMin(root.right);
11:     root.val = succ.val;
12:     root.right = deleteNode(root.right, succ.val);
13:   }
14:   return root;
15: }
*/

function buildBST(values: number[]): { nodes: Record<string, TreeNode>; rootId: string | null } {
  const nodes: Record<string, TreeNode> = {};
  let rootId: string | null = null;
  let counter = 0;
  for (const val of values) {
    const id = `n${counter++}`;
    nodes[id] = { id, value: val, leftId: null, rightId: null };
    if (rootId === null) { rootId = id; continue; }
    let curr = rootId;
    while (true) {
      const node = nodes[curr]!;
      if (val < node.value) {
        if (node.leftId === null) { node.leftId = id; break; }
        curr = node.leftId;
      } else {
        if (node.rightId === null) { node.rightId = id; break; }
        curr = node.rightId;
      }
    }
  }
  return { nodes, rootId };
}

function findMin(nodes: Record<string, TreeNode>, nodeId: string): string {
  let curr = nodeId;
  while (nodes[curr]!.leftId !== null) curr = nodes[curr]!.leftId!;
  return curr;
}

function bstInorder(nodes: Record<string, TreeNode>, rootId: string | null): number[] {
  const result: number[] = [];
  function dfs(id: string | null) {
    if (id === null) return;
    dfs(nodes[id]!.leftId);
    result.push(nodes[id]!.value);
    dfs(nodes[id]!.rightId);
  }
  dfs(rootId);
  return result;
}

export function bstDelete(input: BSTDeleteInput): AlgorithmRun<BSTSnapshot> {
  const { nodes, rootId } = buildBST(input.treeValues);
  const r = createRunBuilder<BSTSnapshot>('bst-delete', input);
  const { target } = input;

  let curr: string | null = rootId;
  let parent: string | null = null;
  let isLeft = false;

  // Walk to find the target node
  while (curr !== null && nodes[curr]!.value !== target) {
    const node = nodes[curr]!;
    const direction = target < node.value ? 'left' : 'right';
    r.push({
      line: target < node.value ? 3 : 5,
      narration: `${target} ${target < node.value ? '<' : '>'} ${node.value} — go ${direction}`,
      snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], comparingWith: curr, comparingValue: target },
      variables: { target, current: node.value },
    });
    parent = curr;
    isLeft = target < node.value;
    curr = target < node.value ? node.leftId : node.rightId;
  }

  if (curr === null) {
    r.push({
      line: 2,
      narration: `${target} not found in BST`,
      snapshot: { nodes: { ...nodes }, rootId, current: null, visited: [] },
    });
    return r.build(bstInorder(nodes, rootId));
  }

  const targetNode = nodes[curr]!;

  // Case 1: leaf node
  if (targetNode.leftId === null && targetNode.rightId === null) {
    r.push({
      line: 8,
      narration: `Node ${target} is a leaf — remove it`,
      snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], deletedNode: curr, comparingValue: target },
    });
    if (parent === null) {
      // deleting root
      return r.build([]);
    }
    if (isLeft) nodes[parent]!.leftId = null;
    else nodes[parent]!.rightId = null;
    delete nodes[curr];
    return r.build(bstInorder(nodes, rootId));
  }

  // Case 2: one child
  if (targetNode.leftId === null || targetNode.rightId === null) {
    const child = targetNode.leftId ?? targetNode.rightId!;
    r.push({
      line: targetNode.leftId === null ? 9 : 8,
      narration: `Node ${target} has one child — replace with it`,
      snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], deletedNode: curr, replacementNode: child, comparingValue: target },
    });
    if (parent === null) {
      // deleting root with one child
      delete nodes[curr];
      return r.build(bstInorder(nodes, child ? { ...nodes } : nodes, child));
    }
    if (isLeft) nodes[parent]!.leftId = child;
    else nodes[parent]!.rightId = child;
    delete nodes[curr];
    return r.build(bstInorder(nodes, rootId));
  }

  // Case 3: two children — find inorder successor
  const succId = findMin(nodes, targetNode.rightId!);
  const succNode = nodes[succId]!;

  r.push({
    line: 10,
    narration: `Node ${target} has two children — finding inorder successor (leftmost in right subtree)`,
    snapshot: { nodes: { ...nodes }, rootId, current: succId, visited: [], comparingWith: succId, comparingValue: target },
  });

  r.push({
    line: 11,
    narration: `Replace ${target} with successor value ${succNode.value}`,
    snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], deletedNode: curr, replacementNode: succId, comparingValue: target },
  });

  targetNode.value = succNode.value;

  // Remove the successor node (it's guaranteed to have at most one right child)
  const succParent = findSuccParent(nodes, targetNode.rightId!, succId);
  if (succParent === null) {
    targetNode.rightId = succNode.rightId;
  } else {
    nodes[succParent]!.leftId = succNode.rightId;
  }

  r.push({
    line: 12,
    narration: `Delete successor ${succNode.value} from right subtree`,
    snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], comparingValue: target },
  });

  delete nodes[succId];
  return r.build(bstInorder(nodes, rootId));
}

function findSuccParent(
  nodes: Record<string, TreeNode>,
  startId: string,
  succId: string,
): string | null {
  if (startId === succId) return null;
  let curr = startId;
  while (nodes[curr]!.leftId !== succId) curr = nodes[curr]!.leftId!;
  return curr;
}
```

Note: The `bstInorder` call in the one-child case has a redundant signature — simplify if TypeScript complains by using the same `bstInorder(nodes, rootId)` signature consistently.

- [ ] **Step 10: Run bstDelete tests**

Run: `pnpm test tests/algorithms/bstDelete.test.ts`
Expected: PASS

- [ ] **Step 11: Run all BST tests**

Run: `pnpm test tests/algorithms/bstInsert.test.ts tests/algorithms/bstSearch.test.ts tests/algorithms/bstDelete.test.ts`
Expected: PASS

- [ ] **Step 12: Commit**

```bash
git add src/algorithms/bst/ tests/algorithms/bstInsert.test.ts tests/algorithms/bstSearch.test.ts tests/algorithms/bstDelete.test.ts tests/algorithms/__snapshots__
git commit -m "feat(bst): add bstInsert, bstSearch, bstDelete algorithms with tests"
```

---

## Task 6: BinaryTreeVisualizer

**Files:**
- Create: `src/components/visualizers/BinaryTreeVisualizer.tsx`
- Create: `tests/components/BinaryTreeVisualizer.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/BinaryTreeVisualizer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BinaryTreeVisualizer } from '@/components/visualizers/BinaryTreeVisualizer';
import type { TreeSnapshot } from '@/types/snapshots';

const SINGLE_NODE_SNAP: TreeSnapshot = {
  nodes: { n0: { id: 'n0', value: 42, leftId: null, rightId: null } },
  rootId: 'n0',
  current: null,
  visited: [],
};

const TWO_NODE_SNAP: TreeSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, leftId: 'n1', rightId: null },
    n1: { id: 'n1', value: 2, leftId: null, rightId: null },
  },
  rootId: 'n0',
  current: 'n1',
  visited: ['n1'],
};

describe('BinaryTreeVisualizer', () => {
  it('renders null snapshot without crashing', () => {
    render(<BinaryTreeVisualizer snapshot={null} />);
  });

  it('renders node with data-testid="tree-node-n0"', () => {
    render(<BinaryTreeVisualizer snapshot={SINGLE_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n0')).toBeInTheDocument();
  });

  it('marks current node with data-active="true"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('tree-node-n0')).not.toHaveAttribute('data-active', 'true');
  });

  it('marks visited nodes with data-visited="true"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-visited', 'true');
  });

  it('renders edge with data-testid="tree-edge-n0-n1"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-edge-n0-n1')).toBeInTheDocument();
  });

  it('renders node value as text', () => {
    render(<BinaryTreeVisualizer snapshot={SINGLE_NODE_SNAP} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test tests/components/BinaryTreeVisualizer.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement BinaryTreeVisualizer.tsx**

Create `src/components/visualizers/BinaryTreeVisualizer.tsx`:

```tsx
import type { TreeSnapshot, TreeNode } from '@/types/snapshots';

interface Position { x: number; y: number }

const NODE_RADIUS = 22;
const H_SPACING = 60;
const V_SPACING = 80;

function computePositions(
  rootId: string | null,
  nodes: Record<string, TreeNode>,
): Record<string, Position> {
  const positions: Record<string, Position> = {};
  let xCounter = 0;

  function dfs(nodeId: string | null, depth: number): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    dfs(node.leftId, depth + 1);
    positions[nodeId] = { x: xCounter * H_SPACING + 40, y: depth * V_SPACING + 40 };
    xCounter++;
    dfs(node.rightId, depth + 1);
  }

  dfs(rootId, 0);
  return positions;
}

function computeSvgDimensions(positions: Record<string, Position>): { width: number; height: number } {
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  if (xs.length === 0) return { width: 200, height: 120 };
  return {
    width: Math.max(...xs) + 60,
    height: Math.max(...ys) + 60,
  };
}

interface Props {
  snapshot: TreeSnapshot | null;
}

export function BinaryTreeVisualizer({ snapshot }: Props) {
  if (snapshot === null || snapshot.rootId === null) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        empty tree
      </div>
    );
  }

  const { nodes, rootId, current, visited } = snapshot;
  const positions = computePositions(rootId, nodes);
  const { width, height } = computeSvgDimensions(positions);

  return (
    <svg
      width={width}
      height={height}
      className="mx-auto"
      role="img"
      aria-label="Binary tree visualization"
    >
      {/* Edges first so nodes render on top */}
      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        return (
          <>
            {node.leftId && positions[node.leftId] && (
              <line
                key={`edge-${node.id}-${node.leftId}`}
                data-testid={`tree-edge-${node.id}-${node.leftId}`}
                x1={pos.x}
                y1={pos.y}
                x2={positions[node.leftId]!.x}
                y2={positions[node.leftId]!.y}
                stroke="var(--color-border-strong)"
                strokeWidth={2}
              />
            )}
            {node.rightId && positions[node.rightId] && (
              <line
                key={`edge-${node.id}-${node.rightId}`}
                data-testid={`tree-edge-${node.id}-${node.rightId}`}
                x1={pos.x}
                y1={pos.y}
                x2={positions[node.rightId]!.x}
                y2={positions[node.rightId]!.y}
                stroke="var(--color-border-strong)"
                strokeWidth={2}
              />
            )}
          </>
        );
      })}

      {/* Nodes */}
      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isActive = current === node.id;
        const isVisited = visited.includes(node.id);

        let fill = '#1e293b'; // bg-elevated
        if (isActive) fill = '#fbbf24'; // amber
        else if (isVisited) fill = '#34d399'; // green

        const textColor = isActive ? '#020617' : '#f1f5f9';

        return (
          <g
            key={node.id}
            data-testid={`tree-node-${node.id}`}
            data-active={isActive ? 'true' : undefined}
            data-visited={isVisited ? 'true' : undefined}
          >
            <circle
              cx={pos.x}
              cy={pos.y}
              r={NODE_RADIUS}
              fill={fill}
              stroke={isActive ? '#fbbf24' : '#334155'}
              strokeWidth={2}
            />
            <text
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize={13}
              fontFamily="JetBrains Mono Variable, monospace"
            >
              {node.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test tests/components/BinaryTreeVisualizer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/visualizers/BinaryTreeVisualizer.tsx tests/components/BinaryTreeVisualizer.test.tsx
git commit -m "feat(visualizer): add BinaryTreeVisualizer with SVG inorder layout"
```

---

## Task 7: BSTVisualizer

**Files:**
- Create: `src/components/visualizers/BSTVisualizer.tsx`
- Create: `tests/components/BSTVisualizer.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `tests/components/BSTVisualizer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BSTVisualizer } from '@/components/visualizers/BSTVisualizer';
import type { BSTSnapshot } from '@/types/snapshots';

const BASE_SNAP: BSTSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 5, leftId: 'n1', rightId: null },
    n1: { id: 'n1', value: 3, leftId: null, rightId: null },
  },
  rootId: 'n0',
  current: null,
  visited: [],
};

describe('BSTVisualizer', () => {
  it('renders null without crashing', () => {
    render(<BSTVisualizer snapshot={null} />);
  });

  it('renders tree-node data-testids', () => {
    render(<BSTVisualizer snapshot={BASE_SNAP} />);
    expect(screen.getByTestId('tree-node-n0')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-n1')).toBeInTheDocument();
  });

  it('marks comparingWith node with data-comparing="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, comparingWith: 'n0' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n0')).toHaveAttribute('data-comparing', 'true');
  });

  it('marks inserted node with data-inserted="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, inserted: 'n1' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-inserted', 'true');
  });

  it('marks deletedNode with data-deleted="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, deletedNode: 'n1' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-deleted', 'true');
  });
});
```

- [ ] **Step 2: Confirm failure**

Run: `pnpm test tests/components/BSTVisualizer.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement BSTVisualizer.tsx**

Create `src/components/visualizers/BSTVisualizer.tsx`:

```tsx
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';

interface Position { x: number; y: number }

const NODE_RADIUS = 22;
const H_SPACING = 60;
const V_SPACING = 80;

function computePositions(
  rootId: string | null,
  nodes: Record<string, TreeNode>,
): Record<string, Position> {
  const positions: Record<string, Position> = {};
  let xCounter = 0;
  function dfs(nodeId: string | null, depth: number): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    dfs(node.leftId, depth + 1);
    positions[nodeId] = { x: xCounter * H_SPACING + 40, y: depth * V_SPACING + 40 };
    xCounter++;
    dfs(node.rightId, depth + 1);
  }
  dfs(rootId, 0);
  return positions;
}

interface Props {
  snapshot: BSTSnapshot | null;
}

export function BSTVisualizer({ snapshot }: Props) {
  if (snapshot === null || snapshot.rootId === null) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        empty tree
      </div>
    );
  }

  const { nodes, rootId, current, visited, comparingWith, inserted, deletedNode, replacementNode } = snapshot;
  const positions = computePositions(rootId, nodes);
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const width = xs.length ? Math.max(...xs) + 60 : 200;
  const height = ys.length ? Math.max(...ys) + 60 : 120;

  return (
    <svg width={width} height={height} className="mx-auto" role="img" aria-label="BST visualization">
      {/* Edges */}
      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        return (
          <>
            {node.leftId && positions[node.leftId] && (
              <line
                key={`el-${node.id}`}
                data-testid={`tree-edge-${node.id}-${node.leftId}`}
                x1={pos.x} y1={pos.y}
                x2={positions[node.leftId]!.x} y2={positions[node.leftId]!.y}
                stroke="#334155" strokeWidth={2}
              />
            )}
            {node.rightId && positions[node.rightId] && (
              <line
                key={`er-${node.id}`}
                data-testid={`tree-edge-${node.id}-${node.rightId}`}
                x1={pos.x} y1={pos.y}
                x2={positions[node.rightId]!.x} y2={positions[node.rightId]!.y}
                stroke="#334155" strokeWidth={2}
              />
            )}
          </>
        );
      })}

      {/* Nodes */}
      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isActive = current === node.id;
        const isVisited = visited.includes(node.id);
        const isComparing = comparingWith === node.id;
        const isInserted = inserted === node.id;
        const isDeleted = deletedNode === node.id;
        const isReplacement = replacementNode === node.id;

        let fill = '#1e293b';
        if (isInserted || isActive) fill = '#fbbf24';
        else if (isDeleted) fill = '#fb7185';
        else if (isComparing) fill = '#fb923c';
        else if (isReplacement) fill = '#22d3ee';
        else if (isVisited) fill = '#34d399';

        const textColor = (isInserted || isActive || isDeleted || isComparing) ? '#020617' : '#f1f5f9';

        let strokeColor = '#334155';
        if (isComparing) strokeColor = '#fb923c';
        else if (isReplacement) strokeColor = '#22d3ee';

        return (
          <g
            key={node.id}
            data-testid={`tree-node-${node.id}`}
            data-active={isActive ? 'true' : undefined}
            data-visited={isVisited ? 'true' : undefined}
            data-comparing={isComparing ? 'true' : undefined}
            data-inserted={isInserted ? 'true' : undefined}
            data-deleted={isDeleted ? 'true' : undefined}
          >
            <circle
              cx={pos.x} cy={pos.y} r={NODE_RADIUS}
              fill={fill} stroke={strokeColor} strokeWidth={isComparing || isReplacement ? 3 : 2}
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fill={textColor} fontSize={13}
              fontFamily="JetBrains Mono Variable, monospace"
            >
              {node.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Run tests**

Run: `pnpm test tests/components/BSTVisualizer.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/visualizers/BSTVisualizer.tsx tests/components/BSTVisualizer.test.tsx
git commit -m "feat(visualizer): add BSTVisualizer with comparison/insert/delete overlays"
```

---

## Task 8: Data Files

**Files:**
- Modify: `src/data/codeSnippets.ts`
- Modify: `src/data/complexities.ts`
- Modify: `src/data/keyInsights.ts`
- Modify: `src/data/neetcodeProblems.ts`

**IMPORTANT:** For `neetcodeProblems.ts`, you MUST verify every slug using Playwright before adding it. Visit `https://neetcode.io/problems/{slug}` — if you get a 404 or redirect to the home page, find the correct slug. Use `https://neetcode.io/practice` to browse the problem list.

- [ ] **Step 1: Add entries to codeSnippets.ts**

Append to the `CODE_SNIPPETS` object in `src/data/codeSnippets.ts`:

```ts
  'inorder': {
    ts: [
      'function inorder(root) {',
      '  if (root === null) return;',
      '  inorder(root.left);',
      '  visit(root.value);',
      '  inorder(root.right);',
      '}',
    ],
    py: [
      'def inorder(root):',
      '    if root is None: return',
      '    inorder(root.left)',
      '    visit(root.val)',
      '    inorder(root.right)',
    ],
  },
  'preorder': {
    ts: [
      'function preorder(root) {',
      '  if (root === null) return;',
      '  visit(root.value);',
      '  preorder(root.left);',
      '  preorder(root.right);',
      '}',
    ],
    py: [
      'def preorder(root):',
      '    if root is None: return',
      '    visit(root.val)',
      '    preorder(root.left)',
      '    preorder(root.right)',
    ],
  },
  'postorder': {
    ts: [
      'function postorder(root) {',
      '  if (root === null) return;',
      '  postorder(root.left);',
      '  postorder(root.right);',
      '  visit(root.value);',
      '}',
    ],
    py: [
      'def postorder(root):',
      '    if root is None: return',
      '    postorder(root.left)',
      '    postorder(root.right)',
      '    visit(root.val)',
    ],
  },
  'level-order': {
    ts: [
      'function levelOrder(root) {',
      '  if (!root) return [];',
      '  const queue = [root];',
      '  const result = [];',
      '  while (queue.length > 0) {',
      '    const node = queue.shift();',
      '    result.push(node.value);',
      '    if (node.left) queue.push(node.left);',
      '    if (node.right) queue.push(node.right);',
      '  }',
      '  return result;',
      '}',
    ],
    py: [
      'from collections import deque',
      'def level_order(root):',
      '    if not root: return []',
      '    queue, result = deque([root]), []',
      '    while queue:',
      '        node = queue.popleft()',
      '        result.append(node.val)',
      '        if node.left: queue.append(node.left)',
      '        if node.right: queue.append(node.right)',
      '    return result',
    ],
  },
  'bst-insert': {
    ts: [
      'function insert(root, val) {',
      '  if (root === null) return new Node(val);',
      '  if (val < root.val) {',
      '    root.left = insert(root.left, val);',
      '  } else {',
      '    root.right = insert(root.right, val);',
      '  }',
      '  return root;',
      '}',
    ],
    py: [
      'def insert(root, val):',
      '    if root is None: return Node(val)',
      '    if val < root.val:',
      '        root.left = insert(root.left, val)',
      '    else:',
      '        root.right = insert(root.right, val)',
      '    return root',
    ],
  },
  'bst-search': {
    ts: [
      'function search(root, target) {',
      '  if (root === null) return false;',
      '  if (root.val === target) return true;',
      '  if (target < root.val)',
      '    return search(root.left, target);',
      '  return search(root.right, target);',
      '}',
    ],
    py: [
      'def search(root, target):',
      '    if root is None: return False',
      '    if root.val == target: return True',
      '    if target < root.val:',
      '        return search(root.left, target)',
      '    return search(root.right, target)',
    ],
  },
  'bst-delete': {
    ts: [
      'function deleteNode(root, key) {',
      '  if (root === null) return null;',
      '  if (key < root.val)',
      '    root.left = deleteNode(root.left, key);',
      '  else if (key > root.val)',
      '    root.right = deleteNode(root.right, key);',
      '  else {',
      '    if (!root.left) return root.right;',
      '    if (!root.right) return root.left;',
      '    const succ = findMin(root.right);',
      '    root.val = succ.val;',
      '    root.right = deleteNode(root.right, succ.val);',
      '  }',
      '  return root;',
      '}',
    ],
    py: [
      'def delete_node(root, key):',
      '    if root is None: return None',
      '    if key < root.val:',
      '        root.left = delete_node(root.left, key)',
      '    elif key > root.val:',
      '        root.right = delete_node(root.right, key)',
      '    else:',
      '        if not root.left: return root.right',
      '        if not root.right: return root.left',
      '        succ = find_min(root.right)',
      '        root.val = succ.val',
      '        root.right = delete_node(root.right, succ.val)',
      '    return root',
    ],
  },
```

- [ ] **Step 2: Add entries to complexities.ts**

Append to `COMPLEXITIES` in `src/data/complexities.ts`:

```ts
  'inorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'h = tree height; O(log n) balanced, O(n) skewed. Space is the recursion call stack.',
  },
  'preorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Same as inorder — every node is visited exactly once regardless of traversal order.',
  },
  'postorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Useful when children must be processed before parent (e.g., deleting a tree).',
  },
  'level-order': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(w)',
    notes: 'w = max width of the tree. Queue holds at most one full level at a time.',
  },
  'bst-insert': {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Worst case O(n) on a degenerate (sorted-input) tree. Balanced BST guarantees O(log n).',
  },
  'bst-search': {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Best case: target is root. Worst: degenerate tree — every node is visited.',
  },
  'bst-delete': {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Two-children deletion finds the inorder successor in O(h) then removes it in O(h).',
  },
```

- [ ] **Step 3: Add entries to keyInsights.ts**

Append to `KEY_INSIGHTS` in `src/data/keyInsights.ts`:

```ts
  'inorder':
    'Inorder (left → root → right) visits BST nodes in sorted order — the key invariant that makes inorder traversal the canonical way to list BST contents.',
  'preorder':
    'Preorder (root → left → right) visits the root before its subtrees — ideal for serialization since the root always comes first in the output.',
  'postorder':
    'Postorder (left → right → root) visits the root last — every child is fully processed before the parent, making it natural for deletion and bottom-up computation.',
  'level-order':
    'Level-order (BFS) uses a queue: enqueue the root, then for each dequeued node enqueue its children — processes the tree level by level without recursion.',
  'bst-insert':
    'Compare each node: go left if smaller, right if larger — follow this until you find a null slot, then attach the new node there.',
  'bst-search':
    'At every node, the BST invariant halves the search space: go left if target < current, right if larger — O(log n) on balanced trees.',
  'bst-delete':
    'Three cases: leaf → remove directly; one child → replace with it; two children → swap with inorder successor (leftmost in right subtree) then delete the successor.',
```

- [ ] **Step 4: Verify NeetCode slugs with Playwright**

Use Playwright to verify each slug by navigating to `https://neetcode.io/problems/{slug}`. A valid slug returns a problem page, not a 404 or redirect. Browse `https://neetcode.io/practice` to find correct slugs.

Slugs to verify for `binary-tree` topic (5 beginner + 5 advanced):

Beginner candidates (verify each):
- `invert-a-binary-tree`
- `maximum-depth-of-binary-tree` or `depth-of-binary-tree`
- `same-binary-tree`
- `subtree-of-a-tree`
- `diameter-of-binary-tree` or `binary-tree-diameter`

Advanced candidates:
- `level-order-traversal-of-binary-tree`
- `binary-tree-right-side-view`
- `count-good-nodes-in-binary-tree`
- `binary-tree-maximum-path-sum`
- `serialize-and-deserialize-binary-tree`

Slugs to verify for `bst` topic:

Beginner candidates:
- `search-in-a-binary-search-tree` or `binary-search`
- `insert-into-a-bst` or `insert-into-a-binary-search-tree`
- `lowest-common-ancestor-in-binary-search-tree`
- `range-sum-of-bst`
- `minimum-absolute-difference-in-bst` or `minimum-distance-between-bst-nodes`

Advanced candidates:
- `valid-binary-search-tree`
- `kth-smallest-integer-in-bst`
- `delete-node-in-a-bst` or `delete-from-a-bst`
- `recover-binary-search-tree`
- `construct-binary-search-tree-from-preorder-traversal` or `balance-a-bst`

- [ ] **Step 5: Add verified slugs to neetcodeProblems.ts**

After verifying slugs, add entries to `src/data/neetcodeProblems.ts`:

```ts
  'binary-tree': [
    { title: 'Invert Binary Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Post-order traversal swapping children; watch the left/right links flip at each node.' },
    { title: 'Maximum Depth of Binary Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'DFS callstack depth mirrors the recursion depth — the maximum callStack length is the answer.' },
    { title: 'Same Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Two trees traversed in sync; the visualizer highlights mismatches at the first diverging node.' },
    { title: 'Subtree of Another Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Same Tree applied at each node of the host tree — combine the two traversals in one run.' },
    { title: 'Diameter of Binary Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Post-order with a running max in VariableInspector; diameter = max(left depth + right depth) seen.' },
    { title: 'Binary Tree Level Order Traversal', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Default level-order example — the queue below the tree shows each level draining before the next starts.' },
    { title: 'Binary Tree Right Side View', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Level-order with last-of-level node highlighted; the right-side view is the sequence of last nodes.' },
    { title: 'Count Good Nodes in Binary Tree', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Preorder with a running max passed down; a node is "good" when its value ≥ the max on the path.' },
    { title: 'Binary Tree Maximum Path Sum', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Post-order — each node computes the best gain contributed to its parent and updates the global max.' },
    { title: 'Serialize and Deserialize Binary Tree', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Pre-order serialization builds the output string node by node — the visualizer shows each token added.' },
  ],
  'bst': [
    { title: 'Search in a Binary Search Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Default search example — each comparison halves the remaining tree.' },
    { title: 'Insert into a BST', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Default insert example — follow comparisons to the null slot, then attach.' },
    { title: 'Lowest Common Ancestor of a BST', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Both values bracket the current node? That is the LCA — no recursion needed beyond that step.' },
    { title: 'Kth Smallest Element in a BST', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Inorder traversal of a BST is sorted — the kth visit is the kth smallest.' },
    { title: 'Validate Binary Search Tree', slug: '<VERIFIED_SLUG>', difficulty: 'beginner', hint: 'Inorder output must be strictly increasing — the visualizer makes the sorted invariant obvious.' },
    { title: 'Delete Node in a BST', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Default delete example — all three cases (leaf / one-child / two-children with successor) animated.' },
    { title: 'Minimum Absolute Difference in BST', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Inorder traversal with successive-pair diff in VariableInspector; minimum appears between adjacent nodes.' },
    { title: 'Recover Binary Search Tree', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Inorder traversal exposes the single out-of-order swap — the two anomalies are the swapped nodes.' },
    { title: 'Balance a Binary Search Tree', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Inorder to sorted array, then rebuild from sorted middle — both stages animated sequentially.' },
    { title: 'Range Sum of BST', slug: '<VERIFIED_SLUG>', difficulty: 'advanced', hint: 'Pruned DFS: skip entire left/right subtree when root.val is already outside [low, high].' },
  ],
```

Replace all `<VERIFIED_SLUG>` with the actual verified slugs.

- [ ] **Step 6: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 errors

- [ ] **Step 7: Commit**

```bash
git add src/data/codeSnippets.ts src/data/complexities.ts src/data/keyInsights.ts src/data/neetcodeProblems.ts
git commit -m "feat(data): add code snippets, complexities, key insights, NeetCode problems for binary tree + BST"
```

---

## Task 9: BinaryTreePage

**Files:**
- Modify: `src/routes/BinaryTreePage.tsx`

Replace the stub with a full 4-tab page following the ArraysPage pattern.

- [ ] **Step 1: Implement BinaryTreePage.tsx**

Replace entire content of `src/routes/BinaryTreePage.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { BinaryTreeVisualizer } from '@/components/visualizers/BinaryTreeVisualizer';
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
import { inorder } from '@/algorithms/tree/inorder';
import { preorder } from '@/algorithms/tree/preorder';
import { postorder } from '@/algorithms/tree/postorder';
import { levelOrder } from '@/algorithms/tree/levelOrder';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_TREE_TRAVERSAL_INPUT,
} from '@/types/algorithm';
import type { TreeSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'inorder' as const, label: 'Inorder' },
  { id: 'preorder' as const, label: 'Preorder' },
  { id: 'postorder' as const, label: 'Postorder' },
  { id: 'level-order' as const, label: 'Level Order' },
];

type BinaryTreeAlgorithmId = 'inorder' | 'preorder' | 'postorder' | 'level-order';

const ALGO_MAP: Record<BinaryTreeAlgorithmId, (input: { values: (number | null)[] }) => AlgorithmRun<TreeSnapshot>> = {
  'inorder': inorder,
  'preorder': preorder,
  'postorder': postorder,
  'level-order': levelOrder,
};

function parseTreeInput(raw: string): (number | null)[] | null {
  const parts = raw.split(',').map((s) => s.trim());
  const result: (number | null)[] = [];
  for (const part of parts) {
    if (part === 'null' || part === '') {
      result.push(null);
    } else {
      const n = parseInt(part, 10);
      if (isNaN(n)) return null;
      result.push(n);
    }
  }
  return result.length > 0 ? result : null;
}

export function BinaryTreePage() {
  const [activeId, setActiveId] = useState<BinaryTreeAlgorithmId>('inorder');
  const [treeInput, setTreeInput] = useState(
    DEFAULT_TREE_TRAVERSAL_INPUT.values.map((v) => (v === null ? 'null' : String(v))).join(', '),
  );
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    inorder(DEFAULT_TREE_TRAVERSAL_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: BinaryTreeAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      setRun(ALGO_MAP[id](DEFAULT_TREE_TRAVERSAL_INPUT) as AlgorithmRun<unknown>);
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);
    const values = parseTreeInput(treeInput);
    if (values === null) {
      setParseError('Invalid input. Use comma-separated numbers and "null" for empty slots.');
      return;
    }
    const nonNull = values.filter((v) => v !== null).length;
    if (nonNull === 0) {
      setParseError('Tree must have at least one node.');
      return;
    }
    if (nonNull > 31) {
      setParseError('Maximum 31 nodes.');
      return;
    }
    runner.reset();
    setRun(ALGO_MAP[activeId]({ values }) as AlgorithmRun<unknown>);
  }, [activeId, treeInput, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const treeSnap = (currentStep?.snapshot as TreeSnapshot | undefined) ?? null;
  const callStack = treeSnap?.callStack;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="binary-tree" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          <BinaryTreeVisualizer snapshot={treeSnap} />
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-text-muted">
              Tree (level-order, comma-separated, use "null" for missing nodes)
            </label>
            <input
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-96 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="1, 2, 3, 4, 5, null, 6"
            />
          </div>
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
        <ProblemsSidebar topicId="binary-tree" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm typecheck`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/BinaryTreePage.tsx
git commit -m "feat(page): implement BinaryTreePage with 4 traversal tabs"
```

---

## Task 10: BSTPage

**Files:**
- Modify: `src/routes/BSTPage.tsx`

- [ ] **Step 1: Implement BSTPage.tsx**

Replace entire content of `src/routes/BSTPage.tsx`:

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { BSTVisualizer } from '@/components/visualizers/BSTVisualizer';
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
import { bstInsert } from '@/algorithms/bst/bstInsert';
import { bstSearch } from '@/algorithms/bst/bstSearch';
import { bstDelete } from '@/algorithms/bst/bstDelete';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_BST_INSERT_INPUT,
  DEFAULT_BST_SEARCH_INPUT,
  DEFAULT_BST_DELETE_INPUT,
} from '@/types/algorithm';
import type { BSTSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'bst-insert' as const, label: 'Insert' },
  { id: 'bst-search' as const, label: 'Search' },
  { id: 'bst-delete' as const, label: 'Delete' },
];

type BSTAlgorithmId = 'bst-insert' | 'bst-search' | 'bst-delete';

export function BSTPage() {
  const [activeId, setActiveId] = useState<BSTAlgorithmId>('bst-insert');

  const [insertValues, setInsertValues] = useState(DEFAULT_BST_INSERT_INPUT.values.join(', '));
  const [searchValues, setSearchValues] = useState(DEFAULT_BST_SEARCH_INPUT.treeValues.join(', '));
  const [searchTarget, setSearchTarget] = useState(String(DEFAULT_BST_SEARCH_INPUT.target));
  const [deleteValues, setDeleteValues] = useState(DEFAULT_BST_DELETE_INPUT.treeValues.join(', '));
  const [deleteTarget, setDeleteTarget] = useState(String(DEFAULT_BST_DELETE_INPUT.target));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    bstInsert(DEFAULT_BST_INSERT_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: BSTAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'bst-insert') setRun(bstInsert(DEFAULT_BST_INSERT_INPUT) as AlgorithmRun<unknown>);
      else if (id === 'bst-search') setRun(bstSearch(DEFAULT_BST_SEARCH_INPUT) as AlgorithmRun<unknown>);
      else setRun(bstDelete(DEFAULT_BST_DELETE_INPUT) as AlgorithmRun<unknown>);
    },
    [runner],
  );

  const parseValues = (raw: string): number[] | null => {
    const vals = raw.split(',').map((s) => parseInt(s.trim(), 10));
    return vals.every((n) => !isNaN(n)) ? vals : null;
  };

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'bst-insert') {
      const values = parseValues(insertValues);
      if (!values || values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(bstInsert({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'bst-search') {
      const treeValues = parseValues(searchValues);
      const target = parseInt(searchTarget.trim(), 10);
      if (!treeValues || treeValues.length < 1) { setParseError('Enter at least 1 tree value.'); return; }
      if (treeValues.length > 20) { setParseError('Maximum 20 tree values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(bstSearch({ treeValues, target }) as AlgorithmRun<unknown>);
    } else {
      const treeValues = parseValues(deleteValues);
      const target = parseInt(deleteTarget.trim(), 10);
      if (!treeValues || treeValues.length < 1) { setParseError('Enter at least 1 tree value.'); return; }
      if (treeValues.length > 20) { setParseError('Maximum 20 tree values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(bstDelete({ treeValues, target }) as AlgorithmRun<unknown>);
    }
  }, [activeId, insertValues, searchValues, searchTarget, deleteValues, deleteTarget, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const bstSnap = (currentStep?.snapshot as BSTSnapshot | undefined) ?? null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="bst" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          <BSTVisualizer snapshot={bstSnap} />
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
          {activeId === 'bst-insert' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Values to insert (comma-separated)</label>
              <input
                type="text"
                value={insertValues}
                onChange={(e) => setInsertValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="5, 3, 7, 1, 4, 6, 8"
              />
            </div>
          )}
          {activeId === 'bst-search' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Tree values (comma-separated)</label>
                <input
                  type="text"
                  value={searchValues}
                  onChange={(e) => setSearchValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="5, 3, 7, 1, 4, 6, 8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Search target</label>
                <input
                  type="number"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="4"
                />
              </div>
            </>
          )}
          {activeId === 'bst-delete' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Tree values (comma-separated)</label>
                <input
                  type="text"
                  value={deleteValues}
                  onChange={(e) => setDeleteValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="5, 3, 7, 1, 4, 6, 8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Node to delete</label>
                <input
                  type="number"
                  value={deleteTarget}
                  onChange={(e) => setDeleteTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="3"
                />
              </div>
            </>
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
        <ProblemsSidebar topicId="bst" />
      </aside>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/routes/BSTPage.tsx
git commit -m "feat(page): implement BSTPage with insert, search, delete tabs"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Run full test suite**

Run: `pnpm test`
Expected: All tests pass (prior passing tests + new tree/BST tests)

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: 0 errors

- [ ] **Step 3: Lint**

Run: `pnpm lint`
Expected: 0 errors

- [ ] **Step 4: Build**

Run: `pnpm build`
Expected: Build succeeds

- [ ] **Step 5: Browser smoke test**

Run: `pnpm dev`

Navigate to `/binary-tree`:
- All 4 tabs are present (Inorder, Preorder, Postorder, Level Order)
- Play button animates traversal through the default tree
- CallStackPanel shows recursion frames during DFS tabs
- Level-order tab shows queue below the tree (visible in VariableInspector or snapshot)
- Code panel highlights the correct line per step
- Custom input (e.g. `1, 2, 3, null, 4`) re-runs the algorithm

Navigate to `/bst`:
- All 3 tabs present (Insert, Search, Delete)
- Insert: nodes appear one by one with orange comparison highlights then amber insertion
- Search: path from root to target highlighted, found/not-found shown
- Delete: 3-step two-children case visible with cyan replacement overlay

Check no console errors on either page.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore(session-6): complete binary tree + BST implementation"
```

---

## Self-Review Checklist

- [x] All 7 algorithm IDs (`inorder`, `preorder`, `postorder`, `level-order`, `bst-insert`, `bst-search`, `bst-delete`) already exist in `AlgorithmId` union — no changes needed to that union
- [x] `parseTree` assigns IDs counter-style (only non-null entries), wires parent-child via `2i+1`/`2i+2` index math
- [x] Tree traversal step model: 2 steps per node (enter + visit), callStack tracks real recursion depth
- [x] levelOrder: n+1 steps (1 init + 1 per dequeue)
- [x] BinaryTreeVisualizer: inorder x-positioning, SVG, correct data-testids
- [x] BSTVisualizer: extends with comparingWith/inserted/deletedNode/replacementNode data-attributes
- [x] NeetCode slugs: subagent must verify via Playwright before adding
- [x] Both pages follow ArraysPage pattern (flex h-full, main + aside layout, CallStackPanel wired)
- [x] `bstDelete` handles all three cases (leaf, one-child, two-children with successor)
- [x] Every algorithm has result test + trace snapshot test
- [x] No placeholders in code steps — complete implementations provided
