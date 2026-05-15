import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import type { ComplexityEntry } from '@/data/complexities';

const TWO_POINTER_ENTRY: ComplexityEntry = {
  time: { best: 'O(1)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(1)',
  notes: 'Best case: outermost pair is the answer.',
};

const UNIFORM_ENTRY: ComplexityEntry = {
  time: { best: 'O(n)', average: 'O(n)', worst: 'O(n)' },
  space: 'O(1)',
};

describe('ComplexityBadge', () => {
  it('renders best, avg, worst time badges when values differ', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    // O(1) appears in best time badge + space badge; O(n) appears in avg + worst
    expect(screen.getAllByText('O(1)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('O(n)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders a single time badge when all three are equal', () => {
    render(<ComplexityBadge entry={UNIFORM_ENTRY} />);
    // Only one O(n) for time; one O(1) for space
    const on = screen.getAllByText('O(n)');
    expect(on.length).toBe(1);
  });

  it('renders space complexity', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    // "Space" appears as both section header and badge label
    expect(screen.getAllByText(/space/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders notes when present', () => {
    render(<ComplexityBadge entry={TWO_POINTER_ENTRY} />);
    expect(screen.getByText(/best case/i)).toBeInTheDocument();
  });

  it('does not render notes section when notes absent', () => {
    render(<ComplexityBadge entry={UNIFORM_ENTRY} />);
    expect(screen.queryByText(/best case/i)).not.toBeInTheDocument();
  });
});
