# DSA Visualizer — Next Steps Roadmap

> **For agentic workers:** This is a strategy document, not an implementation plan. Each phase below should produce its own per-session implementation plan (using `superpowers:writing-plans`) before execution. Read this document first to understand context, then write the per-session plan.

**Goal:** Complete the 9-topic app (master plan), then restructure it into a genuine beginner course — not just a reference visualizer.

**Target learner:** Complete beginners. Zero assumed CS background. They've decided to learn DSA and need scaffolding, not just animations.

**Current state (as of 2026-05-16):**
- Sessions 1–6 of master plan complete: Arrays, Stack & Queue, Linked List, Binary Tree, BST — fully implemented with algorithms, visualizers, shared panels, tests
- 283 tests passing, 0 typecheck/lint errors, production build clean
- 3 sessions remain from master plan: Graph, Sorting, Hash Table + DP + Polish
- Graph/Sorting/Hash Table/DP pages are stub routes (render nothing)

---

## Phase 1 — Complete the Master Plan

### Session 7: Graph (Grid + Adjacency)

This is the most architecturally complex remaining session — two entirely different visualizers, a grid editor, and 4 algorithm runners.

**What to build:**

Algorithms (`src/algorithms/graph/`):
- `bfsGrid.ts` — BFS on a 2D grid, emits `GridSnapshot`
- `dfsGrid.ts` — DFS on a 2D grid, emits `GridSnapshot`
- `bfsAdjacency.ts` — BFS on an adjacency-list graph, emits `AdjacencySnapshot`
- `dfsAdjacency.ts` — DFS on an adjacency-list graph, emits `AdjacencySnapshot`

Visualizers:
- `GraphGridVisualizer.tsx` — CSS grid layout, each cell styled by `GridCell` state, current cell highlighted amber
- `GraphAdjacencyVisualizer.tsx` — SVG circles + lines, hand-positioned nodes from `defaultInputs.ts`

