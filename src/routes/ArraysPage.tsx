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
