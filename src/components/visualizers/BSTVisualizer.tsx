import type { BSTSnapshot, TreeNode } from '@/types/snapshots';

interface Position { x: number; y: number }

const NODE_RADIUS = 22;
const H_SPACING = 60;
const V_SPACING = 80;

function computePositions(
  rootId: string | null,
  nodes: Record<string, TreeNode>,
): Record<string, Position> {
  const positions: Record<string, Position> = {};
  let xCounter = 0;
  function dfs(nodeId: string | null, depth: number): void {
    if (nodeId == null) return;
    const node = nodes[nodeId];
    if (node == null) return;
    dfs(node.leftId, depth + 1);
    positions[nodeId] = { x: xCounter * H_SPACING + 40, y: depth * V_SPACING + 40 };
    xCounter++;
    dfs(node.rightId, depth + 1);
  }
  dfs(rootId, 0);
  return positions;
}

interface Props {
  snapshot: BSTSnapshot | null;
  showInvariant?: boolean;
}

export function BSTVisualizer({ snapshot, showInvariant = false }: Props) {
  if (snapshot == null || snapshot.rootId == null) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted font-mono text-sm">
        empty tree
      </div>
    );
  }

  const { nodes, rootId, current, visited, comparingWith, inserted, deletedNode, replacementNode, searchPath } = snapshot;
  const positions = computePositions(rootId, nodes);
  const xs = Object.values(positions).map((p) => p.x);
  const ys = Object.values(positions).map((p) => p.y);
  const width = xs.length ? Math.max(...xs) + 60 : 200;
  const height = ys.length ? Math.max(...ys) + 60 : 120;

  const searchPolyline =
    searchPath != null && searchPath.length > 1
      ? searchPath
          .map((id) => positions[id])
          .filter((p): p is Position => p != null)
          .map((p) => `${p.x},${p.y}`)
          .join(' ')
      : null;

  const rootNode = nodes[rootId];
  const leftChildPos = rootNode?.leftId ? positions[rootNode.leftId] : null;
  const rightChildPos = rootNode?.rightId ? positions[rootNode.rightId] : null;

  return (
    <svg width={width} height={height} className="mx-auto" role="img" aria-label="BST visualization">
      {/* BST invariant labels — shown only on first step */}
      {showInvariant && leftChildPos && (
        <text
          x={leftChildPos.x - NODE_RADIUS - 4}
          y={leftChildPos.y}
          textAnchor="end"
          dominantBaseline="central"
          fill="#64748b"
          fontSize={10}
          fontFamily="JetBrains Mono Variable, monospace"
          opacity={0.7}
        >
          {'< root'}
        </text>
      )}
      {showInvariant && rightChildPos && (
        <text
          x={rightChildPos.x + NODE_RADIUS + 4}
          y={rightChildPos.y}
          textAnchor="start"
          dominantBaseline="central"
          fill="#64748b"
          fontSize={10}
          fontFamily="JetBrains Mono Variable, monospace"
          opacity={0.7}
        >
          {'> root'}
        </text>
      )}
      {searchPolyline != null && (
        <polyline
          data-testid="search-path"
          points={searchPolyline}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
          strokeDasharray="5 3"
          opacity={0.6}
        />
      )}
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

      {Object.values(nodes).map((node) => {
        const pos = positions[node.id];
        if (!pos) return null;
        const isActive = current === node.id;
        const isVisited = visited.includes(node.id);
        const isComparing = comparingWith === node.id;
        const isInserted = inserted === node.id;
        const isDeleted = deletedNode === node.id;
        const isReplacement = replacementNode === node.id;

        let fill = '#1e293b';
        if (isInserted || isActive) fill = '#fbbf24';
        else if (isDeleted) fill = '#fb7185';
        else if (isComparing) fill = '#fb923c';
        else if (isReplacement) fill = '#22d3ee';
        else if (isVisited) fill = '#34d399';

        const textColor = (isInserted || isActive || isDeleted || isComparing) ? '#020617' : '#f1f5f9';
        const strokeColor = isComparing ? '#fb923c' : isReplacement ? '#22d3ee' : '#334155';
        const strokeWidth = isComparing || isReplacement ? 3 : 2;

        return (
          <g
            key={node.id}
            data-testid={`tree-node-${node.id}`}
            data-active={isActive ? 'true' : undefined}
            data-visited={isVisited ? 'true' : undefined}
            data-comparing={isComparing ? 'true' : undefined}
            data-inserted={isInserted ? 'true' : undefined}
            data-deleted={isDeleted ? 'true' : undefined}
          >
            <circle
              cx={pos.x} cy={pos.y} r={NODE_RADIUS}
              fill={fill} stroke={strokeColor} strokeWidth={strokeWidth}
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
    </svg>
  );
}
