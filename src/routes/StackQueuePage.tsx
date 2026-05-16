import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { StackVisualizer } from '@/components/visualizers/StackVisualizer';
import { QueueVisualizer } from '@/components/visualizers/QueueVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { balancedBrackets } from '@/algorithms/stackQueue/balancedBrackets';
import { monotonicStack } from '@/algorithms/stackQueue/monotonicStack';
import { queueDemo } from '@/algorithms/stackQueue/queueDemo';
import { stackDemo } from '@/algorithms/stackQueue/stackDemo';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_BALANCED_BRACKETS_INPUT,
  DEFAULT_MONOTONIC_STACK_INPUT,
  DEFAULT_QUEUE_DEMO_INPUT,
  DEFAULT_STACK_DEMO_INPUT,
} from '@/types/algorithm';
import type { StackSnapshot, QueueSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type StackQueueAlgorithmId = 'balanced-brackets' | 'monotonic-stack' | 'queue-demo' | 'stack-demo';

const ALGO_TABS = [
  { id: 'balanced-brackets' as const, label: 'Balanced Brackets' },
  { id: 'monotonic-stack' as const, label: 'Monotonic Stack' },
  { id: 'queue-demo' as const, label: 'Queue Demo' },
  { id: 'stack-demo' as const, label: 'Stack Demo' },
];

export function StackQueuePage() {
  const [activeId, setActiveId] = useState<StackQueueAlgorithmId>('balanced-brackets');

  const [bbExpr, setBbExpr] = useState(DEFAULT_BALANCED_BRACKETS_INPUT.expression);
  const [msValues, setMsValues] = useState(DEFAULT_MONOTONIC_STACK_INPUT.values.join(', '));
  const [qdValues, setQdValues] = useState(DEFAULT_QUEUE_DEMO_INPUT.values.join(', '));
  const [sdValues, setSdValues] = useState(DEFAULT_STACK_DEMO_INPUT.values.join(', '));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    balancedBrackets(DEFAULT_BALANCED_BRACKETS_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: StackQueueAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'balanced-brackets') {
        setRun(balancedBrackets(DEFAULT_BALANCED_BRACKETS_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'monotonic-stack') {
        setRun(monotonicStack(DEFAULT_MONOTONIC_STACK_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'queue-demo') {
        setRun(queueDemo(DEFAULT_QUEUE_DEMO_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(stackDemo(DEFAULT_STACK_DEMO_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);
    runner.reset();

    if (activeId === 'balanced-brackets') {
      const expr = bbExpr.trim();
      if (expr.length > 100) { setParseError('Expression too long (max 100 chars).'); return; }
      const valid = /^[()[\]{}]*$/.test(expr);
      if (!valid) { setParseError('Only ( ) [ ] { } characters allowed.'); return; }
      setRun(balancedBrackets({ expression: expr }) as AlgorithmRun<unknown>);
    } else if (activeId === 'monotonic-stack') {
      const values = msValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(monotonicStack({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'stack-demo') {
      const values = sdValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(stackDemo({ values }) as AlgorithmRun<unknown>);
    } else {
      const values = qdValues.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      setRun(queueDemo({ values }) as AlgorithmRun<unknown>);
    }
  }, [activeId, bbExpr, msValues, qdValues, sdValues, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  const stackSnap =
    activeId !== 'queue-demo'
      ? (currentStep?.snapshot as StackSnapshot | undefined) ?? null
      : null;
  const queueSnap =
    activeId === 'queue-demo'
      ? (currentStep?.snapshot as QueueSnapshot | undefined) ?? null
      : null;

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="stack-queue" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          {activeId !== 'queue-demo' ? (
            <StackVisualizer snapshot={stackSnap} />
          ) : (
            <QueueVisualizer snapshot={queueSnap} />
          )}
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

        <InputPanel onRun={handleRun} error={parseError}>
          {activeId === 'balanced-brackets' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Bracket expression (only {'( ) [ ] { }'})
              </label>
              <input
                type="text"
                value={bbExpr}
                onChange={(e) => setBbExpr(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="([{}])"
              />
            </div>
          )}
          {activeId === 'monotonic-stack' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={msValues}
                onChange={(e) => setMsValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="2, 1, 2, 4, 3"
              />
            </div>
          )}
          {activeId === 'queue-demo' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Values to enqueue (comma-separated)
              </label>
              <input
                type="text"
                value={qdValues}
                onChange={(e) => setQdValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="3, 1, 2, 4"
              />
            </div>
          )}
          {activeId === 'stack-demo' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">
                Values to push (comma-separated)
              </label>
              <input
                type="text"
                value={sdValues}
                onChange={(e) => setSdValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="3, 1, 2, 4"
              />
            </div>
          )}
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
        <ProblemsSidebar topicId="stack-queue" />
      </aside>
    </div>
  );
}
