import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
  shortcut?: string[];
}

export function Tooltip({
  content,
  children,
  side = 'bottom',
  shortcut,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  const sideClasses = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    left: 'right-full top-1/2 mr-2 -translate-y-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'pointer-events-none absolute z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1e1e1e] px-2.5 py-1.5 text-xs text-mist/80 shadow-xl',
              sideClasses[side]
            )}
          >
            {content}
            {shortcut && shortcut.length > 0 && (
              <span className="flex items-center gap-0.5">
                {shortcut.map((k, i) => (
                  <kbd
                    key={i}
                    className="rounded bg-white/10 px-1 py-0.5 font-sans text-[10px] text-mist/50"
                  >
                    {k}
                  </kbd>
                ))}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
