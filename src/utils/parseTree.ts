import type { TreeNode } from '@/types/snapshots';

export interface ParsedTree {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
}

export function parseTree(values: (number | null)[]): ParsedTree {
  const nodes: Record<string, TreeNode> = {};
  let counter = 0;

  const ids: (string | null)[] = values.map((v) => {
    if (v === null) return null;
    const id = `n${counter++}`;
    nodes[id] = { id, value: v, leftId: null, rightId: null };
    return id;
  });

  for (let i = 0; i < values.length; i++) {
    const parentId = ids[i];
    if (parentId === null) continue;
    const leftIdx = 2 * i + 1;
    const rightIdx = 2 * i + 2;
    nodes[parentId].leftId = leftIdx < ids.length ? ids[leftIdx] ?? null : null;
    nodes[parentId].rightId = rightIdx < ids.length ? ids[rightIdx] ?? null : null;
  }

  return { nodes, rootId: ids[0] ?? null };
}
