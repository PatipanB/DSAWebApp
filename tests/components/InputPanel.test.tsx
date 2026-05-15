import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputPanel } from '@/components/controls/InputPanel';

describe('InputPanel', () => {
  it('renders children', () => {
    render(
      <InputPanel onRun={vi.fn()}>
        <input data-testid="custom-field" />
      </InputPanel>,
    );
    expect(screen.getByTestId('custom-field')).toBeInTheDocument();
  });

  it('renders a Run button', () => {
    render(<InputPanel onRun={vi.fn()}><span /></InputPanel>);
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
  });

  it('calls onRun when Run clicked', async () => {
    const onRun = vi.fn();
    render(<InputPanel onRun={onRun}><span /></InputPanel>);
    await userEvent.click(screen.getByRole('button', { name: /run/i }));
    expect(onRun).toHaveBeenCalledOnce();
  });

  it('shows error message when provided', () => {
    render(
      <InputPanel onRun={vi.fn()} error="Too many values.">
        <span />
      </InputPanel>,
    );
    expect(screen.getByText('Too many values.')).toBeInTheDocument();
  });

  it('does not show error container when error is null', () => {
    const { container } = render(
      <InputPanel onRun={vi.fn()} error={null}><span /></InputPanel>,
    );
    expect(container.querySelector('[data-testid="input-error"]')).toBeNull();
  });
});
