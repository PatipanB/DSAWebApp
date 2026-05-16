import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { LinkedListSnapshot, LinkedNode } from '@/types/snapshots';
import type { SinglyTraverseInput } from '@/types/algorithm';

export function singlyTraverse(input: SinglyTraverseInput): AlgorithmRun<LinkedListSnapshot> {
  const { values } = input;
  const r = createRunBuilder<LinkedListSnapshot>('singly-traverse', input);

  const nodeIds = values.map((_, i) => `n${i}`);
  const nodes: Record<string, LinkedNode> = {};
  for (let i = 0; i < values.length; i++) {
    nodes[nodeIds[i]!] = {
      id: nodeIds[i]!,
      value: values[i]!,
      nextId: i + 1 < values.length ? nodeIds[i + 1]! : null,
    };
  }
  const headId = values.length > 0 ? nodeIds[0]! : null;
  const tailId = values.length > 0 ? nodeIds[values.length - 1]! : null;

  for (let i = 0; i <= values.length; i++) {
    const currId = i < values.length ? nodeIds[i]! : null;
    const isInit = i === 0;
    const isDone = i === values.length;
    r.push({
      line: isInit ? 1 : isDone ? 2 : 4,
      narration: isDone
        ? 'curr is null — traversal complete.'
        : isInit
          ? `Initialize curr to head (value = ${values[i]}).`
          : `Move curr to next node (value = ${values[i]}).`,
      snapshot: {
        nodes,
        headId,
        tailId,
        pointers: [{ name: 'curr', nodeId: currId, color: 'amber' }],
        doubly: false,
      },
      variables: { curr: currId === null ? 'null' : String(values[i]) },
    });
  }

  return r.build([...values]);
}
