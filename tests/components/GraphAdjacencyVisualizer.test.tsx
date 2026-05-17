import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GraphAdjacencyVisualizer } from '@/components/visualizers/GraphAdjacencyVisualizer';
import type { AdjacencySnapshot } from '@/types/snapshots';

const SNAP: AdjacencySnapshot = {
  nodes: [
    { id: 'n0', label: 'A', x: 80, y: 80 },
    { id: 'n1', label: 'B', x: 220, y: 60 },
  ],
  edges: [{ from: 'n0', to: 'n1' }],
  startId: 'n0',
  visited: ['n0'],
  frontier: ['n1'],
  current: 'n1',
  edgeStates: { 'n0-n1': 'tree', 'n1-n0': 'tree' },
};

describe('GraphAdjacencyVisualizer', () => {
  it('renders without crash when snapshot=null', () => {
    render(<GraphAdjacencyVisualizer snapshot={null} />);
    expect(screen.getByTestId('graph-adjacency-placeholder')).toBeInTheDocument();
  });

  it('renders node with data-testid="graph-node-n0"', () => {
    render(<GraphAdjacencyVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('graph-node-n0')).toBeInTheDocument();
  });

  it('renders edge with data-testid="graph-edge-n0-n1"', () => {
    render(<GraphAdjacencyVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('graph-edge-n0-n1')).toBeInTheDocument();
  });

  it('current node has data-active="true"', () => {
    render(<GraphAdjacencyVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('graph-node-n1')).toHaveAttribute('data-active', 'true');
  });

  it('visited node has data-visited="true"', () => {
    render(<GraphAdjacencyVisualizer snapshot={SNAP} />);
    expect(screen.getByTestId('graph-node-n0')).toHaveAttribute('data-visited', 'true');
  });

  it('node label text is visible', () => {
    render(<GraphAdjacencyVisualizer snapshot={SNAP} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
