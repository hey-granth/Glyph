import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, FolderOpen, Keyboard } from 'lucide-react';
import type { Settings } from '../../lib/types';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Stepper } from '../ui/stepper';
import { Dropdown } from '../ui/dropdown';
import { ShortcutBadge } from '../ui/shortcut-badge';
import { cn } from '../../lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SettingsSheetProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => Promise<void>;
  onOpenShortcuts: () => void;
}

type Section = 'General' | 'Appearance' | 'Privacy' | 'Storage' | 'Advanced' | 'Keyboard';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'General', label: 'General' },
  { id: 'Appearance', label: 'Appearance' },
  { id: 'Privacy', label: 'Privacy' },
  { id: 'Storage', label: 'Storage' },
  { id: 'Advanced', label: 'Advanced' },
  { id: 'Keyboard', label: 'Keyboard' },
];

// ─── Setting Row ──────────────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  control,
}: {
  label: string;
  description?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-3.5">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-mist">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] leading-snug text-mist/45">{description}</p>
        )}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-white/[0.06]" />;
}

// ─── Keyboard shortcuts reference ─────────────────────────────────────────────

const KEYBOARD_SHORTCUTS = [
  {
    category: 'Navigation',
    shortcuts: [
      { action: 'Open Glyph', keys: ['Ctrl', 'Shift', 'Space'] },
      { action: 'Close overlay / Clear search', keys: ['Esc'] },
      { action: 'Focus search', keys: ['Ctrl', 'F'] },
      { action: 'Focus list', keys: ['Ctrl', 'L'] },
      { action: 'Navigate up', keys: ['↑'] },
      { action: 'Navigate down', keys: ['↓'] },
    ],
  },
  {
    category: 'Actions',
    shortcuts: [
      { action: 'Copy selected', keys: ['↵'] },
      { action: 'Copy selected (again)', keys: ['Ctrl', 'C'] },
      { action: 'Copy as plain text', keys: ['Ctrl', 'Shift', 'C'] },
      { action: 'Pin / Favorite', keys: ['Ctrl', 'P'] },
      { action: 'Delete selected', keys: ['Del'] },
    ],
  },
  {
    category: 'Filters',
    shortcuts: [
      { action: 'All items', keys: ['Ctrl', '1'] },
      { action: 'Text', keys: ['Ctrl', '2'] },
      { action: 'Markdown', keys: ['Ctrl', '3'] },
      { action: 'JSON', keys: ['Ctrl', '4'] },
      { action: 'Links', keys: ['Ctrl', '5'] },
      { action: 'Images', keys: ['Ctrl', '6'] },
    ],
  },
  {
    category: 'Application',
    shortcuts: [
      { action: 'Settings', keys: ['Ctrl', ','] },
      { action: 'Command palette', keys: ['Ctrl', 'K'] },
      { action: 'Keyboard shortcuts', keys: ['?'] },
    ],
  },
];

// ─── Settings Sheet ───────────────────────────────────────────────────────────

