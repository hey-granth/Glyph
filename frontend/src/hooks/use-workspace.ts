import { startTransition, useEffect, useMemo, useState } from 'react';
import { bridge } from '../lib/bridge';
import type { BootstrapPayload, ClipboardItem, ClipboardItemType, Settings } from '../lib/types';

const initialState: BootstrapPayload = {
  items: [],
  tags: [],
  collections: [],
  settings: {
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
  },
};

export function useWorkspace() {
  const [boot, setBoot] = useState<BootstrapPayload>(initialState);
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<ClipboardItemType[]>([]);
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [selectedID, setSelectedID] = useState<string>('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void bridge.bootstrap().then((payload) => {
      setBoot(payload);
      setItems(payload.items);
      setSelectedID(payload.items[0]?.id ?? '');
      setLoading(false);
    });
    bridge.onHistoryUpdated((item) => {
      startTransition(() => {
        setItems((current) => [item, ...current.filter((entry) => entry.id !== item.id)]);
        setSelectedID((current) => current || item.id);
      });
    });
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void bridge
        .search({
          term: query,
          types: activeTypes,
          limit: 250,
        })
        .then((nextItems) => {
          startTransition(() => {
            setItems(nextItems);
            setSelectedID((current) =>
              nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? '',
            );
          });
        });
    }, 100);
    return () => window.clearTimeout(handle);
  }, [query, activeTypes]);

  useEffect(() => {
    const focusSearch = () => {
      const element = document.getElementById('glyph-search');
      element?.focus();
    };
    window.addEventListener('glyph:focus-search', focusSearch as EventListener);
    return () => window.removeEventListener('glyph:focus-search', focusSearch as EventListener);
  }, []);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedID) ?? null,
    [items, selectedID],
  );

  async function toggleFavorite(id: string) {
    const updated = await bridge.toggleFavorite(id);
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
  }

  async function deleteItem(id: string) {
    await bridge.deleteItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
    setSelectedID((current) => (current === id ? '' : current));
  }

  async function clearHistory() {
    await bridge.clearHistory();
    setItems([]);
    setSelectedID('');
  }

  async function executeAction(action: string) {
    if (!selectedItem) return;
    await bridge.executeAction(selectedItem.id, action);
  }

  async function updateSettings(nextSettings: Settings) {
    const saved = await bridge.updateSettings(nextSettings);
    setBoot((current) => ({ ...current, settings: saved }));
  }

  return {
    boot,
    items,
    query,
    setQuery,
    activeTypes,
    setActiveTypes,
    selectedID,
    setSelectedID,
    selectedItem,
    settingsOpen,
    setSettingsOpen,
    loading,
    toggleFavorite,
    deleteItem,
    clearHistory,
    executeAction,
    updateSettings,
  };
}
