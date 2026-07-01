// Package hotkey provides global hotkey registration for Glyph.
// It uses golang.design/x/hotkey which supports Linux (X11) and Windows.
package hotkey

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	xhotkey "golang.design/x/hotkey"
)

// Manager registers and monitors a system-wide global hotkey.
type Manager struct {
	logger *slog.Logger
	hk     *xhotkey.Hotkey
}

func NewManager(logger *slog.Logger) *Manager {
	return &Manager{logger: logger}
}

// Start parses shortcutStr (e.g. "Ctrl+Shift+Space"), registers the global
// hotkey, and calls callback each time it is pressed.
// Returns nil even if registration fails — hotkey failure is non-fatal.
func (m *Manager) Start(ctx context.Context, shortcutStr string, callback func()) error {
	mods, key, err := parseShortcut(shortcutStr)
	if err != nil {
		m.logger.Warn("cannot parse global shortcut", "shortcut", shortcutStr, "error", err)
		return nil
	}

	hk := xhotkey.New(mods, key)
	if err := hk.Register(); err != nil {
		m.logger.Warn("cannot register global hotkey — another app may own it or no display available",
			"shortcut", shortcutStr, "error", err)
		return nil
	}

	m.hk = hk
	m.logger.Info("global hotkey registered", "shortcut", shortcutStr)

	go func() {
		for {
			select {
			case <-ctx.Done():
				if m.hk != nil {
					_ = m.hk.Unregister()
				}
				m.logger.Info("global hotkey unregistered")
				return
			case <-hk.Keydown():
				callback()
			}
		}
	}()

	return nil
}

// parseShortcut converts a string like "Ctrl+Shift+Space" into
// golang.design/x/hotkey modifiers and key values.
func parseShortcut(s string) ([]xhotkey.Modifier, xhotkey.Key, error) {
	parts := strings.Split(s, "+")
	if len(parts) < 2 {
		return nil, 0, fmt.Errorf("shortcut must contain at least one modifier and a key: %q", s)
	}

	var mods []xhotkey.Modifier
	for _, part := range parts[:len(parts)-1] {
		mod, ok := modifierFromString(part)
		if !ok {
			return nil, 0, fmt.Errorf("unknown modifier %q in shortcut %q", part, s)
		}
		mods = append(mods, mod)
	}

	key, ok := keyFromString(parts[len(parts)-1])
	if !ok {
		return nil, 0, fmt.Errorf("unknown key %q in shortcut %q", parts[len(parts)-1], s)
	}

	return mods, key, nil
}

func keyFromString(s string) (xhotkey.Key, bool) {
	s = strings.ToLower(strings.TrimSpace(s))
	switch s {
	case "space":
		return xhotkey.KeySpace, true
	case "return", "enter":
		return xhotkey.KeyReturn, true
	case "tab":
		return xhotkey.KeyTab, true
	case "escape", "esc":
		return xhotkey.KeyEscape, true
	case "a":
		return xhotkey.KeyA, true
	case "b":
		return xhotkey.KeyB, true
	case "c":
		return xhotkey.KeyC, true
	case "d":
		return xhotkey.KeyD, true
	case "e":
		return xhotkey.KeyE, true
	case "f":
		return xhotkey.KeyF, true
	case "g":
		return xhotkey.KeyG, true
	case "h":
		return xhotkey.KeyH, true
	case "i":
		return xhotkey.KeyI, true
	case "j":
		return xhotkey.KeyJ, true
	case "k":
		return xhotkey.KeyK, true
	case "l":
		return xhotkey.KeyL, true
	case "m":
		return xhotkey.KeyM, true
	case "n":
		return xhotkey.KeyN, true
	case "o":
		return xhotkey.KeyO, true
	case "p":
		return xhotkey.KeyP, true
	case "q":
		return xhotkey.KeyQ, true
	case "r":
		return xhotkey.KeyR, true
	case "s":
		return xhotkey.KeyS, true
	case "t":
		return xhotkey.KeyT, true
	case "u":
		return xhotkey.KeyU, true
	case "v":
		return xhotkey.KeyV, true
	case "w":
		return xhotkey.KeyW, true
	case "x":
		return xhotkey.KeyX, true
	case "y":
		return xhotkey.KeyY, true
	case "z":
		return xhotkey.KeyZ, true
	case "0":
		return xhotkey.Key0, true
	case "1":
		return xhotkey.Key1, true
	case "2":
		return xhotkey.Key2, true
	case "3":
		return xhotkey.Key3, true
	case "4":
		return xhotkey.Key4, true
	case "5":
		return xhotkey.Key5, true
	case "6":
		return xhotkey.Key6, true
	case "7":
		return xhotkey.Key7, true
	case "8":
		return xhotkey.Key8, true
	case "9":
		return xhotkey.Key9, true
	case "f1":
		return xhotkey.KeyF1, true
	case "f2":
		return xhotkey.KeyF2, true
	case "f3":
		return xhotkey.KeyF3, true
	case "f4":
		return xhotkey.KeyF4, true
	case "f5":
		return xhotkey.KeyF5, true
	case "f6":
		return xhotkey.KeyF6, true
	case "f7":
		return xhotkey.KeyF7, true
	case "f8":
		return xhotkey.KeyF8, true
	case "f9":
		return xhotkey.KeyF9, true
	case "f10":
		return xhotkey.KeyF10, true
	case "f11":
		return xhotkey.KeyF11, true
	case "f12":
		return xhotkey.KeyF12, true
	default:
		return 0, false
	}
}
