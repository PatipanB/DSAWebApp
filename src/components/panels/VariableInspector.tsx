interface Props {
  variables: Record<string, unknown> | undefined;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

export function VariableInspector({ variables }: Props) {
  if (!variables || Object.keys(variables).length === 0) return null;

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface p-3">
      <p className="text-xs font-mono text-text-muted mb-2 uppercase tracking-widest">Variables</p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(variables).map(([k, v]) => (
          <div
            key={k}
            className="flex items-center gap-1.5 bg-bg-elevated border border-border-subtle rounded-md px-2 py-1"
          >
            <span className="text-xs font-mono text-text-muted">{k}</span>
            <span className="text-xs font-mono font-bold text-accent-primary">
              {formatValue(v)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
