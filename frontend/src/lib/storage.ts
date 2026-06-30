/**
 * storage.ts — Lightweight localStorage persistence for Glyph UI state.
 * Only persists non-sensitive UI state. Never persists clipboard content.
 */

const PREFIX = 'glyph:';

function key(k: string) {
  return `${PREFIX}${k}`;
}

export const storage = {
  get<T>(k: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key(k));
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(k: string, value: T): void {
    try {
      localStorage.setItem(key(k), JSON.stringify(value));
    } catch {
      // Silently ignore storage errors (private browsing, quota exceeded)
    }
  },

  remove(k: string): void {
    try {
      localStorage.removeItem(key(k));
    } catch {
      // noop
    }
  },
};

// Typed keys for all persisted state
export const STORAGE_KEYS = {
  ACTIVE_FILTER: 'activeFilter',
  SELECTED_ID: 'selectedId',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  SETTINGS: 'settings',
} as const;
