import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';

describe('KeyInsightCallout', () => {
  it('shows the insight text', () => {
    render(<KeyInsightCallout algorithmId="two-pointers" />);
    expect(screen.getByText(/move the pointer/i)).toBeInTheDocument();
  });

  it('renders nothing for an algorithmId with no insight', () => {
    const { container } = render(<KeyInsightCallout algorithmId="unknown-algo" />);
    expect(container.firstChild).toBeNull();
  });

  it('is collapsible — clicking the header toggles visibility', async () => {
    render(<KeyInsightCallout algorithmId="two-pointers" />);
    // Initially expanded — text is visible
    expect(screen.getByText(/move the pointer/i)).toBeVisible();
    // Click to collapse
    await userEvent.click(screen.getByRole('button', { name: /key insight/i }));
    expect(screen.queryByText(/move the pointer/i)).not.toBeVisible();
    // Click to expand again
    await userEvent.click(screen.getByRole('button', { name: /key insight/i }));
    expect(screen.getByText(/move the pointer/i)).toBeVisible();
  });
});
