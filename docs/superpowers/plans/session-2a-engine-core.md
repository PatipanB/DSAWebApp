# Session 2a — Engine Core + Bare-Bones Playback Loop (Arrays / Two-Pointers)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Read `docs/superpowers/plans/2026-05-14-dsa-visualizer-master-plan.md` before starting — canonical on architecture and naming.

**Goal:** Add a working playback loop to `/arrays` — user enters numbers + target, presses play, watches left/right pointers animate through the two-pointer algorithm. Speed slider, step forward/back, space bar controls all work.

**Architecture:** Pre-computed `Step[]` array (not generator). Framework-agnostic `Runner` class drives RAF-based playback; `useAlgorithmRun` hook syncs runner state into Zustand (`runStore`). `ArrayVisualizer` is a pure rendering component parameterized by the current snapshot. Only the three control panels needed for the loop ship in this session — code panel, complexity, and problems come in Session 2b.

**Tech Stack:** Vitest (TDD throughout), React Testing Library, Zustand, `requestAnimationFrame` (no new npm packages needed).

---

## File Plan

```
src/
  constants/
    speeds.ts              NEW — SPEED_PRESETS array
  types/
    algorithm.ts           NEW — AlgorithmId union + TwoPointersInput
    snapshots.ts           NEW — ArrayPointer, ArraySnapshot
  engine/
    types.ts               NEW — Step, AlgorithmRun, RunnerState, createRunBuilder
    runner.ts              NEW — Runner class (RAF state machine)
    serializeRun.ts        NEW — stable string serializer for snapshot tests
    useAlgorithmRun.ts     NEW — React hook wrapping Runner
    README.md              NEW — algorithm authoring guide
  store/
    runStore.ts            NEW — Zustand store for stepIndex/RunnerState
  hooks/
    useKeyboardControls.ts NEW — space/arrow key bindings
  algorithms/
    arrays/
      twoPointers.ts       NEW — instrumented two-pointer algorithm
  components/
    visualizers/
      ArrayVisualizer.tsx  NEW — renders ArraySnapshot
    controls/
      PlaybackControls.tsx NEW — play/pause/step/reset buttons
      SpeedSlider.tsx      NEW — wraps Slider primitive + prefsStore
      ProgressBar.tsx      NEW — step N of M + progress bar
  routes/
    ArraysPage.tsx         MODIFY — wire all panels together

tests/
  engine/
    runner.test.ts         NEW
    serializeRun.test.ts   NEW
  algorithms/
    twoPointers.test.ts    NEW
  components/
    ArrayVisualizer.test.tsx   NEW
    PlaybackControls.test.tsx  NEW
    ProgressBar.test.tsx       NEW
```

---

## Task 1: Constants and type definitions

**Files:**

- Create: `src/constants/speeds.ts`
- Create: `src/types/algorithm.ts`
- Create: `src/types/snapshots.ts`

- [ ] **Step 1.1: Create `src/constants/speeds.ts`**

```ts
export const SPEED_PRESETS = [
  { label: '0.25×', ms: 2000 },
  { label: '0.5×',  ms: 1000 },
  { label: '1×',    ms: 500  },
  { label: '2×',    ms: 250  },
  { label: '4×',    ms: 100  },
] as const;

export type SpeedPreset = (typeof SPEED_PRESETS)[number];
```

- [ ] **Step 1.2: Create `src/types/algorithm.ts`**

```ts
export type AlgorithmId =
  | 'two-pointers'
  | 'sliding-window'
  | 'balanced-brackets'
  | 'monotonic-stack'
  | 'queue-demo'
  | 'singly-traverse'
  | 'singly-insert-delete'
  | 'doubly-traverse'
  | 'inorder'
  | 'preorder'
  | 'postorder'
  | 'level-order'
  | 'bst-insert'
  | 'bst-search'
  | 'bst-delete'
  | 'bfs-grid'
  | 'dfs-grid'
  | 'bfs-adjacency'
  | 'dfs-adjacency'
  | 'bubble-sort'
  | 'merge-sort'
  | 'quick-sort'
  | 'heap-sort'
  | 'chaining'
  | 'open-addressing'
  | 'fibonacci'
  | 'knapsack-01'
  | 'lcs';

export interface TwoPointersInput {
  values: number[];
  target: number;
}

export const DEFAULT_TWO_POINTERS_INPUT: TwoPointersInput = {
  values: [1, 2, 3, 4, 6, 8, 11, 15],
  target: 11,
};
```

- [ ] **Step 1.3: Create `src/types/snapshots.ts`**

```ts
export interface ArrayPointer {
  name: string;
  index: number;
  color: 'cyan' | 'amber' | 'rose';
}

export interface ArraySnapshot {
  values: number[];
  pointers: ArrayPointer[];
  window?: { start: number; end: number };
  sum?: number;
  result?: number | number[];
}
```

- [ ] **Step 1.4: Verify**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 1.5: Commit**

```bash
git add -A
git commit -m "feat(types): AlgorithmId, ArraySnapshot, SPEED_PRESETS"
```

---

## Task 2: Engine types + createRunBuilder

**Files:**
- Create: `src/engine/types.ts`

- [ ] **Step 2.1: Create `src/engine/types.ts`**

