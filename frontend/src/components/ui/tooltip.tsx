import * as React from 'react';
import { createPortal } from 'react-dom';
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
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLSpanElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    // We center the tooltip horizontally relative to the trigger.
    let left = rect.left + rect.width / 2;
    let top = rect.bottom; // default bottom

    if (side === 'top') {
      top = rect.top;
    } else if (side === 'left') {
      left = rect.left;
      top = rect.top + rect.height / 2;
    } else if (side === 'right') {
      left = rect.right;
      top = rect.top + rect.height / 2;
    }

    setCoords({ top, left });
  };

  const handleEnter = () => {
    updatePosition();
    setVisible(true);
  };

  const sideClasses = {
    top: 'mb-2 -translate-x-1/2 -translate-y-full',
    bottom: 'mt-2 -translate-x-1/2',
    left: 'mr-2 -translate-x-full -translate-y-1/2',
    right: 'ml-2 -translate-y-1/2',
  };

  return (
    <>
      <span
        ref={triggerRef}
        className="relative inline-flex"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setVisible(false)}
        onFocus={handleEnter}
        onBlur={() => setVisible(false)}
      >
        {children}
      </span>
      {createPortal(
        <AnimatePresence>
          {visible && (
            <motion.span
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.1 }}
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
              }}
              className={cn(
                'pointer-events-none z-[100] flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-[#1e1e1e] px-2.5 py-1.5 text-xs text-mist/80 shadow-xl',
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
