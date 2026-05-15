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
