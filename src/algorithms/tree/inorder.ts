import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { TreeSnapshot } from '@/types/snapshots';
import type { TreeTraversalInput } from '@/types/algorithm';
import { parseTree } from '@/utils/parseTree';

/*
Displayed snippet lines (1-indexed):
1: function inorder(root) {
2:   if (root === null) return;
3:   inorder(root.left);
4:   visit(root.value);
5:   inorder(root.right);
6: }
*/

export function inorder(input: TreeTraversalInput): AlgorithmRun<TreeSnapshot> {
  const { nodes, rootId } = parseTree(input.values);
  const r = createRunBuilder<TreeSnapshot>('inorder', input);
  const visited: string[] = [];
  const callStack: string[] = [];

  function dfs(nodeId: string | null): void {
    if (nodeId === null) return;
    const node = nodes[nodeId]!;
    const frame = `inorder(${node.value})`;

    callStack.push(frame);
    r.push({
      line: 1,
      narration: `Enter inorder(${node.value})`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, depth: callStack.length },
    });

    dfs(node.leftId);

    visited.push(nodeId);
    callStack.pop();
    r.push({
      line: 4,
      narration: `Visit ${node.value} — add to inorder output`,
      snapshot: { nodes, rootId, current: nodeId, visited: [...visited], callStack: [...callStack] },
      variables: { current: node.value, visitedCount: visited.length },
    });

    dfs(node.rightId);
  }

  dfs(rootId);
  return r.build(visited.map((id) => nodes[id]!.value));
}
