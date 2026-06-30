import { AnimatePresence, motion } from 'framer-motion';
import { Copy, ExternalLink, FileJson2, FolderOpen, Heart, ScanText, Trash2, Type } from 'lucide-react';
import type { ClipboardItem } from '../../lib/types';

function actionsFor(item: ClipboardItem): Array<{ id: string; label: string; icon: typeof Copy }> {
  switch (item.type) {
    case 'json':
      return [
        { id: 'copy_again', label: 'Copy Again', icon: Copy },
        { id: 'copy_plain', label: 'Copy as Plain Text', icon: Type },
      ];
    case 'url':
      return [
        { id: 'open_url', label: 'Open Link', icon: ExternalLink },
        { id: 'copy_again', label: 'Copy URL', icon: Copy },
      ];
    case 'image':
      return [{ id: 'copy_again', label: 'Copy Image Path', icon: Copy }];
    case 'file':
    case 'folder':
      return [{ id: 'open_file', label: 'Open', icon: FolderOpen }];
    default:
      return [
        { id: 'copy_again', label: 'Copy Again', icon: Copy },
        { id: 'uppercase', label: 'Uppercase', icon: Type },
        { id: 'lowercase', label: 'Lowercase', icon: Type },
      ];
  }
}

interface PreviewPaneProps {
  item: ClipboardItem | null;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onAction: (action: string) => void;
}

export function PreviewPane(props: PreviewPaneProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[32px] border border-white/15 bg-white/[0.08] shadow-glass backdrop-blur-2xl">
      <AnimatePresence mode="wait">
        {props.item ? (
          <motion.div
            key={props.item.id}
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 140, damping: 20 }}
            className="flex h-full flex-col"
          >
            <div className="border-b border-white/10 px-7 py-6">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-mist/40">{props.item.type}</p>
                  <h2 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-mist">
                    {props.item.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => props.onToggleFavorite(props.item!.id)}
                    className={`rounded-2xl px-4 py-3 text-sm transition ${
                      props.item.favorite ? 'bg-amber/15 text-amber' : 'bg-white/[0.06] text-mist/75 hover:bg-white/[0.12]'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Heart className={`h-4 w-4 ${props.item.favorite ? 'fill-current' : ''}`} />
                      Favorite
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => props.onDelete(props.item!.id)}
                    className="rounded-2xl bg-rose/15 px-4 py-3 text-sm text-rose transition hover:bg-rose/20"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-[minmax(0,1fr)_280px] gap-0">
              <div className="overflow-y-auto px-7 py-6">
                {props.item.preview.kind === 'image' && props.item.storagePath ? (
                  <img
                    src={props.item.storagePath}
                    alt={props.item.title}
                    className="max-h-[420px] rounded-[28px] border border-white/10 object-contain shadow-lift"
                  />
                ) : (
                  <div className="prose prose-invert prose-pre:rounded-[24px] prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/20 max-w-none">
                    <pre className="font-mono whitespace-pre-wrap break-words text-sm text-mist/90">
                      {props.item.preview.body || props.item.textContent || props.item.filePath}
                    </pre>
                  </div>
                )}

                {props.item.ocrText ? (
                  <div className="mt-6 rounded-[26px] border border-white/10 bg-black/15 p-5">
                    <p className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-mint/70">
                      <ScanText className="h-4 w-4" />
                      OCR Text
                    </p>
                    <p className="text-sm leading-7 text-mist/70">{props.item.ocrText}</p>
                  </div>
                ) : null}
              </div>

              <div className="border-l border-white/10 bg-black/10 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-mist/40">Quick Actions</p>
                <div className="mt-4 space-y-2">
                  {actionsFor(props.item).map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => props.onAction(action.id)}
                        className="flex w-full items-center gap-3 rounded-[22px] bg-white/[0.06] px-4 py-3 text-left text-sm text-mist transition hover:bg-white/[0.12]"
                      >
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-mist/40">Metadata</p>
                  <div className="mt-4 space-y-3 text-sm text-mist/70">
                    <div>
                      <p className="text-mist/40">Copied</p>
                      <p>{new Date(props.item.lastCopiedAt).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-mist/40">Source</p>
                      <p>{props.item.sourceApp || 'Unknown app'}</p>
                    </div>
                    <div>
                      <p className="text-mist/40">Copy count</p>
                      <p>{props.item.copyCount}</p>
                    </div>
                    <div>
                      <p className="text-mist/40">Preview</p>
                      <p className="inline-flex items-center gap-2">
                        <FileJson2 className="h-4 w-4" />
                        {props.item.preview.kind}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full items-center justify-center px-10 text-center"
          >
            <div>
              <p className="font-display text-4xl text-mist">Clipboard, remembered.</p>
              <p className="mt-3 text-sm text-mist/55">
                Copy something new or refine your search to reveal a saved item.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
