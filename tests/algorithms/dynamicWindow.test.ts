import { describe, it, expect } from 'vitest';
import { dynamicWindow } from '@/algorithms/arrays/dynamicWindow';
import { serializeRun } from '@/engine/serializeRun';

describe('dynamicWindow', () => {
  describe('result', () => {
    it('returns 3 for "abcabcbb"', () => {
      expect(dynamicWindow({ s: 'abcabcbb' }).finalResult).toBe(3);
    });

    it('returns 1 for "bbbbb"', () => {
      expect(dynamicWindow({ s: 'bbbbb' }).finalResult).toBe(1);
    });

    it('returns 3 for "pwwkew"', () => {
      expect(dynamicWindow({ s: 'pwwkew' }).finalResult).toBe(3);
    });

    it('returns 0 for empty string', () => {
      expect(dynamicWindow({ s: '' }).finalResult).toBe(0);
    });
  });

  describe('trace', () => {
    it('init step has phase=init and empty windowSet', () => {
      const run = dynamicWindow({ s: 'abc' });
      const snap = run.steps[0]!.snapshot as import('@/types/snapshots').StringWindowSnapshot;
      expect(snap.phase).toBe('init');
      expect(snap.windowSet).toEqual([]);
    });

    it('last step has phase=done', () => {
      const run = dynamicWindow({ s: 'abc' });
      const last = run.steps[run.steps.length - 1]!;
      const snap = last.snapshot as import('@/types/snapshots').StringWindowSnapshot;
      expect(snap.phase).toBe('done');
    });

    it('expand steps have phase=expand', () => {
      const run = dynamicWindow({ s: 'abc' });
      // For 'abc' (no duplicates), all middle steps are expand
      const expandSteps = run.steps.slice(1, -1);
      for (const step of expandSteps) {
        const snap = step.snapshot as import('@/types/snapshots').StringWindowSnapshot;
        expect(snap.phase).toBe('expand');
      }
    });

    it('shrink steps appear for duplicate chars', () => {
      const run = dynamicWindow({ s: 'abca' });
      const shrinkSteps = run.steps.filter((s) => {
        const snap = s.snapshot as import('@/types/snapshots').StringWindowSnapshot;
        return snap.phase === 'shrink';
      });
      expect(shrinkSteps.length).toBeGreaterThan(0);
    });

    it('trace matches snapshot for "abcabcbb"', () => {
      const run = dynamicWindow({ s: 'abcabcbb' });
      expect(serializeRun(run)).toMatchSnapshot();
    });
  });
});
