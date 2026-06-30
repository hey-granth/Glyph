import * as React from 'react';
import {
  Archive,
  Braces,
  Heart,
  ImageIcon,
  Link2,
  MoreHorizontal,
  Pin,
  ScanSearch,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { ClipboardItem, ClipboardItemType } from '../../lib/types';
import { cn } from '../../lib/utils';
import { ContextMenu } from '../ui/context-menu';
import type { ContextMenuEntry } from '../ui/context-menu';
import { useWorkspace } from '../../contexts/WorkspaceContext';

// ─── Type icon map ────────────────────────────────────────────────────────────

function typeIcon(type: ClipboardItemType): React.ComponentType<{ className?: string }> {
  switch (type) {
    case 'image': return ImageIcon;
    case 'url': return Link2;
    case 'markdown': return Sparkles;
    case 'json': return Braces;
    case 'code': return ScanSearch;
    default: return Archive;
  }
}

// ─── Type badge colour ────────────────────────────────────────────────────────

function typeBadgeClass(type: ClipboardItemType): string {
  switch (type) {
    case 'image': return 'text-amber/70 bg-amber/10';
    case 'url': return 'text-mint/70 bg-mint/10';
    case 'markdown': return 'text-rose/70 bg-rose/10';
    case 'json': return 'text-mint/70 bg-mint/10';
    default: return 'text-mist/40 bg-white/5';
  }
}

// ─── Time formatter ───────────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diff = now - date.getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ─── History Row ──────────────────────────────────────────────────────────────

interface HistoryRowProps {
  item: ClipboardItem;
  selected: boolean;
  onSelect: () => void;
  onContextAction: (id: string, action: string) => void;
  privateMode: boolean;
}

function HistoryRow({ item, selected, onSelect, onContextAction, privateMode }: HistoryRowProps) {
  const [contextPos, setContextPos] = React.useState<{ x: number; y: number } | null>(null);
  const Icon = typeIcon(item.type);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Right-click selects first (standard desktop behaviour)
    onSelect();
    setContextPos({ x: e.clientX, y: e.clientY });
  };

  const contextItems: ContextMenuEntry[] = [
    {
      id: 'copy',
      label: 'Copy',
      shortcut: ['⌃C'],
      icon: Archive,
    },
    {
      id: 'copy_plain',
      label: 'Copy as Plain Text',
      shortcut: ['⌃⇧C'],
      icon: Archive,
    },
    { id: 'sep1', separator: true },
    {
      id: 'toggle_favorite',
      label: item.favorite ? 'Remove from Favorites' : 'Add to Favorites',
      shortcut: ['⌃P'],
      icon: Heart,
    },
    { id: 'sep2', separator: true },
    {
      id: 'delete',
      label: 'Delete',
      shortcut: ['Del'],
      icon: Trash2,
      variant: 'destructive',
    },
  ];

  const handleContextSelect = (actionId: string) => {
    onContextAction(item.id, actionId);
    setContextPos(null);
  };

  const preview = privateMode
    ? '•••••••••••••••••'
    : (item.preview.summary || item.textContent || item.filePath);

  return (
    <>
      <button
        id={`history-item-${item.id}`}
        data-selected={selected}
        type="button"
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        aria-selected={selected}
        role="option"
        className={cn(
          'relative flex w-full items-start gap-2.5 border-b border-white/[0.04] px-3 py-2.5 text-left transition-colors duration-100',
          selected
            ? 'bg-white/[0.07]'
            : 'hover:bg-white/[0.04]'
        )}
      >
        {/* Left selection accent */}
        {selected && (
          <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-mint" />
        )}

        {/* Icon */}
        <div
          className={cn(
            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded',
            selected ? 'text-mint' : 'text-mist/40'
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                'flex-1 truncate text-[13px] font-medium leading-snug',
                selected ? 'text-mist' : 'text-mist/80'
              )}
            >
              {item.title || item.type}
            </p>
            {item.favorite && (
              <Pin className="h-3 w-3 shrink-0 text-amber/70" />
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-snug text-mist/40">
            {preview}
          </p>
        </div>

        {/* Time */}
        <span className="shrink-0 text-[10px] text-mist/30">
          {formatRelative(item.lastCopiedAt)}
        </span>
      </button>

      <ContextMenu
        items={contextItems}
        position={contextPos}
        onSelect={handleContextSelect}
        onClose={() => setContextPos(null)}
      />
    </>
  );
}

// ─── History List ─────────────────────────────────────────────────────────────

interface HistoryListProps {
  items: ClipboardItem[];
  selectedID: string;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  privateMode: boolean;
}

export function HistoryList({
  items,
  selectedID,
  onSelect,
  onToggleFavorite,
  onDeleteItem,
  privateMode,
}: HistoryListProps) {
  const { executeAction, showToast } = useWorkspace();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Scroll selected item into view on keyboard navigation
  React.useEffect(() => {
    const el = document.getElementById(`history-item-${selectedID}`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedID]);

  const handleContextAction = async (itemId: string, action: string) => {
    // We need to select the item first
    onSelect(itemId);

    switch (action) {
      case 'copy':
        await executeAction('copy_again');
        break;
      case 'copy_plain':
        await executeAction('copy_plain');
        break;
      case 'toggle_favorite':
        onToggleFavorite(itemId);
        break;
      case 'delete':
        onDeleteItem(itemId);
        break;
    }
  };

  return (
    <div
      id="history-list-container"
      role="listbox"
      aria-label="Clipboard history"
      tabIndex={-1}
      className="flex h-full flex-col overflow-hidden outline-none focus-visible:ring-inset focus-visible:ring-1 focus-visible:ring-mint/30"
    >
      {/* Header */}
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/[0.07] px-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-mist/30">
          History
        </span>
        <span className="text-[11px] tabular-nums text-mist/30">
          {items.length > 0 ? `${items.length} item${items.length === 1 ? '' : 's'}` : ''}
        </span>
      </div>

      {/* Items */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
            <Archive className="h-8 w-8 text-mist/15" />
            <p className="text-[13px] text-mist/35">No items found</p>
            <p className="text-xs text-mist/25">
              Copy something to see it here
            </p>
          </div>
        ) : (
          <div role="presentation">
            {items.map((item) => (
              <HistoryRow
                key={item.id}
                item={item}
                selected={item.id === selectedID}
                onSelect={() => onSelect(item.id)}
                onContextAction={handleContextAction}
                privateMode={privateMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
