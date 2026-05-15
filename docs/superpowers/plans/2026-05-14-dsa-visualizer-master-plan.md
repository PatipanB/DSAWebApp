# DSA Visualizer — Master Build Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement each session's plan task-by-task. This master document defines architecture, contracts, and session boundaries. Each session has (or will have) its own per-session plan under `docs/superpowers/plans/session-N-*.md` containing bite-sized TDD tasks. Do **not** start a session without writing/reading its session plan first.

**Goal:** Single-page React app that visualizes 9 DSA topics with play/pause/step controls, user-supplied data, real-time code highlighting, Big-O badges, and NeetCode problem links — production polish, dark-mode only.

**Architecture summary:** Pure client SPA. Algorithms run once on input, emit a `Step[]` snapshot array. A central runner state machine plays back snapshots at a configurable cadence. Visualizers are dumb renderers parameterized by the current snapshot. UI shell, controls, code panel, complexity badge, and problems sidebar are shared across topics.

**Tech Stack:** Vite + React + TypeScript (strict) + Tailwind CSS + Framer Motion + Zustand + React Router + prism-react-renderer + Vitest + Testing Library.

> **Version policy:** Do **not** hard-pin versions in this plan. Session 1 scaffolds with `pnpm create vite@latest` and accepts current stable for every dependency, then locks via `pnpm-lock.yaml`. Pinning year-old versions in a planning doc creates day-one tech debt. The package manager is **pnpm** in every session.

---

## 0. Tech Stack Decision: Vite vs Next.js

**Choice: Vite + React + TypeScript.**

| Criterion                         | Vite                                  | Next.js (App Router)                                                                      |
| --------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- |
| Dev HMR speed for animation work  | Instant module HMR                    | Slower; RSC pipeline overhead                                                             |
| Bundle size                       | Minimal                               | Heavier baseline                                                                          |
| SSR / SEO                         | Not needed                            | Strength wasted                                                                           |
| Routing complexity                | React Router is plenty for 9 routes   | App Router introduces RSC/server concepts that conflict with client-heavy animation state |
| Static hosting                    | Trivial (Cloudflare/Netlify/GH Pages) | Requires Node runtime or static export gymnastics                                         |
| TS / Tailwind / Framer ergonomics | First-class                           | First-class but more config                                                               |
| Backend?                          | None needed                           | None needed                                                                               |

**Verdict:** This app is 100% client-side, animation- and state-heavy, with no SEO or server-data needs. Next.js's signature features (SSR, RSC, route handlers, ISR) provide zero value here and the App Router's client/server boundary actively gets in the way of Framer Motion + Zustand. Vite wins on simplicity, dev-loop speed, and deployment.

---

## 1. Final Folder Structure

