import * as React from 'react';
import { cn } from '../../lib/utils';
import { Minus, Plus } from 'lucide-react';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, step = 1, className, disabled }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center space-x-2', className)}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled || value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-mist hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="min-w-[3ch] text-center text-sm font-medium tabular-nums text-mist">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled || value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-mist hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-white/5"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Stepper.displayName = 'Stepper';