Snapshot types (add to `src/types/snapshots.ts`):
```ts
export type GridCell = 'open' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path' | 'current';
export interface GridSnapshot {
  rows: number;
  cols: number;
  cells: GridCell[][];
  current?: [number, number];
}

export interface GraphNode { id: string; label: string; x: number; y: number; }
export interface GraphEdge { from: string; to: string; }
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

`GraphPage.tsx` has a toggle between Grid view and Adjacency view. Within each view, tabs switch between BFS and DFS.

Grid editor: click a cell to toggle wall/open. Special: click with "S" key held = set start, "E" key held = set end. Keep it simple — no drag.

Default grid: 8×8 with a simple maze of walls. Default adjacency: 6-node graph with hand-picked `(x, y)` positions in `src/data/defaultInputs.ts`.

`CallStackPanel` appears for DFS runs (DFS emits callStack). BFS runs show a `QueuePanel` equivalent — use the existing `QueueVisualizer` pattern or render queue state in `VariableInspector`.

**Algorithm step contract:**
- Grid BFS: one step per cell dequeued. `frontier` shows cells currently in queue. `visited` grows as cells are processed. `current` is the cell being explored.
- Grid DFS: one step per cell entered (push to callStack) and per cell fully processed (pop). Makes recursion depth visible.
- Adjacency: same pattern — one step per node dequeued/entered.

**Data files to populate:** `codeSnippets.ts` (4 entries), `complexities.ts` (4 entries), `keyInsights.ts` (4 entries), `neetcodeProblems.ts` graph section (10 problems already listed in master plan §5.6).

**AlgorithmId additions to `src/types/algorithm.ts`:**
```ts
// Add to AlgorithmId union:
| 'bfs-grid' | 'dfs-grid' | 'bfs-adjacency' | 'dfs-adjacency'
```

**Tests:** result test + trace snapshot test for each of the 4 algorithms. Visualizer render tests for both visualizers. Grid editor interaction test (click toggles wall).

---

### Session 8: Sorting (Step Mode + Race Mode)

**What to build:**

Algorithms (`src/algorithms/sorting/`):
- `bubble.ts` — emits `SortingSnapshot`
- `merge.ts` — emits `SortingSnapshot` (uses `auxArray`)
- `quick.ts` — emits `SortingSnapshot` (uses `pivot`, `subarray`)
- `heap.ts` — emits `SortingSnapshot` (uses `heapBoundary`)

Snapshot type (add to `src/types/snapshots.ts`):
```ts
export interface SortingSnapshot {
  values: number[];
  comparing: number[];   // indices being compared this step
  swapped: number[];     // indices just swapped
  sorted: number[];      // indices in final position (green)
  pivot?: number;        // quicksort: pivot index
  subarray?: { start: number; end: number };
  auxArray?: number[];   // merge sort: scratch array
  heapBoundary?: number; // heap: last heap element index
}
```

`SortingVisualizer.tsx` — vertical bar chart. Bar height proportional to value. Color by state:
- `comparing`: `bg-status-warn` (orange)
- `swapped`: `bg-status-danger` (rose)
- `sorted`: `bg-status-success` (green)
- `pivot`: `ring-2 ring-accent-secondary` (cyan ring)
- default: `bg-bg-elevated`

**Race mode** — the pedagogically critical feature:
- `SortingPage` has two modes: "Step" (single algorithm with full controls) and "Race" (all 4 side-by-side)
- Race mode mounts 4 independent `useAlgorithmRun` instances, all on the same input
- A single shared Play button triggers all 4 simultaneously
- Each runner uses `totalDurationMs / steps.length` as its own tick speed, so all four finish at the same wall-clock time despite having different step counts
- This makes O(n²) vs O(n log n) **visible** — bubble/heap bars move slowly and constantly, merge/quick bars "feel" faster
- Do NOT use `padTo()` — that hides the asymptotic difference which is half the educational value
- Race mode has no step-back or scrubbing (too complex with 4 runners); just Play, Pause, Reset

**AlgorithmId additions:**
```ts
| 'bubble' | 'merge' | 'quick' | 'heap'
```

Default input: `[5, 2, 8, 1, 9, 3, 7, 4, 6]`

---

### Session 9: Hash Table + DP + Final Polish

Two topics in one session because neither requires a new architectural pattern.

**Hash Table:**

Algorithms (`src/algorithms/hashTable/`):
- `chaining.ts` — inserts keys into buckets via `key.charCodeAt(0) % bucketCount`, shows hash computation step, then bucket insertion, then collision chaining
- `openAddressing.ts` — linear probing: hash to slot, step through probe sequence until empty slot found

Snapshot types:
```ts
export interface HashEntry { key: string; value: string; hash: number; tombstone?: boolean; }
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
```

Visualizers:
- `HashTableChainingVisualizer.tsx` — row of bucket boxes, each bucket is a horizontal chain of entry boxes. Inserting entry animates into the correct bucket. Collision bucket highlights.
- `HashTableOpenAddressingVisualizer.tsx` — row of fixed slots. Probe sequence highlights each slot visited. Tombstone slots show `✕`.

Default input: 6 key/value pairs from master plan §4.8, bucket count 7 (chosen so collisions occur naturally).

**Dynamic Programming:**

Algorithms (`src/algorithms/dp/`):
- `fibonacci.ts` — 1D table, each cell filled bottom-up, `reading` shows the two prior cells consulted
- `knapsack01.ts` — 2D table, rows = items, cols = capacity. Each cell: highlight the two cells consulted by the recurrence
- `lcs.ts` — 2D table, rows/cols labeled with string chars. After fill: traceback pass animates the optimal path

Snapshot type:
```ts
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

`DPTableVisualizer.tsx` — grid where `null` cells are dark/unfilled, `current` is amber, `reading` cells have cyan outline, `traceback` path is rose-outlined after algorithm completes.

**Polish (in Session 9 after algorithms):**
- All 4 stub pages (Graph, Sorting, Hash Table, DP) had "Coming soon" placeholders — remove them now
- InputPanel: add a "Reset to default" button that restores the algorithm's `DEFAULT_*_INPUT`
- Keyboard shortcut hint: add a small `space ▶  ← → step  R reset` label near PlaybackControls (static text, no tooltip needed)
- `CallStackPanel`: add a subtitle line `"Recursion depth — each frame is an active function call"` below the `CALL STACK` label
- All 9 topic pages: verify `ProblemsSidebar` links open in new tab with `rel="noopener noreferrer"`

**AlgorithmId additions:**
```ts
| 'bfs-grid' | 'dfs-grid' | 'bfs-adjacency' | 'dfs-adjacency'  // already from session 7
| 'bubble' | 'merge' | 'quick' | 'heap'                          // already from session 8
| 'chaining' | 'open-addressing'
| 'fibonacci' | 'knapsack-01' | 'lcs'
```

---

## Phase 2 — Critical Learning Gap Fixes

Execute after all 9 topics are complete. These are bugs in learning, not code bugs.

### Fix 1: Show BFS queue in level-order traversal

