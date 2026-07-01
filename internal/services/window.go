package services

import (
	"context"
	"log/slog"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type WindowManager struct {
	logger *slog.Logger
	cfg    *config.Config
	ctx    context.Context
}

func NewWindowManager(logger *slog.Logger, cfg *config.Config) *WindowManager {
	return &WindowManager{
		logger: logger,
		cfg:    cfg,
	}
}

// Start binds the context and restores the saved window bounds.
func (w *WindowManager) Start(ctx context.Context) {
	w.ctx = ctx
	
	// Restore bounds
	if w.cfg.Window.Width > 0 && w.cfg.Window.Height > 0 {
		runtime.WindowSetSize(ctx, w.cfg.Window.Width, w.cfg.Window.Height)
	}
	
	// Position 0,0 is valid, but let's assume if it's set we restore it.
	// Actually, if we just set it blindly, it might be off-screen.
	// We'll trust the OS/Wails to keep it on screen or just apply it.
	if w.cfg.Window.X != 0 || w.cfg.Window.Y != 0 {
		runtime.WindowSetPosition(ctx, w.cfg.Window.X, w.cfg.Window.Y)
	}
}

// Stop saves the current window bounds to config before shutting down.
func (w *WindowManager) Stop() {
	if w.ctx == nil {
		return
	}
	
	width, height := runtime.WindowGetSize(w.ctx)
	x, y := runtime.WindowGetPosition(w.ctx)
	
	w.cfg.Window.Width = width
	w.cfg.Window.Height = height
	w.cfg.Window.X = x
	w.cfg.Window.Y = y
	
	if err := w.cfg.Save(); err != nil {
		w.logger.Error("failed to save window bounds", "error", err)
	}
}
