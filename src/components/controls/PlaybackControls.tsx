import { Button } from '@/components/primitives/Button';
import type { RunnerState } from '@/engine/types';

interface Props {
  runnerState: RunnerState;
  onPlay: () => void;
  onPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onReset: () => void;
}

export function PlaybackControls({ runnerState, onPlay, onPause, onStepBack, onStepForward, onReset }: Props) {
  const isPlaying = runnerState === 'playing';
  const isDone = runnerState === 'done';

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Playback controls">
      <Button
        variant="ghost"
        size="sm"
        aria-label="Reset"
        onClick={onReset}
      >
        ↩ Reset
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Step back"
        onClick={onStepBack}
        disabled={runnerState === 'idle'}
      >
        ⏮ Step back
      </Button>
      {isPlaying ? (
        <Button
          variant="primary"
          size="md"
          aria-label="Pause"
          onClick={onPause}
        >
          ⏸ Pause
        </Button>
      ) : (
        <Button
          variant="primary"
          size="md"
          aria-label="Play"
          onClick={onPlay}
          disabled={isDone}
        >
          ▶ Play
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        aria-label="Step forward"
        onClick={onStepForward}
        disabled={isDone}
      >
        ⏭ Step forward
      </Button>
    </div>
  );
}
