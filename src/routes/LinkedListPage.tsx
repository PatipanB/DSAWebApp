import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { LinkedListVisualizer } from '@/components/visualizers/LinkedListVisualizer';
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
import { usePrefsStore } from '@/store/prefsStore';
import { singlyTraverse } from '@/algorithms/linkedList/singlyTraverse';
import { singlyInsertDelete } from '@/algorithms/linkedList/singlyInsertDelete';
import { doublyTraverse } from '@/algorithms/linkedList/doublyTraverse';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_SINGLY_TRAVERSE_INPUT,
  DEFAULT_SINGLY_INSERT_DELETE_INPUT,
  DEFAULT_DOUBLY_TRAVERSE_INPUT,
} from '@/types/algorithm';
import type { LinkedListSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'singly-traverse' as const, label: 'Singly Traverse' },
  { id: 'singly-insert-delete' as const, label: 'Insert / Delete' },
  { id: 'doubly-traverse' as const, label: 'Doubly Traverse' },
];

type LinkedListAlgorithmId = 'singly-traverse' | 'singly-insert-delete' | 'doubly-traverse';

export function LinkedListPage() {
  const [activeId, setActiveId] = useState<LinkedListAlgorithmId>('singly-traverse');

  const [stValues, setStValues] = useState(DEFAULT_SINGLY_TRAVERSE_INPUT.values.join(', '));
  const [sidValues, setSidValues] = useState(DEFAULT_SINGLY_INSERT_DELETE_INPUT.values.join(', '));
  const [dtValues, setDtValues] = useState(DEFAULT_DOUBLY_TRAVERSE_INPUT.values.join(', '));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    singlyTraverse(DEFAULT_SINGLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);
  const markVisited = usePrefsStore((s) => s.markVisited);

  useEffect(() => {
    if (stepIndex > 0) markVisited('linked-list');
  }, [stepIndex, markVisited]);

  const handleAlgorithmChange = useCallback(
    (id: LinkedListAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'singly-traverse') {
        setRun(singlyTraverse(DEFAULT_SINGLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>);
      } else if (id === 'singly-insert-delete') {
        setRun(singlyInsertDelete(DEFAULT_SINGLY_INSERT_DELETE_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(doublyTraverse(DEFAULT_DOUBLY_TRAVERSE_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'singly-traverse') {
      const values = stValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(singlyTraverse({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'singly-insert-delete') {
      const values = sidValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 10) { setParseError('Maximum 10 values.'); return; }
      runner.reset();
      setRun(singlyInsertDelete({ values }) as AlgorithmRun<unknown>);
    } else {
      const values = dtValues
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));
      if (values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(doublyTraverse({ values }) as AlgorithmRun<unknown>);
    }
  }, [activeId, stValues, sidValues, dtValues, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const llSnap = (currentStep?.snapshot as LinkedListSnapshot | undefined) ?? null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="linked-list" />

        <KeyInsightCallout algorithmId={activeId} />

        <AlgorithmTabs
          tabs={ALGO_TABS}
          selectedId={activeId}
          onSelect={handleAlgorithmChange}
        />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center"
        >
          <LinkedListVisualizer snapshot={llSnap} />
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
          {activeId === 'singly-traverse' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={stValues}
                onChange={(e) => setStValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'singly-insert-delete' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Initial list (comma-separated, max 10)</label>
              <input
                type="text"
                value={sidValues}
                onChange={(e) => setSidValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
              />
            </div>
          )}
          {activeId === 'doubly-traverse' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Array (comma-separated)</label>
              <input
                type="text"
                value={dtValues}
                onChange={(e) => setDtValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="1, 2, 3, 4"
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
        <ProblemsSidebar topicId="linked-list" />
      </aside>
    </div>
  );
}
