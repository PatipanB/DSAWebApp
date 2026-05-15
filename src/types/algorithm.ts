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
  | 'lcs';

export interface TwoPointersInput {
  values: number[];
  target: number;
}

export const DEFAULT_TWO_POINTERS_INPUT: TwoPointersInput = {
  values: [1, 2, 3, 4, 6, 8, 11, 15],
  target: 11,
};
