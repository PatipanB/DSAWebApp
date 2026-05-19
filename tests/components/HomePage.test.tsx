import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '@/routes/HomePage';
import { TOPICS } from '@/data/topics';

describe('HomePage', () => {
  it('renders a link for every topic in the guided-path default view', () => {
    const { container } = render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      const link = container.querySelector(`a[href="${t.path}"]`);
      expect(link).not.toBeNull();
    }
  });
  it('shows the short description for each topic in the guided-path default view', () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    for (const t of TOPICS) {
      expect(screen.getByText(t.shortDescription)).toBeInTheDocument();
    }
  });
});
