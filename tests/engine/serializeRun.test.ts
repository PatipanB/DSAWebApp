import { describe, it, expect } from 'vitest';
import { serializeRun } from '@/engine/serializeRun';
import { createRunBuilder } from '@/engine/types';

describe('serializeRun', () => {
  it('produces a deterministic string for a simple run', () => {
    const r = createRunBuilder<{ values: number[] }>('two-pointers', [1, 2]);
    r.push({ line: 1, narration: 'init', snapshot: { values: [1, 2] }, variables: { l: 0 } });
    r.push({ line: 2, narration: 'found', snapshot: { values: [1, 2] }, variables: { l: 0, r: 1 } });
    const run = r.build([0, 1]);

    const out = serializeRun(run);
    expect(out).toContain('two-pointers');
    expect(out).toContain('steps: 2');
    expect(out).toContain('line=1');
    expect(out).toContain('narration="init"');
    expect(out).toContain('line=2');
    expect(out).toContain('narration="found"');
    expect(out).toContain('finalResult: [0,1]');
  });

  it('produces identical output on repeated calls (deterministic)', () => {
    const r = createRunBuilder<{ x: number }>('bubble-sort', []);
    r.push({ line: 1, narration: 'step', snapshot: { x: 1 } });
    const run = r.build();
    expect(serializeRun(run)).toBe(serializeRun(run));
  });
});
