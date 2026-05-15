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
    const { container } = render(<ArrayVisualizer snapshot={baseSnap} />);
    // Use data-testid to avoid ambiguity with index labels that also show numbers
    expect(container.querySelector('[data-testid="cell-0"]')?.textContent).toBe('3');
    expect(container.querySelector('[data-testid="cell-4"]')?.textContent).toBe('5');
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

  it('highlights window cells when window is set', () => {
    const snap: ArraySnapshot = {
      values: [2, 1, 5, 1, 3, 2],
      pointers: [],
      window: { start: 1, end: 3 },
    };
    const { container } = render(<ArrayVisualizer snapshot={snap} />);
    const windowed = container.querySelectorAll('[data-window="true"]');
    expect(windowed.length).toBe(3);
  });

  it('does not mark cells outside window', () => {
    const snap: ArraySnapshot = {
      values: [2, 1, 5, 1, 3, 2],
      pointers: [],
      window: { start: 1, end: 3 },
    };
    const { container } = render(<ArrayVisualizer snapshot={snap} />);
    const cell0 = container.querySelector('[data-testid="cell-0"]');
    expect(cell0?.getAttribute('data-window')).toBeNull();
  });
});
