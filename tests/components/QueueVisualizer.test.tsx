import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueueVisualizer } from '@/components/visualizers/QueueVisualizer';
import type { QueueSnapshot } from '@/types/snapshots';

const baseSnap: QueueSnapshot = {
  items: [
    { id: 'q1', value: 3 },
    { id: 'q2', value: 1 },
    { id: 'q3', value: 2 },
  ],
  head: 0,
  tail: 2,
  inputValues: [3, 1, 2, 4],
  phase: 'enqueue',
};

describe('QueueVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<QueueVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all queue items', () => {
    const { container } = render(<QueueVisualizer snapshot={baseSnap} />);
    expect(container.querySelector('[data-testid="queue-item-0"]')?.textContent).toBe('3');
    expect(container.querySelector('[data-testid="queue-item-1"]')?.textContent).toBe('1');
    expect(container.querySelector('[data-testid="queue-item-2"]')?.textContent).toBe('2');
  });

  it('renders head indicator', () => {
    render(<QueueVisualizer snapshot={baseSnap} />);
    expect(screen.getAllByText(/front/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders tail indicator', () => {
    render(<QueueVisualizer snapshot={baseSnap} />);
    expect(screen.getAllByText(/back/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty queue with placeholder', () => {
    const snap: QueueSnapshot = { items: [], head: 0, tail: 0 };
    render(<QueueVisualizer snapshot={snap} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });

  it('highlights front item (head) in cyan', () => {
    const { container } = render(<QueueVisualizer snapshot={baseSnap} />);
    const frontItem = container.querySelector('[data-testid="queue-item-0"]');
    expect(frontItem?.className).toMatch(/accent-secondary|cyan/);
  });
});
