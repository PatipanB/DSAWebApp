import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TopicNav } from '@/components/layout/TopicNav';
import { TOPICS } from '@/data/topics';

describe('TopicNav', () => {
  it('renders a link for every topic', () => {
    render(<MemoryRouter><TopicNav /></MemoryRouter>);
    for (const t of TOPICS) {
      expect(screen.getByRole('link', { name: new RegExp(t.title) })).toHaveAttribute('href', t.path);
    }
  });
});
