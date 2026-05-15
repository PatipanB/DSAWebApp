import type { AlgorithmRun } from '@/engine/types';

export function serializeRun(run: AlgorithmRun<unknown>): string {
  const lines: string[] = [
    `algorithmId: ${run.algorithmId}`,
    `steps: ${run.steps.length}`,
    `finalResult: ${JSON.stringify(run.finalResult ?? null)}`,
    '',
  ];
  for (let i = 0; i < run.steps.length; i++) {
    const s = run.steps[i];
    if (!s) continue;
    lines.push(`step ${i}: line=${s.line} narration="${s.narration}"`);
    if (s.variables) {
      const vars = Object.entries(s.variables)
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(', ');
      lines.push(`  vars: ${vars}`);
    }
    // Serialize snapshot keys that are arrays/scalars for diffing
    const snap = s.snapshot as Record<string, unknown>;
    for (const [k, v] of Object.entries(snap)) {
      if (Array.isArray(v)) {
        lines.push(`  ${k}: [${(v as unknown[]).join(',')}]`);
      } else if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') {
        lines.push(`  ${k}: ${v}`);
      } else if (v !== null && typeof v === 'object') {
        lines.push(`  ${k}: ${JSON.stringify(v)}`);
      }
    }
  }
  return lines.join('\n');
}
