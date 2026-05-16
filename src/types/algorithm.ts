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
