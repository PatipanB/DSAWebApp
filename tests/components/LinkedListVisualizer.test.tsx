import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer';
import type { LinkedListSnapshot } from '@/types/snapshots';

const singlySnap: LinkedListSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, nextId: 'n1' },
    n1: { id: 'n1', value: 2, nextId: 'n2' },
    n2: { id: 'n2', value: 3, nextId: null },
  },
  headId: 'n0',
  tailId: 'n2',
  pointers: [{ name: 'curr', nodeId: 'n1', color: 'amber' }],
  doubly: false,
};

const doublySnap: LinkedListSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, nextId: 'n1', prevId: null },
    n1: { id: 'n1', value: 2, nextId: 'n2', prevId: 'n0' },
    n2: { id: 'n2', value: 3, nextId: null, prevId: 'n1' },
  },
  headId: 'n0',
  tailId: 'n2',
  pointers: [{ name: 'curr', nodeId: 'n0', color: 'amber' }],
  doubly: true,
};

describe('LinkedListVisualizer', () => {
  it('renders placeholder when snapshot is null', () => {
    render(<LinkedListVisualizer snapshot={null} />);
    expect(screen.getByText(/press run/i)).toBeInTheDocument();
  });

  it('renders all nodes with correct testids', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-node-n0')).toBeInTheDocument();
    expect(screen.getByTestId('ll-node-n1')).toBeInTheDocument();
    expect(screen.getByTestId('ll-node-n2')).toBeInTheDocument();
  });

  it('sets data-active on amber pointer node only', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-node-n1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('ll-node-n0')).not.toHaveAttribute('data-active');
    expect(screen.getByTestId('ll-node-n2')).not.toHaveAttribute('data-active');
  });

  it('renders forward arrows including tail-to-null', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByTestId('ll-arrow-n0-n1')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n1-n2')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n2-null')).toBeInTheDocument();
  });

  it('renders backward arrows for doubly linked list', () => {
    render(<LinkedListVisualizer snapshot={doublySnap} />);
    expect(screen.getByTestId('ll-arrow-n1-n0')).toBeInTheDocument();
    expect(screen.getByTestId('ll-arrow-n2-n1')).toBeInTheDocument();
  });

  it('does not render backward arrows for singly linked list', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.queryByTestId('ll-arrow-n1-n0')).not.toBeInTheDocument();
  });

  it('renders pointer badge with correct name', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('curr')).toBeInTheDocument();
  });

  it('renders null sentinel', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('node values are visible', () => {
    render(<LinkedListVisualizer snapshot={singlySnap} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
