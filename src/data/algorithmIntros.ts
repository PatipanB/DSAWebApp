export const ALGORITHM_INTROS: Record<string, string> = {
  // Binary tree traversals
  'inorder':     'Visits left subtree, then root, then right subtree. Produces sorted output for a BST.',
  'preorder':    'Visits root first, then left, then right subtree. Used to copy or serialize trees.',
  'postorder':   'Visits left, right, then root. Used for deletion — children before parents.',
  'level-order': 'Visits all nodes level by level using a queue. The BFS traversal of trees.',
  // BST
  'bst-insert': 'Follow BST property (smaller left, larger right) until reaching a null slot.',
  'bst-search': 'Halves the search space at each node by comparing with the BST key.',
  'bst-delete': 'Three cases: leaf, one child, or two children (replace with inorder successor).',
  // Graph
  'bfs-grid':       'Explores all neighbors at current depth before going deeper. Finds shortest path.',
  'dfs-grid':       'Explores as far as possible before backtracking. Uses a call stack.',
  'bfs-adjacency':  'Same BFS logic on an adjacency-list graph. Dequeues one node per step.',
  'dfs-adjacency':  'Same DFS logic on an adjacency-list graph. Recurses into unvisited neighbors.',
  // Sorting
  'bubble-sort': 'Repeatedly swaps adjacent out-of-order pairs. Each pass floats the max to the end.',
  'merge-sort':  'Divide array in half recursively, then merge sorted halves. O(n log n) guaranteed.',
  'quick-sort':  'Pick a pivot, partition, recurse. Fastest on average but O(n²) worst case.',
  'heap-sort':   'Build a max-heap, then extract-max n times. In-place with O(n log n) guarantee.',
  // Hash table
  'chaining':        'Each bucket holds a linked list. Collisions extend the chain.',
  'open-addressing': 'On collision, probe forward until an empty slot is found (linear probing here).',
  // DP
  'fibonacci':   'Fill dp[i] = dp[i-1] + dp[i-2] bottom-up. Avoids exponential recursion.',
  'knapsack-01': 'For each item, decide: skip it (dp[i-1][w]) or take it if it fits.',
  'lcs':         'Match characters; on match extend dp[i-1][j-1]+1; on mismatch take the max.',
};
