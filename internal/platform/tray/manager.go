package tray

import "log/slog"

type Manager struct {
	logger *slog.Logger
}

func NewManager(logger *slog.Logger) *Manager {
	return &Manager{logger: logger}
}

func (m *Manager) Start() {
	m.logger.Info("tray manager initialized as no-op adapter")
}
