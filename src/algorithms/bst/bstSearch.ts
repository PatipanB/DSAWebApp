import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTSearchInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1: function search(root, target) {
2:   if (root === null) return false;
3:   if (root.val === target) return true;
4:   if (target < root.val)
5:     return search(root.left, target);
6:   return search(root.right, target);
7: }
*/

function buildBST(values: number[]): { nodes: Record<string, TreeNode>; rootId: string | null } {
  const nodes: Record<string, TreeNode> = {};
  let rootId: string | null = null;
  let counter = 0;
  for (const val of values) {
    const id = `n${counter++}`;
    nodes[id] = { id, value: val, leftId: null, rightId: null };
    if (rootId === null) { rootId = id; continue; }
    let curr = rootId;
    while (true) {
      const node = nodes[curr]!;
      if (val < node.value) {
        if (node.leftId === null) { node.leftId = id; break; }
        curr = node.leftId;
      } else {
        if (node.rightId === null) { node.rightId = id; break; }
        curr = node.rightId;
      }
    }
  }
  return { nodes, rootId };
}

export function bstSearch(input: BSTSearchInput): AlgorithmRun<BSTSnapshot> {
  const { nodes, rootId } = buildBST(input.treeValues);
  const r = createRunBuilder<BSTSnapshot>('bst-search', input);
  const { target } = input;
  let curr: string | null = rootId;

  while (curr !== null) {
    const node = nodes[curr]!;
    if (node.value === target) {
      r.push({
        line: 3,
        narration: `Found ${target} at node — search successful`,
        snapshot: { nodes, rootId, current: curr, visited: [curr], comparingWith: curr, comparingValue: target },
        variables: { target, current: node.value, found: true },
      });
      return r.build(true);
    }
    const direction = target < node.value ? 'left' : 'right';
    r.push({
      line: 4,
      narration: `${target} ${target < node.value ? '<' : '>'} ${node.value} — go ${direction}`,
      snapshot: { nodes, rootId, current: curr, visited: [], comparingWith: curr, comparingValue: target },
      variables: { target, current: node.value },
    });
    curr = target < node.value ? node.leftId : node.rightId;
  }

  r.push({
    line: 2,
    narration: `Reached null — ${target} not found`,
    snapshot: { nodes, rootId, current: null, visited: [], comparingValue: target },
    variables: { target, found: false },
  });
  return r.build(false);
}
