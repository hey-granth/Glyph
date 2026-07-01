import { useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { bridge } from '../lib/bridge';

/**
 * useKeyboardShortcuts — Global keyboard engine for Glyph.
 *
 * Design decisions:
 * - Arrow Down/Up navigate history list EVEN when search is focused (Raycast-style)
 * - Enter in search = execute primary action (copy) on selected item
 * - Escape in search: first clears query if non-empty, then blurs
 * - Delete/Backspace only fires when NOT in any text input
 * - Ctrl+K = command palette
 * - Ctrl+, = settings
 * - Ctrl+F = focus search
 * - Ctrl+L = focus list
 * - Ctrl+P = toggle favorite/pin
 * - Ctrl+C = copy (when not in input)
 * - Ctrl+Shift+C = copy as plain text (when not in input)
 * - Ctrl+1…6 = type filters
 * - ? / F1 = shortcut overlay
 */
export function useKeyboardShortcuts(
  setShortcutsOpen: (open: boolean) => void
) {
  const workspace = useWorkspace();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inTextInput =
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        target.id !== 'glyph-search'; // search input is special
      const inSearch = target.id === 'glyph-search';
      const inAnyInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      const inSelect = target.tagName === 'SELECT';

      // ── Arrow navigation (always active — even from search) ─────────────
      if (e.key === 'ArrowDown' && !inTextInput && !inSelect) {
        e.preventDefault();
        workspace.selectNext();
        // Auto-scroll selected item into view
        setTimeout(() => {
          const el = document.querySelector('[data-selected="true"]');
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
        return;
      }

      if (e.key === 'ArrowUp' && !inTextInput && !inSelect) {
        e.preventDefault();
        workspace.selectPrev();
        setTimeout(() => {
          const el = document.querySelector('[data-selected="true"]');
          el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 0);
        return;
      }

      // ── Extended navigation ───────────────────────────────────────────────
      if (['PageUp', 'PageDown', 'Home', 'End'].includes(e.key) && !inTextInput && !inSelect) {
        e.preventDefault();
        const items = workspace.items;
        if (items.length === 0) return;
        const currentIdx = items.findIndex((i) => i.id === workspace.selectedID);
        let nextIdx = currentIdx;

        if (e.key === 'Home') nextIdx = 0;
        if (e.key === 'End') nextIdx = items.length - 1;
        if (e.key === 'PageUp') nextIdx = Math.max(0, currentIdx - 10);
        if (e.key === 'PageDown') nextIdx = Math.min(items.length - 1, currentIdx + 10);

        workspace.setSelectedID(items[nextIdx].id);
        setTimeout(() => {
          const el = document.querySelector('[data-selected="true"]');
          el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 0);
        return;
      }

      // ── Enter: copy selected item (from search or anywhere non-input) ──
      if (e.key === 'Enter' && (inSearch || !inAnyInput) && !e.ctrlKey && !e.metaKey) {
        if (workspace.selectedItem) {
          e.preventDefault();
          void workspace.executeAction('copy_again');
        }
        return;
      }

      // ── Escape ──────────────────────────────────────────────────────────
      if (e.key === 'Escape') {
        // Command palette first
        if (workspace.commandPaletteOpen) {
          e.preventDefault();
          workspace.setCommandPaletteOpen(false);
          return;
        }
        // Settings next
        if (workspace.settingsOpen) {
          e.preventDefault();
          workspace.setSettingsOpen(false);
          return;
        }
        // Confirm dialog
        if (workspace.confirm.open) {
          e.preventDefault();
          workspace.dismissConfirm();
          return;
        }
        // Shortcut overlay
        const overlays = document.querySelectorAll('[aria-label="Keyboard Shortcuts"]');
        if (overlays.length > 0) {
          // If overlay handles its own escape, we just let it bubble, but we check if it's open
          // Actually, overlay has its own escape listener. Let's rely on it or hide it here.
          setShortcutsOpen(false);
          return;
        }
        // Clear search if in search field and query is non-empty
        if (inSearch) {
          if (workspace.query) {
            e.preventDefault();
            workspace.setQuery('');
            return;
          } else {
            (target as HTMLInputElement).blur();
          }
        }
        // Final fallback: hide window
        e.preventDefault();
        void bridge.hideWindow();
        return;
      }

      // ── ? / F1: keyboard shortcuts overlay ──────────────────────────────
      if ((e.key === '?' && !inAnyInput) || e.key === 'F1') {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // ── Delete / Backspace: delete selected item (not in any input) ─────
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inAnyInput && workspace.selectedID) {
        e.preventDefault();
        void workspace.deleteItem(workspace.selectedID);
        return;
      }

      // ── Ctrl / Meta combos ───────────────────────────────────────────────
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          // Ctrl+K — Command palette
          case 'k':
            e.preventDefault();
            workspace.setCommandPaletteOpen(true);
            break;

          // Ctrl+, — Settings
          case ',':
            e.preventDefault();
            workspace.setSettingsOpen(true);
            break;

          // Ctrl+F — Focus search
          case 'f':
            e.preventDefault();
            document.getElementById('glyph-search')?.focus();
            break;

          // Ctrl+L — Focus list
          case 'l':
            e.preventDefault();
            document.getElementById('history-list-container')?.focus();
            break;

          // Ctrl+P — Pin / favorite selected item
          case 'p':
            if (!inTextInput) {
              e.preventDefault();
              if (workspace.selectedID) {
                void workspace.toggleFavorite(workspace.selectedID);
              }
            }
            break;

          // Ctrl+C — Copy selected (only when not in input, avoid blocking native copy)
          case 'c':
            const inPreviewPane = target.closest('#preview-pane') !== null;
            if (!inAnyInput && !inPreviewPane && workspace.selectedID) {
              e.preventDefault();
              if (e.shiftKey) {
                void workspace.executeAction('copy_plain');
              } else {
                void workspace.executeAction('copy_again');
              }
            }
            break;

          // Ctrl+1…6 — Type filters
          case '1':
            e.preventDefault();
            workspace.setActiveTypes([]);
            break;
          case '2':
            e.preventDefault();
            workspace.setActiveTypes(['text']);
            break;
          case '3':
            e.preventDefault();
            workspace.setActiveTypes(['markdown']);
            break;
          case '4':
            e.preventDefault();
            workspace.setActiveTypes(['json']);
            break;
          case '5':
            e.preventDefault();
            workspace.setActiveTypes(['url']);
            break;
          case '6':
            e.preventDefault();
            workspace.setActiveTypes(['image']);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [workspace, setShortcutsOpen]);
}
