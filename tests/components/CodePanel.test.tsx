import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodePanel } from '@/components/panels/CodePanel';

// prefsStore uses zustand; mock it so tests are isolated
vi.mock('@/store/prefsStore', () => ({
  usePrefsStore: (sel: (s: { codeLanguage: 'ts' | 'py'; setCodeLanguage: (l: 'ts' | 'py') => void }) => unknown) =>
    sel({ codeLanguage: 'ts', setCodeLanguage: vi.fn() }),
}));

describe('CodePanel', () => {
  it('renders code lines for the given algorithm', () => {
    render(<CodePanel algorithmId="two-pointers" currentLine={1} />);
    expect(screen.getByText(/twoPointers/)).toBeInTheDocument();
  });

  it('renders the TS/Python language toggle tabs', () => {
    render(<CodePanel algorithmId="two-pointers" currentLine={1} />);
    expect(screen.getByRole('tab', { name: /ts/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /python/i })).toBeInTheDocument();
  });

  it('marks the active line with data-active', () => {
    const { container } = render(<CodePanel algorithmId="two-pointers" currentLine={2} />);
    const activeLine = container.querySelector('[data-active-line="true"]');
    expect(activeLine).toBeInTheDocument();
  });

  it('renders nothing when algorithmId has no snippet', () => {
    const { container } = render(<CodePanel algorithmId="unknown-algo" currentLine={1} />);
    expect(container.firstChild).toBeNull();
  });
});
