import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, onCheckedChange, className, disabled, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        ref={ref}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist/20 disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-mint' : 'bg-white/15',
          className
        )}
        {...(props as any)}
      >
        <motion.span
          layout
          className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform"
          initial={false}
          animate={{
            x: checked ? 20 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        />
      </button>
    );
  }
);
Switch.displayName = 'Switch';
