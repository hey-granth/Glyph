import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Search,
  Settings2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ScanText,
  EyeOff,
  Eye,
  Keyboard,
  ClipboardList,
} from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useCommandRegistry } from '../../lib/command-registry';
import type { Command } from '../../lib/command-registry';
import { cn } from '../../lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onOpenShortcuts: () => void;
}

export function CommandPalette({ open, onClose, onOpenShortcuts }: CommandPaletteProps) {
  const workspace = useWorkspace();
  const [query, setQuery] = React.useState('');
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ─── Commands ─────────────────────────────────────────────────────────────

  const baseCommands = useCommandRegistry(workspace, onOpenShortcuts);
  
  // Wrap actions to also close the palette
  const commands = React.useMemo(() => {
    return baseCommands.map(cmd => ({
      ...cmd,
      action: () => {
        cmd.action();
        onClose();
      }
    }));
  }, [baseCommands, onClose]);

  // ─── Filtered commands ────────────────────────────────────────────────────

  const filtered = React.useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // ─── Keyboard navigation ──────────────────────────────────────────────────

  React.useEffect(() => {
    if (!open) return;
    // Reset on open
    setQuery('');
    setFocusedIndex(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  React.useEffect(() => {
    setFocusedIndex(0);
  }, [filtered.length]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[focusedIndex];
        if (cmd) cmd.action();
      }
    },
    [filtered, focusedIndex]
  );

  // ─── Group commands by category ───────────────────────────────────────────

  const grouped = React.useMemo(() => {
    const groups: Record<string, Command[]> = {};
    filtered.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filtered]);

  let flatIndex = -1;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="cp-panel"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed left-1/2 top-[20%] z-[65] w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-mist/40" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command…"
                className="flex-1 bg-transparent text-sm text-mist outline-none placeholder:text-mist/35"
                aria-label="Command search"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
              />
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-mist/40">
                esc
              </kbd>
            </div>

            {/* Command list */}
            <div
              id="command-list"
              role="listbox"
              className="max-h-[380px] overflow-y-auto py-2"
            >
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-sm text-mist/40">
                  No commands found for "{query}"
                </div>
              ) : (
                Object.entries(grouped).map(([category, cmds]) => (
                  <div key={category}>
                    <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-mist/30">
                      {category}
                    </div>
                    {cmds.map((cmd) => {
                      flatIndex++;
                      const isActive = flatIndex === focusedIndex;
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.id}
                          role="option"
                          aria-selected={isActive}
                          onClick={cmd.action}
                          onMouseEnter={() => setFocusedIndex(flatIndex)}
                          className={cn(
                            'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                            isActive ? 'bg-white/8 text-mist' : 'text-mist/70'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                              isActive ? 'bg-mint/20 text-mint' : 'bg-white/5 text-mist/50'
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{cmd.label}</div>
                            {cmd.description && (
                              <div className="truncate text-xs text-mist/40">{cmd.description}</div>
                            )}
                          </div>
                          {cmd.shortcut && (
                            <div className="flex items-center gap-0.5">
                              {cmd.shortcut.map((k: string, i: number) => (
                                <kbd
                                  key={i}
                                  className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-mist/40"
                                >
                                  {k}
                                </kbd>
                              ))}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2">
              <span className="text-xs text-mist/30">{filtered.length} commands</span>
              <div className="flex items-center gap-3 text-xs text-mist/30">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">↑↓</kbd> navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-white/10 px-1 py-0.5 text-[10px]">↵</kbd> execute
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