```ts
import type { AlgorithmId } from '@/types/algorithm';

export type RunnerState = 'idle' | 'playing' | 'paused' | 'done';

export interface Step<Snapshot> {
  snapshot: Snapshot;
  line: number;
  narration: string;
  variables?: Record<string, unknown>;
}

export interface AlgorithmRun<Snapshot> {
  algorithmId: AlgorithmId;
  steps: Step<Snapshot>[];
  initialInput: unknown;
  finalResult?: unknown;
}

export type AlgorithmRunner<Input, Snapshot> = (input: Input) => AlgorithmRun<Snapshot>;

interface RunBuilder<Snapshot> {
  push(step: Step<Snapshot>): void;
  build(finalResult?: unknown): AlgorithmRun<Snapshot>;
}

export function createRunBuilder<Snapshot>(
  algorithmId: AlgorithmId,
  initialInput: unknown,
): RunBuilder<Snapshot> {
  const steps: Step<Snapshot>[] = [];
  return {
    push(step) { steps.push(step); },
    build(finalResult) { return { algorithmId, steps, initialInput, finalResult }; },
  };
}
```

- [ ] **Step 2.2: Verify**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 2.3: Commit**

```bash
git add -A
git commit -m "feat(engine): Step, AlgorithmRun, createRunBuilder types"
```

---

## Task 3: serializeRun helper (TDD)

**Files:**
- Test: `tests/engine/serializeRun.test.ts`
- Create: `src/engine/serializeRun.ts`

- [ ] **Step 3.1: Write failing test**

Create `tests/engine/serializeRun.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { serializeRun } from '@/engine/serializeRun';
import { createRunBuilder } from '@/engine/types';

describe('serializeRun', () => {
  it('produces a deterministic string for a simple run', () => {
    const r = createRunBuilder<{ values: number[] }>('two-pointers', [1, 2]);
    r.push({ line: 1, narration: 'init', snapshot: { values: [1, 2] }, variables: { l: 0 } });
    r.push({ line: 2, narration: 'found', snapshot: { values: [1, 2] }, variables: { l: 0, r: 1 } });
    const run = r.build([0, 1]);

    const out = serializeRun(run);
    expect(out).toContain('two-pointers');
    expect(out).toContain('steps: 2');
    expect(out).toContain('line=1');
    expect(out).toContain('narration="init"');
    expect(out).toContain('line=2');
    expect(out).toContain('narration="found"');
    expect(out).toContain('finalResult: [0,1]');
  });

  it('produces identical output on repeated calls (deterministic)', () => {
    const r = createRunBuilder<{ x: number }>('bubble-sort', []);
    r.push({ line: 1, narration: 'step', snapshot: { x: 1 } });
    const run = r.build();
    expect(serializeRun(run)).toBe(serializeRun(run));
  });
});
```

- [ ] **Step 3.2: Run (expect fail)**

```bash
pnpm test -- serializeRun 2>&1 | head -15
```
Expected: FAIL — "Cannot find module '@/engine/serializeRun'".

- [ ] **Step 3.3: Implement `src/engine/serializeRun.ts`**

```ts
import type { AlgorithmRun } from '@/engine/types';

export function serializeRun(run: AlgorithmRun<unknown>): string {
  const lines: string[] = [
    `algorithmId: ${run.algorithmId}`,
    `steps: ${run.steps.length}`,
    `finalResult: ${JSON.stringify(run.finalResult ?? null)}`,
    '',
  ];
  for (let i = 0; i < run.steps.length; i++) {
    const s = run.steps[i];
    lines.push(`step ${i}: line=${s.line} narration="${s.narration}"`);
    if (s.variables) {
      const vars = Object.entries(s.variables)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');
      lines.push(`  vars: ${vars}`);
    }
    // Serialize snapshot keys that are arrays/scalars for diffing
    const snap = s.snapshot as Record<string, unknown>;
    for (const [k, v] of Object.entries(snap)) {
      if (Array.isArray(v)) {
        lines.push(`  ${k}: [${(v as unknown[]).join(',')}]`);
      } else if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
        lines.push(`  ${k}: ${v}`);
      } else if (v !== null && typeof v === 'object') {
        lines.push(`  ${k}: ${JSON.stringify(v)}`);
      }
    }
  }
  return lines.join('\n');
}
```

- [ ] **Step 3.4: Run (expect pass)**

```bash
pnpm test -- serializeRun 2>&1 | head -15
```
Expected: 2 passed.

- [ ] **Step 3.5: Commit**

```bash
git add -A
git commit -m "feat(engine): serializeRun helper with tests"
```

---

## Task 4: Runner class (TDD)

**Files:**
- Test: `tests/engine/runner.test.ts`
- Create: `src/engine/runner.ts`

- [ ] **Step 4.1: Write failing tests**