```
DSAWebApp/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── router.tsx
│   ├── routes/
│   │   ├── HomePage.tsx
│   │   ├── ArraysPage.tsx
│   │   ├── StackQueuePage.tsx
│   │   ├── LinkedListPage.tsx
│   │   ├── BinaryTreePage.tsx
│   │   ├── BSTPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── SortingPage.tsx
│   │   ├── HashTablePage.tsx
│   │   └── DPPage.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── TopicNav.tsx
│   │   ├── controls/
│   │   │   ├── PlaybackControls.tsx
│   │   │   ├── SpeedSlider.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── InputPanel.tsx
│   │   │   └── AlgorithmTabs.tsx
│   │   ├── panels/
│   │   │   ├── CodePanel.tsx
│   │   │   ├── ComplexityBadge.tsx
│   │   │   ├── ProblemsSidebar.tsx
│   │   │   ├── StepNarration.tsx          # aria-live="polite"
│   │   │   ├── VariableInspector.tsx
│   │   │   ├── CallStackPanel.tsx         # recursion frames for tree/graph/DP
│   │   │   ├── KeyInsightCallout.tsx      # one-sentence mental-model per algorithm
│   │   │   └── TopicHeader.tsx
│   │   ├── visualizers/
│   │   │   ├── ArrayVisualizer.tsx
│   │   │   ├── StackVisualizer.tsx
│   │   │   ├── QueueVisualizer.tsx
│   │   │   ├── LinkedListVisualizer.tsx
│   │   │   ├── BinaryTreeVisualizer.tsx
│   │   │   ├── BSTVisualizer.tsx
│   │   │   ├── GraphGridVisualizer.tsx
│   │   │   ├── GraphAdjacencyVisualizer.tsx
│   │   │   ├── SortingVisualizer.tsx
│   │   │   ├── HashTableChainingVisualizer.tsx
│   │   │   ├── HashTableOpenAddressingVisualizer.tsx
│   │   │   └── DPTableVisualizer.tsx
│   │   └── primitives/
│   │       ├── Button.tsx
│   │       ├── Slider.tsx
│   │       ├── Tabs.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Cell.tsx
│   │       ├── Pointer.tsx
│   │       ├── Arrow.tsx
│   │       └── Badge.tsx
│   ├── engine/
│   │   ├── types.ts
│   │   ├── runner.ts
│   │   ├── useAlgorithmRun.ts
│   │   └── README.md
│   ├── algorithms/
│   │   ├── index.ts                       # AlgorithmId -> runner function registry
│   │   ├── arrays/
│   │   │   ├── twoPointers.ts
│   │   │   └── slidingWindow.ts
│   │   ├── stackQueue/
│   │   │   ├── balancedBrackets.ts
│   │   │   └── monotonicStack.ts
│   │   ├── linkedList/
│   │   │   ├── singlyTraverse.ts
│   │   │   ├── singlyInsertDelete.ts
│   │   │   └── doublyTraverse.ts
│   │   ├── tree/
│   │   │   ├── inorder.ts
│   │   │   ├── preorder.ts
│   │   │   ├── postorder.ts
│   │   │   └── levelOrder.ts
│   │   ├── bst/
│   │   │   ├── insert.ts
│   │   │   ├── search.ts
│   │   │   └── delete.ts
│   │   ├── graph/
│   │   │   ├── bfsGrid.ts
│   │   │   ├── dfsGrid.ts
│   │   │   ├── bfsAdjacency.ts
│   │   │   └── dfsAdjacency.ts
│   │   ├── sorting/
│   │   │   ├── bubble.ts
│   │   │   ├── merge.ts
│   │   │   ├── quick.ts
│   │   │   └── heap.ts
│   │   ├── hashTable/
│   │   │   ├── chaining.ts
│   │   │   └── openAddressing.ts
│   │   └── dp/
│   │       ├── fibonacci.ts
│   │       ├── knapsack01.ts
│   │       └── lcs.ts
│   ├── store/
│   │   ├── runStore.ts
│   │   ├── topicStore.ts
│   │   └── prefsStore.ts
│   ├── hooks/
│   │   ├── useKeyboardControls.ts
│   │   ├── useRafTicker.ts
│   │   └── useResizeObserver.ts
│   ├── data/
│   │   ├── topics.ts
│   │   ├── codeSnippets.ts
│   │   ├── complexities.ts
│   │   ├── neetcodeProblems.ts
│   │   └── defaultInputs.ts
│   ├── types/
│   │   ├── topic.ts
│   │   ├── algorithm.ts
│   │   ├── snapshots.ts
│   │   └── problems.ts
│   ├── utils/
│   │   ├── parseArray.ts
│   │   ├── parseTree.ts
│   │   ├── parseGraph.ts
│   │   ├── classNames.ts
│   │   └── ids.ts                         # stable id generator
│   └── constants/
│       ├── colors.ts
│       ├── motion.ts
│       └── speeds.ts
├── tests/
│   ├── algorithms/                        # one test file per algorithm
│   ├── engine/
│   │   └── runner.test.ts
│   └── utils/
│       ├── parseArray.test.ts
│       └── parseTree.test.ts
├── docs/
│   └── superpowers/
│       └── plans/
│           ├── 2026-05-14-dsa-visualizer-master-plan.md   # this file
│           ├── session-1-skeleton.md
│           ├── session-2a-engine-core.md
│           ├── session-2b-shared-panels.md
│           ├── session-3-stack-queue.md
│           ├── session-4-linked-list.md
│           ├── session-5-trees-bst.md
│           ├── session-6-graph.md
│           ├── session-7-sorting.md
│           └── session-8-hashtable-dp-polish.md
├── .claude/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

**Layout philosophy:** Files that change together live together (e.g., all primitives in `primitives/`, all visualizers in `visualizers/`). Per-topic _route_ is a thin layout; the topic-specific work lives in `algorithms/<topic>` and `visualizers/<Topic>Visualizer.tsx`. Shared infrastructure (engine, controls, panels) is shared on purpose — adding a 10th topic means: write algorithm files, write one visualizer, add a route, add data entries. No new shell code.

---

## 2. Component Map (per topic)

Every topic page follows the same three-region layout, composed from shared components:

```
┌──────────────────────────────────────────────────────┐
│ TopBar (logo, topic title, theme indicator)          │
├──────────┬──────────────────────────┬────────────────┤
│ Sidebar  │ <TopicVisualizer/>       │ ProblemsSidebar│
│ TopicNav │ (per-topic)              │ (shared)       │
│ (shared) │                          │                │
│          ├──────────────────────────┤                │
│          │ StepNarration (shared)   │                │
│          ├──────────────────────────┤                │
│          │ PlaybackControls +       │                │
│          │ SpeedSlider +            │                │
│          │ ProgressBar (shared)     │                │
│          ├──────────────────────────┤                │
│          │ AlgorithmTabs (shared)   │                │
│          │ InputPanel (shared)      │                │
│          ├──────────────────────────┤                │
│          │ CodePanel +              │                │
│          │ ComplexityBadge +        │                │
│          │ VariableInspector        │                │
│          │ (all shared)             │                │
└──────────┴──────────────────────────┴────────────────┘
```

| Topic         | Container        | Visualizer(s)                                                      | Algorithms exposed in tabs                         |
| ------------- | ---------------- | ------------------------------------------------------------------ | -------------------------------------------------- |
| Arrays        | `ArraysPage`     | `ArrayVisualizer`                                                  | twoPointers, slidingWindow                         |
| Stack & Queue | `StackQueuePage` | `StackVisualizer`, `QueueVisualizer`                               | balancedBrackets, monotonicStack, queueDemo        |
| Linked List   | `LinkedListPage` | `LinkedListVisualizer`                                             | singlyTraverse, singlyInsertDelete, doublyTraverse |
| Binary Tree   | `BinaryTreePage` | `BinaryTreeVisualizer`                                             | inorder, preorder, postorder, levelOrder           |
| BST           | `BSTPage`        | `BSTVisualizer`                                                    | insert, search, delete                             |
| Graph         | `GraphPage`      | `GraphGridVisualizer`, `GraphAdjacencyVisualizer` (toggle)         | bfsGrid, dfsGrid, bfsAdjacency, dfsAdjacency       |
| Sorting       | `SortingPage`    | `SortingVisualizer` (step + race modes)                            | bubble, merge, quick, heap                         |
| Hash Table    | `HashTablePage`  | `HashTableChainingVisualizer`, `HashTableOpenAddressingVisualizer` | chaining, openAddressing                           |
| DP            | `DPPage`         | `DPTableVisualizer`                                                | fibonacci, knapsack01, lcs                         |

Shared (every page uses, no per-topic variant): `CodePanel`, `ComplexityBadge`, `ProblemsSidebar`, `PlaybackControls`, `SpeedSlider`, `ProgressBar`, `StepNarration`, `VariableInspector`, `CallStackPanel`, `KeyInsightCallout`, `AlgorithmTabs`, `InputPanel`, `TopicHeader`.

`CallStackPanel` is shown only when the current snapshot exposes a `callStack` array (tree traversals, DFS, recursive DP). It renders frames top-to-bottom with the topmost frame highlighted as "current".

`KeyInsightCallout` is a one-sentence collapsible callout below `TopicHeader` showing the mental model for the active algorithm (e.g., two-pointers: _"Move the pointer pointing to the smaller end inward — the other end can never produce a larger product"_). Content lives in `src/data/keyInsights.ts`.

---

## 3. Shared Infrastructure

### 3.1 Animation Engine — snapshot array (NOT generator)

**Decision: pre-computed `Step[]` array, not a generator/coroutine.**

Reasons:

- **Time-travel & scrubbing** — `stepIndex` is just an integer; step-backward is `setStepIndex(i - 1)`. Generators can't run in reverse.
- **Determinism** — the same input always produces the same array. Trivial to test (snapshot equality).
- **Lookahead UI** — `totalSteps` is known immediately, so the progress bar and "10 of 47" indicator just work.
- **No async coupling** — algorithms are pure functions, easy to unit test without React.

Trade-off: very large inputs produce many snapshots. Mitigated by (a) capping input sizes in `InputPanel` validation (e.g., array ≤ 30, tree ≤ 31 nodes, grid ≤ 25×25) and (b) using shallow-cloned snapshots so unchanged sub-objects share references.

#### What counts as one step? (Canonical rule)

> **One step = one observable state change a learner should pause to read.**

This rule applies uniformly across every algorithm. Concretely, emit a step when **any** of these changes:

- A named pointer or index moves (e.g., `l++`, `r--`, `curr = curr.next`).
- A data structure mutates (push, pop, swap, link rewired, table cell filled, bucket inserted, node visited).
- A comparison result is decided (e.g., `arr[l] + arr[r] < target` — emit _before_ the branch so the learner can predict).
- A recursive call is entered or returned from (push/pop on `callStack`).
- An invariant tracked in `VariableInspector` materially changes (e.g., `sum`, `windowMax`, `count`).

Do **not** emit a step for:

- Internal arithmetic that doesn't change visible state (e.g., computing `mid = (l+r) >> 1` and then immediately using it once — combine into the comparison step).
- Loop boilerplate (`for (let i = 0; i < n; i++)` increment is implicit in the pointer-move step).
- Re-reading the same value twice in a row.

**Guardrail:** if two consecutive steps render an identical snapshot and identical `line`, collapse them — that's a bug in the algorithm's instrumentation.

#### Algorithm test contract (trace + result)

For every algorithm in `src/algorithms/**/*.ts`, the matching test in `tests/algorithms/**` MUST do BOTH:

1. **Result test:** assert `run.finalResult` matches the known answer for a fixed input.
2. **Trace snapshot test:** call `expect(serializeRun(run)).toMatchSnapshot()` where `serializeRun` produces a stable string summary of every step (line, narration, pointer positions, mutations) — not the full snapshot objects (which contain ids that may shift). This catches the "right answer, wrong intermediate steps" regression — exactly the bug class that ruins the learning value.

Result-only tests are forbidden for algorithm files. CI should fail if any algorithm test imports `expect(result).toBe(...)` without also calling `toMatchSnapshot` on its trace.

A serialization helper for snapshots lives at `src/engine/serializeRun.ts` and is itself unit-tested.

### 3.2 Core Types

```ts
// src/engine/types.ts

export interface Step<Snapshot> {
  snapshot: Snapshot; // full state at this step
  line: number; // 1-based line in the displayed source
  narration: string; // human-readable one-liner
  variables?: Record<string, unknown>; // e.g. { i: 2, j: 5, sum: 14 }
}

export interface AlgorithmRun<Snapshot> {
  algorithmId: AlgorithmId;
  steps: Step<Snapshot>[];
  initialInput: unknown;
  finalResult?: unknown;
}

export type AlgorithmRunner<Input, Snapshot> = (input: Input) => AlgorithmRun<Snapshot>;

export type RunnerState = 'idle' | 'playing' | 'paused' | 'done';
```

Algorithms are written using a small builder to keep them ergonomic:

```ts
// inside an algorithm file
const r = createRunBuilder<ArraySnapshot>('two-pointers');
r.push({
  line: 1,
  narration: 'Initialize left and right pointers',
  snapshot: {
    values,
    pointers: [
      { name: 'l', index: 0, color: 'cyan' },
      { name: 'r', index: values.length - 1, color: 'amber' },
    ],
  },
  variables: { l: 0, r: values.length - 1 },
});
// ...
return r.build(finalResult);
```

### 3.3 Runner State Machine

`src/engine/runner.ts` exposes a framework-agnostic class:

```ts
class Runner {
  state: RunnerState;
  stepIndex: number;
  totalSteps: number;
  speedMs: number;
  play(): void;
  pause(): void;
  stepForward(): void;
  stepBack(): void;
  reset(): void;
  setSpeed(ms: number): void;
  setSteps(steps: Step<unknown>[]): void;
  onChange(listener: () => void): () => void; // returns unsubscribe
}
```

Internally uses **`requestAnimationFrame` + accumulator**:

- Each frame accumulates `deltaMs`; when accumulator ≥ `speedMs`, advance one step and subtract.
- When `stepIndex === totalSteps - 1`, transition to `done` and stop the RAF loop.
- `setSpeed` updates without restarting the loop.

`src/engine/useAlgorithmRun.ts` wraps the runner in a React hook that pushes `stepIndex` and `state` into `runStore` (Zustand) so any component can subscribe to changes without prop drilling.

### 3.4 Speed Control

Speeds in `src/constants/speeds.ts`:

```ts
export const SPEED_PRESETS = [
  { label: '0.25×', ms: 2000 },
  { label: '0.5×', ms: 1000 },
  { label: '1×', ms: 500 },
  { label: '2×', ms: 250 },
  { label: '4×', ms: 100 },
] as const;
```

`SpeedSlider` is a 5-position discrete slider (not continuous) — predictable, accessible, and matches the 5 presets. Default index = 2 (1×).

### 3.5 Code Highlighter

- **Source shown is hand-authored**, not extracted from the instrumented algorithm files. The instrumented files are noisy (they call `r.push(...)` constantly); the displayed code is the "clean" version.
- Stored in `src/data/codeSnippets.ts` as `Record<AlgorithmId, { language: 'ts' | 'py'; lines: string[] }>`. Each algorithm has matching `ts` and `py` snippets; user toggles language in `CodePanel`.
- Use **`prism-react-renderer`** for tokenization — no async loading, ~10kB gzipped, supports TS + Python out of the box.
- `CodePanel` receives `currentLine: number` (from current step) and renders:
  - Line numbers in a gutter (text-slate-500)
  - Active line: full-width `bg-amber-400/10` band + a left-edge `border-l-2 border-amber-400`
  - Token colors derived from the prism theme overridden to fit the dark palette.
- **Critical contract:** the `line` number an algorithm emits must reference the displayed snippet, not the instrumented source. Each algorithm file has the displayed snippet's `lines` literally written inline as a comment so a maintainer can verify alignment.

### 3.6 Theme — Dark Mode Only

`tailwind.config.ts` extends `theme.colors` with semantic tokens. **Always use semantic tokens, never raw Tailwind palette classes in components.**

```ts
// tailwind.config.ts (excerpt)
extend: {
  colors: {
    bg:        { base: '#020617', surface: '#0f172a', elevated: '#1e293b' },
    border:    { subtle: '#1e293b', strong: '#334155' },
    text:      { primary: '#f1f5f9', secondary: '#cbd5e1', muted: '#94a3b8' },
    accent:    { primary: '#fbbf24', secondary: '#22d3ee' },   // amber / cyan
    status:    { success: '#34d399', warn: '#fb923c', danger: '#fb7185', info: '#60a5fa' },
  },
  fontFamily: {
    sans: ['Inter Variable', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono Variable', 'ui-monospace', 'monospace'],
  },
},
```

Semantic role mapping (used consistently across all visualizers):

- **Idle cell / node:** `bg-bg-elevated text-text-primary border-border-subtle`
- **Active / current focus:** `bg-accent-primary text-bg-base` (amber)
- **Pointer / secondary focus:** ring `ring-2 ring-accent-secondary` (cyan)
- **Comparing:** `bg-status-warn/30 border-status-warn`
- **Swapped / just-changed:** `bg-status-danger/30 border-status-danger`
- **Visited / sorted / done:** `bg-status-success/20 border-status-success`
- **Unreachable / blocked (graph walls):** `bg-border-strong`

Fonts loaded via `@fontsource-variable/inter` and `@fontsource-variable/jetbrains-mono` (npm packages, no external CDN).

`<html class="dark">` is hard-coded in `index.html`. No theme toggle.

---

## 4. Data Layer — Snapshot types and defaults

All snapshot types live in `src/types/snapshots.ts`. Each algorithm runner returns `AlgorithmRun<TheRightSnapshot>`.

### 4.1 Arrays

```ts
export interface ArrayPointer {
  name: string;
  index: number;
  color: 'cyan' | 'amber' | 'rose';
}
export interface ArraySnapshot {
  values: number[];
  pointers: ArrayPointer[];
  window?: { start: number; end: number };
  sum?: number;
  result?: number | number[];
}
```

A step: pointer moves, window expands, sum updates. Default input: `[1, 2, 3, 4, 6, 8, 11, 15]`, target=11 (two-pointer); `[2, 1, 5, 1, 3, 2]`, k=3 (sliding window).

### 4.2 Stack & Queue

```ts
export interface StackItem {
  id: string;
  value: string | number;
}
export interface StackSnapshot {
  items: StackItem[]; // top of stack = items[items.length-1]
  inputCursor?: number; // index in input being processed
  inputTokens?: string[]; // visible input above the stack
  matched?: { open: string; close: string };
  invalid?: boolean;
  result?: (number | null)[]; // for monotonic next-greater
}

export interface QueueSnapshot {
  items: StackItem[]; // front = items[0]
  head: number;
  tail: number;
}
```

Default inputs: balanced brackets `"([{}])"`, monotonic stack next-greater `[2, 1, 2, 4, 3]`.

### 4.3 Linked List

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
  tailId?: string | null; // doubly
  pointers: { name: string; nodeId: string | null; color: 'cyan' | 'amber' | 'rose' }[];
  doubly: boolean;
}
```

Default input: `[1, 2, 3, 4]`. Operations: traverse, insertAtHead, deleteByValue, reverse.

### 4.4 Binary Tree

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
  visited: string[]; // ordered output (e.g., inorder)
  callStack?: string[]; // recursion stack (node ids)
  queue?: string[]; // for level-order
}
```

Default input: `[1, 2, 3, 4, 5, null, 6]` (level-order). Layout computed in `BinaryTreeVisualizer` via a simple width-allotment algorithm (each subtree claims width proportional to its leaf count).

### 4.5 BST

```ts
export interface BSTSnapshot extends TreeSnapshot {
  comparingWith?: string; // node we're comparing against
  comparingValue?: number; // the value we're inserting/searching/deleting
  inserted?: string; // newly inserted node id
  deletedNode?: string;
  replacementNode?: string; // for delete: successor or predecessor
}
```

Default insert sequence: `[8, 3, 10, 1, 6, 14, 4, 7, 13]`.

### 4.6 Graph

Two snapshot types, since grid and adjacency are visually distinct:

```ts
export type GridCell =
  | 'open'
  | 'wall'
  | 'start'
  | 'end'
  | 'visited'
  | 'frontier'
  | 'path'
  | 'current';
export interface GridSnapshot {
  rows: number;
  cols: number;
  cells: GridCell[][];
  current?: [number, number];
  distance?: number[][]; // optional, for BFS distance overlay
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}
export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
}
export interface AdjacencySnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startId: string;
  visited: string[];
  frontier: string[];
  current: string | null;
  edgeStates: Record<string, 'idle' | 'traversed' | 'tree'>;
}
```

Default grid: 10×10 with hand-picked walls, start at (0,0), end at (9,9). Default adjacency: 6-node graph, hand-positioned in `defaultInputs.ts`.

### 4.7 Sorting

```ts
export interface SortingSnapshot {
  values: number[];
  comparing: number[]; // indices currently compared
  swapped: number[]; // indices just swapped this step
  sorted: number[]; // indices in final position
  pivot?: number; // quicksort
  subarray?: { start: number; end: number };
  auxArray?: number[]; // merge sort
  heapBoundary?: number; // heap sort: index of last heap element
}
```

Default input: `[5, 2, 8, 1, 9, 3, 7, 4, 6]`. Race mode runs all four runners on the same input and renders four `SortingVisualizer`s in a 2×2 grid, all driven by the same shared `stepIndex`.

### 4.8 Hash Table

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
  probeSequence?: number[]; // indices visited in order
}
```

Default keys/values: `[("apple","🍎"),("banana","🍌"),("cherry","🍒"),("date","🌴"),("elder","🫐"),("fig","🍇")]`, bucket count 7 (so collisions occur).

### 4.9 DP

```ts
export interface DPSnapshot {
  table: (number | null)[][]; // null = uncomputed
  current?: [number, number]; // cell being filled
  reading?: [number, number][]; // cells consulted by recurrence
  rowLabels?: string[]; // e.g. characters of string A
  colLabels?: string[]; // characters of string B
  answer?: number;
  recursionTree?: { id: string; label: string; cached: boolean; parentId: string | null }[]; // Fibonacci
  traceback?: [number, number][]; // LCS path
}
```

Defaults: fib n=8; knapsack weights `[2,3,4,5]` values `[3,4,5,6]` cap=5; LCS `"ABCBDAB"` vs `"BDCABA"`.

### 4.10 Complexity entries

`src/data/complexities.ts` shape (NOT a flat string — flattening loses Quicksort's average-vs-worst story which is itself a learning moment):

```ts
export interface ComplexityEntry {
  time: { best: string; average: string; worst: string };
  space: string;
  notes?: string; // optional one-liner, e.g. "Worst case occurs on already-sorted input with naive pivot."
}
export const COMPLEXITIES: Record<AlgorithmId, ComplexityEntry>;
```

`ComplexityBadge` renders best/avg/worst as three small badges side-by-side (with tooltips); when all three are equal it collapses to one badge. Space is a separate row.

Example:

```ts
'quick-sort': {
  time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
  space: 'O(log n)',
  notes: 'Worst case on already-sorted input with naive (first/last) pivot; mitigated by randomized pivot.'
}
```

---

## 5. NeetCode Problem Mapping

Each entry: title — slug (LeetCode/NeetCode share slugs) — one-line "how the visualizer helps." All slugs verified against neetcode.io and leetcode.com naming conventions. Each link will be rendered as `https://neetcode.io/problems/<slug>`.

### 5.1 Arrays — Two Pointers & Sliding Window

**Beginner:**

1. Two Sum — `two-sum` — _Watch the hash table grow as the array is scanned (also seen in the Hash Table topic)._
2. Valid Palindrome — `valid-palindrome` — _Two cyan/amber pointers converging is exactly the trace you need._
3. Two Sum II – Input Array Is Sorted — `two-sum-ii-input-array-is-sorted` — _Mirrors the default two-pointer example._
4. Best Time to Buy and Sell Stock — `best-time-to-buy-and-sell-stock` — _Visualizer's sliding-window mode shows the running min/max._
5. Contains Duplicate — `contains-duplicate` — _Cross-references the Hash Table topic._

**Advanced:**

1. Container With Most Water — `container-with-most-water` — _Two pointers + a max-area variable in the inspector._
2. 3Sum — `3sum` — _Outer loop + inner two-pointer pass, both visible at once._
3. Trapping Rain Water — `trapping-rain-water` — _Left/right max running maxima rendered as height bars over the array._
4. Longest Substring Without Repeating Characters — `longest-substring-without-repeating-characters` — _Variable-size window with a set highlighted in `VariableInspector`._
5. Minimum Window Substring — `minimum-window-substring` — _Window grows/shrinks; the "need" map is shown live._

### 5.2 Stack & Queue

**Beginner:**

1. Valid Parentheses — `valid-parentheses` — _Default example; watch open brackets push and matching ones pop._
2. Min Stack — `min-stack` — _Auxiliary stack visualized side-by-side with the main one._
3. Evaluate Reverse Polish Notation — `evaluate-reverse-polish-notation` — _Stack visualizer shows operator application directly._
4. Implement Queue using Stacks — `implement-queue-using-stacks` — _Two stack visualizers side-by-side make the trick obvious._
5. Baseball Game — `baseball-game` — _Stack push/pop on string tokens — trivial extension of bracket demo._

**Advanced:**

1. Daily Temperatures — `daily-temperatures` — _Monotonic stack default example, decreasing variant._
2. Next Greater Element II — `next-greater-element-ii` — _Same monotonic-stack visualization on a circular array._
3. Largest Rectangle in Histogram — `largest-rectangle-in-histogram` — _Monotonic stack with width calculation in `VariableInspector`._
4. Car Fleet — `car-fleet` — _Stack of arrival times; comparing top vs current shown step by step._
5. Sliding Window Maximum — `sliding-window-maximum` — _Monotonic deque variant — uses Queue visualizer with double-ended ops._

### 5.3 Linked List

**Beginner:**

1. Reverse Linked List — `reverse-linked-list` — _Three pointers (prev/curr/next) animated through reversal._
2. Merge Two Sorted Lists — `merge-two-sorted-lists` — _Two pointer cursors plus a builder tail pointer._
3. Linked List Cycle — `linked-list-cycle` — _Fast/slow tortoise-and-hare pointers on a list that loops back._
4. Remove Nth Node from End of List — `remove-nth-node-from-end-of-list` — _Two pointers spaced n apart traverse together._
5. Reorder List — `reorder-list` — _Compose three sub-operations the visualizer already supports: midpoint + reverse + merge._

**Advanced:**

1. Copy List with Random Pointer — `copy-list-with-random-pointer` — _Original + copy lists rendered simultaneously, random arrows drawn._
2. Add Two Numbers — `add-two-numbers` — _Two cursors plus carry variable in inspector._
3. Find the Duplicate Number — `find-the-duplicate-number` — _Floyd's cycle detection — same fast/slow visualizer reused._
4. LRU Cache — `lru-cache` — _Doubly linked list + hash map, both panels in view._
5. Reverse Nodes in k-Group — `reverse-nodes-in-k-group` — _Repeated sub-reversal over partitioned chunks._

### 5.4 Binary Tree (Traversals)

**Beginner:**

1. Invert Binary Tree — `invert-binary-tree` — _Post-order traversal swapping children; visualized live._
2. Maximum Depth of Binary Tree — `maximum-depth-of-binary-tree` — _DFS callstack depth shown next to `visited` list._
3. Same Tree — `same-tree` — _Two trees rendered side-by-side, synchronized traversal._
4. Subtree of Another Tree — `subtree-of-another-tree` — _Reuses Same Tree at each node of the host tree._
5. Diameter of Binary Tree — `diameter-of-binary-tree` — _Post-order with a max variable in `VariableInspector`._

**Advanced:**

1. Binary Tree Level Order Traversal — `binary-tree-level-order-traversal` — _Default level-order example with queue rendered below the tree._
2. Binary Tree Right Side View — `binary-tree-right-side-view` — _Level-order with last-of-level highlighting._
3. Count Good Nodes in Binary Tree — `count-good-nodes-in-binary-tree` — _Preorder with running max in inspector._
4. Binary Tree Maximum Path Sum — `binary-tree-maximum-path-sum` — _Postorder + a global max; cells annotated with returned values._
5. Serialize and Deserialize Binary Tree — `serialize-and-deserialize-binary-tree` — _Pre/level-order serialization string built up step by step._

### 5.5 BST

**Beginner:**

1. Search in a Binary Search Tree — `search-in-a-binary-search-tree` — _Default search example._
2. Insert into a Binary Search Tree — `insert-into-a-binary-search-tree` — _Default insert example._
3. Lowest Common Ancestor of a BST — `lowest-common-ancestor-of-a-binary-search-tree` — _Comparison pointer traces down to LCA._
4. Range Sum of BST — `range-sum-of-bst` — _Pruned DFS — pruned subtrees fade in the visualizer._
5. Minimum Distance Between BST Nodes — `minimum-distance-between-bst-nodes` — _Inorder traversal showing successive-pair diffs._

**Advanced:**

1. Validate Binary Search Tree — `validate-binary-search-tree` — _Inorder visualization makes the "must be sorted" invariant obvious._
2. Kth Smallest Element in a BST — `kth-smallest-element-in-a-bst` — _Inorder traversal with a counter in `VariableInspector`._
3. Delete Node in a BST — `delete-node-in-a-bst` — _Default delete operation handles all three cases (leaf/one-child/two-child)._
4. Recover Binary Search Tree — `recover-binary-search-tree` — _Inorder traversal exposes the swapped pair._
5. Balance a Binary Search Tree — `balance-a-binary-search-tree` — _Inorder to sorted array, then rebuild — both stages animated._

### 5.6 Graph

**Beginner:**

1. Number of Islands — `number-of-islands` — _Grid BFS/DFS on connected components — defaults exactly fit._
2. Max Area of Island — `max-area-of-island` — _Same DFS with a size counter._
3. Clone Graph — `clone-graph` — _Adjacency-list BFS with a "visited → cloned" map shown._
4. Flood Fill — `flood-fill` — _Grid BFS/DFS recoloring cells._
5. Rotting Oranges — `rotting-oranges` — _Multi-source BFS — frontier expands from multiple cells simultaneously._

**Advanced:**

1. Pacific Atlantic Water Flow — `pacific-atlantic-water-flow` — _Two BFS passes from opposite borders; intersection highlighted._
2. Course Schedule — `course-schedule` — _Topological sort with in-degree counter (extension topic)._
3. Word Ladder — `word-ladder` — _Adjacency BFS where edges connect strings differing by one letter._
4. Network Delay Time — `network-delay-time` — _Dijkstra (weighted) — extension; the adjacency visualizer can show distance labels._
5. Alien Dictionary — `alien-dictionary` — _Topological sort over inferred character edges._

### 5.7 Sorting

**Beginner:**

1. Sort an Array — `sort-an-array` — _Use the merge or quick visualizer to write the solution._
2. Sort Colors — `sort-colors` — _Three-pointer Dutch-flag — overlays cleanly on the array visualizer._
3. Merge Sorted Array — `merge-sorted-array` — _Reverse two-pointer merge — visualized in array topic too._
4. Height Checker — `height-checker` — _Sort + compare — diff bars highlighted._
5. Relative Sort Array — `relative-sort-array` — _Custom comparator visualization (bucket then sort tail)._

**Advanced:**

1. Kth Largest Element in an Array — `kth-largest-element-in-an-array` — _Use heap visualizer's heapify + extract loop, or quickselect on the sort visualizer._
2. Merge Intervals — `merge-intervals` — _Sort phase visualized, then linear scan with current/last interval highlighted._
3. Largest Number — `largest-number` — _Quicksort with a custom comparator (string concat compare)._
4. Count of Smaller Numbers After Self — `count-of-smaller-numbers-after-self` — _Merge sort with index tracking — auxiliary panel shows counts._
5. Reverse Pairs — `reverse-pairs` — _Modified merge sort — pair counter in inspector._

### 5.8 Hash Table

**Beginner:**

1. Contains Duplicate — `contains-duplicate` — _Insertion into chaining visualizer until collision = duplicate._
2. Valid Anagram — `valid-anagram` — _Two count maps shown side by side._
3. Two Sum — `two-sum` — _Lookup-then-insert pattern, clearly animated._
4. Group Anagrams — `group-anagrams` — _Bucket-key = sorted string; chaining visualizer shows the grouping naturally._
5. Top K Frequent Elements — `top-k-frequent-elements` — _Frequency map + bucket sort; combines hash table with sorting._

**Advanced:**

1. Longest Consecutive Sequence — `longest-consecutive-sequence` — _Set membership lookups during sequence-walk; cyan ring = "in set"._
2. Subarray Sum Equals K — `subarray-sum-equals-k` — _Prefix-sum map; insertion + lookup interleaved._
3. 4Sum II — `4sum-ii` — _Map of pairwise sums; lookups visualized against insertions._
4. Design HashMap — `design-hashmap` — _Implement chaining/open-addressing — the visualizer is the spec._
5. Insert Delete GetRandom O(1) — `insert-delete-getrandom-o1` — _Hash map + array pairing; both panels rendered._

### 5.9 Dynamic Programming

**Beginner (1D):**

1. Climbing Stairs — `climbing-stairs` — _DP table is a single row; tabulation fill matches the visualizer exactly._
2. Min Cost Climbing Stairs — `min-cost-climbing-stairs` — _1D table with two reads per cell — reading-cells highlight in the visualizer._
3. House Robber — `house-robber` — _1D table; recurrence reads cells [i-1] and [i-2]._
4. House Robber II — `house-robber-ii` — _Run house-robber twice on slices — both runs animated._
5. Maximum Subarray — `maximum-subarray` — _Kadane's = DP with a running max in the inspector._

**Advanced (2D / Interval):**

1. Partition Equal Subset Sum — `partition-equal-subset-sum` — _2D knapsack — uses the default knapsack visualizer._
2. Longest Common Subsequence — `longest-common-subsequence` — _Default LCS example with traceback._
3. Edit Distance — `edit-distance` — _2D table; three reading-cells per recurrence (insert/delete/replace)._
4. Longest Increasing Subsequence — `longest-increasing-subsequence` — _1D table O(n²) version; visualizer shows the j-scan for each i._
5. Coin Change — `coin-change` — _Unbounded knapsack variant; 1D table reusable._

The data file `src/data/neetcodeProblems.ts` will serialize the above as:

```ts
export interface Problem {
  title: string;
  slug: string; // appended to https://neetcode.io/problems/
  difficulty: 'beginner' | 'advanced';
  hint: string; // the one-liner above
}
export const NEETCODE_PROBLEMS: Record<TopicId, Problem[]>;
```

---

## 6. Build Order — 9 Sessions

Each session ends with a green test suite, a working visible feature in the browser, and a written hand-off note in `docs/superpowers/plans/session-N-*.md`. Sessions assume TDD per §3.1's algorithm-test contract: every algorithm has both a result test and a trace snapshot test.

> **Why 9 sessions, not 7:** the original Session 2 stuffed engine + 10+ shared panels + first algorithm + ArrayVisualizer into one session — too much surface area to keep coherent. Split into 2a (bare-bones loop) and 2b (full panels). Similarly, Session 4 (linked list + tree + BST + tree parser + tree layout algorithm) was over-scoped; linked list gets its own session.

### Session 1 — Skeleton, Theme, Routing, Topic Grid

**Builds:** Vite scaffolding (current stable, not pinned); Tailwind tokens; React Router with 9 routes (placeholder pages); `AppShell`, `Sidebar`, `TopBar`, `TopicNav`; `HomePage` with 9 topic cards; primitives (`Button`, `Slider`, `Tabs`, `Tooltip`, `Badge`); Zustand stores stubbed (`prefsStore`, `topicStore`); basic GitHub Actions CI running `lint`, `typecheck`, `test`, `build`.
**Files created:** Everything under `src/components/layout/`, `src/components/primitives/`, `src/routes/HomePage.tsx`, stub files in `src/routes/*Page.tsx` (each just renders `<TopicHeader/>` + "Coming soon"), `src/router.tsx`, `src/store/topicStore.ts`, `src/store/prefsStore.ts`, `src/data/topics.ts`, `.github/workflows/ci.yml`, config files, `index.html`, `package.json`.
**Test at end:** `pnpm dev` opens a dark-themed home page; sidebar shows all 9 topics; clicking each navigates to its placeholder page; visual style matches the palette. CI passes on the first commit.
**Handoff to Session 2a:** `src/data/topics.ts` lists every TopicId, AlgorithmId, and route. Engine and `algorithms/` are empty. Visualizer slots in topic pages are empty `<div>`s with `data-testid="visualizer-slot"`.

### Session 2a — Engine Core + Bare-Bones Playback Loop (Arrays / Two-Pointers)

**Builds:** `engine/types.ts`, `engine/runner.ts`, `engine/useAlgorithmRun.ts`, `engine/serializeRun.ts`; `runStore.ts`; `useKeyboardControls`, `useRafTicker`; **only the minimum panels needed for a working playback loop**: `PlaybackControls`, `SpeedSlider`, `ProgressBar`; `algorithms/arrays/twoPointers.ts`; `ArrayVisualizer` (renders `ArraySnapshot`, pointer + cell animation); `tests/algorithms/twoPointers.test.ts` with both a result test and trace snapshot test; `tests/engine/runner.test.ts` covering play/pause/step/reset/speed.
**Files modified:** `src/routes/ArraysPage.tsx`.
**Test at end:** Open `/arrays`, enter `1,2,3,4,6,8,11,15` with target `11`, press play, watch left/right pointers converge. Speed slider works. Space toggles play/pause; arrow keys step. **Other panels (code, complexity, problems) are NOT yet present** — this session proves the loop only.
**Handoff to Session 2b:** Engine + runner are stable. `engine/README.md` documents the algorithm authoring pattern. The "what is a step" rule from §3.1 is enforced by lint comment / code review.

### Session 2b — Full Shared Panels (Code, Complexity, Problems, Narration, Inspector, Call Stack, Insight) + Arrays / Sliding Window

**Builds:** `CodePanel` (with prism-react-renderer + TS/Python toggle); `ComplexityBadge` (best/avg/worst shape from §4.10); `ProblemsSidebar`; `StepNarration` with `aria-live="polite"` and `role="status"` so screen readers announce each step; `VariableInspector`; `CallStackPanel`; `KeyInsightCallout`; `InputPanel`; `AlgorithmTabs`; populate `codeSnippets.ts`, `complexities.ts`, `neetcodeProblems.ts`, `defaultInputs.ts`, `keyInsights.ts` for **arrays only**; add `algorithms/arrays/slidingWindow.ts` as a second algorithm to validate `AlgorithmTabs` plumbing.
**Files modified:** `ArraysPage.tsx` (full layout with all panels), `engine/README.md` (note the data-file checklist).
**Test at end:** `/arrays` has two tabs (Two Pointers / Sliding Window). For each: code panel highlights the moving line, complexity badge shows three time complexities + space, problems sidebar lists 5 beginner + 5 advanced problems with working links, step narration is announced to screen readers (verify via VoiceOver/NVDA or by inspecting `aria-live` updates in DOM). Variable inspector shows live values. Key insight callout shows the algorithm's mental model.
**Handoff to Session 3:** The full topic-page template is locked. Every subsequent topic = (1) algorithm files with `r.push(...)` instrumentation, (2) one or more visualizer components, (3) data-file entries (snippets/complexities/problems/inputs/insights), (4) topic-page layout (which is mostly a copy of `ArraysPage`).

### Session 3 — Stack & Queue

**Builds:** `algorithms/stackQueue/balancedBrackets.ts`, `monotonicStack.ts`, `queueDemo.ts`; `StackVisualizer`, `QueueVisualizer`; data entries.
**Files modified:** `StackQueuePage.tsx`.
**Test at end:** Three tabs animate end-to-end on user input. Trace snapshot tests pass.
**Handoff to Session 4:** "Two-visualizers-on-one-page" pattern captured (stack + input cursor row, queue with head/tail indicators).

### Session 4 — Linked List

**Builds:** `algorithms/linkedList/singlyTraverse.ts`, `singlyInsertDelete.ts`, `doublyTraverse.ts`; `LinkedListVisualizer` (SVG arrows positioned via Framer, supports singly + doubly); `utils/parseLinkedList.ts`; data entries.
**Files modified:** `LinkedListPage.tsx`.
**Test at end:** Custom list parses correctly; traverse, insert, delete animate; pointer arrows reattach smoothly when nodes are inserted/removed; doubly-linked variant shows back-pointers correctly.
**Handoff to Session 5:** SVG-arrow rendering pattern documented; can be reused for trees and graphs.

### Session 5 — Binary Tree + BST

**Builds:** `utils/parseTree.ts` (level-order array → `TreeNode` map); `algorithms/tree/{inorder,preorder,postorder,levelOrder}.ts`; `algorithms/bst/{insert,search,delete}.ts`; `BinaryTreeVisualizer` (layout pass computes `(x,y)` per node via subtree-width allotment, animates `cx/cy` on insert/delete); `BSTVisualizer` extends `BinaryTreeVisualizer` with a comparison highlight overlay; populate `CallStackPanel` for recursive traversals; data entries.
**Files modified:** `BinaryTreePage.tsx`, `BSTPage.tsx`.
**Test at end:** Insert a custom tree like `1,2,3,null,4,5`, run each traversal — visited list builds in order, `CallStackPanel` shows recursion frames; BST insert sequence animates left/right comparisons; delete handles all three cases (leaf / one child / two children with in-order successor) with visible replacement.
**Handoff to Session 6:** Tree-layout algorithm is reusable for the adjacency-graph "spanning tree" overlay.

### Session 6 — Graph (Grid + Adjacency)

**Builds:** `utils/parseGraph.ts` (adjacency list text → `GraphNode`/`GraphEdge`); `algorithms/graph/{bfs,dfs}{Grid,Adjacency}.ts` (4 runners); `GraphGridVisualizer` (CSS grid + per-cell Framer); `GraphAdjacencyVisualizer` (SVG circles + lines, hand-positioned in `defaultInputs.ts`); grid editor: click-drag toggles walls, special clicks set start/end.
**Files modified:** `GraphPage.tsx` with toggle between grid/adjacency.
**Test at end:** Edit a 10×10 grid, run BFS — frontier ripples outward, distance overlay optional; switch to adjacency view of a 6-node graph, run DFS — `CallStackPanel` populates as recursion deepens.
**Handoff to Session 7:** Confirmed DOM/CSS is fast enough for ≤ 25×25 grids; no canvas needed. Race-mode requirements clarified for Session 7 (see below — **no `padTo`, real step counts**).

### Session 7 — Sorting (Step Mode + Race Mode)

**Builds:** `algorithms/sorting/{bubble,merge,quick,heap}.ts`; `SortingVisualizer` (bar chart with per-bar color states from §3.6); race-mode container that mounts four visualizers, each driven by its own `useAlgorithmRun` with its **own** step count, all sharing a single `play()` trigger. Each runner's `tickMs` is independently set to `totalDurationMs / steps.length` so all four finish at the same wall-clock time despite different step counts — preserving the "merge sort takes fewer logical steps" insight visually. (This explicitly **rejects** the earlier `padTo()` idea, which would have hidden the asymptotic difference that's half the educational value.)
**Files modified:** `SortingPage.tsx`.
**Test at end:** Step mode: choose one algorithm, watch bars compare/swap/settle, sorted bars turn green. Race mode: all four side-by-side on the same input — bubble sort's bar shows ~n² comparisons while merge shows ~n log n, and they finish at the same wall-clock moment; learner can visually intuit the complexity gap.
**Handoff to Session 8:** Per-runner speed scaling is a reusable trick — note in `engine/README.md` for any future "race" features.

### Session 8 — Hash Table + DP + Final Polish

**Builds:** `algorithms/hashTable/{chaining,openAddressing}.ts`; `HashTableChainingVisualizer` (bucket rows with chained boxes), `HashTableOpenAddressingVisualizer` (linear slots, probe sequence animated); `algorithms/dp/{fibonacci,knapsack01,lcs}.ts`; `DPTableVisualizer` (grid where each cell fills with a value; "reading cells" outlined in cyan, "current cell" filled amber; traceback rendered as a path overlay); polish pass — empty/error states in `InputPanel`, "no algorithm selected" guards, loading skeletons, hover tooltips on complexity badges, problems-sidebar links open in new tab with `rel="noopener noreferrer"`, URL state for sharing inputs (`?input=...` query params on each topic page, parsed by the page on mount), full keyboard navigation audit.
**Files modified:** `HashTablePage.tsx`, `DPPage.tsx`, plus accessibility/polish edits across the app.
**Test at end:** All 9 topics functional; all listed NeetCode problems clickable; full keyboard navigation works; screen-reader announces step narration; no console errors; production build (`pnpm build && pnpm preview`) loads under 1.5 MB JS gzipped; `?input=` URL parameter restores user input on reload.
**Handoff:** App is shippable. Future work: more algorithms per topic, light theme, embedded explanations sourced from `/Users/patipanb/Obsidian/DSA Learning Hub/`.

---

## 7. Session 1 Prompt (copy-paste ready)

Save this as `docs/superpowers/plans/session-1-skeleton.md` _before_ starting Session 1 (Session 1 will write it as part of its own first task), or paste verbatim into a new Claude Code session pointed at `/Users/patipanb/Obsidian/DSAWebApp`:

````markdown
You are starting Session 1 of the DSA Visualizer project. Before writing any code:

1. Read `docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md` end-to-end. That document is canonical — defer to it on any disagreement with this prompt.
2. Use the `superpowers:test-driven-development` skill for any code you write.
3. Use the `superpowers:verification-before-completion` skill before claiming this session is done.

## Working directory

`/Users/patipanb/Obsidian/DSAWebApp` — currently mostly empty (only `.claude/`, `.DS_Store`, and `docs/superpowers/plans/`).

## Goal of Session 1

Produce a Vite + React + TypeScript app that, on `pnpm dev`, shows a dark-themed home page with 9 topic cards in a responsive grid. Clicking a card routes to a placeholder page for that topic. The app shell (top bar + left sidebar with topic navigation) is present and styled. **No algorithms, no visualizers, no engine.** Those come in later sessions.

## Tech stack — use current stable

Scaffold with `pnpm create vite@latest . --template react-ts` and accept the current stable major versions for every dependency below. **Do not pin to specific versions** — let `pnpm` resolve latest stable and lock via `pnpm-lock.yaml`. Pinning year-old versions here is day-one tech debt.

Runtime:

- `react`, `react-dom`
- `react-router-dom`
- `zustand`
- `framer-motion` (install; do not use yet — Session 2a is when motion appears)
- `tailwindcss`, `postcss`, `autoprefixer`
- `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`
- `clsx` (for the `cn()` helper)

Dev:

- `typescript` (strict mode in tsconfig)
- `vite`
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
- `@types/react`, `@types/react-dom`
- `eslint`, `prettier`, `eslint-plugin-react-refresh`

Use **pnpm** as the package manager (not npm or yarn). Commit `pnpm-lock.yaml`.

## Folder structure to realize (this session)

Create exactly these files (refer to the master plan §1 for the full tree — only the items below get created in Session 1):

```
DSAWebApp/
├── public/favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── router.tsx
│   ├── routes/
│   │   ├── HomePage.tsx
│   │   ├── ArraysPage.tsx
│   │   ├── StackQueuePage.tsx
│   │   ├── LinkedListPage.tsx
│   │   ├── BinaryTreePage.tsx
│   │   ├── BSTPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── SortingPage.tsx
│   │   ├── HashTablePage.tsx
│   │   └── DPPage.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── TopicNav.tsx
│   │   ├── panels/
│   │   │   └── TopicHeader.tsx
│   │   └── primitives/
│   │       ├── Button.tsx
│   │       ├── Tabs.tsx
│   │       ├── Tooltip.tsx
│   │       ├── Slider.tsx
│   │       └── Badge.tsx
│   ├── store/
│   │   ├── topicStore.ts
│   │   └── prefsStore.ts
│   ├── data/
│   │   └── topics.ts
│   ├── types/
│   │   └── topic.ts
│   ├── utils/
│   │   └── classNames.ts
│   └── constants/
│       └── colors.ts
├── tests/
│   └── components/
│       ├── AppShell.test.tsx
│       └── HomePage.test.tsx
├── .github/
│   └── workflows/
│       └── ci.yml
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
└── README.md
```

## Concrete contracts for Session 1

### `src/types/topic.ts`

```ts
export type TopicId =
  | 'arrays'
  | 'stack-queue'
  | 'linked-list'
  | 'binary-tree'
  | 'bst'
  | 'graph'
  | 'sorting'
  | 'hash-table'
  | 'dp';

export interface TopicMeta {
  id: TopicId;
  title: string;
  shortDescription: string; // one-line for sidebar
  longDescription: string; // 2-3 sentences for home card
  path: `/${string}`;
  number: number; // 1..9 display order
  emoji: string; // single emoji for the card (only place emojis appear in the app)
}
```

### `src/data/topics.ts`

Export `TOPICS: TopicMeta[]` with all 9 entries in the order from the master plan §0:
arrays → stack-queue → linked-list → binary-tree → bst → graph → sorting → hash-table → dp.
Paths: `/arrays`, `/stack-queue`, `/linked-list`, `/binary-tree`, `/bst`, `/graph`, `/sorting`, `/hash-table`, `/dp`.

### Tailwind palette (`tailwind.config.ts`)

Use the exact tokens from master plan §3.6. `darkMode: 'class'`; `index.html` sets `<html class="dark">`. Content paths: `./index.html`, `./src/**/*.{ts,tsx}`.

### Layout

- `AppShell` is the root layout: full-height grid `grid-rows-[auto_1fr]` with `TopBar` on top and a horizontal `grid-cols-[260px_1fr]` below, where the left column is `Sidebar` (containing `TopicNav`) and the right is `<Outlet/>`.
- `Sidebar`: `bg-bg-surface border-r border-border-subtle`. `TopicNav` is a vertical list of all 9 topics; the active route gets `bg-bg-elevated text-accent-primary` left border.
- `TopBar`: `bg-bg-surface border-b border-border-subtle`, logo (just text "DSA Visualizer" in `font-mono text-accent-primary`), no actions yet.
- `HomePage`: a `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-8` of 9 topic cards. Each card: `bg-bg-surface border border-border-subtle rounded-2xl p-6 hover:border-accent-primary transition`, shows `#01` style number in mono, emoji, title, longDescription, "Open →" CTA. Whole card is a `<Link>`.
- Stub pages (`ArraysPage`, etc.): render `<TopicHeader topicId="arrays" />` and a `Coming soon` message in muted text.

