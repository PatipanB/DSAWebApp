import type { AlgorithmId } from '@/types/algorithm';

export const DEFAULT_INPUTS: Partial<Record<AlgorithmId, unknown>> = {
  'two-pointers': { values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 },
  'sliding-window': { values: [2, 1, 5, 1, 3, 2], k: 3 },
};
