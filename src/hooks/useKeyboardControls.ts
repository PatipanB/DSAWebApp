import { useEffect } from 'react';
import type { Runner } from '@/engine/runner';

export function useKeyboardControls(runner: Runner) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); runner.stepForward(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); runner.stepBack(); }
      if (e.key === ' ') {
        e.preventDefault();
        runner.state === 'playing' ? runner.pause() : runner.play();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [runner]);
}
