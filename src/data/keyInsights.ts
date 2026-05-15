import type { AlgorithmId } from '@/types/algorithm';

export const KEY_INSIGHTS: Partial<Record<AlgorithmId, string>> = {
  'two-pointers':
    'Move the pointer with the smaller contribution inward — since the array is sorted, this is the only move guaranteed to shift the sum toward the target.',
  'sliding-window':
    'Keep a fixed-size window by adding the incoming element and dropping the outgoing one each step — one O(n) pass replaces an O(n²) brute force.',
  'balanced-brackets':
    'Use a stack: push opening brackets, and for every closing bracket verify it matches the top — if it does, pop; if not (or stack is empty), the string is unbalanced.',
  'monotonic-stack':
    'Keep a stack of "unanswered" elements in decreasing order — the moment a larger element arrives, everything smaller on the stack finally has its answer.',
  'queue-demo':
    'A queue is FIFO (first in, first out): enqueue at the back, dequeue at the front — the opposite end from a stack.',
};
