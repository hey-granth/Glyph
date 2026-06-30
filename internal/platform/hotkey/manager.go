package hotkey

import (
	"context"
	"log/slog"
)

type Manager struct {
	logger *slog.Logger
}

func NewManager(logger *slog.Logger) *Manager {
	return &Manager{logger: logger}
}

func (m *Manager) Start(_ context.Context, _ string, _ func()) error {
	m.logger.Info("global hotkey manager initialized as no-op adapter")
	return nil
}
