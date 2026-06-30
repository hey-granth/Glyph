import { mockBootstrap } from './mock';
import type { BootstrapPayload, ClipboardItem, Collection, SearchQuery, Settings, Tag } from './types';

type GoMain = {
  Bootstrap: () => Promise<BootstrapPayload>;
  SearchHistory: (query: SearchQuery) => Promise<ClipboardItem[]>;
  GetRecentItems: (limit: number) => Promise<ClipboardItem[]>;
  ToggleFavorite: (id: string) => Promise<ClipboardItem>;
  DeleteItem: (id: string) => Promise<void>;
  ClearHistory: () => Promise<void>;
  ExecuteAction: (id: string, action: string) => Promise<void>;
  UpdateSettings: (settings: Settings) => Promise<Settings>;
  CreateTag: (name: string) => Promise<Tag>;
  CreateCollection: (name: string) => Promise<Collection>;
  AssignTag: (itemID: string, tagID: string) => Promise<void>;
  AssignCollection: (itemID: string, collectionID: string) => Promise<void>;
};

declare global {
  interface Window {
    go?: {
      main?: {
        App?: GoMain;
      };
    };
    runtime?: {
      EventsOn?: (eventName: string, callback: (payload: ClipboardItem) => void) => void;
    };
  }
}

let localState = structuredClone(mockBootstrap);

function goApp(): GoMain | undefined {
  return window.go?.main?.App;
}

export const bridge = {
  async bootstrap(): Promise<BootstrapPayload> {
    if (goApp()) return goApp()!.Bootstrap();
    return localState;
  },
  async search(query: SearchQuery): Promise<ClipboardItem[]> {
    if (goApp()) return goApp()!.SearchHistory(query);
    const term = query.term.toLowerCase();
    return localState.items.filter((item) => {
      const matchesTerm =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.textContent.toLowerCase().includes(term) ||
        item.ocrText.toLowerCase().includes(term);
      const matchesType = !query.types.length || query.types.includes(item.type);
      return matchesTerm && matchesType;
    });
  },
  async toggleFavorite(id: string): Promise<ClipboardItem> {
    if (goApp()) return goApp()!.ToggleFavorite(id);
    localState.items = localState.items.map((item) =>
      item.id === id ? { ...item, favorite: !item.favorite } : item,
    );
    return localState.items.find((item) => item.id === id)!;
  },
  async deleteItem(id: string): Promise<void> {
    if (goApp()) return goApp()!.DeleteItem(id);
    localState.items = localState.items.filter((item) => item.id !== id);
  },
  async clearHistory(): Promise<void> {
    if (goApp()) return goApp()!.ClearHistory();
    localState.items = [];
  },
  async executeAction(id: string, action: string): Promise<void> {
    if (goApp()) return goApp()!.ExecuteAction(id, action);
    const item = localState.items.find((entry) => entry.id === id);
    if (!item) return;
    if (navigator.clipboard && (action === 'copy_again' || action === 'copy_plain')) {
      await navigator.clipboard.writeText(item.textContent);
    }
  },
  async updateSettings(settings: Settings): Promise<Settings> {
    if (goApp()) return goApp()!.UpdateSettings(settings);
    localState.settings = settings;
    return settings;
  },
  async createTag(name: string): Promise<any> {
    return null;
  },
  async createCollection(name: string): Promise<any> {
    return null;
  },
  async assignTag(itemID: string, tagID: string): Promise<void> {},
  async assignCollection(itemID: string, collectionID: string): Promise<void> {},
  onHistoryUpdated(callback: (item: ClipboardItem) => void) {
    if (window.runtime?.EventsOn) {
      window.runtime.EventsOn('history:updated', callback);
    }
  },
};
