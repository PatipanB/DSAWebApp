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
  'bfs-grid': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'V = rows×cols cells. Queue holds frontier cells — at most O(V) in the worst case.',
  },
  'dfs-grid': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'Stack depth = longest DFS path, up to O(V) for a maze-like grid.',
  },
  'bfs-adjacency': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'V = nodes, E = edges. Each node enqueued once; each edge examined once.',
  },
  'dfs-adjacency': {
    time: { best: 'O(V+E)', average: 'O(V+E)', worst: 'O(V+E)' },
    space: 'O(V)',
    notes: 'Stack depth = longest DFS path, up to O(V) in a path graph.',
  },
};
