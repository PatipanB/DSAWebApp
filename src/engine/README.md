# Engine — Algorithm Authoring Guide

## How the engine works

1. An algorithm function takes input and returns `AlgorithmRun<Snapshot>`.
2. `AlgorithmRun` contains a pre-computed `steps: Step<Snapshot>[]` array.
3. `Runner` plays back the array at a configurable frame rate using `requestAnimationFrame`.
4. `useAlgorithmRun` hook subscribes to `Runner` and pushes `stepIndex`/`state` into `runStore`.
5. Visualizer components read `run.steps[stepIndex].snapshot` and render it.

## What counts as one step?

> **One step = one observable state change a learner should pause to read.**

Emit a step when ANY of these changes:
- A named pointer or index moves (e.g., `l++`, `r--`)
- A data structure mutates (push, pop, swap, cell filled)
- A comparison result is decided (emit BEFORE the branch)
- A recursive call enters or returns (push/pop on `callStack`)
- A tracked variable materially changes (`sum`, `windowMax`, `count`)

Do NOT emit steps for:
- Pure arithmetic not visible in the snapshot
- Loop counter increments implicit in pointer moves
- Re-reading the same value twice

## Algorithm file template

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { MySnapshot } from '@/types/snapshots';
import type { MyInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function myAlgo(input) {
2:   ...
*/

export function myAlgo(input: MyInput): AlgorithmRun<MySnapshot> {
  const r = createRunBuilder<MySnapshot>('my-algorithm-id', input);
  // ... build steps
  r.push({ line: 1, narration: '...', snapshot: { ... }, variables: { ... } });
  return r.build(finalResult);
}
```

## Test contract (mandatory — both tests required)

```ts
describe('myAlgo', () => {
  it('result: correct answer for known input', () => {
    expect(myAlgo(input).finalResult).toEqual(expected);
  });
  it('trace: matches snapshot', () => {
    expect(serializeRun(myAlgo(input))).toMatchSnapshot();
  });
});
```

Never write a result-only test without the trace snapshot test. The trace catches "right answer, wrong steps" regressions — exactly the bugs that ruin the learning experience.

## Line number alignment

The `line` field in each step references the DISPLAYED snippet (the comment block), not the instrumented source code. Keep them aligned — count from line 1 at the top of the displayed function.

## Data-file checklist (add for each new algorithm)

When adding algorithm `my-algo` to topic `my-topic`, update all four data files:

| File | What to add |
|------|-------------|
| `src/data/codeSnippets.ts` | `'my-algo': { ts: [...], py: [...] }` — line arrays matching the DISPLAYED SNIPPET |
| `src/data/complexities.ts` | `'my-algo': { time: { best, average, worst }, space, notes? }` |
| `src/data/neetcodeProblems.ts` | `'my-topic': [...]` — array of `Problem` objects (`title, slug, difficulty, hint`) |
| `src/data/keyInsights.ts` | `'my-algo': '...'` — one sentence on the key insight |

Also update `src/types/algorithm.ts`:
- Add the new `AlgorithmId` to the union
- Export `MyAlgoInput` interface and `DEFAULT_MY_ALGO_INPUT` constant
