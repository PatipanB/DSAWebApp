import { useState, useCallback, useEffect } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { GraphGridVisualizer } from '@/components/visualizers/GraphGridVisualizer';
import { GraphAdjacencyVisualizer } from '@/components/visualizers/GraphAdjacencyVisualizer';
import { PlaybackControls } from '@/components/controls/PlaybackControls';
import { SpeedSlider } from '@/components/controls/SpeedSlider';
import { ProgressBar } from '@/components/controls/ProgressBar';
import { AlgorithmTabs } from '@/components/controls/AlgorithmTabs';
import { InputPanel } from '@/components/controls/InputPanel';
import { StepNarration } from '@/components/panels/StepNarration';
import { VariableInspector } from '@/components/panels/VariableInspector';
import { CallStackPanel } from '@/components/panels/CallStackPanel';
import { KeyInsightCallout } from '@/components/panels/KeyInsightCallout';
import { AlgorithmIntroCard } from '@/components/panels/AlgorithmIntroCard';
import { CodePanel } from '@/components/panels/CodePanel';
import { ComplexityBadge } from '@/components/panels/ComplexityBadge';
import { ProblemsSidebar } from '@/components/panels/ProblemsSidebar';
import { useAlgorithmRun } from '@/engine/useAlgorithmRun';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { useRunStore } from '@/store/runStore';
import { usePrefsStore } from '@/store/prefsStore';
import { bfsGrid } from '@/algorithms/graph/bfsGrid';
import { dfsGrid } from '@/algorithms/graph/dfsGrid';
import { bfsAdjacency } from '@/algorithms/graph/bfsAdjacency';
import { dfsAdjacency } from '@/algorithms/graph/dfsAdjacency';
import { COMPLEXITIES } from '@/data/complexities';
import { DEFAULT_GRID_INPUT, DEFAULT_ADJACENCY_INPUT } from '@/types/algorithm';
import type { GridInput } from '@/types/algorithm';
import type { GridSnapshot, AdjacencySnapshot, GridCell } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type ViewMode = 'grid' | 'adjacency';
type GridAlgoId = 'bfs-grid' | 'dfs-grid';
type AdjAlgoId = 'bfs-adjacency' | 'dfs-adjacency';

const GRID_ALGO_TABS = [
  { id: 'bfs-grid' as const, label: 'BFS' },
  { id: 'dfs-grid' as const, label: 'DFS' },
];

const ADJ_ALGO_TABS = [
  { id: 'bfs-adjacency' as const, label: 'BFS' },
  { id: 'dfs-adjacency' as const, label: 'DFS' },
];

const GRID_ALGO_MAP: Record<GridAlgoId, (input: GridInput) => AlgorithmRun<GridSnapshot>> = {
  'bfs-grid': bfsGrid,
  'dfs-grid': dfsGrid,
};

function buildGridRun(id: GridAlgoId, input: GridInput): AlgorithmRun<unknown> {
  return GRID_ALGO_MAP[id](input) as AlgorithmRun<unknown>;
}

function buildAdjRun(id: AdjAlgoId): AlgorithmRun<unknown> {
  if (id === 'bfs-adjacency') {
    return bfsAdjacency(DEFAULT_ADJACENCY_INPUT) as AlgorithmRun<unknown>;
  }
  return dfsAdjacency(DEFAULT_ADJACENCY_INPUT) as AlgorithmRun<unknown>;
}