Create `tests/engine/runner.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Runner } from '@/engine/runner';
import { createRunBuilder } from '@/engine/types';

function makeSteps(n: number) {
  const r = createRunBuilder<{ i: number }>('two-pointers', null);
  for (let i = 0; i < n; i++) {
    r.push({ line: i + 1, narration: `step ${i}`, snapshot: { i } });
  }
  return r.build();
}

describe('Runner', () => {
  let runner: Runner;
  beforeEach(() => { runner = new Runner(); });

  it('starts idle with stepIndex 0 and no steps', () => {
    expect(runner.state).toBe('idle');
    expect(runner.stepIndex).toBe(0);
    expect(runner.totalSteps).toBe(0);
  });

  it('setSteps resets to stepIndex 0 and state idle', () => {
    runner.setSteps(makeSteps(3).steps);
    expect(runner.totalSteps).toBe(3);
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('idle');
  });

  it('stepForward advances index', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('paused');
  });

  it('stepForward at last step transitions to done', () => {
    runner.setSteps(makeSteps(2).steps);
    runner.stepForward();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('done');
  });

  it('stepForward does nothing when done', () => {
    runner.setSteps(makeSteps(1).steps);
    runner.stepForward();
    runner.stepForward(); // should no-op
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('done');
  });

  it('stepBack decrements index', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    runner.stepForward();
    runner.stepBack();
    expect(runner.stepIndex).toBe(1);
    expect(runner.state).toBe('paused');
  });

  it('stepBack does nothing at index 0', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepBack();
    expect(runner.stepIndex).toBe(0);
  });

  it('reset returns to index 0 and idle', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.stepForward();
    runner.reset();
    expect(runner.stepIndex).toBe(0);
    expect(runner.state).toBe('idle');
  });

  it('play sets state to playing', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.play();
    expect(runner.state).toBe('playing');
    runner.pause();
  });

  it('pause from playing sets state to paused', () => {
    runner.setSteps(makeSteps(3).steps);
    runner.play();
    runner.pause();
    expect(runner.state).toBe('paused');
  });

  it('setSpeed updates speedMs', () => {
    runner.setSpeed(250);
    expect(runner.speedMs).toBe(250);
  });

  it('onChange listener fires on state change', () => {
    const cb = vi.fn();
    runner.setSteps(makeSteps(3).steps);
    const unsub = runner.onChange(cb);
    runner.stepForward();
    expect(cb).toHaveBeenCalled();
    unsub();
    cb.mockClear();
    runner.stepForward();
    expect(cb).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4.2: Run (expect fail)**

```bash
pnpm test -- runner 2>&1 | head -15
```
Expected: FAIL — "Cannot find module '@/engine/runner'".

- [ ] **Step 4.3: Implement `src/engine/runner.ts`**

```ts
import type { Step, RunnerState } from '@/engine/types';

export class Runner {
  state: RunnerState = 'idle';
  stepIndex: number = 0;
  totalSteps: number = 0;
  speedMs: number = 500;

  private _steps: Step<unknown>[] = [];
  private _listeners: Set<() => void> = new Set();
  private _rafId: number | null = null;
  private _lastTs: number | null = null;
  private _acc: number = 0;

