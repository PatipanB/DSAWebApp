import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTInsertInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1: function insert(root, val) {
2:   if (root === null) return new Node(val);
3:   if (val < root.val) {
4:     root.left = insert(root.left, val);
5:   } else {
6:     root.right = insert(root.right, val);
7:   }
8:   return root;
9: }
*/

function bstInorder(nodes: Record<string, TreeNode>, rootId: string | null): number[] {
  const result: number[] = [];
  function dfs(id: string | null) {
    if (id === null) return;
    dfs(nodes[id]!.leftId);
    result.push(nodes[id]!.value);
    dfs(nodes[id]!.rightId);
  }
  dfs(rootId);
  return result;
}

export function bstInsert(input: BSTInsertInput): AlgorithmRun<BSTSnapshot> {
  const r = createRunBuilder<BSTSnapshot>('bst-insert', input);
  const nodes: Record<string, TreeNode> = {};
  let rootId: string | null = null;
  let counter = 0;

  for (const val of input.values) {
    const newId = `n${counter++}`;
    nodes[newId] = { id: newId, value: val, leftId: null, rightId: null };

    if (rootId === null) {
      rootId = newId;
      r.push({
        line: 2,
        narration: `Insert ${val} as root`,
        snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
        variables: { inserting: val },
      });
      continue;
    }

    let curr: string = rootId;
    let inserted = false;
    while (!inserted) {
      const currNode = nodes[curr]!;
      r.push({
        line: 3,
        narration: `Compare ${val} ${val < currNode.value ? '<' : '>'} ${currNode.value} — go ${val < currNode.value ? 'left' : 'right'}`,
        snapshot: { nodes: { ...nodes }, rootId, current: curr, visited: [], comparingWith: curr, comparingValue: val },
        variables: { inserting: val, comparing: currNode.value },
      });

      if (val < currNode.value) {
        if (currNode.leftId === null) {
          currNode.leftId = newId;
          inserted = true;
          r.push({
            line: 2,
            narration: `Insert ${val} as left child of ${currNode.value}`,
            snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
            variables: { inserting: val, parent: currNode.value },
          });
        } else {
          curr = currNode.leftId;
        }
      } else {
        if (currNode.rightId === null) {
          currNode.rightId = newId;
          inserted = true;
          r.push({
            line: 2,
            narration: `Insert ${val} as right child of ${currNode.value}`,
            snapshot: { nodes: { ...nodes }, rootId, current: newId, visited: [], inserted: newId, comparingValue: val },
            variables: { inserting: val, parent: currNode.value },
          });
        } else {
          curr = currNode.rightId;
        }
      }
    }
  }

  return r.build(bstInorder(nodes, rootId));
}
