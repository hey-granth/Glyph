import { Archive, ImageIcon, Link2, ScanSearch, Settings2, Sparkles, Layers, Braces } from 'lucide-react';
import type { ClipboardItemType } from '../../lib/types';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { cn } from '../../lib/utils';
import { Tooltip } from '../ui/tooltip';
import { ShortcutBadge } from '../ui/shortcut-badge';

// ─── Filter Definitions ───────────────────────────────────────────────────────

interface FilterDef {
  label: string;
  type: ClipboardItemType | 'all';
  icon: React.ComponentType<{ className?: string }>;
  shortcut: string;
}

const FILTERS: FilterDef[] = [
  { label: 'All', type: 'all', icon: Layers, shortcut: '⌃1' },
  { label: 'Text', type: 'text', icon: Archive, shortcut: '⌃2' },
  { label: 'Markdown', type: 'markdown', icon: Sparkles, shortcut: '⌃3' },
  { label: 'JSON', type: 'json', icon: Braces, shortcut: '⌃4' },
  { label: 'Links', type: 'url', icon: Link2, shortcut: '⌃5' },
  { label: 'Images', type: 'image', icon: ImageIcon, shortcut: '⌃6' },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { activeTypes, setActiveTypes, setSettingsOpen } = useWorkspace();

  const handleSelect = (type: ClipboardItemType | 'all') => {
    if (type === 'all') {
      setActiveTypes([]);
    } else {
      setActiveTypes([type]);
    }
  };

  return (
    <aside
      className="flex h-full w-[180px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d0d]"
      aria-label="Navigation"
      role="navigation"
    >
      {/* App identity */}
      <div className="flex h-12 items-center px-4">
        <span className="text-[13px] font-semibold tracking-tight text-mist/90">
          Glyph
        </span>
      </div>

      <div className="mx-3 mb-2 h-px bg-white/[0.06]" />

      {/* Type filters */}
      <div className="flex flex-1 flex-col gap-0.5 px-2 pt-1">
        <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-mist/30">
          Filter
        </p>
        {FILTERS.map(({ label, type, icon: Icon, shortcut }) => {
          const active = type === 'all' ? activeTypes.length === 0 : activeTypes.includes(type);
          return (
            <Tooltip
              key={type}
              content={label}
              shortcut={[shortcut]}
              side="right"
            >
              <button
                type="button"
                onClick={() => handleSelect(type)}
                aria-pressed={active}
                aria-label={`Filter: ${label}`}
                className={cn(
                  'relative flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] font-medium transition-colors',
                  active
                    ? 'text-mist'
                    : 'text-mist/50 hover:bg-white/5 hover:text-mist/80'
                )}
              >
                {/* Active left-bar indicator */}
                {active && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-mint" />
                )}
                <Icon
                  className={cn(
                    'h-[15px] w-[15px] shrink-0 transition-colors',
                    active ? 'text-mint' : 'text-mist/40'
                  )}
                />
                {label}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {/* Settings */}
      <div className="mx-3 mb-2 mt-2 h-px bg-white/[0.06]" />
      <div className="px-2 pb-3">
        <Tooltip content="Settings" shortcut={['⌃', ',']} side="right">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Open Settings"
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-[13px] font-medium text-mist/50 transition-colors hover:bg-white/5 hover:text-mist/80"
          >
            <Settings2 className="h-[15px] w-[15px] shrink-0 text-mist/40" />
            Settings
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
