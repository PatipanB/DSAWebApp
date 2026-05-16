import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ArrayOpsVisualizer } from '@/components/visualizers/ArrayOpsVisualizer';
import type { ArrayOpsSnapshot } from '@/types/snapshots';

const baseSnap: ArrayOpsSnapshot = {
  values: [1, 2, 3, 4, 5],
  operation: 'push',
  activeIndex: 4,
  cost: 'O(1)',
};

describe('ArrayOpsVisualizer', () => {
  it('renders "No data" when snapshot is null', () => {
    render(<ArrayOpsVisualizer snapshot={null} />);
    expect(screen.getByText('No data')).toBeTruthy();
  });

  it('renders one cell per value', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    expect(screen.getByTestId('ops-cell-0')).toBeTruthy();
    expect(screen.getByTestId('ops-cell-4')).toBeTruthy();
  });

  it('renders index labels for each cell', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    expect(screen.getByTestId('ops-index-0')).toBeTruthy();
    expect(screen.getByTestId('ops-index-4')).toBeTruthy();
  });

  it('marks activeIndex cell with data-active="true"', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    const cell = screen.getByTestId('ops-cell-4');
    expect(cell.getAttribute('data-active')).toBe('true');
  });

  it('non-active cells do not have data-active', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    const cell = screen.getByTestId('ops-cell-0');
    expect(cell.getAttribute('data-active')).toBeNull();
  });

  it('marks shift range cells with data-shift="true"', () => {
    const snap: ArrayOpsSnapshot = {
      values: [1, 2, 3, 4, 5],
      operation: 'insert',
      shiftStart: 2,
      shiftEnd: 4,
      cost: 'O(n)',
    };
    render(<ArrayOpsVisualizer snapshot={snap} />);
    expect(screen.getByTestId('ops-cell-2').getAttribute('data-shift')).toBe('true');
    expect(screen.getByTestId('ops-cell-4').getAttribute('data-shift')).toBe('true');
    expect(screen.getByTestId('ops-cell-0').getAttribute('data-shift')).toBeNull();
  });

  it('shows shift-annotation for insert operation with shiftStart/shiftEnd', () => {
    const snap: ArrayOpsSnapshot = {
      values: [1, 2, 3, 4, 5],
      operation: 'insert',
      shiftStart: 2,
      shiftEnd: 4,
      cost: 'O(n)',
    };
    render(<ArrayOpsVisualizer snapshot={snap} />);
    const annotation = screen.getByTestId('shift-annotation');
    expect(annotation.textContent).toContain('shift right');
  });

  it('shows shift-annotation for delete operation with shiftStart/shiftEnd', () => {
    const snap: ArrayOpsSnapshot = {
      values: [1, 2, 3, 4],
      operation: 'delete',
      shiftStart: 1,
      shiftEnd: 3,
      cost: 'O(n)',
    };
    render(<ArrayOpsVisualizer snapshot={snap} />);
    const annotation = screen.getByTestId('shift-annotation');
    expect(annotation.textContent).toContain('shift left');
  });

  it('does not show shift-annotation when shiftStart/shiftEnd not set', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    expect(screen.queryByTestId('shift-annotation')).toBeNull();
  });

  it('shows op-badge with correct operation name', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    expect(screen.getByTestId('op-badge').textContent).toBe('Push');
  });

  it('shows cost-badge with O(1) for push', () => {
    render(<ArrayOpsVisualizer snapshot={baseSnap} />);
    expect(screen.getByTestId('cost-badge').textContent).toBe('O(1)');
  });

  it('shows cost-badge with O(n) for insert', () => {
    const snap: ArrayOpsSnapshot = { values: [1, 2, 3], operation: 'insert', cost: 'O(n)' };
    render(<ArrayOpsVisualizer snapshot={snap} />);
    expect(screen.getByTestId('cost-badge').textContent).toBe('O(n)');
  });

  it('does not show cost-badge when cost is not set', () => {
    const snap: ArrayOpsSnapshot = { values: [1, 2, 3], operation: 'idle' };
    render(<ArrayOpsVisualizer snapshot={snap} />);
    expect(screen.queryByTestId('cost-badge')).toBeNull();
  });
});
