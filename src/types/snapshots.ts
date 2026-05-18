export interface ArrayPointer {
  name: string;
  index: number;
  color: 'cyan' | 'amber' | 'rose';
}

export interface ArraySnapshot {
  values: number[];
  pointers: ArrayPointer[];
  window?: { start: number; end: number };
  sum?: number;
  result?: number | number[];
}

export interface StackItem {
  id: string;
  value: string | number;
}

export interface StackSnapshot {
  items: StackItem[];
  inputCursor?: number;
  inputTokens?: string[];
  matched?: { open: string; close: string };
  invalid?: boolean;
  result?: (number | null)[];
}

export interface QueueSnapshot {
  items: StackItem[];
  head: number;
  tail: number;
  inputValues?: number[];
  inputCursor?: number;
  phase?: 'enqueue' | 'dequeue';
}

export type ArrayOperation = 'idle' | 'push' | 'insert' | 'delete' | 'pop';

export interface ArrayOpsSnapshot {
  values: number[];
  operation: ArrayOperation;
  activeIndex?: number;
  shiftStart?: number;
  shiftEnd?: number;
  cost?: 'O(1)' | 'O(n)';
}

export interface StringWindowSnapshot {
  chars: string[];
  left: number;
  right: number;
  windowSet: string[];
  maxLen: number;
  currentLen: number;
  phase: 'init' | 'shrink' | 'expand' | 'done';
}

export interface LinkedNode {
  id: string;
  value: number;
  nextId: string | null;
  prevId?: string | null;
}

export interface LinkedListSnapshot {
  nodes: Record<string, LinkedNode>;
  headId: string | null;
  tailId?: string | null;
  pointers: { name: string; nodeId: string | null; color: 'cyan' | 'amber' | 'rose' }[];
  doubly: boolean;
}

export interface TreeNode {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
}

export interface TreeSnapshot {
  nodes: Record<string, TreeNode>;
  rootId: string | null;
  current: string | null;
  visited: string[];
  callStack?: string[];
  queue?: string[];
}

export interface BSTSnapshot extends TreeSnapshot {
  comparingWith?: string;
  comparingValue?: number;
  inserted?: string;
  deletedNode?: string;
  replacementNode?: string;
}

export type GridCell = 'open' | 'wall' | 'start' | 'end' | 'visited' | 'frontier' | 'path' | 'current';

export interface GridSnapshot {
  rows: number;
  cols: number;
  cells: GridCell[][];
  current?: [number, number];
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface AdjacencySnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startId: string;
  visited: string[];
  frontier: string[];
  current: string | null;
  edgeStates: Record<string, 'idle' | 'traversed' | 'tree'>;
}

export interface SortingSnapshot {
  values: number[];
  comparing: number[];
  swapped: number[];
  sorted: number[];
  pivot?: number;
  subarray?: { start: number; end: number };
  auxArray?: number[];
  heapBoundary?: number;
}