### Router (`src/router.tsx`)

Use React Router v6 `createBrowserRouter` with `AppShell` as the root layout and 10 child routes: `index → HomePage`, plus one per topic.

### Stores

- `prefsStore`: shape `{ speedIndex: number; setSpeedIndex(i: number): void }` — used in Session 2; for Session 1 just define and export so imports work.
- `topicStore`: shape `{ selectedTopicId: TopicId | null; setSelectedTopicId(id: TopicId | null): void }` — set on route change in `AppShell` via a `useEffect` reading the active route param.

### Primitives

Build only the surface and props; no business logic.

- `Button`: variants `primary | secondary | ghost`, sizes `sm | md`. `primary` uses `bg-accent-primary text-bg-base`; `secondary` uses `bg-bg-elevated border border-border-strong`; `ghost` uses `hover:bg-bg-elevated`.
- `Badge`: variants `info | success | warn | danger`, displays text.
- `Tabs`, `Slider`, `Tooltip`: minimal accessible shells with proper aria attrs. Slider is a discrete 5-position slider (left/right arrow keys to move, value 0..4). They'll be used in Session 2.

### Tests (Vitest + Testing Library)

Two passing tests by end of session:

1. `tests/components/HomePage.test.tsx`: renders 9 cards, each with the correct topic title, each card is a link to the correct path.
2. `tests/components/AppShell.test.tsx`: renders TopBar text "DSA Visualizer", renders Sidebar with all 9 topic links, outlet renders child content.

