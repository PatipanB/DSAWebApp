import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { ArraySnapshot } from '@/types/snapshots';
import type { TwoPointersInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this, not the instrumented code below):
1:  function twoPointers(values, target) {
2:    let l = 0, r = values.length - 1;
3:    while (l < r) {
4:      const sum = values[l] + values[r];
5:      if (sum === target) return [l, r];
6:      if (sum < target) l++;
7:      else r--;
8:    }
9:    return null;
10: }
*/

export function twoPointers(input: TwoPointersInput): AlgorithmRun<ArraySnapshot> {
  const { values, target } = input;
  const r = createRunBuilder<ArraySnapshot>('two-pointers', input);

  let l = 0;
  let rv = values.length - 1;

  // Step: initialize
  r.push({
    line: 2,
    narration: `Initialize l=${l} (${values[l]}) and r=${rv} (${values[rv]})`,
    snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }] },
    variables: { l, r: rv, target },
  });

  while (l < rv) {
    const vl = values[l] ?? 0;
    const vr = values[rv] ?? 0;
    const sum = vl + vr;

    // Step: compare
    r.push({
      line: 4,
      narration: `Compare: ${vl} + ${vr} = ${sum} vs target ${target}`,
      snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
      variables: { l, r: rv, sum, target },
    });

    if (sum === target) {
      // Step: found
      r.push({
        line: 5,
        narration: `Found! ${vl} + ${vr} = ${target} at indices [${l}, ${rv}]`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'amber' }, { name: 'r', index: rv, color: 'amber' }], sum, result: [l, rv] },
        variables: { l, r: rv, sum, target },
      });
      return r.build([l, rv]);
    }

    if (sum < target) {
      l++;
      const newVl = values[l] ?? 0;
      r.push({
        line: 6,
        narration: `Sum too small — move l right to ${l} (${newVl})`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
        variables: { l, r: rv, sum, target },
      });
    } else {
      rv--;
      const newVr = values[rv] ?? 0;
      r.push({
        line: 7,
        narration: `Sum too large — move r left to ${rv} (${newVr})`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
        variables: { l, r: rv, sum, target },
      });
    }
  }

  // No solution
  r.push({
    line: 9,
    narration: 'Pointers crossed — no solution found',
    snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }] },
    variables: { l, r: rv, target },
  });
  return r.build(null);
}
