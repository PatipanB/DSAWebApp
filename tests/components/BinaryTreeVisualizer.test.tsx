import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BinaryTreeVisualizer } from '@/components/visualizers/BinaryTreeVisualizer';
import type { TreeSnapshot } from '@/types/snapshots';

const SINGLE_NODE_SNAP: TreeSnapshot = {
  nodes: { n0: { id: 'n0', value: 42, leftId: null, rightId: null } },
  rootId: 'n0',
  current: null,
  visited: [],
};

const TWO_NODE_SNAP: TreeSnapshot = {
  nodes: {
    n0: { id: 'n0', value: 1, leftId: 'n1', rightId: null },
    n1: { id: 'n1', value: 2, leftId: null, rightId: null },
  },
  rootId: 'n0',
  current: 'n1',
  visited: ['n1'],
};

describe('BinaryTreeVisualizer', () => {
  it('renders null snapshot without crashing', () => {
    render(<BinaryTreeVisualizer snapshot={null} />);
  });

  it('renders node with data-testid="tree-node-n0"', () => {
    render(<BinaryTreeVisualizer snapshot={SINGLE_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n0')).toBeInTheDocument();
  });

  it('marks current node with data-active="true"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('tree-node-n0')).not.toHaveAttribute('data-active', 'true');
  });

  it('marks visited nodes with data-visited="true"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-node-n1')).toHaveAttribute('data-visited', 'true');
  });

  it('renders edge with data-testid="tree-edge-n0-n1"', () => {
    render(<BinaryTreeVisualizer snapshot={TWO_NODE_SNAP} />);
    expect(screen.getByTestId('tree-edge-n0-n1')).toBeInTheDocument();
  });

  it('renders node value as text', () => {
    render(<BinaryTreeVisualizer snapshot={SINGLE_NODE_SNAP} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
