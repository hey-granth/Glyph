import { Archive, ImageIcon, Link2, ScanSearch, Settings2, Sparkles, Tag } from 'lucide-react';
import type { ClipboardItemType, Collection, Tag as ItemTag } from '../../lib/types';

const typeFilters: Array<{ label: string; type: ClipboardItemType; icon: typeof Archive }> = [
  { label: 'Text', type: 'text', icon: Archive },
  { label: 'Markdown', type: 'markdown', icon: Sparkles },
  { label: 'JSON', type: 'json', icon: ScanSearch },
  { label: 'Links', type: 'url', icon: Link2 },
  { label: 'Images', type: 'image', icon: ImageIcon },
];

interface SidebarProps {
  activeTypes: ClipboardItemType[];
  setActiveTypes: (types: ClipboardItemType[]) => void;
  tags: ItemTag[];
  collections: Collection[];
  onOpenSettings: () => void;
}

export function Sidebar(props: SidebarProps) {
  const toggleType = (type: ClipboardItemType) => {
    if (props.activeTypes.includes(type)) {
      props.setActiveTypes(props.activeTypes.filter((entry) => entry !== type));
      return;
    }
    props.setActiveTypes([...props.activeTypes, type]);
  };

  return (
    <aside className="flex h-full w-[270px] shrink-0 flex-col rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-glass backdrop-blur-2xl">
      <div className="mb-8">
        <p className="font-display text-3xl text-mist">Glyph</p>
        <p className="mt-2 text-sm text-mist/65">
          Local clipboard memory with instant search, OCR, and quiet privacy controls.
        </p>
      </div>

      <div className="space-y-2">
        <p className="px-1 text-xs uppercase tracking-[0.28em] text-mist/40">Types</p>
        {typeFilters.map(({ label, type, icon: Icon }) => {
          const active = props.activeTypes.includes(type);
          return (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition ${
                active
                  ? 'bg-mint/20 text-mist shadow-lift'
                  : 'bg-white/[0.03] text-mist/65 hover:bg-white/[0.08] hover:text-mist'
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 space-y-2">
        <p className="px-1 text-xs uppercase tracking-[0.28em] text-mist/40">Collections</p>
        {props.collections.length ? (
          props.collections.map((collection) => (
            <div key={collection.id} className="rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-mist/75">
              {collection.name}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 px-4 py-3 text-sm text-mist/45">
            No collections yet
          </div>
        )}
      </div>

      <div className="mt-8 space-y-2">
        <p className="px-1 text-xs uppercase tracking-[0.28em] text-mist/40">Tags</p>
        <div className="flex flex-wrap gap-2">
          {props.tags.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] px-3 py-1 text-xs text-mist/80">
              <Tag className="h-3.5 w-3.5" />
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={props.onOpenSettings}
        className="mt-auto flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-mist transition hover:bg-white/[0.12]"
      >
        <Settings2 className="h-4 w-4" />
        Settings
      </button>
    </aside>
  );
}
