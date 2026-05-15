import { createRunBuilder } from '@/engine/types';
import type { AlgorithmRun } from '@/engine/types';
import type { StackSnapshot, StackItem } from '@/types/snapshots';
import type { BalancedBracketsInput } from '@/types/algorithm';

/*
DISPLAYED SNIPPET (line numbers reference this block):
1: function balancedBrackets(s) {
2:   const stack = [];
3:   const map = { ')':'(', ']':'[', '}':'{' };
4:   for (const c of s) {
5:     if ('([{'.includes(c)) stack.push(c);
6:     else if (stack.pop() !== map[c]) return false;
7:   }
8:   return stack.length === 0;
9: }
*/

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
const OPENS = new Set(['(', '[', '{']);

export function balancedBrackets(input: BalancedBracketsInput): AlgorithmRun<StackSnapshot> {
  const { expression } = input;
  const tokens = expression.split('');
  const r = createRunBuilder<StackSnapshot>('balanced-brackets', input);
  let idCounter = 0;
  const uid = () => `b${idCounter++}`;

  let items: StackItem[] = [];

  r.push({
    line: 1,
    narration: `Start scanning "${expression || '(empty)'}"`,
    snapshot: { items: [], inputCursor: 0, inputTokens: tokens },
    variables: { expr: expression, stackSize: 0 },
  });

  for (let i = 0; i < tokens.length; i++) {
    const c = tokens[i]!;

    if (OPENS.has(c)) {
      items = [...items, { id: uid(), value: c }];
      r.push({
        line: 5,
        narration: `'${c}' is an opening bracket — push onto stack`,
        snapshot: { items: [...items], inputCursor: i + 1, inputTokens: tokens },
        variables: { char: c, stackSize: items.length },
      });
    } else if (c in PAIRS) {
      const top = items[items.length - 1];
      const expected = PAIRS[c]!;

      if (!top || top.value !== expected) {
        r.push({
          line: 6,
          narration: top
            ? `'${c}' expected '${expected}' on top but found '${String(top.value)}' — mismatch!`
            : `'${c}' expected '${expected}' but stack is empty!`,
          snapshot: { items: [...items], inputCursor: i, inputTokens: tokens, invalid: true },
          variables: { char: c, expected, found: top ? String(top.value) : 'empty' },
        });
        r.push({
          line: 6,
          narration: `"${expression}" is NOT balanced`,
          snapshot: { items: [], inputCursor: i, inputTokens: tokens, invalid: true },
          variables: { result: false },
        });
        return r.build(false);
      }

      const matched = { open: String(top.value), close: c };
      items = items.slice(0, -1);
      r.push({
        line: 6,
        narration: `'${c}' matches '${String(top.value)}' — pop stack`,
        snapshot: { items: [...items], inputCursor: i + 1, inputTokens: tokens, matched },
        variables: { char: c, matched: `${String(top.value)}${c}`, stackSize: items.length },
      });
    }
  }

  const balanced = items.length === 0;
  r.push({
    line: 8,
    narration: balanced
      ? `Stack is empty — "${expression || '(empty)'}" is balanced ✓`
      : `Stack has ${items.length} unmatched bracket(s) — not balanced`,
    snapshot: { items: [...items], inputCursor: tokens.length, inputTokens: tokens },
    variables: { result: balanced, stackSize: items.length },
  });

  return r.build(balanced);
}
