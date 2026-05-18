import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';

describe('ProblemsSidebar', () => {
  it('renders beginner and advanced sections for arrays', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    expect(screen.getByText(/beginner/i)).toBeInTheDocument();
    expect(screen.getByText(/advanced/i)).toBeInTheDocument();
  });

  it('renders all 10 problem links for arrays', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBe(10);
  });

  it('links point to neetcode.io with the correct slug', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const link = screen.getByRole('link', { name: /is palindrome/i });
    expect(link).toHaveAttribute('href', 'https://neetcode.io/problems/is-palindrome');
  });

  it('links open in a new tab with noopener noreferrer', () => {
    render(<ProblemsSidebar topicId="arrays" />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('renders nothing for a topic with no problems yet', () => {
    const { container } = render(<ProblemsSidebar topicId="unknown-topic" />);
    expect(container.firstChild).toBeNull();
  });
});
