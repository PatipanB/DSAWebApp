import { TopicHeader } from '@/components/panels/TopicHeader';

export function BSTPage() {
  return (
    <>
      <TopicHeader topicId="bst" />
      <div className="p-8 text-text-muted">
        <p>Coming soon. Engine and visualizer ship in Session 2a.</p>
        <div data-testid="visualizer-slot" className="mt-6 h-64 bg-bg-surface border border-dashed border-border-strong rounded-2xl" />
      </div>
    </>
  );
}
