import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GraphGridVisualizer } from '@/components/visualizers/GraphGridVisualizer';
import type { GridSnapshot } from '@/types/snapshots';

const SNAP: GridSnapshot = {
  rows: 3, cols: 3,
  cells: [
    ['start', 'open', 'wall'],
    ['open', 'current', 'open'],
    ['open', 'open', 'end'],
  ],
};

describe('GraphGridVisualizer', () => {
  it('renders without crashing when snapshot=null', () => {
    render(<GraphGridVisualizer snapshot={null} />);
    expect(screen.getByTestId('graph-grid-placeholder')).toBeInTheDocument();
  });

  it('renders correct number of cells (rows × cols)', () => {
    render(<GraphGridVisualizer snapshot={SNAP} />);
    // 3 × 3 = 9 cells
    const grid = screen.getByTestId('graph-grid');
    expect(grid.querySelectorAll('[data-testid^="grid-cell-"]')).toHaveLength(9);
  });

  it('cell has correct data-testid grid-cell-0-0', () => {
    render(<GraphGridVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('grid-cell-0-0')).toBeInTheDocument();
  });

  it('wall cell has data-state="wall"', () => {
    render(<GraphGridVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('grid-cell-0-2')).toHaveAttribute('data-state', 'wall');
  });

  it('start cell has data-state="start"', () => {
    render(<GraphGridVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('grid-cell-0-0')).toHaveAttribute('data-state', 'start');
  });

  it('onCellClick called with correct row/col on click', () => {
    const handler = vi.fn();
    render(<GraphGridVisualizer snapshot={SNAP} onCellClick={handler} />);
    fireEvent.click(screen.getByTestId('grid-cell-1-2'));
    expect(handler).toHaveBeenCalledWith(1, 2);
  });

  it('current cell has data-state="current"', () => {
    render(<GraphGridVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('grid-cell-1-1')).toHaveAttribute('data-state', 'current');
  });
});
