import type { TreeSnapshot, TreeNode } from '@/types/snapshots';

interface Position { x: number; y: number }
interface GhostPos { x: number; y: number; parentId: string; side: 'left' | 'right' }

const NODE_RADIUS = 22;
const H_SPACING = 60;
const V_SPACING = 80;

function computePositions(
  rootId: string | null,
  nodes: Record<string, TreeNode>,
): { positions: Record<string, Position>; ghosts: GhostPos[] } {
  const positions: Record<string, Position> = {};
  const ghosts: GhostPos[] = [];
  let xCounter = 0;

  // siblingExists: if true, the other child is real — show ghost for this null slot
  function dfs(
    nodeId: string | null,
    depth: number,
    parentId?: string,
    side?: 'left' | 'right',
    siblingExists?: boolean,
  ): void {
    if (nodeId == null) {
      if (parentId != null && side != null && siblingExists) {
        ghosts.push({ x: xCounter * H_SPACING + 40, y: depth * V_SPACING + 40, parentId, side });
        xCounter++;
      }
      return;
    }
    const node = nodes[nodeId];
    if (node == null) return;
    dfs(node.leftId, depth + 1, nodeId, 'left', node.rightId != null);
    positions[nodeId] = { x: xCounter * H_SPACING + 40, y: depth * V_SPACING + 40 };
    xCounter++;
    dfs(node.rightId, depth + 1, nodeId, 'right', node.leftId != null);
  }

  dfs(rootId, 0);
  return { positions, ghosts };
}

interface Props {
  snapshot: TreeSnapshot | null;
}

export function BinaryTreeVisualizer({ snapshot }: Props) {
  if (snapshot == null || snapshot.rootId == null) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        empty tree
      </div>
    );
  }

  const { nodes, rootId, current, visited } = snapshot;
  const { positions, ghosts } = computePositions(rootId, nodes);
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const ghostXs = ghosts.map((g) => g.x);
  const ghostYs = ghosts.map((g) => g.y);
  const allXs = [...xs, ...ghostXs];
  const allYs = [...ys, ...ghostYs];
  const width = allXs.length ? Math.max(...allXs) + 60 : 200;
  const height = allYs.length ? Math.max(...allYs) + 60 : 120;

  return (
    <svg
      width={width}
      height={height}
      className="mx-auto"
      role="img"
      aria-label="Binary tree visualization"
    >
      {/* Real edges */}
      {Object.values(nodes).flatMap((node) => {
        const pos = positions[node.id];
        if (!pos) return [];
        const edges = [];
        if (node.leftId && positions[node.leftId]) {
          edges.push(
            <line
              key={`el-${node.id}`}
              data-testid={`tree-edge-${node.id}-${node.leftId}`}
              x1={pos.x} y1={pos.y}
              x2={positions[node.leftId]!.x} y2={positions[node.leftId]!.y}
              stroke="#334155" strokeWidth={2}
            />
          );
        }
        if (node.rightId && positions[node.rightId]) {
          edges.push(
            <line
              key={`er-${node.id}`}
              data-testid={`tree-edge-${node.id}-${node.rightId}`}
              x1={pos.x} y1={pos.y}
              x2={positions[node.rightId]!.x} y2={positions[node.rightId]!.y}
              stroke="#334155" strokeWidth={2}
            />
          );
        }
        return edges;
      })}

      {/* Ghost edges (dashed, faint) */}
      {ghosts.map((g) => {
        const parentPos = positions[g.parentId];
        if (!parentPos) return null;
        return (
          <line
            key={`ghost-edge-${g.parentId}-${g.side}`}
            x1={parentPos.x} y1={parentPos.y}
            x2={g.x} y2={g.y}
            stroke="#334155" strokeWidth={1} strokeDasharray="4 3" opacity={0.4}
          />
        );
      })}

      {/* Real nodes */}
      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isActive = current === node.id;
        const isVisited = visited.includes(node.id);

        let fill = '#1e293b';
        if (isActive) fill = '#fbbf24';
        else if (isVisited) fill = '#34d399';

        const textColor = isActive ? '#020617' : '#f1f5f9';

        return (
          <g
            key={node.id}
            data-testid={`tree-node-${node.id}`}
            data-active={isActive ? 'true' : undefined}
            data-visited={isVisited ? 'true' : undefined}
          >
            <circle
              cx={pos.x} cy={pos.y} r={NODE_RADIUS}
              fill={fill} stroke={isActive ? '#fbbf24' : '#334155'} strokeWidth={2}
            />
            <text
              x={pos.x} y={pos.y}
              textAnchor="middle" dominantBaseline="central"
              fill={textColor} fontSize={13}
              fontFamily="JetBrains Mono Variable, monospace"
            >
              {node.value}
            </text>
          </g>
        );
      })}

      {/* Ghost null nodes */}
      {ghosts.map((g) => (
        <g
          key={`ghost-${g.parentId}-${g.side}`}
          data-testid={`ghost-node-${g.parentId}-${g.side}`}
          opacity={0.3}
        >
          <circle
            cx={g.x} cy={g.y} r={NODE_RADIUS}
            fill="none" stroke="#64748b" strokeWidth={1} strokeDasharray="4 3"
          />
          <text
            x={g.x} y={g.y}
            textAnchor="middle" dominantBaseline="central"
            fill="#64748b" fontSize={13}
            fontFamily="JetBrains Mono Variable, monospace"
          >
            ∅
          </text>
        </g>
      ))}
    </svg>
  );
}
