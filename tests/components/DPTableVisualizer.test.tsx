import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DPTableVisualizer } from '@/components/visualizers/DPTableVisualizer';
import type { DPSnapshot } from '@/types/snapshots';

const SNAP: DPSnapshot = {
  table: [
    [0, 0, 0],
    [0, null, null],
    [0, null, null],
  ],
  current: [1, 1],
  reading: [[0, 1]],
};

describe('DPTableVisualizer', () => {
  it('renders cells for each table entry', () => {
    render(<DPTableVisualizer snapshot={SNAP} />);
    expect(screen.getAllByTestId(/^dp-cell-/).length).toBe(9);
  });
  it('marks current cell', () => {
    render(<DPTableVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('dp-cell-1-1')).toHaveAttribute('data-state', 'current');
  });
  it('marks reading cells', () => {
    render(<DPTableVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('dp-cell-0-1')).toHaveAttribute('data-state', 'reading');
  });
  it('shows placeholder for null snapshot', () => {
    render(<DPTableVisualizer snapshot={null} />);
    expect(screen.getByTestId('dp-table-placeholder')).toBeDefined();
  });
});
