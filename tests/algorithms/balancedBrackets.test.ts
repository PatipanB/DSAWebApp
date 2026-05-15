import { describe, it, expect } from 'vitest';
import { balancedBrackets } from '@/algorithms/stackQueue/balancedBrackets';
import { serializeRun } from '@/engine/serializeRun';

describe('balancedBrackets', () => {
  describe('result', () => {
    it('returns true for balanced expression', () => {
      expect(balancedBrackets({ expression: '([{}])' }).finalResult).toBe(true);
    });

    it('returns true for empty string', () => {
      expect(balancedBrackets({ expression: '' }).finalResult).toBe(true);
    });

    it('returns false for mismatched brackets', () => {
      expect(balancedBrackets({ expression: '([)]' }).finalResult).toBe(false);
    });

    it('returns false for unclosed bracket', () => {
      expect(balancedBrackets({ expression: '((' }).finalResult).toBe(false);
    });

    it('returns false for extra closing bracket', () => {
      expect(balancedBrackets({ expression: ')' }).finalResult).toBe(false);
    });
  });

  describe('trace', () => {
    it('matches snapshot for default input', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      expect(serializeRun(run)).toMatchSnapshot();
    });

    it('emits at least one step per character', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      expect(run.steps.length).toBeGreaterThanOrEqual(6);
    });

    it('all steps have valid line numbers', () => {
      const run = balancedBrackets({ expression: '([{}])' });
      for (const s of run.steps) expect(s.line).toBeGreaterThan(0);
    });

    it('finalResult is true for balanced expression', () => {
      const run = balancedBrackets({ expression: '()' });
      expect(run.finalResult).toBe(true);
    });

    it('early-exit step has invalid=true for mismatch', () => {
      const run = balancedBrackets({ expression: '([)]' });
      const hasInvalid = run.steps.some(
        (s) => (s.snapshot as import('@/types/snapshots').StackSnapshot).invalid === true,
      );
      expect(hasInvalid).toBe(true);
    });
  });
});
