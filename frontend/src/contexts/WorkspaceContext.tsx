import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  startTransition,
} from 'react';
import { bridge } from '../lib/bridge';
import { storage, STORAGE_KEYS } from '../lib/storage';
import { applyTheme } from '../lib/theme';
import type { BootstrapPayload, ClipboardItem, ClipboardItemType, Settings } from '../lib/types';

// ─── Toast System ────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

// ─── Initial State ────────────────────────────────────────────────────────────

const defaultSettings: Settings = {
  launchOnBoot: false,
  theme: 'graphite',
  globalShortcut: 'Ctrl+Shift+Space',
  historyLimit: 0,
  ocrEnabled: true,
  privateMode: false,
  pauseHistory: false,
  ignoreApplications: [],
  storageDirectory: '',
  largeText: false,
  highContrast: false,
};

const initialBootstrap: BootstrapPayload = {
  items: [],
  settings: defaultSettings,
};

// ─── Context Interface ────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  // Data
  boot: BootstrapPayload;
  items: ClipboardItem[];
  loading: boolean;

  // Search
  query: string;
  setQuery: (q: string) => void;

  // Filter
  activeTypes: ClipboardItemType[];
  setActiveTypes: (types: ClipboardItemType[]) => void;

  // Selection
  selectedID: string;
  setSelectedID: (id: string) => void;
  selectedItem: ClipboardItem | null;

  // Navigation
  selectNext: () => void;
  selectPrev: () => void;

  // Actions
  toggleFavorite: (id: string) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  executeAction: (action: string) => Promise<void>;
  updateSettings: (settings: Settings) => Promise<void>;

  // UI State
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  dismissToast: (id: string) => void;

  // Confirm Dialog
  confirm: ConfirmDialogState;
  showConfirm: (opts: Omit<ConfirmDialogState, 'open'>) => void;
  dismissConfirm: () => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [boot, setBoot] = useState<BootstrapPayload>(initialBootstrap);
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypesState] = useState<ClipboardItemType[]>(
    () => storage.get<ClipboardItemType[]>(STORAGE_KEYS.ACTIVE_FILTER, [])
  );
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedID, setSelectedIDState] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Toast state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Confirm dialog state
  const [confirm, setConfirm] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  // ─── Bootstrap ─────────────────────────────────────────────────────────────

  useEffect(() => {
    void bridge.bootstrap().then((payload) => {
      setBoot(payload);
      applyTheme(payload.settings);
      setItems(payload.items);
      const savedID = storage.get<string>(STORAGE_KEYS.SELECTED_ID, '');
      const firstID = payload.items[0]?.id ?? '';
      const restoredID = payload.items.find((i) => i.id === savedID) ? savedID : firstID;
      setSelectedIDState(restoredID);
      setLoading(false);
    });

    bridge.onHistoryUpdated((item) => {
      startTransition(() => {
        setItems((current) => [item, ...current.filter((e) => e.id !== item.id)]);
        setSelectedIDState((current) => current || item.id);
      });
    });

    bridge.onSettingsUpdated((settings) => {
      startTransition(() => {
        setBoot((current) => ({ ...current, settings }));
        applyTheme(settings);
      });
    });
  }, []);

  // ─── Search / Filter ───────────────────────────────────────────────────────

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void bridge
        .search({ term: query, types: activeTypes, limit: 500 })
        .then((nextItems) => {
          startTransition(() => {
            setItems(nextItems);
            setSelectedIDState((current) =>
              nextItems.some((item) => item.id === current)
                ? current
                : nextItems[0]?.id ?? ''
            );
          });
        });
    }, 80);
    return () => window.clearTimeout(handle);
  }, [query, activeTypes]);

  // ─── Persisted Selection & Filter ─────────────────────────────────────────

  const setSelectedID = useCallback((id: string) => {
    setSelectedIDState(id);
    storage.set(STORAGE_KEYS.SELECTED_ID, id);
  }, []);

  const setActiveTypes = useCallback((types: ClipboardItemType[]) => {
    setActiveTypesState(types);
    storage.set(STORAGE_KEYS.ACTIVE_FILTER, types);
  }, []);

  // ─── Derived State ─────────────────────────────────────────────────────────

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedID) ?? null,
    [items, selectedID]
  );

  // ─── Navigation ────────────────────────────────────────────────────────────

  const selectNext = useCallback(() => {
    const idx = items.findIndex((i) => i.id === selectedID);
    const next = items[Math.min(idx + 1, items.length - 1)];
    if (next) setSelectedID(next.id);
  }, [items, selectedID, setSelectedID]);

  const selectPrev = useCallback(() => {
    const idx = items.findIndex((i) => i.id === selectedID);
    const prev = items[Math.max(idx - 1, 0)];
    if (prev) setSelectedID(prev.id);
  }, [items, selectedID, setSelectedID]);

  // ─── Toast ─────────────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ─── Confirm Dialog ────────────────────────────────────────────────────────

  const showConfirm = useCallback((opts: Omit<ConfirmDialogState, 'open'>) => {
    setConfirm({ ...opts, open: true });
  }, []);

  const dismissConfirm = useCallback(() => {
    setConfirm((prev) => ({ ...prev, open: false }));
  }, []);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const toggleFavorite = useCallback(async (id: string) => {
    const updated = await bridge.toggleFavorite(id);
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    showToast(updated.favorite ? 'Pinned to favorites' : 'Removed from favorites');
  }, [showToast]);

  const deleteItem = useCallback(async (id: string) => {
    await bridge.deleteItem(id);
    setItems((current) => {
      const idx = current.findIndex((i) => i.id === id);
      const next = current[idx + 1] ?? current[idx - 1];
      setSelectedIDState(next?.id ?? '');
      return current.filter((item) => item.id !== id);
    });
    showToast('Item deleted');
  }, [showToast]);

  const clearHistory = useCallback(async () => {
    await bridge.clearHistory();
    setItems([]);
    setSelectedIDState('');
    showToast('History cleared');
  }, [showToast]);

  const executeAction = useCallback(async (action: string) => {
    if (!selectedItem) return;
    await bridge.executeAction(selectedItem.id, action);

    const actionMessages: Record<string, string> = {
      copy_again: 'Copied to clipboard',
      copy_plain: 'Copied as plain text',
      open_url: 'Opening link…',
      open_file: 'Opening file…',
      uppercase: 'Transformed to UPPERCASE',
      lowercase: 'Transformed to lowercase',
    };
    showToast(actionMessages[action] ?? 'Action executed');
  }, [selectedItem, showToast]);

  const updateSettings = useCallback(async (nextSettings: Settings) => {
    const saved = await bridge.updateSettings(nextSettings);
    setBoot((current) => ({ ...current, settings: saved }));
    applyTheme(saved);
    showToast('Settings saved');
  }, [showToast]);

  // ─── Focus Search Event ────────────────────────────────────────────────────

  useEffect(() => {
    const focusSearch = () => {
      document.getElementById('glyph-search')?.focus();
    };
    window.addEventListener('glyph:focus-search', focusSearch as EventListener);
    return () => window.removeEventListener('glyph:focus-search', focusSearch as EventListener);
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        boot,
        items,
        loading,
        query,
        setQuery,
        activeTypes,
        setActiveTypes,
        selectedID,
        setSelectedID,
        selectedItem,
        selectNext,
        selectPrev,
        settingsOpen,
        setSettingsOpen,
        commandPaletteOpen,
        setCommandPaletteOpen,
        toggleFavorite,
        deleteItem,
        clearHistory,
        executeAction,
        updateSettings,
        toasts,
        showToast,
        dismissToast,
        confirm,
        showConfirm,
        dismissConfirm,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