export function SettingsSheet({ open, settings, onClose, onSave, onOpenShortcuts }: SettingsSheetProps) {
  const [activeSection, setActiveSection] = React.useState<Section>('General');
  const [shortcutSearch, setShortcutSearch] = React.useState('');

  // Keyboard: Escape closes, Arrow keys navigate sections
  React.useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const filteredShortcuts = React.useMemo(() => {
    if (!shortcutSearch.trim()) return KEYBOARD_SHORTCUTS;
    const q = shortcutSearch.toLowerCase();
    return KEYBOARD_SHORTCUTS
      .map((group) => ({
        ...group,
        shortcuts: group.shortcuts.filter((s) =>
          s.action.toLowerCase().includes(q) || s.keys.some((k) => k.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.shortcuts.length > 0);
  }, [shortcutSearch]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-black/60 p-8 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 360 }}
        className="flex h-[560px] w-full max-w-[820px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        {/* ── Sidebar nav ─────────────────────────────────────────────── */}
        <nav
          className="flex w-[180px] shrink-0 flex-col border-r border-white/[0.07] bg-[#0a0a0a] py-4"
          aria-label="Settings sections"
        >
          <div className="mb-3 px-4">
            <h2 className="text-[13px] font-semibold text-mist/70">Settings</h2>
          </div>
          <div className="flex flex-col gap-0.5 px-2">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                aria-current={activeSection === id ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-2 rounded-md px-2.5 py-[7px] text-left text-[13px] font-medium transition-colors',
                  activeSection === id
                    ? 'text-mist'
                    : 'text-mist/50 hover:bg-white/5 hover:text-mist/80'
                )}
              >
                {activeSection === id && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-mint" />
                )}
                {id === 'Keyboard' && (
                  <Keyboard className="h-3.5 w-3.5 text-mist/40" />
                )}
                {label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.07] px-6">
            <h3 className="text-[15px] font-semibold text-mist">
              {SECTIONS.find((s) => s.id === activeSection)?.label}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">

            {/* ── General ─────────────────────────────────────────────── */}
            {activeSection === 'General' && (
              <div className="divide-y divide-white/[0.06]">
                <SettingRow
                  label="Launch at Login"
                  description="Start Glyph automatically when you log in"
                  control={
                    <Switch
                      checked={settings.launchOnBoot}
                      onCheckedChange={(v) => void onSave({ ...settings, launchOnBoot: v })}
                    />
                  }
                />
                <SettingRow
                  label="Global Shortcut"
                  description="Shortcut to open Glyph from anywhere"
                  control={
                    <Input
                      value={settings.globalShortcut}
                      onChange={(e) => void onSave({ ...settings, globalShortcut: e.target.value })}
                      className="w-[200px] font-mono text-[12px]"
                      placeholder="e.g. Ctrl+Shift+Space"
                    />
                  }
                />
                <SettingRow
                  label="History Limit"
                  description="Maximum items to store. 0 = unlimited"
                  control={
                    <Stepper
                      value={settings.historyLimit}
                      onChange={(v) => void onSave({ ...settings, historyLimit: v })}
                      min={0}
                      max={100000}
                      step={500}
                    />
                  }
                />
              </div>
            )}

            {/* ── Appearance ──────────────────────────────────────────── */}
            {activeSection === 'Appearance' && (
              <div className="divide-y divide-white/[0.06]">
                <SettingRow
                  label="Theme"
                  description="Color scheme for the application"
                  control={
                    <Dropdown
                      value={settings.theme}
                      onChange={(e) => void onSave({ ...settings, theme: e.target.value })}
                      className="w-[160px]"
                    >
                      <option value="graphite">Graphite</option>
                    </Dropdown>
                  }
                />
                <SettingRow
                  label="Large Text"
                  description="Increase the base font size"
                  control={
                    <Switch
                      checked={settings.largeText}
                      onCheckedChange={(v) => void onSave({ ...settings, largeText: v })}
                    />
                  }
                />
                <SettingRow
                  label="High Contrast"
                  description="Increase contrast for better readability"
                  control={
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(v) => void onSave({ ...settings, highContrast: v })}
                    />
                  }
                />
              </div>
            )}

            {/* ── Privacy ─────────────────────────────────────────────── */}
            {activeSection === 'Privacy' && (
              <div className="divide-y divide-white/[0.06]">
                <SettingRow
                  label="Private Mode"
                  description="Mask clipboard content until hovered"
                  control={
                    <Switch
                      checked={settings.privateMode}
                      onCheckedChange={(v) => void onSave({ ...settings, privateMode: v })}
                    />
                  }
                />
                <SettingRow
                  label="Pause History"
                  description="Temporarily stop recording clipboard events"
                  control={
                    <Switch
                      checked={settings.pauseHistory}
                      onCheckedChange={(v) => void onSave({ ...settings, pauseHistory: v })}
                    />
                  }
                />
              </div>
            )}

            {/* ── Storage ─────────────────────────────────────────────── */}
            {activeSection === 'Storage' && (
              <div className="divide-y divide-white/[0.06]">
                <div className="py-3.5">
                  <p className="text-[13px] font-medium text-mist">Storage Location</p>
                  <p className="mt-0.5 text-[12px] text-mist/45">
                    Where Glyph stores its database and assets
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Input
                      readOnly
                      value={settings.storageDirectory || '~/.glyph'}
                      className="flex-1 cursor-default font-mono text-[12px] text-mist/60 bg-white/[0.03]"
                    />
                    <Button variant="secondary" size="sm" className="shrink-0">
                      <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                      Browse
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Advanced ────────────────────────────────────────────── */}
            {activeSection === 'Advanced' && (
              <div className="divide-y divide-white/[0.06]">
                <SettingRow
                  label="Enable OCR"
                  description="Automatically extract text from copied images"
                  control={
                    <Switch
                      checked={settings.ocrEnabled}
                      onCheckedChange={(v) => void onSave({ ...settings, ocrEnabled: v })}
                    />
                  }
                />
              </div>
            )}

            {/* ── Keyboard ────────────────────────────────────────────── */}
            {activeSection === 'Keyboard' && (
              <div>
                <Input
                  value={shortcutSearch}
                  onChange={(e) => setShortcutSearch(e.target.value)}
                  placeholder="Search shortcuts…"
                  className="mb-4 w-full"
                />
                <div className="space-y-5">
                  {filteredShortcuts.map((group) => (
                    <div key={group.category}>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-mist/35">
                        {group.category}
                      </p>
                      <div className="divide-y divide-white/[0.05] rounded-lg border border-white/[0.07] bg-white/[0.02]">
                        {group.shortcuts.map((shortcut) => (
                          <div
                            key={shortcut.action}
                            className="flex items-center justify-between px-3 py-2.5"
                          >
                            <span className="text-[13px] text-mist/70">{shortcut.action}</span>
                            <ShortcutBadge keys={shortcut.keys} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
