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
};
