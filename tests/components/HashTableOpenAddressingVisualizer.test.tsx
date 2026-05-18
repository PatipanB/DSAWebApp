import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HashTableOpenAddressingVisualizer } from '@/components/visualizers/HashTableOpenAddressingVisualizer';
import type { OpenAddressingSnapshot } from '@/types/snapshots';

const SNAP: OpenAddressingSnapshot = {
  slots: [
    { key: 'apple', value: '🍎', hash: 0 },
    null,
    null,
    { key: 'date', value: '🌴', hash: 3 },
    null, null, null,
  ],
  probeIndex: 1,
  probeSequence: [0, 1],
};

describe('HashTableOpenAddressingVisualizer', () => {
  it('renders correct number of slots', () => {
    render(<HashTableOpenAddressingVisualizer snapshot={SNAP} />);
    expect(screen.getAllByTestId(/^oa-slot-/).length).toBe(7);
  });
  it('marks probeIndex slot', () => {
    render(<HashTableOpenAddressingVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('oa-slot-1')).toHaveAttribute('data-state', 'current-probe');
  });
  it('shows placeholder for null snapshot', () => {
    render(<HashTableOpenAddressingVisualizer snapshot={null} />);
    expect(screen.getByTestId('hash-oa-placeholder')).toBeDefined();
  });
});