Both must pass via `pnpm test`.

## TDD discipline

For each non-trivial component or store you build, write the test first, see it fail, implement minimally, see it pass, then refactor. Commit after each task.

## Commit cadence

Conventional commits. One commit per task (init, tailwind setup, router, layout shell, sidebar, home cards, stub pages, stores, tests). Final commit: `chore(session-1): complete skeleton`.

## Verification before claiming done

Run all of these and paste their full output into your final message:

- `pnpm typecheck` (add a script: `tsc -b --noEmit`)
- `pnpm lint`
- `pnpm test`
- `pnpm build`
  Then `pnpm preview` and verify in a browser: home shows 9 cards; clicking each navigates to the right placeholder; no console errors.

## CI workflow (`.github/workflows/ci.yml`)

A minimal GitHub Actions workflow that runs on push and PR: checks out, sets up pnpm + Node LTS, installs deps, runs `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`. Cache `~/.pnpm-store`. The workflow must pass on the first commit.

## Out of scope for Session 1

Do NOT build:

- The engine, runner, snapshots, or `useAlgorithmRun` (Session 2a)
- Any algorithm files (Session 2a onward)
- Any visualizer components (Session 2a onward)
- `CodePanel`, `ComplexityBadge`, `ProblemsSidebar`, `PlaybackControls`, `SpeedSlider`, `ProgressBar`, `StepNarration`, `VariableInspector`, `CallStackPanel`, `KeyInsightCallout`, `InputPanel`, `AlgorithmTabs` (Session 2a builds the minimal three; Session 2b builds the rest)
- `parseArray`, `parseTree`, `parseGraph`, `parseLinkedList`
- The `data/codeSnippets.ts`, `data/complexities.ts`, `data/neetcodeProblems.ts`, `data/defaultInputs.ts`, `data/keyInsights.ts` files (Session 2b populates these for arrays only)

