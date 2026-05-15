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
};
