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
};
