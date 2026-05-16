import type { TopicId } from '@/types/topic';
import type { Problem } from '@/types/problems';

export const NEETCODE_PROBLEMS: Partial<Record<TopicId, Problem[]>> = {
  arrays: [
    {
      title: 'Two Sum',
      slug: 'two-integer-sum',
      difficulty: 'beginner',
      hint: 'Cross-references the Hash Table topic.',
    },
    {
      title: 'Is Palindrome',
      slug: 'is-palindrome',
      difficulty: 'beginner',
      hint: 'Two cyan/amber pointers converging is exactly the trace you need.',
    },
    {
      title: 'Two Sum II – Input Array Is Sorted',
      slug: 'two-integer-sum-ii',
      difficulty: 'beginner',
      hint: 'Mirrors the default two-pointer example directly.',
    },
    {
      title: 'Best Time to Buy and Sell Stock',
      slug: 'buy-and-sell-crypto',
      difficulty: 'beginner',
      hint: "Visualizer's sliding-window mode shows the running min/max.",
    },
    {
      title: 'Contains Duplicate',
      slug: 'duplicate-integer',
      difficulty: 'beginner',
      hint: 'Cross-references the Hash Table topic.',
    },
    {
      title: 'Container With Most Water',
      slug: 'container-with-most-water',
      difficulty: 'advanced',
      hint: 'Two pointers + a max-area variable in the inspector.',
    },
    {
      title: '3Sum',
      slug: '3sum',
      difficulty: 'advanced',
      hint: 'Outer loop + inner two-pointer pass, both visible at once.',
    },
    {
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      difficulty: 'advanced',
      hint: 'Left/right running maxima rendered as height bars over the array.',
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-duplicates',
      difficulty: 'advanced',
      hint: 'Variable-size window with a set highlighted in VariableInspector.',
    },
    {
      title: 'Minimum Window Substring',
      slug: 'minimum-window-with-characters',
      difficulty: 'advanced',
      hint: 'Window grows/shrinks; the "need" map is shown live.',
    },
  ],
  'linked-list': [
    {
      title: 'Reverse Linked List',
      slug: 'reverse-a-linked-list',
      difficulty: 'beginner',
      hint: 'Mirrors the reverse() step in the Insert/Delete demo — watch prev/curr flip.',
    },
    {
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-linked-lists',
      difficulty: 'beginner',
      hint: 'Two curr pointers advance through each list; the smaller value is linked next.',
    },
    {
      title: 'Linked List Cycle',
      slug: 'linked-list-cycle-detection',
      difficulty: 'beginner',
      hint: 'Fast pointer moves two steps, slow one — they meet only if a cycle exists.',
    },
    {
      title: 'Reorder List',
      slug: 'reorder-linked-list',
      difficulty: 'advanced',
      hint: 'Find the midpoint, reverse the second half, then interleave the two halves.',
    },
    {
      title: 'Remove Nth Node From End of List',
      slug: 'remove-node-from-end-of-linked-list',
      difficulty: 'advanced',
      hint: 'Two pointers n apart — when the leader hits null, the trailer is at the target.',
    },
    {
      title: 'Add Two Numbers',
      slug: 'add-two-numbers',
      difficulty: 'advanced',
      hint: 'Traverse both lists simultaneously, carry the overflow digit to the next node.',
    },
  ],
  'stack-queue': [
    {
      title: 'Baseball Game',
      slug: 'baseball-game',
      difficulty: 'beginner',
      hint: 'Push scores; D doubles top, C removes top — pure stack operations.',
    },
    {
      title: 'Valid Parentheses',
      slug: 'validate-parentheses',
      difficulty: 'beginner',
      hint: 'Default balanced-brackets example — watch open brackets push and matching ones pop.',
    },
    {
      title: 'Min Stack',
      slug: 'minimum-stack',
      difficulty: 'beginner',
      hint: 'Auxiliary min-tracking stack shown side-by-side with the main one.',
    },
    {
      title: 'Implement Queue using Stacks',
      slug: 'implement-queue-using-stacks',
      difficulty: 'beginner',
      hint: 'Two-stack queue trick: fill from stack 1 into stack 2 when dequeuing.',
    },
    {
      title: 'Evaluate Reverse Polish Notation',
      slug: 'evaluate-reverse-polish-notation',
      difficulty: 'beginner',
      hint: 'Operand stack — operator pops two, computes, pushes result.',
    },
    {
      title: 'Daily Temperatures',
      slug: 'daily-temperatures',
      difficulty: 'advanced',
      hint: 'Monotonic stack default example — decreasing-temperature variant.',
    },
    {
      title: 'Online Stock Span',
      slug: 'online-stock-span',
      difficulty: 'advanced',
      hint: 'Monotonic stack accumulating spans — pop while top price ≤ current.',
    },
    {
      title: 'Car Fleet',
      slug: 'car-fleet',
      difficulty: 'advanced',
      hint: 'Stack of arrival times; a car that catches the one ahead joins its fleet.',
    },
    {
      title: 'Largest Rectangle in Histogram',
      slug: 'largest-rectangle-in-histogram',
      difficulty: 'advanced',
      hint: 'Monotonic stack tracks pending widths; area computed when a bar is popped.',
    },
    {
      title: 'Sliding Window Maximum',
      slug: 'sliding-window-maximum',
      difficulty: 'advanced',
      hint: 'Monotonic deque — front is window max, stale front is evicted when out of window.',
    },
  ],
};
