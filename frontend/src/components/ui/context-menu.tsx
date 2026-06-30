import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string[];
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  separator?: false;
}

export interface ContextMenuSeparator {
  separator: true;
  id: string;
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

interface ContextMenuProps {
  items: ContextMenuEntry[];
  position: { x: number; y: number } | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export function ContextMenu({ items, position, onSelect, onClose }: ContextMenuProps) {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const actionItems = items.filter((i): i is ContextMenuItem => !i.separator);

  // Close on outside click or Escape
  React.useEffect(() => {
    if (!position) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((idx) => Math.min(idx + 1, actionItems.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((idx) => Math.max(idx - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = actionItems[focusedIndex];
        if (item) {
          onSelect(item.id);
          onClose();
        }
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('mousedown', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('mousedown', handleClick);
    };
  }, [position, onClose, onSelect, actionItems, focusedIndex]);

  // Constrain position to viewport
  const style = React.useMemo(() => {
    if (!position) return {};
    const menuW = 220;
    const menuH = items.length * 36;
    const x = Math.min(position.x, window.innerWidth - menuW - 8);
    const y = Math.min(position.y, window.innerHeight - menuH - 8);
    return { left: x, top: y };
  }, [position, items.length]);

  let actionIndex = -1;

  return (
    <AnimatePresence>
      {position && (
        <motion.div
          ref={menuRef}
          role="menu"
          aria-label="Item actions"
          initial={{ opacity: 0, scale: 0.96, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -4 }}
          transition={{ duration: 0.1 }}
          style={style}
          className="fixed z-[70] min-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-2xl backdrop-blur-xl"
        >
          {items.map((entry) => {
            if ('separator' in entry && entry.separator) {
              return (
                <div key={entry.id} className="my-1 h-px bg-white/10" role="separator" />
              );
            }
            const item = entry as ContextMenuItem;
            actionIndex++;
            const isFocused = actionIndex === focusedIndex;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => {
                  onSelect(item.id);
                  onClose();
                }}
                onMouseEnter={() => setFocusedIndex(actionIndex)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  isFocused
                    ? item.variant === 'destructive'
                      ? 'bg-rose/15 text-rose'
                      : 'bg-white/10 text-mist'
                    : item.variant === 'destructive'
                      ? 'text-rose/80'
                      : 'text-mist/80',
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0 opacity-70" />}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="flex items-center gap-0.5 text-[10px] text-mist/40">
                    {item.shortcut.map((k, i) => (
                      <kbd
                        key={i}
                        className="rounded bg-white/10 px-1 py-0.5 font-sans text-[10px] text-mist/50"
                      >
                        {k}
                      </kbd>
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
