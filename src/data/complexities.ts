import type { AlgorithmId } from '@/types/algorithm';

export interface ComplexityEntry {
  time: { best: string; average: string; worst: string };
  space: string;
  notes?: string;
  notationNotes?: string;
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
  'stack-demo': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Each push and pop is O(1); the full demo processes all n elements.',
  },
  'array-ops': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(1)',
    notes: 'Push/pop are O(1); insert/delete at arbitrary index are O(n) due to element shifting.',
  },
  'dynamic-window': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(min(n, k))',
    notes: 'Each character enters and leaves the window at most once. k = size of character set.',
    notationNotes: 'k = character set size (e.g. 26 for lowercase letters). Window never grows larger than k.',
  },
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
  'inorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'h = tree height; O(log n) balanced, O(n) skewed. Space is the recursion call stack.',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed (e.g. sorted insertion order).',
  },
  'preorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Same as inorder — every node is visited exactly once regardless of traversal order.',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed.',
  },
  'postorder': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Useful when children must be processed before parent (e.g., deleting a tree).',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed.',
  },
  'level-order': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(w)',
    notes: 'w = max width of the tree. Queue holds at most one full level at a time.',
    notationNotes: 'w = max width of tree. Queue holds at most one full level at a time.',
  },
  'bst-insert': {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Worst case O(n) on a degenerate (sorted-input) tree. Balanced BST guarantees O(log n).',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed (e.g. sorted insertion order).',
  },
  'bst-search': {
    time: { best: 'O(1)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Best case: target is root. Worst: degenerate tree — every node is visited.',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed.',
  },
  'bst-delete': {
    time: { best: 'O(log n)', average: 'O(log n)', worst: 'O(n)' },
    space: 'O(h)',
    notes: 'Two-children deletion finds the inorder successor in O(h) then removes it in O(h).',
    notationNotes: 'h = tree height. O(log n) if balanced, O(n) if skewed.',
  },
  'bfs-grid': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'V = rows×cols cells. Queue holds frontier cells — at most O(V) in the worst case.',
    notationNotes: 'V = vertices (cells), E = edges (4-neighbor connections). Queue ≤ O(V).',
  },
  'dfs-grid': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'Stack depth = longest DFS path, up to O(V) for a maze-like grid.',
    notationNotes: 'V = vertices (cells), E = edges. Stack depth = longest DFS path.',
  },
  'bfs-adjacency': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'V = nodes, E = edges. Each node enqueued once; each edge examined once.',
    notationNotes: 'V = nodes, E = edges. Queue holds at most all nodes once.',
  },
  'dfs-adjacency': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'Stack depth = longest DFS path, up to O(V) in a path graph.',
    notationNotes: 'V = nodes, E = edges. Call stack depth = longest path in graph.',
  },
  'bubble-sort': {
    time: { best: 'O(n)', average: 'O(n²)', worst: 'O(n²)' },
    space: 'O(1)',
    notes: 'Best case when array is already sorted — no swaps in any pass.',
  },
  'merge-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(n)',
    notes: 'Requires O(n) auxiliary array for merging. Stable sort.',
  },
  'quick-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n²)' },
    space: 'O(log n)',
    notes: 'Worst case on already-sorted input with last-element pivot. Randomized pivot avoids this.',
  },
  'heap-sort': {
    time: { best: 'O(n log n)', average: 'O(n log n)', worst: 'O(n log n)' },
    space: 'O(1)',
    notes: 'In-place and not stable. Build-heap is O(n); each of n extractions is O(log n).',
  },
  'chaining': {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Worst case when all keys hash to the same bucket (all collide).',
  },
  'open-addressing': {
    time: { best: 'O(1)', average: 'O(1)', worst: 'O(n)' },
    space: 'O(n)',
    notes: 'Performance degrades as load factor approaches 1; rehash at ~70% capacity.',
  },
  'fibonacci': {
    time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
    space: 'O(n)',
  },
  'knapsack-01': {
    time: { best: 'O(nW)', average: 'O(nW)', worst: 'O(nW)' },
    space: 'O(nW)',
    notes: 'n = item count, W = capacity. Space reducible to O(W) with 1D rolling array.',
    notationNotes: 'n = number of items, W = knapsack capacity. Table is (n+1)×(W+1).',
  },
  'lcs': {
    time: { best: 'O(mn)', average: 'O(mn)', worst: 'O(mn)' },
    space: 'O(mn)',
    notes: 'm and n are lengths of the two strings.',
    notationNotes: 'm = length of string A, n = length of string B. Table is (m+1)×(n+1).',
  },
};
