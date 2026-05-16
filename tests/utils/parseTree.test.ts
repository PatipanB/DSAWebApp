import { describe, it, expect } from 'vitest';
import { parseTree } from '@/utils/parseTree';

describe('parseTree', () => {
  it('returns null rootId for empty input', () => {
    const { rootId, nodes } = parseTree([]);
    expect(rootId).toBeNull();
    expect(Object.keys(nodes)).toHaveLength(0);
  });

  it('handles single node', () => {
    const { rootId, nodes } = parseTree([42]);
    expect(rootId).toBe('n0');
    expect(nodes['n0']!.value).toBe(42);
    expect(nodes['n0']!.leftId).toBeNull();
    expect(nodes['n0']!.rightId).toBeNull();
  });

  it('parses [1,2,3,4,5,null,6] into correct structure', () => {
    const { rootId, nodes } = parseTree([1, 2, 3, 4, 5, null, 6]);
    expect(rootId).toBe('n0');
    expect(Object.keys(nodes)).toHaveLength(6);
    expect(nodes['n0']!.value).toBe(1);
    expect(nodes['n0']!.leftId).toBe('n1');
    expect(nodes['n0']!.rightId).toBe('n2');
    expect(nodes['n1']!.leftId).toBe('n3');
    expect(nodes['n1']!.rightId).toBe('n4');
    expect(nodes['n2']!.leftId).toBeNull();
    expect(nodes['n2']!.rightId).toBe('n5');
    expect(nodes['n5']!.value).toBe(6);
  });

  it('IDs are assigned in non-null order (null slots skipped)', () => {
    const { nodes } = parseTree([1, null, 2]);
    expect(nodes['n0']!.leftId).toBeNull();
    expect(nodes['n0']!.rightId).toBe('n1');
    expect(nodes['n1']!.value).toBe(2);
  });
});
