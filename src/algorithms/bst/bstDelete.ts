import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { BSTSnapshot, TreeNode } from '@/types/snapshots';
import type { BSTDeleteInput } from '@/types/algorithm';

/*
Displayed snippet lines:
1:  function deleteNode(root, key) {
2:    if (root === null) return null;
3:    if (key < root.val)
4:      root.left = deleteNode(root.left, key);
5:    else if (key > root.val)
6:      root.right = deleteNode(root.right, key);
7:    else {
8:      if (!root.left) return root.right;
9:      if (!root.right) return root.left;
10:     const succ = findMin(root.right);
11:     root.val = succ.val;
12:     root.right = deleteNode(root.right, succ.val);
13:   }
14:   return root;
15: }
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

function findMin(nodes: Record<string, TreeNode>, nodeId: string): string {
  let curr = nodeId;
  while (nodes[curr]!.leftId !== null) curr = nodes[curr]!.leftId!;
  return curr;
}

function findSuccParent(
  nodes: Record<string, TreeNode>,
  startId: string,
  succId: string,
): string | null {
  if (startId === succId) return null;
  let curr = startId;
  while (nodes[curr]!.leftId !== succId) curr = nodes[curr]!.leftId!;
  return curr;
}

function deepCopyNodes(nodes: Record<string, TreeNode>): Record<string, TreeNode> {
  return Object.fromEntries(Object.entries(nodes).map(([k, v]) => [k, { ...v }]));
}

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

export function bstDelete(input: BSTDeleteInput): AlgorithmRun<BSTSnapshot> {
  const { nodes, rootId: initialRootId } = buildBST(input.treeValues);
  const r = createRunBuilder<BSTSnapshot>('bst-delete', input);
  const { target } = input;
  let rootId = initialRootId;

  let curr: string | null = rootId;
  let parent: string | null = null;
  let isLeft = false;

  while (curr !== null && nodes[curr]!.value !== target) {
    const node = nodes[curr]!;
    const direction = target < node.value ? 'left' : 'right';
    r.push({
      line: target < node.value ? 3 : 5,
      narration: `${target} ${target < node.value ? '<' : '>'} ${node.value} — go ${direction}`,
      snapshot: { nodes: deepCopyNodes(nodes), rootId, current: curr, visited: [], comparingWith: curr, comparingValue: target },
      variables: { target, current: node.value },
    });
    parent = curr;
    isLeft = target < node.value;
    curr = target < node.value ? node.leftId : node.rightId;
  }

  if (curr === null) {
    r.push({
      line: 2,
      narration: `${target} not found in BST`,
      snapshot: { nodes: deepCopyNodes(nodes), rootId, current: null, visited: [] },
      variables: { target, found: false },
    });
    return r.build(bstInorder(nodes, rootId));
  }

  const targetNode = nodes[curr]!;

  // Case 1: leaf
  if (targetNode.leftId === null && targetNode.rightId === null) {
    r.push({
      line: 8,
      narration: `Node ${target} is a leaf — remove it`,
      snapshot: { nodes: deepCopyNodes(nodes), rootId, current: curr, visited: [], deletedNode: curr, comparingValue: target },
      variables: { target, node: targetNode.value, case: 'leaf' },
    });
    if (parent === null) {
      delete nodes[curr];
      return r.build([]);
    }
    if (isLeft) nodes[parent]!.leftId = null;
    else nodes[parent]!.rightId = null;
    delete nodes[curr];
    return r.build(bstInorder(nodes, rootId));
  }

  // Case 2: one child
  if (targetNode.leftId === null || targetNode.rightId === null) {
    const child = (targetNode.leftId ?? targetNode.rightId)!;
    r.push({
      line: targetNode.leftId === null ? 9 : 8,
      narration: `Node ${target} has one child — replace with it`,
      snapshot: { nodes: deepCopyNodes(nodes), rootId, current: curr, visited: [], deletedNode: curr, replacementNode: child, comparingValue: target },
      variables: { target, node: targetNode.value, case: 'one child' },
    });
    if (parent === null) {
      rootId = child;
      delete nodes[curr];
      return r.build(bstInorder(nodes, rootId));
    }
    if (isLeft) nodes[parent]!.leftId = child;
    else nodes[parent]!.rightId = child;
    delete nodes[curr];
    return r.build(bstInorder(nodes, rootId));
  }

  // Case 3: two children
  const succId = findMin(nodes, targetNode.rightId!);
  const succNode = nodes[succId]!;

  r.push({
    line: 10,
    narration: `Node ${target} has two children — finding inorder successor (leftmost in right subtree)`,
    snapshot: { nodes: deepCopyNodes(nodes), rootId, current: succId, visited: [], comparingWith: succId, comparingValue: target },
    variables: { target, node: targetNode.value, case: 'two children' },
  });

  r.push({
    line: 11,
    narration: `Replace ${target} with successor value ${succNode.value}`,
    snapshot: { nodes: deepCopyNodes(nodes), rootId, current: curr, visited: [], deletedNode: curr, replacementNode: succId, comparingValue: target },
    variables: { target, node: targetNode.value, successor: succNode.value },
  });

  targetNode.value = succNode.value;

  const succParent = findSuccParent(nodes, targetNode.rightId!, succId);
  if (succParent === null) {
    targetNode.rightId = succNode.rightId;
  } else {
    nodes[succParent]!.leftId = succNode.rightId;
  }

  r.push({
    line: 12,
    narration: `Delete successor ${succNode.value} from right subtree`,
    snapshot: { nodes: deepCopyNodes(nodes), rootId, current: curr, visited: [], comparingValue: target },
    variables: { target, deleted: succNode.value },
  });

  delete nodes[succId];
  return r.build(bstInorder(nodes, rootId));
}