export function GraphPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeGridId, setActiveGridId] = useState<GridAlgoId>('bfs-grid');
  const [activeAdjId, setActiveAdjId] = useState<AdjAlgoId>('bfs-adjacency');
  const [gridInput, setGridInput] = useState<GridInput>(() => DEFAULT_GRID_INPUT);
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(
    () => bfsGrid(DEFAULT_GRID_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);
  const markVisited = usePrefsStore((s) => s.markVisited);

  useEffect(() => {
    if (stepIndex > 0) markVisited('graph');
  }, [stepIndex, markVisited]);

  const handleModeToggle = useCallback(() => {
    setViewMode((prev) => {
      const next: ViewMode = prev === 'grid' ? 'adjacency' : 'grid';
      runner.reset();
      if (next === 'grid') {
        setRun(buildGridRun(activeGridId, DEFAULT_GRID_INPUT));
        setGridInput(DEFAULT_GRID_INPUT);
      } else {
        setRun(buildAdjRun(activeAdjId));
      }
      return next;
    });
    setParseError(null);
  }, [runner, activeGridId, activeAdjId]);

  const handleGridAlgorithmChange = useCallback(
    (id: GridAlgoId) => {
      setActiveGridId(id);
      setParseError(null);
      runner.reset();
      setRun(buildGridRun(id, gridInput));
    },
    [runner, gridInput],
  );

  const handleAdjAlgorithmChange = useCallback(
    (id: AdjAlgoId) => {
      setActiveAdjId(id);
      setParseError(null);
      runner.reset();
      setRun(buildAdjRun(id));
    },
    [runner],
  );

  const handleGridCellClick = useCallback(
    (row: number, col: number) => {
      const cell = gridInput.cells[row]?.[col];
      if (cell === 'start' || cell === 'end') return;
      const newCells = gridInput.cells.map((r, ri) =>
        r.map((c, ci): GridCell => (ri === row && ci === col ? (c === 'wall' ? 'open' : 'wall') : c)),
      );
      const newInput: GridInput = { ...gridInput, cells: newCells };
      setGridInput(newInput);
      runner.reset();
      setRun(buildGridRun(activeGridId, newInput));
    },
    [gridInput, activeGridId, runner],
  );

  const handleGridRun = useCallback(() => {
    setParseError(null);
    setGridInput(DEFAULT_GRID_INPUT);
    runner.reset();
    setRun(buildGridRun(activeGridId, DEFAULT_GRID_INPUT));
  }, [activeGridId, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const totalSteps = run?.steps.length ?? 0;

  const gridSnap = (currentStep?.snapshot as GridSnapshot | undefined) ?? null;
  const adjSnap = (currentStep?.snapshot as AdjacencySnapshot | undefined) ?? null;

  const activeAlgoId = viewMode === 'grid' ? activeGridId : activeAdjId;
  const complexityEntry = COMPLEXITIES[activeAlgoId];

  const gridCallStack: string[] | undefined =
    activeGridId === 'dfs-grid' && viewMode === 'grid' && currentStep?.variables?.callStack != null
      ? String(currentStep.variables.callStack).split(', ')
      : undefined;

  const adjCallStack: string[] | undefined =
    activeAdjId === 'dfs-adjacency' && viewMode === 'adjacency' && currentStep?.variables?.callStack != null
      ? String(currentStep.variables.callStack).split(', ')
      : undefined;

  const dfsCallStack = viewMode === 'grid' ? gridCallStack : adjCallStack;

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="graph" />

        <button
          onClick={handleModeToggle}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-strong bg-bg-elevated text-text-secondary text-sm font-mono hover:text-text-primary hover:border-accent-primary transition self-start"
        >
          {viewMode === 'grid' ? 'Switch to Adjacency Graph' : 'Switch to Grid'}
        </button>

        <KeyInsightCallout algorithmId={activeAlgoId} />

        {viewMode === 'grid' ? (
          <AlgorithmTabs
            tabs={GRID_ALGO_TABS}
            selectedId={activeGridId}
            onSelect={handleGridAlgorithmChange}
          />
        ) : (
          <AlgorithmTabs
            tabs={ADJ_ALGO_TABS}
            selectedId={activeAdjId}
            onSelect={handleAdjAlgorithmChange}
          />
        )}
        <AlgorithmIntroCard algorithmId={activeAlgoId} stepIndex={stepIndex} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          {viewMode === 'grid' ? (
            <GraphGridVisualizer snapshot={gridSnap} onCellClick={handleGridCellClick} />
          ) : (
            <GraphAdjacencyVisualizer snapshot={adjSnap} />
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

        {viewMode === 'grid' ? (
          <InputPanel onRun={handleGridRun} error={parseError}>
            <p className="text-xs text-text-muted font-mono">
              Click cells to toggle walls. Start/end cells are locked.
            </p>
          </InputPanel>
        ) : (
          <InputPanel onRun={() => {}} error={null}>
            <p className="text-xs text-text-muted font-mono">
              Fixed adjacency graph — no custom input.
            </p>
          </InputPanel>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeAlgoId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
            <CallStackPanel callStack={dfsCallStack} />
          </div>
        </div>
      </main>

      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="graph" />
      </aside>
    </div>
  );
}
