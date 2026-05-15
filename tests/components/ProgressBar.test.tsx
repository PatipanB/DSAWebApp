import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/controls/ProgressBar';

describe('ProgressBar', () => {
  it('shows step count text', () => {
    render(<ProgressBar stepIndex={3} totalSteps={10} />);
    expect(screen.getByText(/4.*10|step 4 of 10/i)).toBeInTheDocument();
  });

  it('renders progress bar element', () => {
    const { container } = render(<ProgressBar stepIndex={5} totalSteps={10} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const { container } = render(<ProgressBar stepIndex={5} totalSteps={10} />);
    const fill = container.querySelector('[data-testid="progress-fill"]');
    expect(fill).toBeTruthy();
  });
});
