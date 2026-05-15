import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';

describe('Sidebar', () => {
  it('renders the Topics heading and the topic nav', () => {
    render(<MemoryRouter><Sidebar /></MemoryRouter>);
    expect(screen.getByText(/Topics/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Topics' })).toBeInTheDocument();
  });
});
