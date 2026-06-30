import { Command, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { HistoryList } from './components/history/history-list';
import { Sidebar } from './components/layout/sidebar';
import { PreviewPane } from './components/preview/preview-pane';
import { SettingsSheet } from './components/settings/settings-sheet';
import { useWorkspace } from './hooks/use-workspace';

export default function App() {
  const workspace = useWorkspace();

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(159,216,191,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(202,161,103,0.18),_transparent_22%),linear-gradient(135deg,_#081011_0%,_#11191b_55%,_#0a1011_100%)] text-mist">
      <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="relative flex h-screen gap-4 p-4">
        <Sidebar
          activeTypes={workspace.activeTypes}
          setActiveTypes={workspace.setActiveTypes}
          tags={workspace.boot.tags}
          collections={workspace.boot.collections}
          onOpenSettings={() => workspace.setSettingsOpen(true)}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            className="rounded-[30px] border border-white/15 bg-white/[0.08] px-6 py-5 shadow-glass backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between gap-5">
              <div className="flex min-w-0 flex-1 items-center gap-4 rounded-[24px] border border-white/10 bg-black/15 px-5 py-4">
                <Search className="h-5 w-5 text-mint/70" />
                <input
                  id="glyph-search"
                  value={workspace.query}
                  onChange={(event) => workspace.setQuery(event.target.value)}
                  placeholder="Search everything you copied"
                  className="w-full bg-transparent text-lg text-mist outline-none placeholder:text-mist/35"
                  autoFocus
                />
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-xs uppercase tracking-[0.24em] text-mist/50">
                  <Command className="h-3.5 w-3.5" />
                  {workspace.boot.settings.globalShortcut}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => workspace.setSettingsOpen(true)}
                  className="rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-mist/75 transition hover:bg-white/[0.12]"
                >
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Settings
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void workspace.clearHistory()}
                  className="rounded-2xl bg-rose/15 px-4 py-3 text-sm text-rose transition hover:bg-rose/20"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          <div className="grid min-h-0 flex-1 grid-cols-[420px_minmax(0,1fr)] gap-4">
            <HistoryList
              items={workspace.items}
              selectedID={workspace.selectedID}
              onSelect={workspace.setSelectedID}
              onToggleFavorite={(id) => void workspace.toggleFavorite(id)}
            />
            <PreviewPane
              item={workspace.selectedItem}
              onToggleFavorite={(id) => void workspace.toggleFavorite(id)}
              onDelete={(id) => void workspace.deleteItem(id)}
              onAction={(action) => void workspace.executeAction(action)}
            />
          </div>
        </main>
      </div>

      <SettingsSheet
        open={workspace.settingsOpen}
        settings={workspace.boot.settings}
        onClose={() => workspace.setSettingsOpen(false)}
        onSave={workspace.updateSettings}
      />

      {workspace.loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-ink/70 backdrop-blur-sm">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-mist/70">
            Preparing your clipboard workspace…
          </div>
        </div>
      ) : null}
    </div>
  );
}
