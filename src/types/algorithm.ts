import type { GridCell, GraphNode, GraphEdge } from '@/types/snapshots';

export type AlgorithmId =
  | 'two-pointers'
  | 'sliding-window'
  | 'balanced-brackets'
  | 'monotonic-stack'
  | 'queue-demo'
  | 'singly-traverse'
  | 'singly-insert-delete'
  | 'doubly-traverse'
  | 'inorder'
  | 'preorder'
  | 'postorder'
  | 'level-order'
  | 'bst-insert'
  | 'bst-search'
  | 'bst-delete'
  | 'bfs-grid'
  | 'dfs-grid'
  | 'bfs-adjacency'
  | 'dfs-adjacency'
  | 'bubble-sort'
  | 'merge-sort'
  | 'quick-sort'
  | 'heap-sort'
  | 'chaining'
  | 'open-addressing'
  | 'fibonacci'
  | 'knapsack-01'
  | 'lcs'
  | 'stack-demo'
  | 'array-ops'
  | 'dynamic-window';

export interface TwoPointersInput {
  values: number[];
  target: number;
}

export const DEFAULT_TWO_POINTERS_INPUT: TwoPointersInput = {
  values: [1, 2, 3, 4, 6, 8, 11, 15],
  target: 11,
};

export interface SlidingWindowInput {
  values: number[];
  k: number;
}

export const DEFAULT_SLIDING_WINDOW_INPUT: SlidingWindowInput = {
  values: [2, 1, 5, 1, 3, 2],
  k: 3,
};

export interface BalancedBracketsInput {
  expression: string;
}

export const DEFAULT_BALANCED_BRACKETS_INPUT: BalancedBracketsInput = {
  expression: '([{}])',
};

export interface MonotonicStackInput {
  values: number[];
}

export const DEFAULT_MONOTONIC_STACK_INPUT: MonotonicStackInput = {
  values: [2, 1, 2, 4, 3],
};

export interface QueueDemoInput {
  values: number[];
}

export const DEFAULT_QUEUE_DEMO_INPUT: QueueDemoInput = {
  values: [3, 1, 2, 4],
};

export interface StackDemoInput {
  values: number[];
}

export const DEFAULT_STACK_DEMO_INPUT: StackDemoInput = {
  values: [3, 1, 2, 4],
};

export interface ArrayOpsInput {
  values: number[];
}

export const DEFAULT_ARRAY_OPS_INPUT: ArrayOpsInput = {
  values: [1, 2, 3, 4],
};

export interface DynamicWindowInput {
  s: string;
}

export const DEFAULT_DYNAMIC_WINDOW_INPUT: DynamicWindowInput = {
  s: 'abcabcbb',
};

export interface SinglyTraverseInput {
  values: number[];
}

export const DEFAULT_SINGLY_TRAVERSE_INPUT: SinglyTraverseInput = {
  values: [1, 2, 3, 4],
};

export interface SinglyInsertDeleteInput {
  values: number[];
}

export const DEFAULT_SINGLY_INSERT_DELETE_INPUT: SinglyInsertDeleteInput = {
  values: [1, 2, 3, 4],
};

export interface DoublyTraverseInput {
  values: number[];
}

export const DEFAULT_DOUBLY_TRAVERSE_INPUT: DoublyTraverseInput = {
  values: [1, 2, 3, 4],
};

export interface TreeTraversalInput {
  values: (number | null)[];
}

export const DEFAULT_TREE_TRAVERSAL_INPUT: TreeTraversalInput = {
  values: [1, 2, 3, 4, 5, null, 6],
};

export interface BSTInsertInput {
  values: number[];
}

export const DEFAULT_BST_INSERT_INPUT: BSTInsertInput = {
  values: [5, 3, 7, 1, 4, 6, 8],
};

export interface BSTSearchInput {
  treeValues: number[];
  target: number;
}

export const DEFAULT_BST_SEARCH_INPUT: BSTSearchInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 4,
};

export interface BSTDeleteInput {
  treeValues: number[];
  target: number;
}

export const DEFAULT_BST_DELETE_INPUT: BSTDeleteInput = {
  treeValues: [5, 3, 7, 1, 4, 6, 8],
  target: 3,
};

export interface GridInput {
  rows: number;
  cols: number;
  cells: GridCell[][];
  start: [number, number];
  end: [number, number];
}

export const DEFAULT_GRID_INPUT: GridInput = {
  rows: 8,
  cols: 8,
  start: [0, 0],
  end: [7, 7],
  cells: (() => {
    const grid: GridCell[][] = Array.from({ length: 8 }, () => Array(8).fill('open') as GridCell[]);
    // mark start/end
    grid[0]![0] = 'start';
    grid[7]![7] = 'end';
    // simple wall pattern (L-shaped blocker in the middle)
    grid[1]![3] = 'wall';
    grid[2]![3] = 'wall';
    grid[3]![3] = 'wall';
    grid[3]![4] = 'wall';
    grid[3]![5] = 'wall';
    grid[5]![2] = 'wall';
    grid[5]![3] = 'wall';
    grid[5]![4] = 'wall';
    grid[4]![4] = 'wall';
    return grid;
  })(),
};

export interface AdjacencyInput {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startId: string;
}

export const DEFAULT_ADJACENCY_INPUT: AdjacencyInput = {
  startId: 'n0',
  nodes: [
    { id: 'n0', label: 'A', x: 80,  y: 80  },
    { id: 'n1', label: 'B', x: 220, y: 60  },
    { id: 'n2', label: 'C', x: 340, y: 140 },
    { id: 'n3', label: 'D', x: 80,  y: 220 },
    { id: 'n4', label: 'E', x: 220, y: 280 },
    { id: 'n5', label: 'F', x: 340, y: 300 },
  ],
  edges: [
    { from: 'n0', to: 'n1' },
    { from: 'n0', to: 'n3' },
    { from: 'n1', to: 'n2' },
    { from: 'n1', to: 'n4' },
    { from: 'n2', to: 'n5' },
    { from: 'n3', to: 'n4' },
    { from: 'n4', to: 'n5' },
    { from: 'n2', to: 'n3' },
  ],
};

export interface SortingInput {
  values: number[];
}

export const DEFAULT_SORTING_INPUT: SortingInput = {
  values: [5, 2, 8, 1, 9, 3, 7, 4, 6],
};

export interface HashTableInput {
  entries: { key: string; value: string }[];
  bucketCount: number;
}

export const DEFAULT_HASH_TABLE_INPUT: HashTableInput = {
  bucketCount: 7,
  entries: [
    { key: 'apple',  value: '🍎' },
    { key: 'banana', value: '🍌' },
    { key: 'cherry', value: '🍒' },
    { key: 'date',   value: '🌴' },
    { key: 'elder',  value: '🫐' },
    { key: 'fig',    value: '🍇' },
  ],
};

export interface FibonacciInput {
  n: number;
}

export const DEFAULT_FIBONACCI_INPUT: FibonacciInput = { n: 8 };

export interface KnapsackInput {
  weights: number[];
  values: number[];
  capacity: number;
}

export const DEFAULT_KNAPSACK_INPUT: KnapsackInput = {
  weights: [2, 3, 4, 5],
  values: [3, 4, 5, 6],
  capacity: 5,
};

export interface LCSInput {
  a: string;
  b: string;
}

export const DEFAULT_LCS_INPUT: LCSInput = { a: 'ABCBDAB', b: 'BDCABA' };
