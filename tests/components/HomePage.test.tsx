import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/routes/HomePage';
import { TOPICS } from '@/data/topics';

describe('HomePage', () => {
  it('renders a card for every topic with a link to its path', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      const link = screen.getByRole('link', { name: new RegExp(t.title) });
      expect(link).toHaveAttribute('href', t.path);
    }
  });
  it('shows the long description for each card', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      expect(screen.getByText(t.longDescription)).toBeInTheDocument();
    }
  });
});
