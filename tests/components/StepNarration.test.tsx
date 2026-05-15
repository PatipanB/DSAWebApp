import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepNarration } from '@/components/panels/StepNarration';

describe('StepNarration', () => {
  it('renders the narration text', () => {
    render(<StepNarration narration="Compare: 3 + 8 = 11 vs target 11" />);
    expect(screen.getByText(/compare: 3 \+ 8/i)).toBeInTheDocument();
  });

  it('has aria-live="polite" for screen readers', () => {
    const { container } = render(<StepNarration narration="some step" />);
    const el = container.querySelector('[aria-live="polite"]');
    expect(el).toBeInTheDocument();
  });

  it('has role="status"', () => {
    render(<StepNarration narration="some step" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders nothing meaningful for empty narration', () => {
    const { container } = render(<StepNarration narration="" />);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });
});
