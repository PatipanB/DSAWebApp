import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot, StackItem } from '@/types/snapshots';
import type { MonotonicStackInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1:  function nextGreater(nums) {
2:    const result = new Array(nums.length).fill(-1);
3:    const stack = [];
4:    for (let i = 0; i < nums.length; i++) {
5:      while (stack.length && nums[stack.at(-1)] < nums[i]) {
6:        result[stack.pop()] = nums[i];
7:      }
8:      stack.push(i);
9:    }
10:   return result;
11: }
*/

export function monotonicStack(input: MonotonicStackInput): AlgorithmRun<StackSnapshot> {
  const { values } = input;
  const n = values.length;
  const r = createRunBuilder<StackSnapshot>('monotonic-stack', input);
  let idCounter = 0;
  const uid = () => `m${idCounter++}`;

  const result: number[] = new Array(n).fill(-1);
  let indexStack: number[] = [];
  let visualItems: StackItem[] = [];

  r.push({
    line: 2,
    narration: `Initialize result=[-1,…,-1] and empty stack`,
    snapshot: { items: [], inputTokens: values.map(String), inputCursor: 0, result: [...result] },
    variables: { result: JSON.stringify(result) },
  });

  for (let i = 0; i < n; i++) {
    const curr = values[i]!;

    while (indexStack.length > 0) {
      const topIdx = indexStack[indexStack.length - 1]!;
      const topVal = values[topIdx]!;
      if (topVal >= curr) break;

      indexStack = indexStack.slice(0, -1);
      visualItems = visualItems.slice(0, -1);
      result[topIdx] = curr;

      r.push({
        line: 6,
        narration: `${topVal} < ${curr}: pop index ${topIdx}, set result[${topIdx}]=${curr}`,
        snapshot: { items: [...visualItems], inputCursor: i, inputTokens: values.map(String), result: [...result] },
        variables: { i, curr, popped: topIdx, [`result[${topIdx}]`]: curr },
      });
    }

    indexStack = [...indexStack, i];
    visualItems = [...visualItems, { id: uid(), value: curr }];

    r.push({
      line: 8,
      narration: `Push ${curr} (index ${i}) onto stack`,
      snapshot: { items: [...visualItems], inputCursor: i + 1, inputTokens: values.map(String), result: [...result] },
      variables: { i, curr, stackSize: indexStack.length },
    });
  }

  r.push({
    line: 10,
    narration: `Done — ${indexStack.length} element(s) have no next greater (already -1)`,
    snapshot: { items: [], inputCursor: n, inputTokens: values.map(String), result: [...result] },
    variables: { result: JSON.stringify(result) },
  });

  return r.build([...result]);
}
