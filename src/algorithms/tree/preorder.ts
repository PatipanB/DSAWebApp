import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines:
1: function preorder(root) {
2:   if (root === null) return;
3:   visit(root.value);
4:   preorder(root.left);
5:   preorder(root.right);
6: }
*/

export function preorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('preorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `preorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter preorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 3,
      narration: `Visit ${node.value} — add to preorder output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });

    dfs(node.leftId);
    dfs(node.rightId);
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
