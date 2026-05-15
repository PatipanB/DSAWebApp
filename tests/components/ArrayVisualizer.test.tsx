import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import type { ArraySnapshot } from '@/types/snapshots';

const baseSnap: ArraySnapshot = {
  values: [3, 1, 4, 1, 5],
  pointers: [
    { name: 'l', index: 0, color: 'cyan' },
    { name: 'r', index: 4, color: 'amber' },
  ],
};

describe('ArrayVisualizer', () => {
  it('renders a cell for each value', () => {
    render(<ArrayVisualizer snapshot={baseSnap} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders pointer labels', () => {
    render(<ArrayVisualizer snapshot={baseSnap} />);
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
  });

  it('renders correct number of cells with data-testid', () => {
    const { container } = render(<ArrayVisualizer snapshot={baseSnap} />);
    const cells = container.querySelectorAll('[data-testid^="cell-"]');
    expect(cells.length).toBe(5);
  });

  it('renders null gracefully', () => {
    const { container } = render(<ArrayVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });
});