If you find yourself wanting to add something in this list, stop — that's a Session 2a+ task.

## Handoff

At the end of Session 1, write `docs/superpowers/plans/session-1-skeleton.md` documenting what shipped, any deviations from this prompt, the exact dependency versions `pnpm` resolved (for the record), and the exact state Session 2a should expect.
````

---

## Self-Review Checklist (post-review revision)

- [x] Tech stack decision is justified and explicit (Vite, not Next.js).
- [x] Folder structure names every file and folder.
- [x] Component map covers all 9 topics with container, visualizer(s), and shared panels.
- [x] Snapshot-array engine is chosen over generator, with reasons.
- [x] **"What is one step" rule defined** (§3.1) and applies uniformly across all algorithms.
- [x] **Trace snapshot tests required** for every algorithm (§3.1) — result-only tests forbidden.
- [x] **CallStackPanel** added to shared panels; rendered when snapshot has `callStack`.
- [x] **Complexity shape exposes best / avg / worst time + space** (§4.10).
- [x] **Race mode uses real step counts + wall-clock scaling** (no `padTo`) — Session 7.
- [x] **`StepNarration` is `aria-live="polite"`** for screen-reader stepping.
- [x] **No version pins** — Session 1 uses `pnpm create vite@latest` + current stable.
- [x] Speed control, code highlighter, theme each spec'd with concrete tokens.
- [x] Snapshot types defined per topic (TS interfaces).
- [x] Default inputs listed per algorithm.
- [x] NeetCode mapping has 5 beginner + 5 advanced per topic with slugs and visualizer-relevance notes.
- [x] Build order has **9** sessions (was 7 — split 2 → 2a/2b and 4 → 4/5), each with files, test outcome, and handoff.
- [x] Session 1 prompt is self-contained — current-stable scaffold, contracts, scope boundaries, verification commands, CI workflow included.
- [x] URL-state sharing + GitHub Actions CI added (CI in Session 1, URL state in Session 8).
- [x] No "TBD" or placeholder language.

## Execution Handoff

Plan complete (post-review revision) and saved to `/Users/patipanb/Obsidian/DSAWebApp/docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md`.

Two execution options for Session 1:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task in Session 1, review between tasks, fast iteration.
2. **Inline Execution** — execute Session 1 in this session using `superpowers:executing-plans`, batch execution with checkpoints.

Before each subsequent session, write its per-session plan (`docs/superpowers/plans/session-Na-*.md`, etc.) using `superpowers:writing-plans`, then execute.
