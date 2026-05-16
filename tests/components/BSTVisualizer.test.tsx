import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BSTVisualizer } from '@/components/visualizers/BSTVisualizer';
import type { BSTSnapshot } from '@/types/snapshots';

const BASE_SNAP: BSTSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 5, leftId: 'n1', rightId: null },
    n1: { id: 'n1', value: 3, leftId: null, rightId: null },
  },
  rootId: 'n0',
  current: null,
  visited: [],
};

describe('BSTVisualizer', () => {
  it('renders null without crashing', () => {
    render(<BSTVisualizer snapshot={null} />);
  });

  it('renders tree-node data-testids', () => {
    render(<BSTVisualizer snapshot={BASE_SNAP} />);
    expect(screen.getByTestId('tree-node-n0')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-n1')).toBeInTheDocument();
  });

  it('marks comparingWith node with data-comparing="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, comparingWith: 'n0' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n0')).toHaveAttribute('data-comparing', 'true');
  });

  it('marks inserted node with data-inserted="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, inserted: 'n1' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-inserted', 'true');
  });

  it('marks deletedNode with data-deleted="true"', () => {
    const snap: BSTSnapshot = { ...BASE_SNAP, deletedNode: 'n1' };
    render(<BSTVisualizer snapshot={snap} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-deleted', 'true');
  });

  it('renders edge between parent and child', () => {
    render(<BSTVisualizer snapshot={BASE_SNAP} />);
    expect(screen.getByTestId('tree-edge-n0-n1')).toBeInTheDocument();
  });
});
