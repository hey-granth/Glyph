export type ClipboardItemType =
  | 'text'
  | 'markdown'
  | 'code'
  | 'richtext'
  | 'image'
  | 'file'
  | 'folder'
  | 'pdf'
  | 'url'
  | 'json';

export interface Preview {
  kind: string;
  summary: string;
  body: string;
  thumbnailPath: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
}

export interface ClipboardItem {
  id: string;
  type: ClipboardItemType;
  title: string;
  textContent: string;
  richText: string;
  filePath: string;
  storagePath: string;
  sourceApp: string;
  hash: string;
  copyCount: number;
  favorite: boolean;
  ocrText: string;
  metadata: string;
  preview: Preview;
  tags: Tag[];
  collections: Collection[];
  createdAt: string;
  updatedAt: string;
  lastCopiedAt: string;
}

export interface Settings {
  launchOnBoot: boolean;
  theme: string;
  globalShortcut: string;
  historyLimit: number;
  ocrEnabled: boolean;
  privateMode: boolean;
  pauseHistory: boolean;
  ignoreApplications: string[];
  storageDirectory: string;
  largeText: boolean;
  highContrast: boolean;
}

export interface BootstrapPayload {
  items: ClipboardItem[];
  tags: Tag[];
  collections: Collection[];
  settings: Settings;
}

export interface SearchQuery {
  term: string;
  types: ClipboardItemType[];
  dateFrom?: string;
  dateTo?: string;
  limit: number;
}
