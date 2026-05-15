import { cn } from '@/utils/classNames';

interface Option<T extends string> { value: T; label: string }

export function Tabs<T extends string>({
  value, onChange, options,
}: { value: T; onChange: (v: T) => void; options: Option<T>[] }) {
  return (
    <div role="tablist" className="inline-flex gap-1 p-1 bg-bg-elevated rounded-lg border border-border-subtle">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'px-3 h-8 text-sm rounded-md transition',
              active ? 'bg-accent-primary text-bg-base font-medium' : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
