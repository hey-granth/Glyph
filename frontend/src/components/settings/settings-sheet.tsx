import { motion } from 'framer-motion';
import type { Settings } from '../../lib/types';

interface SettingsSheetProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSave: (settings: Settings) => Promise<void>;
}

export function SettingsSheet(props: SettingsSheetProps) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        className="w-full max-w-2xl rounded-[32px] border border-white/15 bg-[#142022]/95 p-8 shadow-glass"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-mist/40">Settings</p>
            <h3 className="mt-2 font-display text-3xl text-mist">Privacy and behavior</h3>
          </div>
          <button type="button" onClick={props.onClose} className="rounded-2xl bg-white/[0.08] px-4 py-2 text-sm text-mist">
            Close
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <label className="rounded-[24px] bg-white/[0.05] p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-mist/40">Shortcut</span>
            <input
              value={props.settings.globalShortcut}
              onChange={(event) => props.onSave({ ...props.settings, globalShortcut: event.target.value })}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-mist outline-none"
            />
          </label>
          <label className="rounded-[24px] bg-white/[0.05] p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-mist/40">Theme</span>
            <input
              value={props.settings.theme}
              onChange={(event) => props.onSave({ ...props.settings, theme: event.target.value })}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-mist outline-none"
            />
          </label>
          <label className="rounded-[24px] bg-white/[0.05] p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-mist/40">Storage</span>
            <input
              value={props.settings.storageDirectory}
              onChange={(event) => props.onSave({ ...props.settings, storageDirectory: event.target.value })}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-mist outline-none"
            />
          </label>
          <label className="rounded-[24px] bg-white/[0.05] p-4">
            <span className="text-xs uppercase tracking-[0.24em] text-mist/40">History limit</span>
            <input
              type="number"
              value={props.settings.historyLimit}
              onChange={(event) => props.onSave({ ...props.settings, historyLimit: Number(event.target.value) })}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-mist outline-none"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            { key: 'ocrEnabled', label: 'Enable OCR' },
            { key: 'privateMode', label: 'Private mode' },
            { key: 'pauseHistory', label: 'Pause history' },
            { key: 'largeText', label: 'Large text' },
            { key: 'highContrast', label: 'High contrast' },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() =>
                props.onSave({
                  ...props.settings,
                  [option.key]: !props.settings[option.key as keyof Settings],
                } as Settings)
              }
              className={`rounded-[24px] border px-4 py-4 text-left text-sm transition ${
                props.settings[option.key as keyof Settings]
                  ? 'border-mint/30 bg-mint/15 text-mist'
                  : 'border-white/10 bg-white/[0.04] text-mist/65'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
