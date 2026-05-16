import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1:  function levelOrder(root) {
2:    if (!root) return [];
3:    const queue = [root];
4:    const result = [];
5:    while (queue.length > 0) {
6:      const node = queue.shift();
7:      result.push(node.value);
8:      if (node.left) queue.push(node.left);
9:      if (node.right) queue.push(node.right);
10:   }
11:   return result;
12: }
*/

export function levelOrder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('level-order', input);

  if (rootId === null) {
    r.push({
      line: 2,
      narration: 'Tree is empty — return []',
      snapshot: { nodes, rootId, current: null, visited: [], queue: [] },
    });
    return r.build([]);
  }

  const queue: string[] = [rootId];
  const visited: string[] = [];

  r.push({
    line: 3,
    narration: `Initialize queue with root (${nodes[rootId]!.value})`,
    snapshot: { nodes, rootId, current: null, visited: [], queue: [...queue] },
    variables: { queueSize: queue.length },
  });

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    const node = nodes[nodeId]!;
    visited.push(nodeId);

    const left = node.leftId;
    const right = node.rightId;
    if (left !== null) queue.push(left);
    if (right !== null) queue.push(right);

    r.push({
      line: 7,
      narration: `Dequeue ${node.value}, enqueue children — queue size now ${queue.length}`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], queue: [...queue] },
      variables: { current: node.value, queueSize: queue.length, visitedCount: visited.length },
    });
  }

  return r.build(visited.map((id) => nodes[id]!.value));
}
