import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { GridSnapshot, GridCell } from '@/types/snapshots';
import type { GridInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this):
1:  function dfsGrid(grid, start, end) {
2:    const stack = [start];
3:    const visited = new Set([start]);
4:    while (stack.length > 0) {
5:      const cell = stack.pop();
6:      if (cell == end) return true;
7:      for (const neighbor of getNeighbors(cell, grid)) {
8:        if (!visited.has(neighbor)) {
9:          visited.add(neighbor);
10:         stack.push(neighbor);
11:       }
12:     }
13:   }
14:   return false;
15: }
*/

type Cell = [number, number];

function key(r: number, c: number): string {
  return `${r},${c}`;
}

function buildCells(
  input: GridInput,
  poppedSet: Set<string>,
  stackSet: Set<string>,
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
      } else if (stackSet.has(cellKey)) {
        result[r]![c] = 'frontier';
      } else if (poppedSet.has(cellKey)) {
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
    const nr = r + dr!;
    const nc = c + dc!;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr]?.[nc] !== 'wall') {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

export function dfsGrid(input: GridInput): AlgorithmRun<GridSnapshot> {
  const { rows, cols, start, end } = input;
  const run = createRunBuilder<GridSnapshot>('dfs-grid', input);

  // visited marks cells when pushed to prevent duplicates
  const visitedSet = new Set<string>();
  // stackSet tracks cells currently in the stack (frontier)
  const stackSet = new Set<string>();
  // poppedSet tracks cells already popped (for 'visited' display)
  const poppedSet = new Set<string>();

  const stack: Cell[] = [start];
  visitedSet.add(key(start[0], start[1]));
  stackSet.add(key(start[0], start[1]));

  while (stack.length > 0) {
    const cell = stack.pop()!;
    const [cr, cc] = cell;
    const cellKey = key(cr, cc);

    // Move from stack set to popped set
    stackSet.delete(cellKey);
    poppedSet.add(cellKey);

    const isStart = cr === start[0] && cc === start[1];
    const isEnd = cr === end[0] && cc === end[1];

    // Build narration
    let narration: string;
    if (isStart) {
      narration = `Pop (${cr},${cc}) — start, push unvisited neighbors`;
    } else if (isEnd) {
      narration = `Pop (${cr},${cc}) — reached the end!`;
    } else {
      narration = `Pop (${cr},${cc}) — explore, push neighbors`;
    }

    // Build callStack string from current stack contents (bottom to top)
    const callStack = stack.map(([r, c]) => `[${r},${c}]`).join(', ');

    // Build cells grid
    const cells = buildCells(input, poppedSet, stackSet, cell);

    run.push({
      line: 5,
      narration,
      snapshot: {
        rows,
        cols,
        cells,
        current: [cr, cc],
      },
      variables: {
        current: `[${cr},${cc}]`,
        stackDepth: stack.length,
        callStack,
        visited: poppedSet.size,
      },
    });

    if (isEnd) {
      return run.build(true);
    }

    // Push unvisited non-wall neighbors onto stack (mark visited immediately)
    for (const [nr, nc] of getNeighbors(cr, cc, input)) {
      const nKey = key(nr, nc);
      if (!visitedSet.has(nKey)) {
        visitedSet.add(nKey);
        stackSet.add(nKey);
        stack.push([nr, nc]);
      }
    }
  }

  return run.build(false);
}
