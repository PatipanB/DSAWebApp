import type { LinkedListSnapshot } from '@/types/snapshots';

interface Props {
  snapshot: LinkedListSnapshot | null;
}

const COLOR_CLASSES: Record<'cyan' | 'amber' | 'rose', string> = {
  cyan: 'text-accent-primary border-accent-primary',
  amber: 'text-status-warn border-status-warn',
  rose: 'text-status-danger border-status-danger',
};

export function LinkedListVisualizer({ snapshot }: Props) {
  if (!snapshot) {
    return (
      <div className="flex items-center justify-center h-32 text-text-muted font-mono text-sm">
        Press Run to start
      </div>
    );
  }

  // Build ordered node list by following head chain
  const ordered: string[] = [];
  let curr: string | null = snapshot.headId;
  while (curr !== null && snapshot.nodes[curr]) {
    ordered.push(curr);
    curr = snapshot.nodes[curr]!.nextId;
  }

  // Map nodeId → pointers pointing to it
  const pointersByNode = new Map<string | null, typeof snapshot.pointers>();
  for (const ptr of snapshot.pointers) {
    if (!pointersByNode.has(ptr.nodeId)) pointersByNode.set(ptr.nodeId, []);
    pointersByNode.get(ptr.nodeId)!.push(ptr);
  }

  return (
    <div className="flex items-start justify-center p-6 flex-wrap">
      {ordered.map((nodeId, idx) => {
        const node = snapshot.nodes[nodeId]!;
        const ptrs = pointersByNode.get(nodeId) ?? [];
        const isActive = ptrs.some((p) => p.color === 'amber');
        const nextNodeId = ordered[idx + 1] ?? null;

        return (
          <div key={nodeId} className="flex items-center">
            {/* Node column: badges above, box below */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1 min-h-5 items-center">
                {ptrs.map((ptr) => (
                  <span
                    key={ptr.name}
                    className={`text-xs font-mono px-1 rounded border ${COLOR_CLASSES[ptr.color]}`}
                  >
                    {ptr.name}
                  </span>
                ))}
              </div>
              <div
                data-testid={`ll-node-${nodeId}`}
                data-active={isActive ? 'true' : undefined}
                className={`w-12 h-12 flex items-center justify-center rounded-xl border-2 font-mono text-sm font-bold transition-colors ${
                  isActive
                    ? 'bg-status-warn/10 border-status-warn text-status-warn'
                    : 'bg-bg-elevated border-border-strong text-text-primary'
                }`}
              >
                {node.value}
              </div>
            </div>

            {/* Arrow column after this node */}
            <div className="flex flex-col items-center justify-center mx-1 gap-0.5 mt-5">
              {/* Forward arrow: this node → next (or null) */}
              <span
                data-testid={`ll-arrow-${nodeId}-${node.nextId ?? 'null'}`}
                className="text-text-muted font-mono text-sm"
              >
                →
              </span>
              {/* Backward arrow: nextNode → this node (doubly only, not after last node) */}
              {snapshot.doubly && nextNodeId !== null && (
                <span
                  data-testid={`ll-arrow-${nextNodeId}-${nodeId}`}
                  className="text-text-muted font-mono text-sm"
                >
                  ←
                </span>
              )}
            </div>
          </div>
        );
      })}
      {/* Null sentinel */}
      <div className="flex items-center mt-5">
        <span className="text-text-muted font-mono text-sm">null</span>
      </div>
    </div>
  );
}
