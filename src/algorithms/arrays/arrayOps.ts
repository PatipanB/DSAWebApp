import { createRunBuilder } from '@/engine/types';
import type { ArrayOpsInput } from '@/types/algorithm';
import type { ArrayOpsSnapshot } from '@/types/snapshots';

export function arrayOps(input: ArrayOpsInput) {
  const r = createRunBuilder<ArrayOpsSnapshot>('array-ops', input);
  let arr = [...input.values];

  // Step 0: init
  r.push({
    line: 1,
    narration: 'Starting array operations demo.',
    snapshot: { values: [...arr], operation: 'idle' },
    variables: { array: `[${arr.join(', ')}]` },
  });

  // Step 1: push to end (O(1))
  const pushVal = Math.max(...arr) + 1;
  arr.push(pushVal);
  r.push({
    line: 2,
    narration: `Push ${pushVal} to end — O(1).`,
    snapshot: { values: [...arr], operation: 'push', activeIndex: arr.length - 1, cost: 'O(1)' },
    variables: { array: `[${arr.join(', ')}]`, pushVal },
  });

  // Step 2: insert announce (before mutation, show shift range)
  const insertIdx = Math.floor(arr.length / 2);
  const shiftCount = arr.length - insertIdx;
  r.push({
    line: 3,
    narration: `Insert 99 at index ${insertIdx} — shifting ${shiftCount} element${shiftCount !== 1 ? 's' : ''} right (O(n)).`,
    snapshot: {
      values: [...arr],
      operation: 'insert',
      shiftStart: insertIdx,
      shiftEnd: arr.length - 1,
      cost: 'O(n)',
    },
    variables: { array: `[${arr.join(', ')}]`, insertIdx, insertVal: 99 },
  });

  // Step 3: insert done
  arr.splice(insertIdx, 0, 99);
  r.push({
    line: 3,
    narration: `Inserted 99 at index ${insertIdx}.`,
    snapshot: { values: [...arr], operation: 'insert', activeIndex: insertIdx, cost: 'O(n)' },
    variables: { array: `[${arr.join(', ')}]` },
  });

  // Step 4: delete announce (before mutation, show shift range)
  const deleteShiftCount = arr.length - 2; // elements after idx 1
  r.push({
    line: 4,
    narration: `Delete at index 1 — shifting ${deleteShiftCount} element${deleteShiftCount !== 1 ? 's' : ''} left (O(n)).`,
    snapshot: {
      values: [...arr],
      operation: 'delete',
      shiftStart: 1,
      shiftEnd: arr.length - 2,
      cost: 'O(n)',
    },
    variables: { array: `[${arr.join(', ')}]`, deleteIdx: 1 },
  });

  // Step 5: delete done
  arr.splice(1, 1);
  r.push({
    line: 4,
    narration: 'Deleted element at index 1.',
    snapshot: { values: [...arr], operation: 'delete', activeIndex: 1, cost: 'O(n)' },
    variables: { array: `[${arr.join(', ')}]` },
  });

  // Step 6: pop from end (O(1))
  const popped = arr.pop()!;
  r.push({
    line: 5,
    narration: `Pop ${popped} from end — O(1).`,
    snapshot: { values: [...arr], operation: 'pop', cost: 'O(1)' },
    variables: { array: `[${arr.join(', ')}]`, popped },
  });

  // Step 7: final
  r.push({
    line: 6,
    narration: 'Array operations complete.',
    snapshot: { values: [...arr], operation: 'idle' },
    variables: { array: `[${arr.join(', ')}]` },
  });

  return r.build([...arr]);
}
