import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HashTableChainingVisualizer } from '@/components/visualizers/HashTableChainingVisualizer';
import type { ChainingSnapshot } from '@/types/snapshots';

const SNAP: ChainingSnapshot = {
  buckets: [
    [{ key: 'apple', value: '🍎', hash: 0 }],
    [],
    [{ key: 'cherry', value: '🍒', hash: 2 }],
    [], [], [], [],
  ],
  size: 2,
};

describe('HashTableChainingVisualizer', () => {
  it('renders correct number of bucket rows', () => {
    render(<HashTableChainingVisualizer snapshot={SNAP} />);
    expect(screen.getAllByTestId(/^chain-bucket-/).length).toBe(7);
  });
  it('renders entries in correct buckets', () => {
    render(<HashTableChainingVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('chain-entry-0-0')).toBeDefined();
    expect(screen.getByTestId('chain-entry-2-0')).toBeDefined();
  });
  it('shows placeholder for null snapshot', () => {
    render(<HashTableChainingVisualizer snapshot={null} />);
    expect(screen.getByTestId('hash-chaining-placeholder')).toBeDefined();
  });
});
