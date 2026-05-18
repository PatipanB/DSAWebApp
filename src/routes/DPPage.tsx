import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { DPTableVisualizer } from '@/components/visualizers/DPTableVisualizer';
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
import { usePrefsStore } from '@/store/prefsStore';
import { fibonacci } from '@/algorithms/dp/fibonacci';
import { knapsack01 } from '@/algorithms/dp/knapsack01';
import { lcs } from '@/algorithms/dp/lcs';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_FIBONACCI_INPUT,
  DEFAULT_KNAPSACK_INPUT,
  DEFAULT_LCS_INPUT,
} from '@/types/algorithm';
import type { DPSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type DPAlgoId = 'fibonacci' | 'knapsack-01' | 'lcs';

const DP_TABS = [
  { id: 'fibonacci'   as const, label: 'Fibonacci' },
  { id: 'knapsack-01' as const, label: 'Knapsack'  },
  { id: 'lcs'         as const, label: 'LCS'        },
];

function buildRun(id: DPAlgoId): AlgorithmRun<unknown> {
  if (id === 'fibonacci') return fibonacci(DEFAULT_FIBONACCI_INPUT) as AlgorithmRun<unknown>;
  if (id === 'knapsack-01') return knapsack01(DEFAULT_KNAPSACK_INPUT) as AlgorithmRun<unknown>;
  return lcs(DEFAULT_LCS_INPUT) as AlgorithmRun<unknown>;
}

export function DPPage() {
  const [activeId, setActiveId] = useState<DPAlgoId>('fibonacci');
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() => buildRun('fibonacci'));

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);
  const markVisited = usePrefsStore((s) => s.markVisited);

  useEffect(() => {
    if (stepIndex > 0) markVisited('dp');
  }, [stepIndex, markVisited]);

  const handleAlgorithmChange = useCallback(
    (id: DPAlgoId) => {
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
  const dpSnap = (currentStep?.snapshot as DPSnapshot | undefined) ?? null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="dp" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={DP_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />
        <AlgorithmIntroCard algorithmId={activeId} stepIndex={stepIndex} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          <DPTableVisualizer snapshot={dpSnap} />
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

        <InputPanel onRun={handleRun}>
          <p className="text-xs text-text-muted font-mono">Fixed input — click Run to reset to default.</p>
        </InputPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
          </div>
        </div>
      </main>

      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="dp" />
      </aside>
    </div>
  );
}
