import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';

describe('AppShell', () => {
  it('renders TopBar, Sidebar, and the child route via outlet', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/test" element={<div data-testid="child">Hello</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'DSA Visualizer' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Topics' })).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
