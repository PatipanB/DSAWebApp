import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StringVisualizer } from '@/components/visualizers/StringVisualizer';
import type { StringWindowSnapshot } from '@/types/snapshots';

const expandSnap: StringWindowSnapshot = {
  chars: ['a', 'b', 'c'],
  left: 0,
  right: 2,
  windowSet: ['a', 'b', 'c'],
  maxLen: 3,
  currentLen: 3,
  phase: 'expand',
};

describe('StringVisualizer', () => {
  it('renders "No data" when snapshot is null', () => {
    render(<StringVisualizer snapshot={null} />);
    expect(screen.getByText('No data')).toBeTruthy();
  });

  it('renders one cell per char', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('char-cell-0')).toBeTruthy();
    expect(screen.getByTestId('char-cell-2')).toBeTruthy();
  });

  it('marks left pointer cell with data-left="true"', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('char-cell-0').getAttribute('data-left')).toBe('true');
  });

  it('marks right pointer cell with data-right="true"', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('char-cell-2').getAttribute('data-right')).toBe('true');
  });

  it('marks window cells with data-in-window="true" for expand phase', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('char-cell-0').getAttribute('data-in-window')).toBe('true');
    expect(screen.getByTestId('char-cell-1').getAttribute('data-in-window')).toBe('true');
    expect(screen.getByTestId('char-cell-2').getAttribute('data-in-window')).toBe('true');
  });

  it('marks window cells left..right-1 for shrink phase', () => {
    const shrinkSnap: StringWindowSnapshot = {
      chars: ['a', 'b', 'c', 'a'],
      left: 0,
      right: 3,
      windowSet: ['b', 'c'],
      maxLen: 3,
      currentLen: 3,
      phase: 'shrink',
    };
    render(<StringVisualizer snapshot={shrinkSnap} />);
    // Window is left..right-1 = 0..2
    expect(screen.getByTestId('char-cell-0').getAttribute('data-in-window')).toBe('true');
    expect(screen.getByTestId('char-cell-2').getAttribute('data-in-window')).toBe('true');
    // cell at right (3) should NOT be in window
    expect(screen.getByTestId('char-cell-3').getAttribute('data-in-window')).toBeNull();
  });

  it('no cells marked in-window for init phase', () => {
    const initSnap: StringWindowSnapshot = {
      chars: ['a', 'b'],
      left: 0,
      right: 0,
      windowSet: [],
      maxLen: 0,
      currentLen: 0,
      phase: 'init',
    };
    render(<StringVisualizer snapshot={initSnap} />);
    expect(screen.getByTestId('char-cell-0').getAttribute('data-in-window')).toBeNull();
    expect(screen.getByTestId('char-cell-1').getAttribute('data-in-window')).toBeNull();
  });

  it('renders window-set container', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('window-set')).toBeTruthy();
  });

  it('renders max-len display', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('max-len').textContent).toContain('3');
  });

  it('renders phase-label', () => {
    render(<StringVisualizer snapshot={expandSnap} />);
    expect(screen.getByTestId('phase-label').textContent?.toLowerCase()).toContain('expand');
  });
});