  setSteps(steps: Step<unknown>[]) {
    this._cancelRaf();
    this._steps = steps;
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
```

- [ ] **Step 4.4: Run (expect pass)**

```bash
pnpm test -- runner 2>&1 | head -20
```
Expected: 12 tests passed.

- [ ] **Step 4.5: Full suite**

```bash
pnpm test
```
Expected: all prior tests still pass.

- [ ] **Step 4.6: Commit**

```bash
git add -A
git commit -m "feat(engine): Runner class with RAF playback and full TDD"
```

---

## Task 5: runStore (TDD)

**Files:**
- Test: `tests/store/runStore.test.ts`
- Create: `src/store/runStore.ts`

- [ ] **Step 5.1: Write failing test**

Create `tests/store/runStore.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useRunStore } from '@/store/runStore';

describe('runStore', () => {
  beforeEach(() => useRunStore.setState({ stepIndex: 0, runnerState: 'idle' }));

  it('defaults to stepIndex 0 and idle state', () => {
    expect(useRunStore.getState().stepIndex).toBe(0);
    expect(useRunStore.getState().runnerState).toBe('idle');
  });

  it('setStepIndex updates stepIndex', () => {
    useRunStore.getState().setStepIndex(5);
    expect(useRunStore.getState().stepIndex).toBe(5);
  });

  it('setRunnerState updates runnerState', () => {
    useRunStore.getState().setRunnerState('playing');
    expect(useRunStore.getState().runnerState).toBe('playing');
  });
});
```

- [ ] **Step 5.2: Run (expect fail)**

```bash
pnpm test -- runStore 2>&1 | head -10
```

- [ ] **Step 5.3: Implement `src/store/runStore.ts`**

```ts
import { create } from 'zustand';
import type { RunnerState } from '@/engine/types';

interface RunState {
  stepIndex: number;
  runnerState: RunnerState;
  setStepIndex: (i: number) => void;
  setRunnerState: (s: RunnerState) => void;
}

export const useRunStore = create<RunState>((set) => ({
  stepIndex: 0,
  runnerState: 'idle',
  setStepIndex: (i) => set({ stepIndex: i }),
  setRunnerState: (s) => set({ runnerState: s }),
}));
```

- [ ] **Step 5.4: Run (expect pass)**

```bash
pnpm test -- runStore 2>&1 | head -10
```
Expected: 3 passed.

- [ ] **Step 5.5: Commit**

```bash
git add -A
git commit -m "feat(store): runStore for stepIndex and runner state"
```

---

## Task 6: useAlgorithmRun hook

**Files:**
- Create: `src/engine/useAlgorithmRun.ts`

No dedicated test file — the hook is exercise-tested via `ArraysPage` integration. Keep it focused.

- [ ] **Step 6.1: Create `src/engine/useAlgorithmRun.ts`**

```ts
import { useEffect, useRef } from 'react';
import { Runner } from '@/engine/runner';
import { useRunStore } from '@/store/runStore';
import type { AlgorithmRun } from '@/engine/types';

export function useAlgorithmRun(run: AlgorithmRun<unknown> | null): Runner {
  const runnerRef = useRef<Runner | null>(null);
  if (runnerRef.current === null) runnerRef.current = new Runner();
  const runner = runnerRef.current;

  const setStepIndex = useRunStore((s) => s.setStepIndex);
  const setRunnerState = useRunStore((s) => s.setRunnerState);

  useEffect(() => {
    if (!run) return;
    runner.setSteps(run.steps);
    const unsub = runner.onChange(() => {
      setStepIndex(runner.stepIndex);
      setRunnerState(runner.state);
    });
    // Sync initial state
    setStepIndex(runner.stepIndex);
    setRunnerState(runner.state);
    return unsub;
  }, [run, runner, setStepIndex, setRunnerState]);

  return runner;
}
```

- [ ] **Step 6.2: Verify typecheck**

```bash
pnpm typecheck
```
Expected: zero errors.

- [ ] **Step 6.3: Commit**

```bash
git add -A
git commit -m "feat(engine): useAlgorithmRun hook"
```

---

## Task 7: useKeyboardControls hook (TDD)

**Files:**
- Test: `tests/hooks/useKeyboardControls.test.ts`
- Create: `src/hooks/useKeyboardControls.ts`

- [ ] **Step 7.1: Write failing test**

Create `tests/hooks/useKeyboardControls.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { Runner } from '@/engine/runner';
import { createRunBuilder } from '@/engine/types';

function makeRunner(steps = 5) {
  const r = createRunBuilder<{ i: number }>('two-pointers', null);
  for (let i = 0; i < steps; i++) r.push({ line: i + 1, narration: `s${i}`, snapshot: { i } });
  const runner = new Runner();
  runner.setSteps(r.build().steps);
  return runner;
}

describe('useKeyboardControls', () => {
  it('ArrowRight calls stepForward', async () => {
    const runner = makeRunner();
    const spy = vi.spyOn(runner, 'stepForward');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard('{ArrowRight}');
    expect(spy).toHaveBeenCalled();
  });

  it('ArrowLeft calls stepBack', async () => {
    const runner = makeRunner();
    const spy = vi.spyOn(runner, 'stepBack');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard('{ArrowLeft}');
    expect(spy).toHaveBeenCalled();
  });

  it('Space toggles play/pause', async () => {
    const runner = makeRunner();
    const playSpy = vi.spyOn(runner, 'play');
    renderHook(() => useKeyboardControls(runner));
    await userEvent.keyboard(' ');
    expect(playSpy).toHaveBeenCalled();
    runner.pause();
  });
});
```

- [ ] **Step 7.2: Run (expect fail)**

```bash
pnpm test -- useKeyboardControls 2>&1 | head -10
```

- [ ] **Step 7.3: Implement `src/hooks/useKeyboardControls.ts`**

```ts
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
```

- [ ] **Step 7.4: Run (expect pass)**

```bash
pnpm test -- useKeyboardControls 2>&1 | head -15
```
Expected: 3 passed.

- [ ] **Step 7.5: Commit**

```bash
git add -A
git commit -m "feat(hooks): useKeyboardControls — space/arrow key bindings"
```

---

## Task 8: twoPointers algorithm (TDD — result + trace snapshot)

**Files:**
- Test: `tests/algorithms/twoPointers.test.ts`
- Create: `src/algorithms/arrays/twoPointers.ts`

> **Critical contract:** Both a result test AND a trace snapshot test are required. Result-only tests are forbidden for algorithm files per the master plan §3.1.

- [ ] **Step 8.1: Write failing tests**

Create `tests/algorithms/twoPointers.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { twoPointers } from '@/algorithms/arrays/twoPointers';
import { serializeRun } from '@/engine/serializeRun';

describe('twoPointers', () => {
  describe('result', () => {
    it('finds indices for target=11 in [1,2,3,4,6,8,11,15]', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      expect(run.finalResult).toEqual([2, 4]); // indices of 3 and 8 (0-based)
    });

    it('finds indices for target=9 in [2,7,11,15]', () => {
      const run = twoPointers({ values: [2, 7, 11, 15], target: 9 });
      expect(run.finalResult).toEqual([0, 1]);
    });

    it('returns null when no solution exists', () => {
      const run = twoPointers({ values: [1, 2, 3], target: 100 });
      expect(run.finalResult).toBeNull();
    });
  });

  describe('trace', () => {
    it('matches snapshot for [1,2,3,4,6,8,11,15] target=11', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least one step per pointer move', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      // Should have init + compare + move steps > 3
      expect(run.steps.length).toBeGreaterThan(3);
    });

    it('all steps have valid line numbers (1-based)', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      for (const step of run.steps) {
        expect(step.line).toBeGreaterThan(0);
      }
    });

    it('all steps have non-empty narration', () => {
      const run = twoPointers({ values: [1, 2, 3, 4, 6, 8, 11, 15], target: 11 });
      for (const step of run.steps) {
        expect(step.narration.trim().length).toBeGreaterThan(0);
      }
    });
  });
});
```

**Note on expected result:** The two-pointer algorithm for finding two numbers that sum to `target` in a sorted array returns the 0-based indices. For `[1,2,3,4,6,8,11,15]` target=11: `3+8=11` → indices `[2,4]`. Verify this math before implementing — if the algorithm uses a different convention (1-based, or returns values), adjust the test accordingly.

- [ ] **Step 8.2: Run (expect fail)**

```bash
pnpm test -- twoPointers 2>&1 | head -15
```

- [ ] **Step 8.3: Implement `src/algorithms/arrays/twoPointers.ts`**

The displayed code snippet (what `CodePanel` will show in Session 2b) is written inline as a comment so line numbers stay aligned.

```ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { ArraySnapshot } from '@/types/snapshots';
import type { TwoPointersInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this, not the instrumented code below):
1:  function twoPointers(values, target) {
2:    let l = 0, r = values.length - 1;
3:    while (l < r) {
4:      const sum = values[l] + values[r];
5:      if (sum === target) return [l, r];
6:      if (sum < target) l++;
7:      else r--;
8:    }
9:    return null;
10: }
*/

