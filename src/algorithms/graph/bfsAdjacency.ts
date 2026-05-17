import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { AdjacencySnapshot } from '@/types/snapshots';
import type { AdjacencyInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function bfsAdjacency(nodes, edges, startId) {
2:    const adjList = buildAdjList(edges);
3:    const queue = [startId];
4:    const visited = new Set();
5:    while (queue.length > 0) {
6:      const current = queue.shift();
7:      visited.add(current);
8:      for (const neighbor of adjList[current]) {
9:        if (!visited.has(neighbor)) {
10:          queue.push(neighbor);
11:        }
12:      }
13:    }
14:    return [...visited];
15: }
*/

export function bfsAdjacency(input: AdjacencyInput): AlgorithmRun<AdjacencySnapshot> {
  const { nodes, edges, startId } = input;
  const r = createRunBuilder<AdjacencySnapshot>('bfs-adjacency', input);

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

  const visited: string[] = [];
  const visitedSet = new Set<string>();
  const frontierSet = new Set<string>();
  const treeEdges = new Set<string>();
  const queue: string[] = [startId];
  const edgeStates: Record<string, 'idle' | 'traversed' | 'tree'> = {};

  // Initialize all edge states to idle
  for (const edge of edges) {
    edgeStates[`${edge.from}-${edge.to}`] = 'idle';
    edgeStates[`${edge.to}-${edge.from}`] = 'idle';
  }

  frontierSet.add(startId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    frontierSet.delete(current);
    visitedSet.add(current);
    visited.push(current);

    const neighbors = adjList[current] ?? [];
    const newNeighbors: string[] = [];

    for (const neighbor of neighbors) {
      const fwdKey = `${current}-${neighbor}`;
      const bwdKey = `${neighbor}-${current}`;
      if (!visitedSet.has(neighbor) && !frontierSet.has(neighbor)) {
        // Tree edge: first discovery of neighbor
        edgeStates[fwdKey] = 'tree';
        edgeStates[bwdKey] = 'tree';
        treeEdges.add(fwdKey);
        treeEdges.add(bwdKey);
        frontierSet.add(neighbor);
        queue.push(neighbor);
        newNeighbors.push(neighbor);
      } else if (!treeEdges.has(fwdKey)) {
        // Cross/back edge: neighbor already seen, and not a tree edge — mark traversed
        edgeStates[fwdKey] = 'traversed';
        edgeStates[bwdKey] = 'traversed';
      }
    }

    const currentLabel = labelOf[current] ?? current;
    const frontierLabels = [...frontierSet].map((id) => labelOf[id] ?? id);

    let narration: string;
    if (newNeighbors.length > 0) {
      const newLabels = newNeighbors.map((id) => labelOf[id] ?? id).join(', ');
      const isStart = current === startId;
      if (isStart) {
        narration = `Dequeue ${currentLabel} — start node, add neighbors ${newLabels} to frontier`;
      } else {
        narration = `Dequeue ${currentLabel} — add ${newLabels} to frontier`;
      }
    } else {
      narration = `Dequeue ${currentLabel} — already seen neighbors, no new additions`;
    }

    r.push({
      line: 6,
      narration,
      snapshot: {
        nodes,
        edges,
        startId,
        visited: [...visitedSet],
        frontier: [...frontierSet],
        current,
        edgeStates: { ...edgeStates },
      },
      variables: {
        current: currentLabel,
        frontier: frontierLabels.join(', '),
        visited: visitedSet.size,
      },
    });
  }

  const finalResult = visited.map((id) => labelOf[id] ?? id);
  return r.build(finalResult);
}
