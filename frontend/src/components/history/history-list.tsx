import { motion } from 'framer-motion';
import { Clock3, Heart, ImageIcon, Link2, TextCursorInput } from 'lucide-react';
import type { ClipboardItem } from '../../lib/types';

interface HistoryListProps {
  items: ClipboardItem[];
  selectedID: string;
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function iconFor(item: ClipboardItem) {
  switch (item.type) {
    case 'image':
      return ImageIcon;
    case 'url':
      return Link2;
    default:
      return TextCursorInput;
  }
}

export function HistoryList(props: HistoryListProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-white/15 bg-black/10 shadow-glass backdrop-blur-xl">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.28em] text-mist/40">History</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-2">
          {props.items.map((item, index) => {
            const Icon = iconFor(item);
            const active = item.id === props.selectedID;
            return (
              <motion.button
                key={item.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02, type: 'spring', stiffness: 180, damping: 20 }}
                onClick={() => props.onSelect(item.id)}
                className={`group w-full rounded-[24px] border px-4 py-4 text-left transition ${
                  active
                    ? 'border-mint/35 bg-white/14 shadow-lift'
                    : 'border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.07]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-2xl bg-white/[0.08] p-2 text-mist/70">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-medium text-mist">{item.title}</p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          props.onToggleFavorite(item.id);
                        }}
                        className={`rounded-full p-1.5 transition ${
                          item.favorite ? 'text-amber' : 'text-mist/30 hover:text-mist/70'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${item.favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-mist/55">{item.preview.summary || item.textContent}</p>
                    <div className="mt-3 flex items-center gap-3 text-xs text-mist/40">
                      <span className="rounded-full bg-white/[0.08] px-2 py-1 uppercase tracking-[0.2em]">
                        {item.type}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3.5 w-3.5" />
                        {new Date(item.lastCopiedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
