import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import type { RunnerState } from '@/engine/types';

function renderControls(state: RunnerState = 'idle', overrides: Partial<{
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
}> = {}) {
  const props = {
    runnerState: state,
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStepForward: vi.fn(),
    onStepBack: vi.fn(),
    onReset: vi.fn(),
    ...overrides,
  };
  render(<PlaybackControls {...props} />);
  return props;
}

describe('PlaybackControls', () => {
  it('shows Play button when idle', () => {
    renderControls('idle');
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });

  it('shows Pause button when playing', () => {
    renderControls('playing');
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });

  it('calls onPlay when Play clicked', async () => {
    const { onPlay } = renderControls('idle');
    await userEvent.click(screen.getByRole('button', { name: /play/i }));
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it('calls onStepForward when Step Forward clicked', async () => {
    const { onStepForward } = renderControls('paused');
    await userEvent.click(screen.getByRole('button', { name: /step forward/i }));
    expect(onStepForward).toHaveBeenCalledOnce();
  });

  it('calls onReset when Reset clicked', async () => {
    const { onReset } = renderControls('paused');
    await userEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(onReset).toHaveBeenCalledOnce();
  });
});
