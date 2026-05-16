import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1: function postorder(root) {
2:   if (root === null) return;
3:   postorder(root.left);
4:   postorder(root.right);
5:   visit(root.value);
6: }
*/

export function postorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('postorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `postorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter postorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    dfs(node.leftId);
    dfs(node.rightId);

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 5,
      narration: `Visit ${node.value} — both children done, add to output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
