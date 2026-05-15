import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';

const TABS = [
  { id: 'two-pointers' as const, label: 'Two Pointers' },
  { id: 'sliding-window' as const, label: 'Sliding Window' },
];

describe('AlgorithmTabs', () => {
  it('renders a tab for each entry', () => {
    render(<AlgorithmTabs tabs={TABS} selectedId="two-pointers" onSelect={vi.fn()} />);
    expect(screen.getByRole('tab', { name: /two pointers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sliding window/i })).toBeInTheDocument();
  });

  it('marks the selected tab as aria-selected', () => {
    render(<AlgorithmTabs tabs={TABS} selectedId="sliding-window" onSelect={vi.fn()} />);
    const tab = screen.getByRole('tab', { name: /sliding window/i });
    expect(tab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelect with the tab id when clicked', async () => {
    const onSelect = vi.fn();
    render(<AlgorithmTabs tabs={TABS} selectedId="two-pointers" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('tab', { name: /sliding window/i }));
    expect(onSelect).toHaveBeenCalledWith('sliding-window');
  });
});
