import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SortingVisualizer } from '@/components/visualizers/SortingVisualizer';

const BASE: import('@/types/snapshots').SortingSnapshot = {
  values: [3, 1, 2],
  comparing: [],
  swapped: [],
  sorted: [],
};

describe('SortingVisualizer', () => {
  it('renders correct number of bars', () => {
    render(<SortingVisualizer snapshot={BASE} />);
    expect(screen.getAllByTestId(/^sorting-bar-/).length).toBe(3);
  });
  it('marks comparing bars', () => {
    render(<SortingVisualizer snapshot={{ ...BASE, comparing: [0, 1] }} />);
    expect(screen.getByTestId('sorting-bar-0')).toHaveAttribute('data-state', 'comparing');
  });
  it('marks sorted bars', () => {
    render(<SortingVisualizer snapshot={{ ...BASE, sorted: [2] }} />);
    expect(screen.getByTestId('sorting-bar-2')).toHaveAttribute('data-state', 'sorted');
  });
  it('shows placeholder for null snapshot', () => {
    render(<SortingVisualizer snapshot={null} />);
    expect(screen.getByTestId('sorting-placeholder')).toBeDefined();
  });
  it('shows label when provided', () => {
    render(<SortingVisualizer snapshot={BASE} label="Bubble Sort" />);
    expect(screen.getByText('Bubble Sort')).toBeDefined();
  });
});
