import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Copy,
  ExternalLink,
  FileJson2,
  FolderOpen,
  Heart,
  ScanText,
  Trash2,
  Type,
  MoreHorizontal,
} from 'lucide-react';
import type { ClipboardItem } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/tooltip';

// ─── Actions per type ─────────────────────────────────────────────────────────

function actionsFor(item: ClipboardItem): Array<{
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  primary?: boolean;
}> {
  switch (item.type) {
    case 'json':
      return [
        { id: 'copy_again', label: 'Copy', icon: Copy, primary: true },
        { id: 'copy_plain', label: 'Copy as Plain Text', icon: Type },
      ];
    case 'url':
      return [
        { id: 'copy_again', label: 'Copy URL', icon: Copy, primary: true },
        { id: 'open_url', label: 'Open Link', icon: ExternalLink },
      ];
    case 'image':
      return [
        { id: 'copy_again', label: 'Copy Image', icon: Copy, primary: true },
      ];
    case 'file':
    case 'folder':
      return [
        { id: 'copy_again', label: 'Copy Path', icon: Copy, primary: true },
        { id: 'open_file', label: 'Open in Finder', icon: FolderOpen },
      ];
    default:
      return [
        { id: 'copy_again', label: 'Copy', icon: Copy, primary: true },
        { id: 'copy_plain', label: 'Copy as Plain Text', icon: Type },
        { id: 'uppercase', label: 'To Uppercase', icon: Type },
        { id: 'lowercase', label: 'To Lowercase', icon: Type },
      ];
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PreviewPaneProps {
  item: ClipboardItem | null;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (action: string) => void;
  privateMode: boolean;
}

// ─── Preview Pane ─────────────────────────────────────────────────────────────

export function PreviewPane({
  item,
  onToggleFavorite,
  onDelete,
  onAction,
  privateMode,
}: PreviewPaneProps) {
  const [metadataOpen, setMetadataOpen] = React.useState(false);

  // Reset metadata collapse when item changes
  React.useEffect(() => {
    setMetadataOpen(false);
  }, [item?.id]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        {item ? (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex h-full flex-col"
          >
            {/* ── Toolbar header ────────────────────────────────────────── */}
            <div className="flex h-12 shrink-0 items-center gap-2 border-b border-white/[0.07] px-4">
              {/* Type badge */}
              <span className="inline-flex items-center rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-mist/50">
                {item.type}
              </span>

              {/* Title */}
              <h2 className="flex-1 truncate text-[13px] font-medium text-mist/80">
                {item.title}
              </h2>

              {/* Primary action buttons */}
              <div className="flex items-center gap-1">
                {actionsFor(item)
                  .filter((a) => a.primary)
                  .map((action) => {
                    const Icon = action.icon;
                    return (
                      <Tooltip key={action.id} content={action.label} side="bottom">
                        <button
                          type="button"
                          onClick={() => onAction(action.id)}
                          aria-label={action.label}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-mint/15 text-mint transition-colors hover:bg-mint/25"
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    );
                  })}

                <Tooltip
                  content={item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  shortcut={['⌃P']}
                  side="bottom"
                >
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label={item.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    aria-pressed={item.favorite}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                      item.favorite
                        ? 'bg-amber/15 text-amber'
                        : 'text-mist/40 hover:bg-white/8 hover:text-mist/70'
                    )}
                  >
                    <Heart className={cn('h-3.5 w-3.5', item.favorite && 'fill-current')} />
                  </button>
                </Tooltip>

                <Tooltip content="Delete" shortcut={['Del']} side="bottom">
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    aria-label="Delete item"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-mist/40 transition-colors hover:bg-rose/10 hover:text-rose"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────── */}
            <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
              {/* Secondary actions row (non-primary) */}
              {actionsFor(item).filter((a) => !a.primary).length > 0 && (
                <div className="flex items-center gap-1 border-b border-white/[0.05] px-4 py-2">
                  <span className="mr-1 text-[10px] font-semibold uppercase tracking-widest text-mist/25">
                    Actions
                  </span>
                  {actionsFor(item)
                    .filter((a) => !a.primary)
                    .map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => onAction(action.id)}
                          className="flex items-center gap-1.5 rounded-md border border-white/[0.07] px-2.5 py-1 text-[12px] text-mist/60 transition-colors hover:border-white/15 hover:text-mist/80"
                        >
                          <Icon className="h-3 w-3" />
                          {action.label}
                        </button>
                      );
                    })}
                </div>
              )}

              {/* Main preview area */}
              <div className="flex-1 overflow-y-auto">
                {item.preview.kind === 'image' && item.storagePath ? (
                  <div className="flex items-center justify-center p-8">
                    <img
                      src={item.storagePath}
                      alt={item.title}
                      className={cn(
                        'max-h-[480px] max-w-full rounded-lg border border-white/10 object-contain shadow-lg',
                        privateMode && 'blur-xl'
                      )}
                    />
                  </div>
                ) : (
                  <div className="p-4">
                    <pre
                      className={cn(
                        'whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-mist/85',
                        privateMode && 'select-none blur-md'
                      )}
                    >
                      {item.preview.body || item.textContent || item.filePath}
                    </pre>
                  </div>
                )}

                {item.ocrText && (
                  <div className="mx-4 mb-4 rounded-lg border border-white/[0.07] bg-white/[0.02] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ScanText className="h-3.5 w-3.5 text-mint/60" />
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-mist/40">
                        OCR Text
                      </span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-mist/70 whitespace-pre-wrap">
                      {item.ocrText}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Metadata drawer ────────────────────────────────────── */}
              <div className="shrink-0 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setMetadataOpen((v) => !v)}
                  aria-expanded={metadataOpen}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-mist/35">
                    Metadata
                  </span>
                  {metadataOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-mist/30" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-mist/30" />
                  )}
                </button>

                <AnimatePresence>
                  {metadataOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className="overflow-hidden"
                    >
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 pb-4 pt-1">
                        <div>
                          <dt className="text-[10px] text-mist/35">Last Copied</dt>
                          <dd className="mt-0.5 text-[12px] text-mist/70">
                            {new Date(item.lastCopiedAt).toLocaleString()}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-mist/35">Source</dt>
                          <dd className="mt-0.5 text-[12px] text-mist/70">
                            {item.sourceApp || 'Unknown'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-mist/35">Times Copied</dt>
                          <dd className="mt-0.5 text-[12px] tabular-nums text-mist/70">
                            {item.copyCount}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[10px] text-mist/35">Format</dt>
                          <dd className="mt-0.5 flex items-center gap-1 text-[12px] text-mist/70">
                            <FileJson2 className="h-3 w-3" />
                            {item.preview.kind}
                          </dd>
                        </div>
                        {item.filePath && (
                          <div className="col-span-2">
                            <dt className="text-[10px] text-mist/35">Path</dt>
                            <dd className="mt-0.5 break-all font-mono text-[11px] text-mist/60">
                              {item.filePath}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col items-center justify-center gap-2 text-center"
          >
            <div className="mb-1 rounded-full border border-white/[0.07] p-4">
              <Copy className="h-6 w-6 text-mist/20" />
            </div>
            <p className="text-[13px] font-medium text-mist/40">Nothing selected</p>
            <p className="text-[12px] text-mist/25">
              Select an item from the list to preview
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
