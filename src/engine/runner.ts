import type { Step, RunnerState } from '@/engine/types';

export class Runner {
  state: RunnerState = 'idle';
  stepIndex: number = 0;
  totalSteps: number = 0;
  speedMs: number = 500;

  private _listeners: Set<() => void> = new Set();
  private _rafId: number | null = null;
  private _lastTs: number | null = null;
  private _acc: number = 0;

  setSteps(steps: Step<unknown>[]) {
    this._cancelRaf();
    this.totalSteps = steps.length;
    this.stepIndex = 0;
    this.state = 'idle';
    this._acc = 0;
    this._lastTs = null;
    this._notify();
  }

  play() {
    if (this.state === 'done' || this.totalSteps === 0) return;
    this.state = 'playing';
    this._notify();
    this._scheduleRaf();
  }

  pause() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this._cancelRaf();
    this._notify();
  }

  stepForward() {
    if (this.state === 'done') return;
    if (this.stepIndex >= this.totalSteps - 1) {
      this.state = 'done';
      this._notify();
      return;
    }
    this.stepIndex++;
    this.state = this.stepIndex >= this.totalSteps - 1 ? 'done' : 'paused';
    this._notify();
  }

  stepBack() {
    if (this.stepIndex <= 0) return;
    this.stepIndex--;
    this.state = 'paused';
    this._notify();
  }

  reset() {
    this._cancelRaf();
    this.stepIndex = 0;
    this.state = 'idle';
    this._acc = 0;
    this._lastTs = null;
    this._notify();
  }

  setSpeed(ms: number) {
    this.speedMs = ms;
  }

  onChange(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify() {
    for (const l of this._listeners) l();
  }

  private _cancelRaf() {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  private _scheduleRaf() {
    this._rafId = requestAnimationFrame((ts) => {
      if (this.state !== 'playing') return;
      if (this._lastTs !== null) {
        this._acc += ts - this._lastTs;
        while (this._acc >= this.speedMs && this.state === 'playing') {
          this._acc -= this.speedMs;
          this.stepIndex++;
          if (this.stepIndex >= this.totalSteps - 1) {
            this.stepIndex = this.totalSteps - 1;
            this.state = 'done';
            this._rafId = null;
            this._lastTs = null;
            this._notify();
            return;
          }
          this._notify();
        }
      }
      this._lastTs = ts;
      if (this.state === 'playing') this._scheduleRaf();
    });
  }
}
