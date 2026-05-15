import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TopicHeader } from '@/components/panels/TopicHeader';

describe('TopicHeader', () => {
  it('renders the topic title and number', () => {
    render(<TopicHeader topicId="arrays" />);
    expect(screen.getByText('Arrays')).toBeInTheDocument();
    expect(screen.getByText(/#01/)).toBeInTheDocument();
  });
  it('renders nothing useful for unknown id', () => {
    // @ts-expect-error invalid id intentionally
    render(<TopicHeader topicId="nope" />);
    expect(screen.queryByText('Arrays')).not.toBeInTheDocument();
  });
});
