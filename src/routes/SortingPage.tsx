import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { SortingVisualizer } from '@/components/visualizers/SortingVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { AlgorithmIntroCard } from '@/components/panels/AlgorithmIntroCard';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { bubbleSort } from '@/algorithms/sorting/bubble';
import { mergeSort } from '@/algorithms/sorting/merge';
import { quickSort } from '@/algorithms/sorting/quick';
import { heapSort } from '@/algorithms/sorting/heap';
import { COMPLEXITIES } from '@/data/complexities';
import { DEFAULT_SORTING_INPUT } from '@/types/algorithm';
import type { SortingSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type SortingAlgoId = 'bubble-sort' | 'merge-sort' | 'quick-sort' | 'heap-sort';
type PageMode = 'step' | 'race';
type RaceMode = 'idle' | 'playing' | 'paused';

const ALGO_TABS = [
  { id: 'bubble-sort' as const, label: 'Bubble' },
  { id: 'merge-sort'  as const, label: 'Merge'  },
  { id: 'quick-sort'  as const, label: 'Quick'  },
  { id: 'heap-sort'   as const, label: 'Heap'   },
];

const RACE_DURATION_MS = 5000;

function buildRun(id: SortingAlgoId): AlgorithmRun<unknown> {
  switch (id) {
    case 'bubble-sort': return bubbleSort(DEFAULT_SORTING_INPUT) as AlgorithmRun<unknown>;
    case 'merge-sort':  return mergeSort(DEFAULT_SORTING_INPUT)  as AlgorithmRun<unknown>;
    case 'quick-sort':  return quickSort(DEFAULT_SORTING_INPUT)  as AlgorithmRun<unknown>;
    case 'heap-sort':   return heapSort(DEFAULT_SORTING_INPUT)   as AlgorithmRun<unknown>;
  }
}

export function SortingPage() {
  // ── Shared ──
  const [pageMode, setPageMode] = useState<PageMode>('step');

  // ── Step mode ──
  const [activeId, setActiveId] = useState<SortingAlgoId>('bubble-sort');
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(
    () => bubbleSort(DEFAULT_SORTING_INPUT) as AlgorithmRun<unknown>,
  );
  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: SortingAlgoId) => {
      setActiveId(id);
      runner.reset();
      setRun(buildRun(id));
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    runner.reset();
    setRun(buildRun(activeId));
  }, [activeId, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;
  const sortSnap = (currentStep?.snapshot as SortingSnapshot | undefined) ?? null;
  const complexityEntry = COMPLEXITIES[activeId];

  // ── Race mode ──
  const [bubbleRun] = useState(() => bubbleSort(DEFAULT_SORTING_INPUT) as AlgorithmRun<unknown>);
  const [mergeRun]  = useState(() => mergeSort(DEFAULT_SORTING_INPUT)  as AlgorithmRun<unknown>);
  const [quickRun]  = useState(() => quickSort(DEFAULT_SORTING_INPUT)  as AlgorithmRun<unknown>);
  const [heapRun]   = useState(() => heapSort(DEFAULT_SORTING_INPUT)   as AlgorithmRun<unknown>);

  const [raceIndices, setRaceIndices] = useState([0, 0, 0, 0]);
  const [raceMode, setRaceMode] = useState<RaceMode>('idle');

  const raceRuns = [bubbleRun, mergeRun, quickRun, heapRun];

  useEffect(() => {
    if (raceMode !== 'playing') return;
    const intervals = raceRuns.map((run, i) => {
      const speed = Math.max(50, Math.floor(RACE_DURATION_MS / run.steps.length));
      return setInterval(() => {
        setRaceIndices((prev) => {
          const next = [...prev];
          if (next[i]! < run.steps.length - 1) next[i] = next[i]! + 1;
          return next;
        });
      }, speed);
    });
    return () => intervals.forEach(clearInterval);
  }, [raceMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (raceMode !== 'playing') return;
    const allDone = raceRuns.every((run, i) => (raceIndices[i] ?? 0) >= run.steps.length - 1);
    if (allDone) setRaceMode('idle');
  }, [raceIndices, raceMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRacePlay = useCallback(() => setRaceMode('playing'), []);
  const handleRacePause = useCallback(() => setRaceMode('paused'), []);
  const handleRaceReset = useCallback(() => {
    setRaceMode('idle');
    setRaceIndices([0, 0, 0, 0]);
  }, []);

  const handleModeToggle = useCallback(() => {
    setPageMode((prev) => {
      if (prev === 'step') {
        // entering race — reset race state
        setRaceMode('idle');
        setRaceIndices([0, 0, 0, 0]);
        return 'race';
      } else {
        return 'step';
      }
    });
  }, []);

  // ── Race snapshots ──
  const raceLabels = ['Bubble', 'Merge', 'Quick', 'Heap'];
  const raceSnapshots = raceRuns.map((r, i) =>
    (r.steps[raceIndices[i]!]?.snapshot as SortingSnapshot | undefined) ?? null,
  );

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="sorting" />

        <button
          onClick={handleModeToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-strong bg-bg-elevated text-text-secondary text-sm font-mono hover:text-text-primary hover:border-accent-primary transition self-start"
        >
          {pageMode === 'step' ? 'Switch to Race Mode' : 'Switch to Step Mode'}
        </button>

        {pageMode === 'step' ? (
          <>
            <KeyInsightCallout algorithmId={activeId} />

            <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />
            <AlgorithmIntroCard algorithmId={activeId} stepIndex={stepIndex} />

            <div
              data-testid="visualizer-slot"
              className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
            >
              <SortingVisualizer snapshot={sortSnap} />
            </div>

            <StepNarration narration={currentStep?.narration} />

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

            <InputPanel onRun={handleRun} error={null}>
              <p className="text-xs text-text-muted font-mono">
                Click Run to reset to default input: [5, 2, 8, 1, 9, 3, 7, 4, 6]
              </p>
            </InputPanel>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
              <div className="flex flex-col gap-4">
                {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
                <VariableInspector variables={currentVars} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              data-testid="visualizer-slot"
              className="grid grid-cols-2 gap-4"
            >
              {raceSnapshots.map((snap, i) => (
                <div
                  key={raceLabels[i]}
                  className="bg-bg-surface border border-border-subtle rounded-2xl p-4"
                >
                  <SortingVisualizer snapshot={snap} label={raceLabels[i]} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRacePlay}
                disabled={raceMode === 'playing'}
                className="px-4 py-2 rounded-lg bg-accent-primary text-bg-base text-sm font-mono disabled:opacity-40 hover:opacity-90 transition"
              >
                Play
              </button>
              <button
                onClick={handleRacePause}
                disabled={raceMode !== 'playing'}
                className="px-4 py-2 rounded-lg border border-border-strong bg-bg-elevated text-text-secondary text-sm font-mono disabled:opacity-40 hover:text-text-primary transition"
              >
                Pause
              </button>
              <button
                onClick={handleRaceReset}
                className="px-4 py-2 rounded-lg border border-border-strong bg-bg-elevated text-text-secondary text-sm font-mono hover:text-text-primary transition"
              >
                Reset
              </button>
            </div>
          </>
        )}
      </main>

      {pageMode === 'step' && (
        <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
          <ProblemsSidebar topicId="sorting" />
        </aside>
      )}
    </div>
  );
}
