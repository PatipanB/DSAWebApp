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
};
