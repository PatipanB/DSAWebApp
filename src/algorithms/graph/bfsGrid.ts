import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { GridSnapshot, GridCell } from '@/types/snapshots';
import type { GridInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function bfsGrid(grid, start, end) {
2:    const queue = [start];
3:    const visited = new Set();
4:    visited.add(start);
5:    while (queue.length > 0) {
6:      const cell = queue.shift();
7:      if (cell == end) return true;
8:      for (const neighbor of getNeighbors(cell, grid)) {
9:        if (!visited.has(neighbor)) {
10:          visited.add(neighbor);
11:          queue.push(neighbor);
12:        }
13:      }
14:    }
15:    return false;
16: }
*/

type Cell = [number, number];

function key(r: number, c: number): string {
  return `${r},${c}`;
}

function buildCells(
  input: GridInput,
  visitedSet: Set<string>,
  frontierSet: Set<string>,
  currentCell: Cell,
): GridCell[][] {
  const { rows, cols, cells: inputCells, start, end } = input;
  const result: GridCell[][] = Array.from({ length: rows }, () =>
    Array(cols).fill('open') as GridCell[],
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const inputCell = inputCells[r]?.[c];
      const cellKey = key(r, c);
      const isCurrent = r === currentCell[0] && c === currentCell[1];
      const isStart = r === start[0] && c === start[1];
      const isEnd = r === end[0] && c === end[1];

      if (inputCell === 'wall') {
        result[r]![c] = 'wall';
      } else if (isCurrent) {
        result[r]![c] = 'current';
      } else if (isStart) {
        result[r]![c] = 'start';
      } else if (isEnd) {
        result[r]![c] = 'end';
      } else if (frontierSet.has(cellKey)) {
        result[r]![c] = 'frontier';
      } else if (visitedSet.has(cellKey)) {
        result[r]![c] = 'visited';
      } else {
        result[r]![c] = 'open';
      }
    }
  }

  return result;
}

function getNeighbors(r: number, c: number, input: GridInput): Cell[] {
  const { rows, cols, cells } = input;
  const dirs: Cell[] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const neighbors: Cell[] = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr]?.[nc] !== 'wall') {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

export function bfsGrid(input: GridInput): AlgorithmRun<GridSnapshot> {
  const { rows, cols, start, end } = input;
  const r = createRunBuilder<GridSnapshot>('bfs-grid', input);

  const queue: Cell[] = [start];
  const visitedSet = new Set<string>();
  const frontierSet = new Set<string>();

  visitedSet.add(key(start[0], start[1]));
  frontierSet.add(key(start[0], start[1]));

  while (queue.length > 0) {
    const cell = queue.shift()!;
    const [cr, cc] = cell;
    const cellKey = key(cr, cc);

    // Remove from frontier — it's now being processed
    frontierSet.delete(cellKey);

    const isStart = cr === start[0] && cc === start[1];
    const isEnd = cr === end[0] && cc === end[1];

    // Build narration
    let narration: string;
    if (isStart) {
      narration = `Dequeue (${cr},${cc}) — start cell, add neighbors to frontier`;
    } else if (isEnd) {
      narration = `Dequeue (${cr},${cc}) — reached the end!`;
    } else {
      narration = `Dequeue (${cr},${cc}) — mark visited, explore neighbors`;
    }

    // Snapshot: current cell shown as 'current'
    const cells = buildCells(input, visitedSet, frontierSet, cell);
    const frontierList = [...frontierSet].map((k) => `[${k.replace(',', ',')}]`).join(',');

    r.push({
      line: 6,
      narration,
      snapshot: {
        rows,
        cols,
        cells,
        current: [cr, cc],
      },
      variables: {
        current: `[${cr},${cc}]`,
        frontier: frontierList,
        visited: visitedSet.size,
      },
    });

    // Check if we reached the end
    if (isEnd) {
      return r.build(true);
    }

    // Explore neighbors
    for (const [nr, nc] of getNeighbors(cr, cc, input)) {
      const nKey = key(nr, nc);
      if (!visitedSet.has(nKey)) {
        visitedSet.add(nKey);
        frontierSet.add(nKey);
        queue.push([nr, nc]);
      }
    }
  }

  return r.build(false);
}
