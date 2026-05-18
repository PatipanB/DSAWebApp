import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { BinaryTreeVisualizer } from '@/components/visualizers/BinaryTreeVisualizer';
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
import { inorder } from '@/algorithms/tree/inorder';
import { preorder } from '@/algorithms/tree/preorder';
import { postorder } from '@/algorithms/tree/postorder';
import { levelOrder } from '@/algorithms/tree/levelOrder';
import { COMPLEXITIES } from '@/data/complexities';
import { DEFAULT_TREE_TRAVERSAL_INPUT } from '@/types/algorithm';
import type { TreeSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

const ALGO_TABS = [
  { id: 'inorder' as const, label: 'Inorder' },
  { id: 'preorder' as const, label: 'Preorder' },
  { id: 'postorder' as const, label: 'Postorder' },
  { id: 'level-order' as const, label: 'Level Order' },
];

type BinaryTreeAlgorithmId = 'inorder' | 'preorder' | 'postorder' | 'level-order';

const ALGO_MAP: Record<BinaryTreeAlgorithmId, (input: { values: (number | null)[] }) => AlgorithmRun<TreeSnapshot>> = {
  'inorder': inorder,
  'preorder': preorder,
  'postorder': postorder,
  'level-order': levelOrder,
};

function parseTreeInput(raw: string): (number | null)[] | null {
  const parts = raw.split(',').map((s) => s.trim());
  if (parts.length === 0) return null;
  const result: (number | null)[] = [];
  for (const part of parts) {
    if (part === 'null' || part === '') {
      result.push(null);
    } else {
      const n = parseInt(part, 10);
      if (isNaN(n)) return null;
      result.push(n);
    }
  }
  return result.length > 0 ? result : null;
}

export function BinaryTreePage() {
  const [activeId, setActiveId] = useState<BinaryTreeAlgorithmId>('inorder');
  const [treeInput, setTreeInput] = useState(
    DEFAULT_TREE_TRAVERSAL_INPUT.values.map((v) => (v === null ? 'null' : String(v))).join(', '),
  );
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(() =>
    inorder(DEFAULT_TREE_TRAVERSAL_INPUT) as AlgorithmRun<unknown>,
  );
  const [parseError, setParseError] = useState<string | null>(null);

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: BinaryTreeAlgorithmId) => {
      setActiveId(id);
      setParseError(null);
      runner.reset();
      setRun(ALGO_MAP[id](DEFAULT_TREE_TRAVERSAL_INPUT) as AlgorithmRun<unknown>);
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    setParseError(null);
    const values = parseTreeInput(treeInput);
    if (values === null) {
      setParseError('Invalid input. Use comma-separated numbers and "null" for empty slots.');
      return;
    }
    const nonNull = values.filter((v) => v !== null).length;
    if (nonNull === 0) {
      setParseError('Tree must have at least one node.');
      return;
    }
    if (nonNull > 31) {
      setParseError('Maximum 31 nodes.');
      return;
    }
    runner.reset();
    setRun(ALGO_MAP[activeId]({ values }) as AlgorithmRun<unknown>);
  }, [activeId, treeInput, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const treeSnap = (currentStep?.snapshot as TreeSnapshot | undefined) ?? null;
  const callStack = treeSnap?.callStack;
  const bfsQueue =
    activeId === 'level-order' && treeSnap?.queue != null
      ? treeSnap.queue.map((id) => treeSnap.nodes[id]?.value ?? '?')
      : null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="binary-tree" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={ALGO_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          <BinaryTreeVisualizer snapshot={treeSnap} />
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
          <div className="flex flex-col gap-1">
            <label className="text-xs font-mono text-text-muted">
              Tree (level-order, comma-separated, use "null" for missing nodes)
            </label>
            <input
              type="text"
              value={treeInput}
              onChange={(e) => setTreeInput(e.target.value)}
              className="bg-bg-elevated border border-border-strong rounded-lg px-3 py-2 text-sm font-mono text-text-primary w-96 focus:outline-none focus:ring-2 focus:ring-accent-primary"
              placeholder="1, 2, 3, 4, 5, null, 6"
            />
          </div>
        </InputPanel>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <CodePanel algorithmId={activeId} currentLine={currentStep?.line ?? 1} />
          <div className="flex flex-col gap-4">
            {complexityEntry && <ComplexityBadge entry={complexityEntry} />}
            <VariableInspector variables={currentVars} />
            <CallStackPanel callStack={callStack} />
            {bfsQueue != null && (
              <div data-testid="bfs-queue-panel" className="bg-bg-surface border border-border-subtle rounded-xl p-4 flex flex-col gap-2">
                <p className="text-xs font-mono text-text-muted uppercase tracking-wider">BFS Queue</p>
                {bfsQueue.length === 0 ? (
                  <p className="text-xs font-mono text-text-muted">empty</p>
                ) : (
                  <div className="flex items-center gap-1 flex-wrap">
                    {bfsQueue.map((val, idx) => (
                      <span
                        key={idx}
                        data-testid={`bfs-queue-item-${idx}`}
                        className="px-2 py-1 rounded-md bg-bg-elevated border border-border-subtle text-xs font-mono text-text-primary"
                      >
                        {String(val)}
                      </span>
                    ))}
                    <span className="text-xs font-mono text-text-muted ml-1">← front</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className="w-72 border-l border-border-subtle overflow-y-auto p-5 shrink-0">
        <ProblemsSidebar topicId="binary-tree" />
      </aside>
    </div>
  );
}