export function twoPointers(input: TwoPointersInput): AlgorithmRun<ArraySnapshot> {
  const { values, target } = input;
  const r = createRunBuilder<ArraySnapshot>('two-pointers', input);

  let l = 0;
  let rv = values.length - 1;

  // Step: initialize
  r.push({
    line: 2,
    narration: `Initialize l=${l} (${values[l]}) and r=${rv} (${values[rv]})`,
    snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }] },
    variables: { l, r: rv, target },
  });

  while (l < rv) {
    const sum = (values[l] ?? 0) + (values[rv] ?? 0);

    // Step: compare
    r.push({
      line: 4,
      narration: `Compare: ${values[l]} + ${values[rv]} = ${sum} vs target ${target}`,
      snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
      variables: { l, r: rv, sum, target },
    });

    if (sum === target) {
      // Step: found
      r.push({
        line: 5,
        narration: `Found! ${values[l]} + ${values[rv]} = ${target} at indices [${l}, ${rv}]`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'amber' }, { name: 'r', index: rv, color: 'amber' }], sum, result: [l, rv] },
        variables: { l, r: rv, sum, target },
      });
      return r.build([l, rv]);
    }

    if (sum < target) {
      l++;
      r.push({
        line: 6,
        narration: `Sum too small — move l right to ${l} (${values[l]})`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
        variables: { l, r: rv, sum, target },
      });
    } else {
      rv--;
      r.push({
        line: 7,
        narration: `Sum too large — move r left to ${rv} (${values[rv]})`,
        snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }], sum },
        variables: { l, r: rv, sum, target },
      });
    }
  }

  // No solution
  r.push({
    line: 9,
    narration: 'Pointers crossed — no solution found',
    snapshot: { values, pointers: [{ name: 'l', index: l, color: 'cyan' }, { name: 'r', index: rv, color: 'amber' }] },
    variables: { l, r: rv, target },
  });
  return r.build(null);
}
```

- [ ] **Step 8.4: Run result tests (expect pass)**

```bash
pnpm test -- twoPointers 2>&1 | head -30
```
Expected: result tests pass. Snapshot tests create new snapshots on first run — that's expected (`1 snapshot written`).

- [ ] **Step 8.5: Verify snapshot was written**

```bash
ls tests/algorithms/__snapshots__/
```
Expected: `twoPointers.test.ts.snap` exists.

- [ ] **Step 8.6: Run again (expect pass on snapshot match)**

```bash
pnpm test -- twoPointers
```
Expected: all tests pass including snapshot match.

- [ ] **Step 8.7: Commit**

```bash
git add -A
git commit -m "feat(algo): twoPointers with result + trace snapshot tests"
```

---

## Task 9: ArrayVisualizer component (TDD)

**Files:**
- Test: `tests/components/ArrayVisualizer.test.tsx`
- Create: `src/components/visualizers/ArrayVisualizer.tsx`

- [ ] **Step 9.1: Write failing test**

Create `tests/components/ArrayVisualizer.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import type { ArraySnapshot } from '@/types/snapshots';

const baseSnap: ArraySnapshot = {
  values: [3, 1, 4, 1, 5],
  pointers: [
    { name: 'l', index: 0, color: 'cyan' },
    { name: 'r', index: 4, color: 'amber' },
  ],
};

