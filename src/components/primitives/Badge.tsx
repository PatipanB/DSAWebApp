import { cn } from '@/utils/classNames';
import type { ReactNode } from 'react';

type Tone = 'info' | 'success' | 'warn' | 'danger' | 'neutral';
const toneClass: Record<Tone, string> = {
  info:    'bg-status-info/15  text-status-info  border-status-info/30',
  success: 'bg-status-success/15 text-status-success border-status-success/30',
  warn:    'bg-status-warn/15 text-status-warn border-status-warn/30',
  danger:  'bg-status-danger/15 text-status-danger border-status-danger/30',
  neutral: 'bg-bg-elevated text-text-secondary border-border-strong',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-mono rounded-md border', toneClass[tone])}>
      {children}
    </span>
  );
}
