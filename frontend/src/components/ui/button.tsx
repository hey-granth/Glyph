import * as React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'default' | 'ghost' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mist/20 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-mist text-ink hover:bg-mist/90': variant === 'default',
            'bg-transparent text-mist hover:bg-white/10': variant === 'ghost',
            'bg-rose text-white hover:bg-rose/90': variant === 'destructive',
            'border border-white/10 bg-transparent hover:bg-white/5 text-mist': variant === 'outline',
            'bg-white/10 text-mist hover:bg-white/20': variant === 'secondary',
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-lg px-3 text-xs': size === 'sm',
            'h-10 rounded-2xl px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          className
        )}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children as React.ReactNode}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
