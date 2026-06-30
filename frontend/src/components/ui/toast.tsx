import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import type { Toast, ToastType } from '../../contexts/WorkspaceContext';
import { cn } from '../../lib/utils';

// ─── Toast Item ───────────────────────────────────────────────────────────────

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: 'text-mint',
  error: 'text-rose',
  info: 'text-mist/70',
  warning: 'text-amber',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = ICONS[toast.type];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-graphite/95 px-4 py-3 shadow-2xl backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <Icon className={cn('h-4 w-4 shrink-0', COLORS[toast.type])} />
      <span className="text-sm text-mist/90">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-1 rounded p-0.5 text-mist/40 hover:text-mist/70 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

// ─── Toast Stack ──────────────────────────────────────────────────────────────

interface ToastStackProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col items-end gap-2"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
