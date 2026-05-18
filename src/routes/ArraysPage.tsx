import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { ArrayVisualizer } from '@/components/visualizers/ArrayVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { CallStackPanel } from '@/components/panels/CallStackPanel';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { usePrefsStore } from '@/store/prefsStore';
import { twoPointers } from '@/algorithms/arrays/twoPointers';
import { slidingWindow } from '@/algorithms/arrays/slidingWindow';
import { arrayOps } from '@/algorithms/arrays/arrayOps';
import { dynamicWindow } from '@/algorithms/arrays/dynamicWindow';
import { ArrayOpsVisualizer } from '@/components/visualizers/ArrayOpsVisualizer';
import { StringVisualizer } from '@/components/visualizers/StringVisualizer';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_TWO_POINTERS_INPUT,
  DEFAULT_SLIDING_WINDOW_INPUT,
  DEFAULT_ARRAY_OPS_INPUT,
  DEFAULT_DYNAMIC_WINDOW_INPUT,
} from '@/types/algorithm';
import type { ArraySnapshot, ArrayOpsSnapshot, StringWindowSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'two-pointers' as const, label: 'Two Pointers' },
  { id: 'sliding-window' as const, label: 'Sliding Window' },
  { id: 'array-ops' as const, label: 'Array Operations' },
  { id: 'dynamic-window' as const, label: 'Dynamic Window' },
];

type ArraysAlgorithmId = 'two-pointers' | 'sliding-window' | 'array-ops' | 'dynamic-window';

export function ArraysPage() {
  const [activeId, setActiveId] = useState<ArraysAlgorithmId>('two-pointers');

  const [tpValues, setTpValues] = useState(DEFAULT_TWO_POINTERS_INPUT.values.join(', '));
  const [tpTarget, setTpTarget] = useState(String(DEFAULT_TWO_POINTERS_INPUT.target));

  const [swValues, setSwValues] = useState(DEFAULT_SLIDING_WINDOW_INPUT.values.join(', '));
  const [swK, setSwK] = useState(String(DEFAULT_SLIDING_WINDOW_INPUT.k));

  const [aoValues, setAoValues] = useState(DEFAULT_ARRAY_OPS_INPUT.values.join(', '));
  const [dwString, setDwString] = useState(DEFAULT_DYNAMIC_WINDOW_INPUT.s);

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    twoPointers(DEFAULT_TWO_POINTERS_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);
  const markVisited = usePrefsStore((s) => s.markVisited);

  useEffect(() => {
    if (stepIndex > 0) markVisited('arrays');
  }, [stepIndex, markVisited]);

  const handleAlgorithmChange = useCallback(
    (id: ArraysAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'two-pointers') {
        setRun(twoPointers(DEFAULT_TWO_POINTERS_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'sliding-window') {
        setRun(slidingWindow(DEFAULT_SLIDING_WINDOW_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'array-ops') {
        setRun(arrayOps(DEFAULT_ARRAY_OPS_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(dynamicWindow(DEFAULT_DYNAMIC_WINDOW_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'two-pointers') {
      const values = tpValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const target = parseInt(tpTarget.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(twoPointers({ values, target }) as AlgorithmRun<unknown>);
    } else if (activeId === 'sliding-window') {
      const values = swValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      const k = parseInt(swK.trim(), 10);
      if (values.length < 2) { setParseError('Enter at least 2 numbers.'); return; }
      if (values.length > 30) { setParseError('Maximum 30 values.'); return; }
      if (isNaN(k) || k < 1) { setParseError('k must be a positive number.'); return; }
      if (k > values.length) { setParseError('k cannot exceed array length.'); return; }
      runner.reset();
      setRun(slidingWindow({ values, k }) as AlgorithmRun<unknown>);
    } else if (activeId === 'array-ops') {
      const values = aoValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(arrayOps({ values }) as AlgorithmRun<unknown>);
    } else {
      const s = dwString.trim();
      if (s.length > 50) { setParseError('String too long (max 50 characters).'); return; }
      if (!/^[a-zA-Z]*$/.test(s)) { setParseError('Only letters a-z and A-Z allowed.'); return; }
      runner.reset();
      setRun(dynamicWindow({ s }) as AlgorithmRun<unknown>);
    }
  }, [activeId, tpValues, tpTarget, swValues, swK, aoValues, dwString, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;

  const arraySnap = (activeId === 'two-pointers' || activeId === 'sliding-window')
    ? (currentStep?.snapshot as ArraySnapshot | undefined) ?? null
    : null;
  const arrayOpsSnap = activeId === 'array-ops'
    ? (currentStep?.snapshot as ArrayOpsSnapshot | undefined) ?? null
    : null;
  const stringSnap = activeId === 'dynamic-window'
    ? (currentStep?.snapshot as StringWindowSnapshot | undefined) ?? null
    : null;

  const callStack = (arraySnap as unknown as { callStack?: string[] })?.callStack;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Main scrollable content ── */}
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="arrays" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs
          tabs={ALGO_TABS}
          selectedId={activeId}
          onSelect={handleAlgorithmChange}
        />

        {/* Visualizer */}
        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          {activeId === 'array-ops' ? (
            <ArrayOpsVisualizer snapshot={arrayOpsSnap} />
          ) : activeId === 'dynamic-window' ? (
            <StringVisualizer snapshot={stringSnap} />
          ) : (
            <ArrayVisualizer snapshot={arraySnap} />
          )}
        </div>

        <StepNarration narration={currentStep?.narration} />

        {/* Playback controls */}
        <div className="flex flex-col gap-3">
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

        {/* Algorithm-specific inputs */}
        <InputPanel onRun={handleRun} error={parseError}>
          {activeId === 'two-pointers' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Array (sorted, comma-separated)</label>
                <input
                  type="text"
                  value={tpValues}
                  onChange={(e) => setTpValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="1, 2, 3, 4, 6, 8, 11, 15"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Target</label>
                <input
                  type="number"
                  value={tpTarget}
                  onChange={(e) => setTpTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="11"
                />
              </div>
            </>
          )}
          {activeId === 'sliding-window' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
                <input
                  type="text"
                  value={swValues}
                  onChange={(e) => setSwValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="2, 1, 5, 1, 3, 2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Window size (k)</label>
                <input
                  type="number"
                  value={swK}
                  onChange={(e) => setSwK(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="3"
                />
              </div>
            </>
          )}
          {activeId === 'array-ops' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={aoValues}
                onChange={(e) => setAoValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'dynamic-window' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">String input</label>
              <input
                type="text"
                value={dwString}
                onChange={(e) => setDwString(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="abcabcbb"
              />
            </div>
          )}
        </InputPanel>

        {/* Code + complexity + variable inspector */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
            <CallStackPanel callStack={callStack} />
          </div>
        </div>
      </main>

      {/* ── Problems sidebar (fixed right column) ── */}
      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="arrays" />
      </aside>
    </div>
  );
}
