import * as React from 'react';
import { cn } from '../../lib/utils';

interface ShortcutBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  keys: string[];
}

export function ShortcutBadge({ keys, className, ...props }: ShortcutBadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} {...props}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded bg-white/10 px-1 text-[10px] font-medium uppercase text-mist/70 shadow-sm border border-white/10">
            {k}
          </kbd>
          {i < keys.length - 1 && <span className="text-xs text-mist/30">+</span>}
        </React.Fragment>
      ))}
    </span>
  );
}
