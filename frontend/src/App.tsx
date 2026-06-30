import * as React from 'react';
import { Search } from 'lucide-react';
import { HistoryList } from './components/history/history-list';
import { Sidebar } from './components/layout/sidebar';
import { PreviewPane } from './components/preview/preview-pane';
import { SettingsSheet } from './components/settings/settings-sheet';
import { KeyboardShortcutsOverlay } from './components/layout/keyboard-overlay';
import { CommandPalette } from './components/command-palette/command-palette';
import { ToastStack } from './components/ui/toast';
import { ConfirmDialog } from './components/ui/confirm-dialog';
import { useWorkspace } from './contexts/WorkspaceContext';
import { useKeyboardShortcuts } from './hooks/use-keyboard-shortcuts';
import { ShortcutBadge } from './components/ui/shortcut-badge';

export default function App() {
  const workspace = useWorkspace();
  const [shortcutsOpen, setShortcutsOpen] = React.useState(false);

  useKeyboardShortcuts(setShortcutsOpen);

  const privateMode = workspace.boot.settings.privateMode;
  const pauseHistory = workspace.boot.settings.pauseHistory;

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-[#0d0d0d] text-mist antialiased"
      style={{ fontFamily: '"Inter", "Avenir Next", "Segoe UI", sans-serif' }}
    >
      {/* ── Search toolbar (48px) ───────────────────────────────────────── */}
      <header
        className="flex h-12 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#0a0a0a] px-4"
        role="banner"
      >
        <Search className="h-4 w-4 shrink-0 text-mist/35" aria-hidden="true" />
        <input
          id="glyph-search"
          type="search"
          value={workspace.query}
          onChange={(e) => workspace.setQuery(e.target.value)}
          placeholder="Search clipboard history…"
          aria-label="Search clipboard history"
          aria-autocomplete="list"
          aria-controls="history-list-container"
          className="h-full flex-1 bg-transparent text-[14px] text-mist outline-none placeholder:text-mist/30"
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />

        {/* Status indicators */}
        <div className="flex items-center gap-2">
          {pauseHistory && (
            <span className="flex items-center gap-1.5 rounded-full bg-amber/10 px-2 py-0.5 text-[11px] font-medium text-amber/80">
              <span className="h-1.5 w-1.5 rounded-full bg-amber/80" />
              Paused
            </span>
          )}
          {privateMode && (
            <span className="flex items-center gap-1.5 rounded-full bg-rose/10 px-2 py-0.5 text-[11px] font-medium text-rose/80">
              <span className="h-1.5 w-1.5 rounded-full bg-rose/80" />
              Private
            </span>
          )}
        </div>

        {/* Shortcut hint */}
        <ShortcutBadge keys={['Ctrl', 'K']} />
      </header>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Sidebar: 180px */}
        <Sidebar />

        {/* History list: ~30% */}
        <div
          className="flex shrink-0 flex-col border-r border-white/[0.07] bg-[#0d0d0d]"
          style={{ width: 'clamp(220px, 28%, 340px)' }}
        >
          <HistoryList
            items={workspace.items}
            selectedID={workspace.selectedID}
            onSelect={workspace.setSelectedID}
            onToggleFavorite={(id) => void workspace.toggleFavorite(id)}
            onDeleteItem={(id) => void workspace.deleteItem(id)}
            privateMode={privateMode}
          />
        </div>

        {/* Preview: remaining (~52%) */}
        <main className="flex flex-1 min-w-0 flex-col" role="main">
          <PreviewPane
            item={workspace.selectedItem}
            onToggleFavorite={(id) => void workspace.toggleFavorite(id)}
            onDelete={(id) => void workspace.deleteItem(id)}
            onAction={(action) => void workspace.executeAction(action)}
            privateMode={privateMode}
          />
        </main>
      </div>

      {/* ── Global overlays ─────────────────────────────────────────────── */}
      <CommandPalette
        open={workspace.commandPaletteOpen}
        onClose={() => workspace.setCommandPaletteOpen(false)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      <KeyboardShortcutsOverlay
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      <SettingsSheet
        open={workspace.settingsOpen}
        settings={workspace.boot.settings}
        onClose={() => workspace.setSettingsOpen(false)}
        onSave={workspace.updateSettings}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Confirm dialog */}
      <ConfirmDialog
        open={workspace.confirm.open}
        title={workspace.confirm.title}
        description={workspace.confirm.description}
        confirmLabel={workspace.confirm.confirmLabel}
        onConfirm={workspace.confirm.onConfirm}
        onCancel={workspace.dismissConfirm}
      />

      {/* Toast notifications */}
      <ToastStack toasts={workspace.toasts} onDismiss={workspace.dismissToast} />

      {/* Loading overlay */}
      {workspace.loading && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-[#0d0d0d]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-mint/30 border-t-mint" />
            <p className="text-[12px] text-mist/40">Loading workspace…</p>
          </div>
        </div>
      )}
    </div>
  );
}
