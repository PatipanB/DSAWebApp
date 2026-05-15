import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/primitives/Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>O(n)</Badge>);
    expect(screen.getByText('O(n)')).toBeInTheDocument();
  });
  it('applies tone class', () => {
    render(<Badge tone="success">ok</Badge>);
    expect(screen.getByText('ok').className).toMatch(/status-success/);
  });
});
