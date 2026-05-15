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