describe('ArrayVisualizer', () => {
  it('renders a cell for each value', () => {
    render(<ArrayVisualizer snapshot={baseSnap} />);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders pointer labels', () => {
    render(<ArrayVisualizer snapshot={baseSnap} />);
    expect(screen.getByText('l')).toBeInTheDocument();
    expect(screen.getByText('r')).toBeInTheDocument();
  });

  it('applies active styling to cells with a pointer on them', () => {
    const { container } = render(<ArrayVisualizer snapshot={baseSnap} />);
    // Cell at index 0 has l pointer → should have amber/active class
    const cells = container.querySelectorAll('[data-testid^="cell-"]');
    expect(cells.length).toBe(5);
  });

  it('renders null gracefully', () => {
    const { container } = render(<ArrayVisualizer snapshot={null} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 9.2: Run (expect fail)**

```bash
pnpm test -- ArrayVisualizer 2>&1 | head -10
```

- [ ] **Step 9.3: Implement `src/components/visualizers/ArrayVisualizer.tsx`**

```tsx
import { cn } from '@/utils/classNames';
import type { ArraySnapshot, ArrayPointer } from '@/types/snapshots';

const POINTER_COLOR: Record<ArrayPointer['color'], string> = {
  cyan:  'text-accent-secondary border-accent-secondary',
  amber: 'text-accent-primary  border-accent-primary',
  rose:  'text-status-danger   border-status-danger',
};

const CELL_HIGHLIGHT: Record<ArrayPointer['color'], string> = {
  cyan:  'ring-2 ring-accent-secondary bg-accent-secondary/10',
  amber: 'ring-2 ring-accent-primary  bg-accent-primary/10',
  rose:  'ring-2 ring-status-danger   bg-status-danger/10',
};

interface Props {
  snapshot: ArraySnapshot | null;
}

export function ArrayVisualizer({ snapshot }: Props) {
  if (!snapshot) return null;

  const { values, pointers } = snapshot;

  // Build a map: index → pointer (first pointer wins if multiple at same index)
  const ptrAt = new Map<number, ArrayPointer>();
  for (const p of pointers) {
    if (!ptrAt.has(p.index)) ptrAt.set(p.index, p);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Pointer labels above cells */}
      <div className="flex gap-2">
        {values.map((_, i) => {
          const ptr = ptrAt.get(i);
          return (
            <div key={i} className="w-12 flex flex-col items-center">
              {ptr ? (
                <span className={cn('text-xs font-mono font-bold', POINTER_COLOR[ptr.color])}>
                  {ptr.name}
                </span>
              ) : (
                <span className="text-xs invisible">_</span>
              )}
              {ptr && (
                <div className={cn('w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent', `border-t-current`, POINTER_COLOR[ptr.color].split(' ')[0])} />
              )}
            </div>
          );
        })}
      </div>

      {/* Cells */}
      <div className="flex gap-2">
        {values.map((v, i) => {
          const ptr = ptrAt.get(i);
          return (
            <div
              key={i}
              data-testid={`cell-${i}`}
              className={cn(
                'w-12 h-12 flex items-center justify-center text-lg font-mono font-semibold rounded-lg border transition',
                'bg-bg-elevated text-text-primary border-border-subtle',
                ptr && CELL_HIGHLIGHT[ptr.color],
              )}
            >
              {v}
            </div>
          );
        })}
      </div>

      {/* Index labels below cells */}
      <div className="flex gap-2">
        {values.map((_, i) => (
          <div key={i} className="w-12 text-center text-xs font-mono text-text-muted">
            {i}
          </div>
        ))}
      </div>

      {/* Sum / result overlay */}
      {snapshot.sum !== undefined && (
        <div className="text-sm font-mono text-text-secondary">
          sum = <span className="text-accent-primary font-bold">{snapshot.sum}</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 9.4: Run (expect pass)**

```bash
pnpm test -- ArrayVisualizer 2>&1 | head -15
```
Expected: 4 passed.

- [ ] **Step 9.5: Commit**

```bash
git add -A
git commit -m "feat(viz): ArrayVisualizer renders cells and pointer labels"
```

---

## Task 10: PlaybackControls component (TDD)

**Files:**
- Test: `tests/components/PlaybackControls.test.tsx`
- Create: `src/components/controls/PlaybackControls.tsx`

- [ ] **Step 10.1: Write failing test**

Create `tests/components/PlaybackControls.test.tsx`:
```tsx
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
```

- [ ] **Step 10.2: Run (expect fail)**

```bash
pnpm test -- PlaybackControls 2>&1 | head -10
```

- [ ] **Step 10.3: Implement `src/components/controls/PlaybackControls.tsx`**

```tsx
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
```

- [ ] **Step 10.4: Run (expect pass)**

```bash
pnpm test -- PlaybackControls 2>&1 | head -15
```
Expected: 5 passed.

- [ ] **Step 10.5: Commit**

```bash
git add -A
git commit -m "feat(controls): PlaybackControls component"
```

---

## Task 11: SpeedSlider component

**Files:**
- Create: `src/components/controls/SpeedSlider.tsx`

No new test — `Slider` primitive is already tested; this just wires it to `prefsStore` and `SPEED_PRESETS`. Verify by running the full suite.

- [ ] **Step 11.1: Create `src/components/controls/SpeedSlider.tsx`**

```tsx
import { Slider } from '@/components/primitives/Slider';
import { usePrefsStore } from '@/store/prefsStore';
import { SPEED_PRESETS } from '@/constants/speeds';
import type { Runner } from '@/engine/runner';

interface Props {
  runner: Runner;
}

export function SpeedSlider({ runner }: Props) {
  const speedIndex = usePrefsStore((s) => s.speedIndex);
  const setSpeedIndex = usePrefsStore((s) => s.setSpeedIndex);

  const handleChange = (i: number) => {
    setSpeedIndex(i);
    const preset = SPEED_PRESETS[i];
    if (preset) runner.setSpeed(preset.ms);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-text-muted">Speed</span>
      <Slider min={0} max={4} value={speedIndex} onChange={handleChange} />
      <span className="text-xs font-mono text-accent-primary w-10">
        {SPEED_PRESETS[speedIndex]?.label ?? '1×'}
      </span>
    </div>
  );
}
```

- [ ] **Step 11.2: Verify**

```bash
pnpm typecheck && pnpm test
```
Expected: zero errors, all tests pass.

- [ ] **Step 11.3: Commit**

```bash
git add -A
git commit -m "feat(controls): SpeedSlider wired to prefsStore + Runner"
```

---

## Task 12: ProgressBar component (TDD)

**Files:**
- Test: `tests/components/ProgressBar.test.tsx`
- Create: `src/components/controls/ProgressBar.tsx`

- [ ] **Step 12.1: Write failing test**

Create `tests/components/ProgressBar.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '@/components/controls/ProgressBar';

describe('ProgressBar', () => {
  it('shows step count text', () => {
    render(<ProgressBar stepIndex={3} totalSteps={10} />);
    expect(screen.getByText(/4.*10|step 4 of 10/i)).toBeInTheDocument();
  });

  it('renders progress bar element', () => {
    const { container } = render(<ProgressBar stepIndex={5} totalSteps={10} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    const { container } = render(<ProgressBar stepIndex={5} totalSteps={10} />);
    const fill = container.querySelector('[data-testid="progress-fill"]');
    expect(fill).toBeTruthy();
  });
});
```

- [ ] **Step 12.2: Run (expect fail)**

```bash
pnpm test -- ProgressBar 2>&1 | head -10
```

- [ ] **Step 12.3: Implement `src/components/controls/ProgressBar.tsx`**

```tsx
interface Props {
  stepIndex: number;
  totalSteps: number;
}

export function ProgressBar({ stepIndex, totalSteps }: Props) {
  const pct = totalSteps > 1 ? Math.round((stepIndex / (totalSteps - 1)) * 100) : 0;
  const display = stepIndex + 1;

  return (
    <div className="flex items-center gap-3 w-full">
      <span className="text-xs font-mono text-text-muted whitespace-nowrap">
        {display} / {totalSteps}
      </span>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-1.5 bg-bg-elevated rounded-full overflow-hidden border border-border-subtle"
      >
        <div
          data-testid="progress-fill"
          className="h-full bg-accent-primary rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-text-muted whitespace-nowrap">{pct}%</span>
    </div>
  );
}
```

- [ ] **Step 12.4: Run (expect pass)**

```bash
pnpm test -- ProgressBar 2>&1 | head -10
```
Expected: 3 passed.

- [ ] **Step 12.5: Commit**

```bash
git add -A
git commit -m "feat(controls): ProgressBar with step count and progress fill"
```

---

## Task 13: Wire ArraysPage

**Files:**
- Modify: `src/routes/ArraysPage.tsx`

No new tests — the integration is verified by manual browser check. All unit tests cover the pieces; `ArraysPage` is the composition.

- [ ] **Step 13.1: Replace `src/routes/ArraysPage.tsx`**

```tsx
import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { twoPointers } from '@/algorithms/arrays/twoPointers';
import { DEFAULT_TWO_POINTERS_INPUT } from '@/types/algorithm';
import type { ArraySnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

export function ArraysPage() {
  const [inputText, setInputText] = useState(
    DEFAULT_TWO_POINTERS_INPUT.values.join(', '),
  );
  const [targetText, setTargetText] = useState(
    String(DEFAULT_TWO_POINTERS_INPUT.target),
  );
  const [run, setRun] = useState<AlgorithmRun<ArraySnapshot> | null>(() =>
    twoPointers(DEFAULT_TWO_POINTERS_INPUT),
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run as AlgorithmRun<unknown> | null);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleRun = useCallback(() => {
    const values = inputText
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const target = parseInt(targetText.trim(), 10);

    if (values.length < 2) {
      setParseError('Enter at least 2 numbers separated by commas.');
      return;
    }
    if (isNaN(target)) {
      setParseError('Target must be a number.');
      return;
    }
    if (values.length > 30) {
      setParseError('Maximum 30 values.');
      return;
    }

    setParseError(null);
    runner.reset();
    setRun(twoPointers({ values, target }) as AlgorithmRun<ArraySnapshot>);
  }, [inputText, targetText, runner]);

  const currentSnap = run?.steps[stepIndex]?.snapshot ?? null;
  const totalSteps = run?.steps.length ?? 0;

  return (
    <>
      <TopicHeader topicId="arrays" />

      <div className="p-8 flex flex-col gap-6">
        {/* Input row */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-text-muted">Array (sorted, comma-separated)</label>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="1, 2, 3, 4, 6, 8, 11, 15"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-text-muted">Target</label>
            <input
              type="number"
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
              className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="11"
            />
          </div>
          <button
            onClick={handleRun}
            className="h-10 px-4 bg-accent-primary text-bg-base text-sm font-medium rounded-lg hover:brightness-110 transition"
          >
            Run
          </button>
        </div>

        {parseError && (
          <p className="text-sm text-status-danger font-mono">{parseError}</p>
        )}

        {/* Visualizer */}
        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          <ArrayVisualizer snapshot={currentSnap as ArraySnapshot | null} />
        </div>

        {/* Narration */}
        {run && stepIndex < run.steps.length && (
          <p
            role="status"
            aria-live="polite"
            className="text-sm font-mono text-text-secondary border-l-2 border-accent-primary pl-3"
          >
            {run.steps[stepIndex]?.narration}
          </p>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <ProgressBar stepIndex={stepIndex} totalSteps={totalSteps} />
          <div className="flex items-center gap-6 flex-wrap">
            <PlaybackControls
              runnerState={runnerState}
              onPlay={() => runner.play()}
              onPause={() => runner.pause()}
              onStepBack={() => runner.stepBack()}
              onStepForward={() => runner.stepForward()}
              onReset={() => runner.reset()}
            />
            <SpeedSlider runner={runner} />
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 13.2: Typecheck**

```bash
pnpm typecheck
```
Fix any errors before continuing.

- [ ] **Step 13.3: Run full test suite**

```bash
pnpm test
```
Expected: all prior tests pass (no regressions).

- [ ] **Step 13.4: Manual browser check**

```bash
pnpm dev &
sleep 3
```

Open `http://localhost:5173/arrays` and verify:
1. Default array `1,2,3,4,6,8,11,15` and target `11` pre-filled.
2. Click **Run** — visualizer shows the array with `l` (cyan) at index 0 and `r` (amber) at index 7.
3. Press **Play** — pointers animate, narration updates, progress bar advances.
4. Press **Space** — toggles play/pause.
5. Press **← →** arrow keys — steps backward/forward.
6. Speed slider changes playback speed.
7. No console errors.

Kill server: `kill %1`

- [ ] **Step 13.5: Commit**

```bash
git add -A
git commit -m "feat(arrays): wire ArraysPage with playback loop and input controls"
```

---

## Task 14: Engine README

**Files:**
- Create: `src/engine/README.md`

- [ ] **Step 14.1: Create `src/engine/README.md`**

```markdown
# Engine — Algorithm Authoring Guide

## How the engine works

1. An algorithm function takes input and returns `AlgorithmRun<Snapshot>`.
2. `AlgorithmRun` contains a pre-computed `steps: Step<Snapshot>[]` array.
3. `Runner` plays back the array at a configurable frame rate using `requestAnimationFrame`.
4. `useAlgorithmRun` hook subscribes to `Runner` and pushes `stepIndex`/`state` into `runStore`.
5. Visualizer components read `run.steps[stepIndex].snapshot` and render it.

## What counts as one step?

> **One step = one observable state change a learner should pause to read.**

Emit a step when ANY of these changes:
- A named pointer or index moves (e.g., `l++`, `r--`)
- A data structure mutates (push, pop, swap, cell filled)
- A comparison result is decided (emit BEFORE the branch)
- A recursive call enters or returns (push/pop on `callStack`)
- A tracked variable materially changes (`sum`, `windowMax`, `count`)

Do NOT emit steps for:
- Pure arithmetic not visible in the snapshot
- Loop counter increments implicit in pointer moves
- Re-reading the same value twice

## Algorithm file template

\`\`\`ts
import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { MySnapshot } from '@/types/snapshots';
import type { MyInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function myAlgo(input) {
2:   ...
*/

export function myAlgo(input: MyInput): AlgorithmRun<MySnapshot> {
  const r = createRunBuilder<MySnapshot>('my-algorithm-id', input);
  // ... build steps
  r.push({ line: 1, narration: '...', snapshot: { ... }, variables: { ... } });
  return r.build(finalResult);
}
\`\`\`

## Test contract (mandatory — both tests required)

\`\`\`ts
describe('myAlgo', () => {
  it('result: correct answer for known input', () => {
    expect(myAlgo(input).finalResult).toEqual(expected);
  });
  it('trace: matches snapshot', () => {
    expect(serializeRun(myAlgo(input))).toMatchSnapshot();
  });
});
\`\`\`

Never write a result-only test without the trace snapshot test. The trace catches "right answer, wrong steps" regressions — exactly the bugs that ruin the learning experience.

## Line number alignment

The `line` field in each step references the DISPLAYED snippet (the comment block), not the instrumented source code. Keep them aligned — count from line 1 at the top of the displayed function.
```

- [ ] **Step 14.2: Final verification**

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
All must pass.

- [ ] **Step 14.3: Final commit**

```bash
git add -A
git commit -m "docs(engine): README algorithm authoring guide + session 2a complete"
```

---

## Final Verification Checklist

- [ ] `pnpm test` — all tests pass (prior 25 + new engine/algo/component tests)
- [ ] `pnpm typecheck` — zero errors
- [ ] `pnpm lint` — zero warnings
- [ ] `pnpm build` — production build succeeds
- [ ] Browser: `/arrays` shows animated two-pointer visualization, all controls work
- [ ] Use `superpowers:verification-before-completion` before declaring done

---

## Out of Scope (defer to Session 2b)

- `CodePanel` — hand-authored code display with line highlighting
- `ComplexityBadge` — best/avg/worst time + space badges
- `ProblemsSidebar` — NeetCode problem links
- `StepNarration` as a standalone panel (narration is inline in ArraysPage for now)
- `VariableInspector` — live variable display
- `CallStackPanel` — recursion frame display
- `KeyInsightCallout` — mental model callout
- `InputPanel` component (input is inline in ArraysPage)
- `AlgorithmTabs` component (no tabs yet — only one algorithm in Session 2a)
- `algorithms/arrays/slidingWindow.ts` — added in Session 2b to validate tabs
- Data files: `codeSnippets.ts`, `complexities.ts`, `neetcodeProblems.ts`, `defaultInputs.ts`, `keyInsights.ts`
- `src/hooks/useRafTicker.ts` — not needed; RAF is internal to Runner
