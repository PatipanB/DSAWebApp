import { Tabs } from '@/components/primitives/Tabs';
import type { AlgorithmId } from '@/types/algorithm';

interface AlgorithmTab {
  id: AlgorithmId;
  label: string;
}

interface Props {
  tabs: AlgorithmTab[];
  selectedId: AlgorithmId;
  onSelect: (id: AlgorithmId) => void;
}

export function AlgorithmTabs({ tabs, selectedId, onSelect }: Props) {
  return (
    <Tabs
      value={selectedId}
      onChange={onSelect}
      options={tabs.map((t) => ({ value: t.id, label: t.label }))}
    />
  );
}
