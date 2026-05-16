import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot } from '@/types/snapshots';
import type { StackDemoInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: class Stack {
2:   constructor() { this.items = []; }
3:   push(val) { this.items.push(val); }
4:   pop() { return this.items.pop(); }
5: }
6: // Push all values, then pop to show LIFO
*/

export function stackDemo(input: StackDemoInput): AlgorithmRun<StackSnapshot> {
  const { values } = input;
  const r = createRunBuilder<StackSnapshot>('stack-demo', input);
  let idCounter = 0;
  const uid = () => `s${idCounter++}`;

  let items: { id: string; value: number }[] = [];
  const popped: number[] = [];

  // init step
  r.push({
    line: 1,
    narration: 'Initializing stack demo.',
    snapshot: {
      items: [],
      inputCursor: 0,
      inputTokens: values.map(String),
    },
    variables: { stack: '[]' },
  });

  // push phase
  for (let i = 0; i < values.length; i++) {
    const val = values[i]!;
    items = [...items, { id: uid(), value: val }];
    r.push({
      line: 3,
      narration: `Push ${val} onto stack.`,
      snapshot: {
        items,
        inputCursor: i + 1,
        inputTokens: values.map(String),
      },
      variables: { stack: `[${items.map((it) => it.value).join(', ')}]` },
    });
  }

  // pop phase
  for (let i = 0; i < values.length; i++) {
    const top = items[items.length - 1]!;
    const val = top.value;
    items = items.slice(0, items.length - 1);
    popped.push(val);
    r.push({
      line: 4,
      narration: `Pop ${val} from stack (LIFO).`,
      snapshot: {
        items,
        inputCursor: values.length,
        inputTokens: values.map(String),
      },
      variables: {
        stack: `[${items.map((it) => it.value).join(', ')}]`,
        popped: `[${popped.join(', ')}]`,
      },
    });
  }

  return r.build([...popped]);
}
