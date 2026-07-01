import * as React from 'react';
import { Input } from './input';

interface ShortcutCaptureProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ShortcutCapture({ value, onChange, className }: ShortcutCaptureProps) {
  const [recording, setRecording] = React.useState(false);
  const [current, setCurrent] = React.useState(value);

  React.useEffect(() => {
    setCurrent(value);
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      setRecording(false);
      setCurrent(value);
      (e.target as HTMLInputElement).blur();
      return;
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setCurrent('');
      onChange('');
      return;
    }

    // Ignore isolated modifier keys
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }

    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.altKey) modifiers.push('Alt');
    if (e.metaKey) modifiers.push('Super');

    let key = e.key.toUpperCase();
    if (key === ' ') key = 'Space';

    const shortcut = [...modifiers, key].join('+');
    setCurrent(shortcut);
    onChange(shortcut);
    setRecording(false);
    (e.target as HTMLInputElement).blur();
  };

  return (
    <Input
      className={className}
      value={recording ? 'Recording...' : current}
      onFocus={() => setRecording(true)}
      onBlur={() => setRecording(false)}
      onKeyDown={handleKeyDown}
      readOnly
      placeholder="Click to record shortcut"
    />
  );
}