**Why:** `levelOrder.ts` already emits `queue: string[]` in every snapshot. But `BinaryTreePage` never renders it. Without seeing the queue drain and refill level by level, BFS is just "nodes turning green mysteriously."

**What to build:** A `QueuePanel` component (or reuse `QueueVisualizer`) in `BinaryTreePage` that renders the queue state for the `level-order` tab only. Show it below the visualizer, above the narration. Display node values (not IDs) in queue cells.

File to modify: `src/routes/BinaryTreePage.tsx` — conditionally render queue when `activeId === 'level-order'` and `treeSnap?.queue` has items.

Existing `QueueVisualizer` pattern: `src/components/visualizers/QueueVisualizer.tsx` — adapt or create a simpler inline queue row.

### Fix 2: Null node markers in BinaryTreeVisualizer

**Why:** For `[1, 2, 3, null, 5]`, node 2 has no left child but the visualizer shows nothing. Beginners cannot see tree shape, BST holes, or balance without these markers.

**What to build:** In `BinaryTreeVisualizer.tsx`, after computing positions for all real nodes, also compute "ghost" positions for null children of existing nodes. Render them as faded circles with `∅` text and no value.

Implementation note: ghost positions are computed by the same inorder `dfs()` function — instead of skipping `null` children, place a ghost and still increment `xCounter`. This keeps sibling nodes from colliding. Ghost nodes have no `data-testid` and get `opacity-30` styling.

File to modify: `src/components/visualizers/BinaryTreeVisualizer.tsx`

### Fix 3: BST search path trail

**Why:** The comparison highlight (orange) clears on each step. A beginner cannot reconstruct "what path did I take?" after watching. The "each comparison halves the tree" insight is described but never shown spatially.

**What to build:** Add a `searchPath: string[]` field to `BSTSnapshot` (list of node IDs visited in order). `bstSearch.ts` accumulates this as it walks. `BSTVisualizer.tsx` draws a faint dotted `<polyline>` connecting the positions of path nodes from root to current. The line grows one segment per step.

Files to modify: `src/types/snapshots.ts`, `src/algorithms/bst/bstSearch.ts`, `src/components/visualizers/BSTVisualizer.tsx`

### Fix 4: Human-readable variable inspector values

**Why:** Currently displays `nodeId: n3`, `leftId: null` — internal IDs that mean nothing to a beginner.

**What to build:** Update the `variables` field in each algorithm's step pushes to emit human-readable values. Examples:
- `inorder.ts`: `{ 'current node': node.value, 'visited so far': visitedValues.join(' → ') }`
- `bstSearch.ts`: `{ target: comparingValue, 'at node': currentNode.value, direction: 'go left' }`
- `levelOrder.ts`: `{ queue: queueValues.join(', '), 'just visited': node.value }`

No component changes needed — `VariableInspector` already renders `Record<string, unknown>` correctly. This is a data change only.

Files to modify: All algorithm files in `src/algorithms/tree/` and `src/algorithms/bst/`. Update `toMatchSnapshot()` tests after changing variables output.

### Fix 5: "Before you run" intro card per algorithm

**Why:** Users open Inorder traversal, see a tree, have zero context, press play, watch things happen. Passive watching builds weak understanding. A setup prompt — "predict what you'll see" — turns watching into active learning.

**What to build:** A new `AlgorithmIntro` component in `src/components/panels/AlgorithmIntro.tsx`:
```tsx
interface Props { algorithmId: AlgorithmId; }
// Renders a collapsible card with 2-3 sentences + a "predict" prompt
// Collapses automatically when the runner starts (stepIndex > 0)
// Content stored in src/data/algorithmIntros.ts
```

`src/data/algorithmIntros.ts` — new data file:
```ts
export const ALGORITHM_INTROS: Partial<Record<AlgorithmId, { setup: string; predict: string }>> = {
  'inorder': {
    setup: 'Inorder traversal visits every node exactly once in Left → Root → Right order. For a BST, this always produces a sorted sequence.',
    predict: 'Predict: for the tree shown, what will the visited order be from left to right?',
  },
  'bst-search': {
    setup: 'A BST search never backtracks. At each node, one comparison sends you left or right — eliminating half the remaining tree.',
    predict: 'Predict: how many comparisons will it take to find the target?',
  },
  // ... one entry per algorithm
};
```

The card renders above the visualizer, below `KeyInsightCallout`. It auto-hides (not collapses — hides) once `stepIndex > 0` so it doesn't take space during the animation.

---

## Phase 3 — Course Restructure

Execute after Phase 2. These are structural changes that affect the whole app.

