import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface DropdownProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Dropdown = React.forwardRef<HTMLSelectElement, DropdownProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'h-9 w-full appearance-none rounded-xl border border-white/10 bg-white/5 pl-3 pr-10 text-sm text-mist shadow-sm transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist/20 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/50" />
      </div>
    );
  }
);
Dropdown.displayName = 'Dropdown';
