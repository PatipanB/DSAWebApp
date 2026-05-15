interface Props {
  narration: string | undefined;
}

export function StepNarration({ narration }: Props) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="text-sm font-mono text-text-secondary border-l-2 border-accent-primary pl-3 min-h-[1.5rem]"
    >
      {narration ?? ''}
    </p>
  );
}
