import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { AdjacencySnapshot } from '@/types/snapshots';
import type { AdjacencyInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function dfsAdjacency(nodes, edges, startId) {
2:    const adjList = buildAdjList(edges);
3:    const stack = [startId];
4:    const visited = new Set([startId]);
5:    while (stack.length > 0) {
6:      const current = stack.pop();
7:      for (const neighbor of adjList[current]) {
8:        if (!visited.has(neighbor)) {
9:          stack.push(neighbor);
10:          visited.add(neighbor);
11:        }
12:      }
13:    }
14:    return [...visited];
15: }
*/

export function dfsAdjacency(input: AdjacencyInput): AlgorithmRun<AdjacencySnapshot> {
  const { nodes, edges, startId } = input;
  const r = createRunBuilder<AdjacencySnapshot>('dfs-adjacency', input);

  // Build label lookup
  const labelOf: Record<string, string> = {};
  for (const node of nodes) {
    labelOf[node.id] = node.label;
  }

  // Build adjacency list (undirected: both directions)
  const adjList: Record<string, string[]> = {};
  for (const node of nodes) {
    adjList[node.id] = [];
  }
  for (const edge of edges) {
    adjList[edge.from]!.push(edge.to);
    adjList[edge.to]!.push(edge.from);
  }

  // Initialize all edge states to idle
  const edgeStates: Record<string, 'idle' | 'traversed' | 'tree'> = {};
  for (const edge of edges) {
    edgeStates[`${edge.from}-${edge.to}`] = 'idle';
    edgeStates[`${edge.to}-${edge.from}`] = 'idle';
  }

  const visitedSet = new Set<string>();
  const visitOrder: string[] = [];
  const stack: string[] = [startId];
  visitedSet.add(startId);

  while (stack.length > 0) {
    const current = stack.pop()!;
    visitOrder.push(current);

    const neighbors = adjList[current] ?? [];

    for (const neighbor of neighbors) {
      const fwdKey = `${current}-${neighbor}`;
      const bwdKey = `${neighbor}-${current}`;
      if (!visitedSet.has(neighbor)) {
        // Tree edge: first discovery
        edgeStates[fwdKey] = 'tree';
        edgeStates[bwdKey] = 'tree';
        stack.push(neighbor);
        visitedSet.add(neighbor);
      } else if (edgeStates[fwdKey] !== 'tree') {
        // Back/cross edge: already seen
        edgeStates[fwdKey] = 'traversed';
        edgeStates[bwdKey] = 'traversed';
      }
    }

    const currentLabel = labelOf[current] ?? current;
    const stackLabels = stack.map((id) => labelOf[id] ?? id).join(', ');

    // Determine narration
    let narration: string;
    if (current === startId) {
      narration = `Enter ${currentLabel} — push neighbors onto stack`;
    } else if (stack.length === 0 || neighbors.every((n) => visitedSet.has(n) && !stack.includes(n))) {
      narration = `Enter ${currentLabel} — leaf node, DFS backtracks`;
    } else {
      narration = `Enter ${currentLabel} — exploring depth first`;
    }

    r.push({
      line: 6,
      narration,
      snapshot: {
        nodes,
        edges,
        startId,
        visited: [...visitedSet],
        frontier: [...stack],
        current,
        edgeStates: { ...edgeStates },
      },
      variables: {
        current: currentLabel,
        callStack: stackLabels,
        visited: visitedSet.size,
      },
    });
  }

  const finalResult = visitOrder.map((id) => labelOf[id] ?? id);
  return r.build(finalResult);
}
