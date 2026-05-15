import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CallStackPanel } from '@/components/panels/CallStackPanel';

describe('CallStackPanel', () => {
  it('renders frame labels', () => {
    render(<CallStackPanel callStack={['dfs(3)', 'dfs(1)', 'dfs(0)']} />);
    expect(screen.getByText('dfs(3)')).toBeInTheDocument();
    expect(screen.getByText('dfs(1)')).toBeInTheDocument();
    expect(screen.getByText('dfs(0)')).toBeInTheDocument();
  });

  it('highlights the top (last) frame as current', () => {
    const { container } = render(
      <CallStackPanel callStack={['dfs(3)', 'dfs(1)', 'dfs(0)']} />,
    );
    const frames = container.querySelectorAll('[data-testid="stack-frame"]');
    expect(frames[frames.length - 1]).toHaveAttribute('data-current', 'true');
  });

  it('renders nothing when callStack is undefined', () => {
    const { container } = render(<CallStackPanel callStack={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when callStack is empty', () => {
    const { container } = render(<CallStackPanel callStack={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
