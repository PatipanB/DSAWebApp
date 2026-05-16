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
  'stack-demo':
    'A stack is LIFO (last in, first out): push adds to the top, pop removes from the top — the opposite end from where you inserted in a queue.',
  'array-ops':
    'Appending or removing from the end is O(1) because no elements shift; inserting or deleting in the middle is O(n) because all elements to the right must shift.',
  'dynamic-window':
    'Grow the window right until a duplicate appears, then shrink from the left until the duplicate is gone — each character enters and leaves the window at most once, giving O(n) overall.',
  'singly-traverse':
    'Follow the chain: start curr=head, advance curr=curr.next each step, stop when curr is null — O(n) with O(1) space.',
  'singly-insert-delete':
    'Head insert is O(1) (redirect head); tail insert needs the tail pointer; delete requires tracking prev so prev.next can skip the removed node; reversal flips every next pointer in one pass.',
  'doubly-traverse':
    'The extra prev pointer enables O(1) backward navigation — forward: curr=curr.next; backward: curr=curr.prev. No copying or reversal needed.',
};
