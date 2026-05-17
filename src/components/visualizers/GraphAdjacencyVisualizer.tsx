import type { AdjacencySnapshot } from '@/types/snapshots';

interface Props {
  snapshot: AdjacencySnapshot | null;
}

function edgeColor(state: 'idle' | 'traversed' | 'tree' | undefined): string {
  if (state === 'tree') return '#34d399';
  if (state === 'traversed') return '#94a3b8';
  return '#334155';
}

function nodeColor(
  id: string,
  current: string | null,
  visited: string[],
  frontier: string[],
): string {
  if (current === id) return '#fbbf24';
  if (visited.includes(id)) return '#34d399';
  if (frontier.includes(id)) return '#fb923c';
  return '#1e293b';
}

export function GraphAdjacencyVisualizer({ snapshot }: Props) {
  if (snapshot == null) {
    return <div data-testid="graph-adjacency-placeholder" />;
  }

  const { nodes, edges, current, visited, frontier, edgeStates } = snapshot;

  return (
    <svg viewBox="0 0 420 360" width="100%" height="100%">
      {edges.map((edge) => {
        const from = nodes.find((n) => n.id === edge.from);
        const to = nodes.find((n) => n.id === edge.to);
        if (from == null || to == null) return null;
        const key = `${edge.from}-${edge.to}`;
        const stroke = edgeColor(edgeStates[key]);
        return (
          <line
            key={key}
            data-testid={`graph-edge-${edge.from}-${edge.to}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={stroke}
            strokeWidth={2}
          />
        );
      })}
      {nodes.map((node) => {
        const fill = nodeColor(node.id, current, visited, frontier);
        const isActive = current === node.id;
        const isVisited = visited.includes(node.id);
        return (
          <g
            key={node.id}
            data-testid={`graph-node-${node.id}`}
            data-active={isActive ? 'true' : undefined}
            data-visited={isVisited ? 'true' : undefined}
          >
            <circle cx={node.x} cy={node.y} r={20} fill={fill} />
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#f1f5f9"
              fontSize={13}
              fontFamily="monospace"
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
