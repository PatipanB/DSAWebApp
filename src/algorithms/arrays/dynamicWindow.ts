import { createRunBuilder } from '@/engine/types';
import type { DynamicWindowInput } from '@/types/algorithm';
import type { StringWindowSnapshot } from '@/types/snapshots';

export function dynamicWindow(input: DynamicWindowInput) {
  const r = createRunBuilder<StringWindowSnapshot>('dynamic-window', input);
  const { s } = input;
  const chars = s.split('');
  const seen = new Set<string>();
  let left = 0;
  let maxLen = 0;

  // init step
  r.push({
    line: 1,
    narration: 'Initialize window: left=0, right=0, seen={}.',
    snapshot: { chars, left: 0, right: 0, windowSet: [], maxLen: 0, currentLen: 0, phase: 'init' },
    variables: { left: 0, right: 0, maxLen: 0, seen: '{}' },
  });

  for (let right = 0; right < chars.length; right++) {
    const c = chars[right]!;

    // shrink phase: remove from left until c is not in window
    while (seen.has(c)) {
      const removed = chars[left]!;
      seen.delete(removed);
      left++;
      r.push({
        line: 3,
        narration: `Duplicate '${c}' found — remove '${removed}' from window, shrink left to ${left}.`,
        snapshot: {
          chars,
          left,
          right,
          windowSet: [...seen],
          maxLen,
          currentLen: right - left,
          phase: 'shrink',
        },
        variables: { left, right, maxLen, seen: `{${[...seen].join(', ')}}` },
      });
    }

    // expand
    seen.add(c);
    maxLen = Math.max(maxLen, right - left + 1);
    r.push({
      line: 4,
      narration: `Add '${c}' to window. Window: [${left}, ${right}], length=${right - left + 1}.`,
      snapshot: {
        chars,
        left,
        right,
        windowSet: [...seen],
        maxLen,
        currentLen: right - left + 1,
        phase: 'expand',
      },
      variables: { left, right, maxLen, seen: `{${[...seen].join(', ')}}` },
    });
  }

  // done step
  r.push({
    line: 5,
    narration: `Longest substring without repeating characters: ${maxLen}.`,
    snapshot: {
      chars,
      left,
      right: chars.length > 0 ? chars.length - 1 : 0,
      windowSet: [...seen],
      maxLen,
      currentLen: 0,
      phase: 'done',
    },
    variables: { maxLen, result: maxLen },
  });

  return r.build(maxLen);
}
