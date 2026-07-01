// Package tray provides system tray support for Glyph.
// The actual tray icon is registered via the Wails build toolchain.
// This package provides the application menu structure for Show/Hide/Quit actions.
package tray

import (
	"log/slog"

	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
)

// Manager manages the system tray lifecycle.
type Manager struct {
	logger *slog.Logger
}

func NewManager(logger *slog.Logger) *Manager {
	return &Manager{logger: logger}
}

// Start initialises the tray. On Linux/Windows, the actual tray icon is
// handled by the Wails runtime based on wails.json configuration.
func (m *Manager) Start() {
	m.logger.Info("tray manager started")
}

// BuildMenu creates a Wails-compatible menu for the application / tray.
// Returns a menu with Show, Hide, and Quit items.
func BuildMenu(showFn func(), hideFn func(), quitFn func()) *menu.Menu {
	return menu.NewMenuFromItems(
		menu.Text("Show Glyph", keys.CmdOrCtrl("space"), func(_ *menu.CallbackData) {
			showFn()
		}),
		menu.Text("Hide Glyph", nil, func(_ *menu.CallbackData) {
			hideFn()
		}),
		menu.Separator(),
		menu.Text("Quit Glyph", keys.CmdOrCtrl("q"), func(_ *menu.CallbackData) {
			quitFn()
		}),
	)
}
