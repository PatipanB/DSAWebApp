import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { HomePage } from '@/routes/HomePage';
import { ArraysPage } from '@/routes/ArraysPage';
import { GraphPage } from '@/routes/GraphPage';
import { useTopicStore } from '@/store/topicStore';

function buildRouter(initial: string) {
  return createMemoryRouter(
    [{
      element: <AppShell />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'arrays', element: <ArraysPage /> },
        { path: 'graph', element: <GraphPage /> },
      ],
    }],
    { initialEntries: [initial] },
  );
}

describe('routing', () => {
  it('home page → arrays page sets topicStore', async () => {
    render(<RouterProvider router={buildRouter('/')} />);
    await userEvent.click(screen.getByRole('link', { name: /Open Arrays/ }));
    await waitFor(() => expect(screen.getByTestId('visualizer-slot')).toBeInTheDocument());
    expect(useTopicStore.getState().selectedTopicId).toBe('arrays');
  });

  it('directly mounting /graph sets topicStore', async () => {
    render(<RouterProvider router={buildRouter('/graph')} />);
    await waitFor(() => expect(useTopicStore.getState().selectedTopicId).toBe('graph'));
  });
});
