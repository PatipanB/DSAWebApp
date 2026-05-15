import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { QueueSnapshot, StackItem } from '@/types/snapshots';
import type { QueueDemoInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: class Queue {
2:   constructor() { this.items = []; }
3:   enqueue(val) { this.items.push(val); }
4:   dequeue() { return this.items.shift(); }
5: }
6: // Enqueue all values, then dequeue to show FIFO
*/

export function queueDemo(input: QueueDemoInput): AlgorithmRun<QueueSnapshot> {
  const { values } = input;
  const r = createRunBuilder<QueueSnapshot>('queue-demo', input);
  let idCounter = 0;
  const uid = () => `q${idCounter++}`;

  let items: StackItem[] = [];
  const dequeued: number[] = [];

  const snap = (extra?: Partial<QueueSnapshot>): QueueSnapshot => ({
    items: [...items],
    head: 0,
    tail: Math.max(0, items.length - 1),
    inputValues: values,
    ...extra,
  });

  r.push({
    line: 2,
    narration: `Create empty queue — items will enqueue from the back, dequeue from the front`,
    snapshot: snap({ phase: 'enqueue', inputCursor: 0 }),
    variables: { size: 0 },
  });

  for (let i = 0; i < values.length; i++) {
    const val = values[i]!;
    items = [...items, { id: uid(), value: val }];
    r.push({
      line: 3,
      narration: `Enqueue ${val} — added to back of queue`,
      snapshot: snap({ phase: 'enqueue', inputCursor: i + 1 }),
      variables: { enqueued: val, size: items.length },
    });
  }

  for (let i = 0; i < values.length; i++) {
    const val = items[0]!.value as number;
    items = items.slice(1);
    dequeued.push(val);
    r.push({
      line: 4,
      narration: `Dequeue ${val} from front — FIFO order preserved`,
      snapshot: snap({ phase: 'dequeue', inputCursor: i }),
      variables: { dequeued: val, size: items.length, order: JSON.stringify(dequeued) },
    });
  }

  return r.build([...dequeued]);
}
