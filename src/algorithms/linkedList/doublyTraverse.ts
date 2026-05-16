import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { DoublyTraverseInput } from '@/types/algorithm';

export function doublyTraverse(input: DoublyTraverseInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('doubly-traverse', input);

  const nodeIds = values.map((_, i) => `n${i}`);
  const nodes: Record<string, LinkedNode> = {};
  for (let i = 0; i < values.length; i++) {
    nodes[nodeIds[i]!] = {
      id: nodeIds[i]!,
      value: values[i]!,
      nextId: i + 1 < values.length ? nodeIds[i + 1]! : null,
      prevId: i > 0 ? nodeIds[i - 1]! : null,
    };
  }
  const headId = values.length > 0 ? nodeIds[0]! : null;
  const tailId = values.length > 0 ? nodeIds[values.length - 1]! : null;

  // Forward traversal: n steps
  for (let i = 0; i < values.length; i++) {
    r.push({
      line: i === 0 ? 2 : 3,
      narration:
        i === 0
          ? `Forward pass — curr starts at head (value = ${values[i]}).`
          : `Forward: curr moves to next (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: nodeIds[i]!, color: 'amber' }],
        doubly: true,
      },
      variables: { curr: String(values[i]), direction: 'forward' },
    });
  }

  // Backward traversal: n steps
  for (let i = values.length - 1; i >= 0; i--) {
    r.push({
      line: i === values.length - 1 ? 5 : 6,
      narration:
        i === values.length - 1
          ? `Backward pass — curr starts at tail (value = ${values[i]}).`
          : `Backward: curr moves to prev (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: nodeIds[i]!, color: 'amber' }],
        doubly: true,
      },
      variables: { curr: String(values[i]), direction: 'backward' },
    });
  }

  return r.build({ forward: [...values], backward: [...values].reverse() });
}