### Restructure 3.1: Reorder the topic sequence

**Current order:** Arrays → Stack & Queue → Linked List → Binary Tree → BST → Graph → Sorting → Hash Table → DP

**Proposed order for beginners:**
```
1. Arrays          (foundation — index, pointer, window)
2. Hash Table      (unlocks Two Sum, Contains Duplicate immediately)
3. Linked List     (pointer concept before trees)
4. Stack & Queue   (builds on linked list node mental model)
5. Binary Tree     (recursion + tree shape)
6. BST             (requires Binary Tree)
7. Sorting         (comparisons, swaps — self-contained)
8. Graph           (BFS/DFS from trees, larger problems)
9. DP              (requires all of the above)
```

**Why Hash Table at #2:** The NeetCode problems linked from the Arrays topic (Two Sum, Contains Duplicate) both require hash maps. A beginner finishing Arrays and clicking those problem links immediately hits a wall. Moving Hash Table to #2 fixes this cold-start.

**What changes:**
- `src/data/topics.ts` — update `number` fields for all 9 entries and reorder the array
- `src/types/topic.ts` — no change (TopicId union doesn't depend on order)
- Nothing else changes — routes, pages, and algorithms are all ID-based, not position-based

### Restructure 3.2: Learning path mode on homepage

**What to build:** Add a toggle on `HomePage` between two views:

**Explore mode** (current): 3-column card grid, all topics equal weight. Good for reference users.

**Learn mode** (new): Linear list of 9 topics in recommended order, with:
- Progress indicator per topic (checkmark if visited, circle if not)
- Prerequisite label on each card: `"Builds on: Arrays"` under the title
- Estimated time label: `"~20 min"` based on algorithm count
- The first unvisited topic is highlighted / "Start here →"

Toggle state saved in `prefsStore`. Add `learningMode: boolean; setLearningMode(v: boolean): void` to `prefsStore.ts`.

### Restructure 3.3: Progress tracking

**What to build:**
- Add to `prefsStore.ts`: `visitedTopics: Set<TopicId>` persisted to localStorage via Zustand `persist` middleware
- Mark a topic visited when `stepIndex` first exceeds 0 on any tab (i.e., they actually started watching)
- Sidebar: show a small filled dot or checkmark next to visited topic names
- HomePage cards: show a checkmark badge in the top-right corner of visited cards
- This is pure state + UI — no backend, no auth, localStorage only

Zustand persist example:
```ts
import { persist } from 'zustand/middleware';
// wrap create() with persist({ name: 'dsa-prefs' })
```

### Restructure 3.4: Prerequisite chips on topic headers

**What to build:** A `prereqs` field in `TopicMeta`:
```ts
export interface TopicMeta {
  // ... existing fields
  prereqs?: TopicId[];  // topics a beginner should see first
}
```

Update `src/data/topics.ts`:
```ts
{ id: 'bst', prereqs: ['binary-tree'], ... }
{ id: 'graph', prereqs: ['binary-tree'], ... }
{ id: 'dp', prereqs: ['arrays', 'hash-table'], ... }
```

`TopicHeader.tsx` — if `prereqs` is set and any prereq topic has NOT been visited (check `prefsStore.visitedTopics`), render a small chip:
```
⚠ Recommended first: Binary Tree →   [link to /binary-tree]
```

If all prereqs are visited, render a green chip: `✓ Prerequisites complete`.

---

## Phase 4 — Polish

Execute last, after Phase 3 is stable.

### Polish 4.1: Traversal comparison view (Binary Tree)

A "Compare all 3" mode on the Binary Tree page that shows Inorder, Preorder, and Postorder simultaneously on the same tree — three mini-visualizers in a row, each pre-played to show final visited order. No animation in this mode — just the end state with visited nodes colored green in the order they were visited (numbered 1, 2, 3... inside each node).

This makes the difference between traversal orders instantly obvious. A beginner sees "same tree, three different sequences" without having to watch three separate animations and remember.

### Polish 4.2: BST invariant annotation

On the BST page, during the initial step (before any operation), render subtle `< root` text beside the left subtree root and `> root` beside the right subtree root. Only shown on the first step, fades away as the animation progresses.

### Polish 4.3: Syntax highlighting in CodePanel

The master plan spec'd `prism-react-renderer` for syntax highlighting in `CodePanel.tsx` but it was deferred. Current state: plain monospace text with line-level amber highlight only.

`prism-react-renderer` is already listed as a dependency in the master plan. Add it, use the Prism dark theme overridden to the app's semantic tokens. Tokenization for TypeScript and Python. The `currentLine` amber background band and left border remain on top of the token colors.

### Polish 4.4: ComplexityBadge notation tooltips

The notes field already explains `h`, `w`, `k` in some entries but not all. Add a tooltip (use the existing `Tooltip.tsx` primitive) on each badge that explains the notation variable in context:
- O(h) → "h = tree height. O(log n) if balanced, O(n) if skewed (e.g. sorted insertion)."
- O(w) → "w = max width of tree. Queue holds at most one full level."
- O(min(n,k)) → "k = character set size (e.g. 26 for lowercase letters)."

Tooltip content stored in `src/data/complexities.ts` as an optional `notationNotes?: string` field alongside the existing `notes`.

---

## Architectural Notes for Future Agents

### Things that are stable — do not change
- `createRunBuilder<Snapshot>()` pattern in `src/engine/types.ts` — all algorithms use this, changing it would break every algorithm
- The `Step<Snapshot>` shape — `{line, narration, snapshot, variables}` — shared panels depend on these exact fields
- Semantic color tokens in `tailwind.config.ts` — all visualizers use these; don't use raw Tailwind palette classes in components
- `parseTree.ts` — stable, tested, used by all tree algorithms; `== null` guard (not `=== null`) is intentional for TS strict mode

### Patterns already established — follow them
- **Algorithm file:** `createRunBuilder` → `.push({line, narration, snapshot, variables})` → `.build(finalResult)`
- **Test file:** result test + `serializeRun(run).toMatchSnapshot()` trace test — both required, no exceptions
- **Topic page:** copy the `BinaryTreePage.tsx` pattern — it's the cleanest template for a new topic
- **Visualizer:** SVG for tree/graph/linked-list (positional), CSS for array/stack/queue/hash (list-based)
- **Data files:** `codeSnippets.ts`, `complexities.ts`, `keyInsights.ts`, `neetcodeProblems.ts` — add entries for every new `AlgorithmId`

### Known technical debt
- `prism-react-renderer` is installed as a dependency but CodePanel uses plain text rendering — tokenization deferred to Phase 4
- `Framer Motion` is installed but not used anywhere — the master plan included it for linked list SVG arrows but the implementation used plain SVG instead. Either use it in a future session or remove the dependency
- `.playwright-mcp/` directory contains browser automation artifacts that got committed — add it to `.gitignore`

### AlgorithmId union — current state
All IDs in `src/types/algorithm.ts`:
```
'two-pointers' | 'sliding-window' | 'array-ops' | 'dynamic-window'
| 'balanced-brackets' | 'monotonic-stack' | 'queue-demo' | 'stack-demo'
| 'singly-traverse' | 'singly-insert-delete' | 'doubly-traverse'
| 'inorder' | 'preorder' | 'postorder' | 'level-order'
| 'bst-insert' | 'bst-search' | 'bst-delete'
```

Still to add (Phases 1):
```
| 'bfs-grid' | 'dfs-grid' | 'bfs-adjacency' | 'dfs-adjacency'
| 'bubble' | 'merge' | 'quick' | 'heap'
| 'chaining' | 'open-addressing'
| 'fibonacci' | 'knapsack-01' | 'lcs'
```

---

## Execution Order Summary

```
Phase 1: Complete master plan
  └─ Session 7: Graph (Grid + Adjacency)
  └─ Session 8: Sorting (step + race mode)
  └─ Session 9: Hash Table + DP + final polish from master plan

Phase 2: Learning gap fixes (any order, independent of each other)
  └─ Fix 1: Level-order BFS queue panel
  └─ Fix 2: Null node ghost markers
  └─ Fix 3: BST search path trail
  └─ Fix 4: Human-readable variable inspector
  └─ Fix 5: "Before you run" intro cards

Phase 3: Course restructure (do in order — 3.3 depends on 3.2)
  └─ 3.1: Reorder topic sequence
  └─ 3.2: Learning path mode on homepage
  └─ 3.3: Progress tracking (prereq for 3.4)
  └─ 3.4: Prerequisite chips on topic headers

Phase 4: Polish (independent, do any order)
  └─ 4.1: Traversal comparison view
  └─ 4.2: BST invariant annotation
  └─ 4.3: Syntax highlighting in CodePanel
  └─ 4.4: ComplexityBadge notation tooltips
```

**Before starting any session in Phase 2+**, write the per-session plan using `superpowers:writing-plans`, then execute with `superpowers:subagent-driven-development`. Do not start from this document alone — it describes what and why, not the bite-sized TDD tasks.
