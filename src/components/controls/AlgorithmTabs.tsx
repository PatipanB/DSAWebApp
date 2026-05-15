import { Tabs } from '@/components/primitives/Tabs';
import type { AlgorithmId } from '@/types/algorithm';

interface AlgorithmTab<T extends AlgorithmId> {
  id: T;
  label: string;
}

interface Props<T extends AlgorithmId> {
  tabs: AlgorithmTab<T>[];
  selectedId: T;
  onSelect: (id: T) => void;
}

export function AlgorithmTabs<T extends AlgorithmId>({ tabs, selectedId, onSelect }: Props<T>) {
  return (
    <Tabs
      value={selectedId}
      onChange={onSelect}
      options={tabs.map((t) => ({ value: t.id, label: t.label }))}
    />
  );
}
