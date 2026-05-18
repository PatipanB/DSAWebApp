import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { BSTVisualizer } from '@/components/visualizers/BSTVisualizer';
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
import { bstInsert } from '@/algorithms/bst/bstInsert';
import { bstSearch } from '@/algorithms/bst/bstSearch';
import { bstDelete } from '@/algorithms/bst/bstDelete';
import { COMPLEXITIES } from '@/data/complexities';
import {
  DEFAULT_BST_INSERT_INPUT,
  DEFAULT_BST_SEARCH_INPUT,
  DEFAULT_BST_DELETE_INPUT,
} from '@/types/algorithm';
import type { BSTSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'bst-insert' as const, label: 'Insert' },
  { id: 'bst-search' as const, label: 'Search' },
  { id: 'bst-delete' as const, label: 'Delete' },
];

type BSTAlgorithmId = 'bst-insert' | 'bst-search' | 'bst-delete';

export function BSTPage() {
  const [activeId, setActiveId] = useState<BSTAlgorithmId>('bst-insert');

  const [insertValues, setInsertValues] = useState(DEFAULT_BST_INSERT_INPUT.values.join(', '));
  const [searchValues, setSearchValues] = useState(DEFAULT_BST_SEARCH_INPUT.treeValues.join(', '));
  const [searchTarget, setSearchTarget] = useState(String(DEFAULT_BST_SEARCH_INPUT.target));
  const [deleteValues, setDeleteValues] = useState(DEFAULT_BST_DELETE_INPUT.treeValues.join(', '));
  const [deleteTarget, setDeleteTarget] = useState(String(DEFAULT_BST_DELETE_INPUT.target));

  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    bstInsert(DEFAULT_BST_INSERT_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);
  const markVisited = usePrefsStore((s) => s.markVisited);

  useEffect(() => {
    if (stepIndex > 0) markVisited('bst');
  }, [stepIndex, markVisited]);

  const handleAlgorithmChange = useCallback(
    (id: BSTAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      if (id === 'bst-insert') setRun(bstInsert(DEFAULT_BST_INSERT_INPUT) as AlgorithmRun<unknown>);
      else if (id === 'bst-search') setRun(bstSearch(DEFAULT_BST_SEARCH_INPUT) as AlgorithmRun<unknown>);
      else setRun(bstDelete(DEFAULT_BST_DELETE_INPUT) as AlgorithmRun<unknown>);
    },
    [runner],
  );

  const parseValues = (raw: string): number[] | null => {
    const vals = raw.split(',').map((s) => parseInt(s.trim(), 10));
    return vals.every((n) => !isNaN(n)) ? vals : null;
  };

  const handleRun = useCallback(() => {
    setParseError(null);

    if (activeId === 'bst-insert') {
      const values = parseValues(insertValues);
      if (!values || values.length < 1) { setParseError('Enter at least 1 number.'); return; }
      if (values.length > 20) { setParseError('Maximum 20 values.'); return; }
      runner.reset();
      setRun(bstInsert({ values }) as AlgorithmRun<unknown>);
    } else if (activeId === 'bst-search') {
      const treeValues = parseValues(searchValues);
      const target = parseInt(searchTarget.trim(), 10);
      if (!treeValues || treeValues.length < 1) { setParseError('Enter at least 1 tree value.'); return; }
      if (treeValues.length > 20) { setParseError('Maximum 20 tree values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(bstSearch({ treeValues, target }) as AlgorithmRun<unknown>);
    } else {
      const treeValues = parseValues(deleteValues);
      const target = parseInt(deleteTarget.trim(), 10);
      if (!treeValues || treeValues.length < 1) { setParseError('Enter at least 1 tree value.'); return; }
      if (treeValues.length > 20) { setParseError('Maximum 20 tree values.'); return; }
      if (isNaN(target)) { setParseError('Target must be a number.'); return; }
      runner.reset();
      setRun(bstDelete({ treeValues, target }) as AlgorithmRun<unknown>);
    }
  }, [activeId, insertValues, searchValues, searchTarget, deleteValues, deleteTarget, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const bstSnap = (currentStep?.snapshot as BSTSnapshot | undefined) ?? null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="bst" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />
        <AlgorithmIntroCard algorithmId={activeId} stepIndex={stepIndex} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          <BSTVisualizer snapshot={bstSnap} />
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
          {activeId === 'bst-insert' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-mono text-text-muted">Values to insert (comma-separated)</label>
              <input
                type="text"
                value={insertValues}
                onChange={(e) => setInsertValues(e.target.value)}
                className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                placeholder="5, 3, 7, 1, 4, 6, 8"
              />
            </div>
          )}
          {activeId === 'bst-search' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Tree values (comma-separated)</label>
                <input
                  type="text"
                  value={searchValues}
                  onChange={(e) => setSearchValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="5, 3, 7, 1, 4, 6, 8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Search target</label>
                <input
                  type="number"
                  value={searchTarget}
                  onChange={(e) => setSearchTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="4"
                />
              </div>
            </>
          )}
          {activeId === 'bst-delete' && (
            <>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Tree values (comma-separated)</label>
                <input
                  type="text"
                  value={deleteValues}
                  onChange={(e) => setDeleteValues(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-72 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="5, 3, 7, 1, 4, 6, 8"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono text-text-muted">Node to delete</label>
                <input
                  type="number"
                  value={deleteTarget}
                  onChange={(e) => setDeleteTarget(e.target.value)}
                  className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-24 focus:outline-none focus:ring-2 focus:ring-accent-primary"
                  placeholder="3"
                />
              </div>
            </>
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
        <ProblemsSidebar topicId="bst" />
      </aside>
    </div>
  );
}
