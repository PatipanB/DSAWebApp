import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VariableInspector } from '@/components/panels/VariableInspector';

describe('VariableInspector', () => {
  it('renders variable names and values', () => {
    render(<VariableInspector variables={{ l: 0, r: 7, sum: 14 }} />);
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('sum')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('renders nothing when variables is undefined', () => {
    const { container } = render(<VariableInspector variables={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when variables is empty', () => {
    const { container } = render(<VariableInspector variables={{}} />);
    expect(container.firstChild).toBeNull();
  });

  it('stringifies object values with JSON', () => {
    render(<VariableInspector variables={{ arr: [1, 2, 3] }} />);
    expect(screen.getByText('[1,2,3]')).toBeInTheDocument();
  });
});
