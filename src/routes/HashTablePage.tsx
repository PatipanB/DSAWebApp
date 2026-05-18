import { useState, useCallback } from 'react';
import { TopicHeader } from '@/components/panels/TopicHeader';
import { HashTableChainingVisualizer } from '@/components/visualizers/HashTableChainingVisualizer';
import { HashTableOpenAddressingVisualizer } from '@/components/visualizers/HashTableOpenAddressingVisualizer';
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
import { chaining } from '@/algorithms/hashTable/chaining';
import { openAddressing } from '@/algorithms/hashTable/openAddressing';
import { COMPLEXITIES } from '@/data/complexities';
import { DEFAULT_HASH_TABLE_INPUT } from '@/types/algorithm';
import type { ChainingSnapshot, OpenAddressingSnapshot } from '@/types/snapshots';
import type { AlgorithmRun } from '@/engine/types';

type HashAlgoId = 'chaining' | 'open-addressing';

const HASH_TABS = [
  { id: 'chaining'        as const, label: 'Chaining'       },
  { id: 'open-addressing' as const, label: 'Open Addressing' },
];

export function HashTablePage() {
  const [activeId, setActiveId] = useState<HashAlgoId>('chaining');
  const [run, setRun] = useState<AlgorithmRun<unknown> | null>(
    () => chaining(DEFAULT_HASH_TABLE_INPUT) as AlgorithmRun<unknown>,
  );

  const runner = useAlgorithmRun(run);
  useKeyboardControls(runner);

  const stepIndex = useRunStore((s) => s.stepIndex);
  const runnerState = useRunStore((s) => s.runnerState);

  const handleAlgorithmChange = useCallback(
    (id: HashAlgoId) => {
      setActiveId(id);
      runner.reset();
      if (id === 'chaining') {
        setRun(chaining(DEFAULT_HASH_TABLE_INPUT) as AlgorithmRun<unknown>);
      } else {
        setRun(openAddressing(DEFAULT_HASH_TABLE_INPUT) as AlgorithmRun<unknown>);
      }
    },
    [runner],
  );

  const handleRun = useCallback(() => {
    runner.reset();
    if (activeId === 'chaining') {
      setRun(chaining(DEFAULT_HASH_TABLE_INPUT) as AlgorithmRun<unknown>);
    } else {
      setRun(openAddressing(DEFAULT_HASH_TABLE_INPUT) as AlgorithmRun<unknown>);
    }
  }, [activeId, runner]);

  const currentStep = run?.steps[stepIndex];
  const currentVars = currentStep?.variables;
  const chainSnap = activeId === 'chaining' ? (currentStep?.snapshot as ChainingSnapshot | undefined) ?? null : null;
  const oaSnap = activeId === 'open-addressing' ? (currentStep?.snapshot as OpenAddressingSnapshot | undefined) ?? null : null;
  const totalSteps = run?.steps.length ?? 0;
  const complexityEntry = COMPLEXITIES[activeId];

  return (
    <div className="flex h-full overflow-hidden">
      <main className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
        <TopicHeader topicId="hash-table" />
        <KeyInsightCallout algorithmId={activeId} />
        <AlgorithmTabs tabs={HASH_TABS} selectedId={activeId} onSelect={handleAlgorithmChange} />
        <AlgorithmIntroCard algorithmId={activeId} stepIndex={stepIndex} />

        <div
          data-testid="visualizer-slot"
          className="min-h-64 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center overflow-auto p-4"
        >
          {activeId === 'chaining'
            ? <HashTableChainingVisualizer snapshot={chainSnap} />
            : <HashTableOpenAddressingVisualizer snapshot={oaSnap} />}
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
          <p className="text-xs font-mono text-text-muted self-center">
            Fixed input: 6 fruit key-value pairs, bucket count 7.
          </p>
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
        <ProblemsSidebar topicId="hash-table" />
      </aside>
    </div>
  );
}
