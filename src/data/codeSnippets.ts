import type { AlgorithmId } from '@/types/algorithm';

interface CodeSnippet {
  ts: string[];
  py: string[];
}

export const CODE_SNIPPETS: Partial<Record<AlgorithmId, CodeSnippet>> = {
  'two-pointers': {
    ts: [
      'function twoPointers(values: number[], target: number) {',
      '  let l = 0, r = values.length - 1;',
      '  while (l < r) {',
      '    const sum = values[l] + values[r];',
      '    if (sum === target) return [l, r];',
      '    if (sum < target) l++;',
      '    else r--;',
      '  }',
      '  return null;',
      '}',
    ],
    py: [
      'def two_pointers(values, target):',
      '    l, r = 0, len(values) - 1',
      '    while l < r:',
      '        s = values[l] + values[r]',
      '        if s == target:',
      '            return [l, r]',
      '        elif s < target:',
      '            l += 1',
      '        else:',
      '            r -= 1',
      '    return None',
    ],
  },
  'sliding-window': {
    ts: [
      'function slidingWindow(values: number[], k: number) {',
      '  let sum = 0;',
      '  for (let i = 0; i < k; i++) sum += values[i];',
      '  let max = sum;',
      '  for (let r = k; r < values.length; r++) {',
      '    sum += values[r] - values[r - k];',
      '    if (sum > max) max = sum;',
      '  }',
      '  return max;',
      '}',
    ],
    py: [
      'def sliding_window(values, k):',
      '    s = sum(values[:k])',
      '    mx = s',
      '    for r in range(k, len(values)):',
      '        s += values[r] - values[r - k]',
      '        if s > mx:',
      '            mx = s',
      '    return mx',
    ],
  },
};
