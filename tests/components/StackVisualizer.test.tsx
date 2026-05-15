import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StackVisualizer } from '@/components/visualizers/StackVisualizer';
import type { StackSnapshot } from '@/types/snapshots';

const baseSnap: StackSnapshot = {
  items: [
    { id: 'a', value: '(' },
    { id: 'b', value: '[' },
    { id: 'c', value: '{' },
  ],
  inputTokens: ['(', '[', '{', '}', ']', ')'],
  inputCursor: 3,
};

describe('StackVisualizer', () => {
  it('renders nothing for null snapshot', () => {
    const { container } = render(<StackVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders all stack items', () => {
    render(<StackVisualizer snapshot={baseSnap} />);
    expect(screen.getAllByText('(').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('[').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('{').length).toBeGreaterThanOrEqual(1);
  });

  it('renders input tokens when provided', () => {
    render(<StackVisualizer snapshot={baseSnap} />);
    // inputTokens row should show all 6 tokens
    const tokenEls = screen.getAllByText(/[()[\]{}]/);
    expect(tokenEls.length).toBeGreaterThanOrEqual(6);
  });

  it('marks active input token with data-active', () => {
    const { container } = render(<StackVisualizer snapshot={baseSnap} />);
    const active = container.querySelector('[data-active="true"]');
    expect(active).toBeInTheDocument();
  });

  it('applies invalid styling when invalid=true', () => {
    const snap: StackSnapshot = { ...baseSnap, invalid: true };
    const { container } = render(<StackVisualizer snapshot={snap} />);
    expect(container.querySelector('[data-invalid="true"]')).toBeInTheDocument();
  });

  it('renders result array when present', () => {
    const snap: StackSnapshot = {
      items: [],
      inputTokens: ['2', '1', '2', '4', '3'],
      inputCursor: 5,
      result: [4, 2, 4, -1, -1],
    };
    render(<StackVisualizer snapshot={snap} />);
    expect(screen.getAllByText('4').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('-1').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty stack with placeholder text', () => {
    const snap: StackSnapshot = { items: [], inputTokens: [], inputCursor: 0 };
    render(<StackVisualizer snapshot={snap} />);
    expect(screen.getByText(/empty/i)).toBeInTheDocument();
  });
});
