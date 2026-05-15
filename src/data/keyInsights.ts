import type { AlgorithmId } from '@/types/algorithm';

export const KEY_INSIGHTS: Partial<Record<AlgorithmId, string>> = {
  'two-pointers':
    'Move the pointer with the smaller contribution inward — since the array is sorted, this is the only move guaranteed to shift the sum toward the target.',
  'sliding-window':
    'Keep a fixed-size window by adding the incoming element and dropping the outgoing one each step — one O(n) pass replaces an O(n²) brute force.',
};
