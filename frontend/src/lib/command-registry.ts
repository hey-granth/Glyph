/**
 * CommandRegistry — Single source of truth for all user actions.
 */

import React, { useMemo } from 'react';
import {
  Settings2,
  Trash2,
  PauseCircle,
  PlayCircle,
  ScanText,
  EyeOff,
  Eye,
  Keyboard,
  ClipboardList,
} from 'lucide-react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string[];
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  action: () => void;
}

export function useCommandRegistry(workspace: any, onOpenShortcuts?: () => void): Command[] {
  return useMemo(() => [
    {
      id: 'open-settings',
      label: 'Open Settings',
      description: 'Manage preferences',
      shortcut: ['Ctrl', ','],
      icon: Settings2,
      category: 'Application',
      action: () => workspace.setSettingsOpen(true),
    },
    {
      id: 'keyboard-shortcuts',
      label: 'Keyboard Shortcuts',
      description: 'View and edit shortcuts',
      shortcut: ['?'],
      icon: Keyboard,
      category: 'Application',
      action: () => {
        if (onOpenShortcuts) onOpenShortcuts();
        else window.dispatchEvent(new CustomEvent('glyph:open-shortcuts'));
      },
    },
    {
      id: 'clear-history',
      label: 'Clear History',
      description: 'Delete all clipboard items',
      icon: Trash2,
      category: 'History',
      action: () => {
        workspace.showConfirm({
          title: 'Clear all history?',
          description: 'This will permanently delete all clipboard items. This cannot be undone.',
          confirmLabel: 'Clear All',
          onConfirm: () => {
            void workspace.clearHistory();
            workspace.dismissConfirm();
          },
        });
      },
    },
    {
      id: 'toggle-pause',
      label: workspace.boot.settings.pauseHistory ? 'Resume Recording' : 'Pause Recording',
      description: workspace.boot.settings.pauseHistory
        ? 'Start capturing clipboard events again'
        : 'Temporarily stop capturing clipboard events',
      icon: workspace.boot.settings.pauseHistory ? PlayCircle : PauseCircle,
      category: 'History',
      action: () => {
        void workspace.updateSettings({
          ...workspace.boot.settings,
          pauseHistory: !workspace.boot.settings.pauseHistory,
        });
      },
    },
    {
      id: 'toggle-ocr',
      label: workspace.boot.settings.ocrEnabled ? 'Disable OCR' : 'Enable OCR',
      description: 'Extract text from clipboard images',
      icon: ScanText,
      category: 'Features',
      action: () => {
        void workspace.updateSettings({
          ...workspace.boot.settings,
          ocrEnabled: !workspace.boot.settings.ocrEnabled,
        });
      },
    },
    {
      id: 'toggle-private',
      label: workspace.boot.settings.privateMode ? 'Disable Private Mode' : 'Enable Private Mode',
      description: 'Hide content until hovered',
      icon: workspace.boot.settings.privateMode ? Eye : EyeOff,
      category: 'Privacy',
      action: () => {
        void workspace.updateSettings({
          ...workspace.boot.settings,
          privateMode: !workspace.boot.settings.privateMode,
        });
      },
    },
    {
      id: 'filter-all',
      label: 'Show All Items',
      shortcut: ['Ctrl', '1'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes([]),
    },
    {
      id: 'filter-text',
      label: 'Filter: Text',
      shortcut: ['Ctrl', '2'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes(['text']),
    },
    {
      id: 'filter-markdown',
      label: 'Filter: Markdown',
      shortcut: ['Ctrl', '3'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes(['markdown']),
    },
    {
      id: 'filter-json',
      label: 'Filter: JSON',
      shortcut: ['Ctrl', '4'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes(['json']),
    },
    {
      id: 'filter-links',
      label: 'Filter: Links',
      shortcut: ['Ctrl', '5'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes(['url']),
    },
    {
      id: 'filter-images',
      label: 'Filter: Images',
      shortcut: ['Ctrl', '6'],
      icon: ClipboardList,
      category: 'Filter',
      action: () => workspace.setActiveTypes(['image']),
    },
  ], [workspace, onOpenShortcuts]);
}
