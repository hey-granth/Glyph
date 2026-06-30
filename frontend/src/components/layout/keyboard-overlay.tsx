import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { ShortcutBadge } from '../ui/shortcut-badge';

interface ShortcutOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS_BY_CATEGORY = [
  {
    category: 'Navigation',
    shortcuts: [
      { action: 'Open Glyph', keys: ['Ctrl', 'Shift', 'Space'] },
      { action: 'Close overlay / Clear search', keys: ['Esc'] },
      { action: 'Navigate up', keys: ['↑'] },
      { action: 'Navigate down', keys: ['↓'] },
      { action: 'Focus search', keys: ['Ctrl', 'F'] },
      { action: 'Focus list', keys: ['Ctrl', 'L'] },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { action: 'Copy selected', keys: ['↵'] },
      { action: 'Copy again', keys: ['Ctrl', 'C'] },
      { action: 'Copy as plain text', keys: ['Ctrl', 'Shift', 'C'] },
      { action: 'Pin / Favorite', keys: ['Ctrl', 'P'] },
      { action: 'Delete selected', keys: ['Del'] },
    ],
  },
  {
    category: 'Filters',
    shortcuts: [
      { action: 'All items', keys: ['Ctrl', '1'] },
      { action: 'Text', keys: ['Ctrl', '2'] },
      { action: 'Markdown', keys: ['Ctrl', '3'] },
      { action: 'JSON', keys: ['Ctrl', '4'] },
      { action: 'Links', keys: ['Ctrl', '5'] },
      { action: 'Images', keys: ['Ctrl', '6'] },
    ],
  },
  {
    category: 'Application',
    shortcuts: [
      { action: 'Settings', keys: ['Ctrl', ','] },
      { action: 'Command palette', keys: ['Ctrl', 'K'] },
      { action: 'Keyboard shortcuts', keys: ['?'] },
    ],
  },
];

export function KeyboardShortcutsOverlay({ open, onClose }: ShortcutOverlayProps) {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return SHORTCUTS_BY_CATEGORY;
    const q = query.toLowerCase();
    return SHORTCUTS_BY_CATEGORY
      .map((group) => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          (s) => s.action.toLowerCase().includes(q) || s.keys.some((k) => k.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.shortcuts.length > 0);
  }, [query]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Escape closes
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="ks-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="ks-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Keyboard Shortcuts"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ type: 'spring', damping: 28, stiffness: 360 }}
            className="fixed left-1/2 top-[15%] z-[58] flex max-h-[70vh] w-full max-w-[520px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#141414] shadow-2xl"
          >
            {/* Search header */}
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-mist/35" />
              <input
                ref={inputRef}
                id="shortcut-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search shortcuts…"
                className="flex-1 bg-transparent text-[13px] text-mist outline-none placeholder:text-mist/35"
                aria-label="Search keyboard shortcuts"
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-6 w-6 items-center justify-center rounded-md text-mist/40 hover:bg-white/8 hover:text-mist/70 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Shortcut list */}
            <div className="flex-1 overflow-y-auto p-3">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-[13px] text-mist/40">
                  No shortcuts found for "{query}"
                </div>
              ) : (
                <div className="space-y-4">
                  {filtered.map((group) => (
                    <div key={group.category}>
                      <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-mist/30">
                        {group.category}
                      </p>
                      <div className="divide-y divide-white/[0.05] rounded-lg border border-white/[0.07] bg-white/[0.02]">
                        {group.shortcuts.map((shortcut, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between px-3 py-2"
                          >
                            <span className="text-[13px] text-mist/75">{shortcut.action}</span>
                            <ShortcutBadge keys={shortcut.keys} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
