import type { AlgorithmId } from '@/types/algorithm';

export const KEY_INSIGHTS: Partial<Record<AlgorithmId, string>> = {
  'two-pointers':
    'Move the pointer with the smaller contribution inward — since the array is sorted, this is the only move guaranteed to shift the sum toward the target.',
  'sliding-window':
    'Keep a fixed-size window by adding the incoming element and dropping the outgoing one each step — one O(n) pass replaces an O(n²) brute force.',
  'balanced-brackets':
    'Use a stack: push opening brackets, and for every closing bracket verify it matches the top — if it does, pop; if not (or stack is empty), the string is unbalanced.',
  'monotonic-stack':
    'Keep a stack of "unanswered" elements in decreasing order — the moment a larger element arrives, everything smaller on the stack finally has its answer.',
  'queue-demo':
    'A queue is FIFO (first in, first out): enqueue at the back, dequeue at the front — the opposite end from a stack.',
  'stack-demo':
    'A stack is LIFO (last in, first out): push adds to the top, pop removes from the top — the opposite end from where you inserted in a queue.',
  'array-ops':
    'Appending or removing from the end is O(1) because no elements shift; inserting or deleting in the middle is O(n) because all elements to the right must shift.',
  'dynamic-window':
    'Grow the window right until a duplicate appears, then shrink from the left until the duplicate is gone — each character enters and leaves the window at most once, giving O(n) overall.',
  'singly-traverse':
    'Follow the chain: start curr=head, advance curr=curr.next each step, stop when curr is null — O(n) with O(1) space.',
  'singly-insert-delete':
    'Head insert is O(1) (redirect head); tail insert needs the tail pointer; delete requires tracking prev so prev.next can skip the removed node; reversal flips every next pointer in one pass.',
  'doubly-traverse':
    'The extra prev pointer enables O(1) backward navigation — forward: curr=curr.next; backward: curr=curr.prev. No copying or reversal needed.',
  'inorder':
    'Inorder (left → root → right) visits BST nodes in sorted order — the key invariant that makes inorder traversal the canonical way to list BST contents.',
  'preorder':
    'Preorder (root → left → right) visits the root before its subtrees — ideal for serialization since the root always comes first in the output.',
  'postorder':
    'Postorder (left → right → root) visits the root last — every child is fully processed before the parent, making it natural for deletion and bottom-up computation.',
  'level-order':
    'Level-order (BFS) uses a queue: enqueue the root, then for each dequeued node enqueue its children — processes the tree level by level without recursion.',
  'bst-insert':
    'Compare each node: go left if smaller, right if larger — follow this until you find a null slot, then attach the new node there.',
  'bst-search':
    'At every node, the BST invariant halves the search space: go left if target < current, right if larger — O(log n) on balanced trees.',
  'bst-delete':
    'Three cases: leaf → remove directly; one child → replace with it; two children → swap with inorder successor (leftmost in right subtree) then delete the successor.',
  'bfs-grid':
    'BFS explores the grid in rings — every cell at distance d is visited before any cell at distance d+1. This guarantees the shortest path (fewest steps) when one exists.',
  'dfs-grid':
    'DFS plunges as deep as possible before backtracking — it finds A path, not necessarily the shortest. The call stack grows with depth, making recursion depth visible.',
  'bfs-adjacency':
    'BFS on an adjacency list visits each node exactly once (level by level). Tree edges form the BFS shortest-path tree; all other examined edges are cross or back edges.',
  'dfs-adjacency':
    'DFS on a graph discovers tree edges (first-time visits) and back/cross edges (already-seen neighbors). The call stack mirrors the current DFS path from the start node.',
};
