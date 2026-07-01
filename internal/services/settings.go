package services

import (
	"context"
	"log/slog"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/hey-granth/Glyph/internal/domain"
)

type SettingsService struct {
	logger         *slog.Logger
	cfg            *config.Config
	eventBus       *EventBus
	hotkeyManager  HotkeyManager
	storageService *StorageService
	trimmer        HistoryTrimmer
	ctx            context.Context
	cancelCtx      context.CancelFunc
}

type HotkeyManager interface {
	Start(context.Context, string, func()) error
}

type HistoryTrimmer interface {
	TrimHistory(context.Context, int) error
}

func NewSettingsService(
	logger *slog.Logger,
	cfg *config.Config,
	eventBus *EventBus,
	hotkey HotkeyManager,
	storage *StorageService,
	trimmer HistoryTrimmer,
) *SettingsService {
	return &SettingsService{
		logger:         logger,
		cfg:            cfg,
		eventBus:       eventBus,
		hotkeyManager:  hotkey,
		storageService: storage,
		trimmer:        trimmer,
	}
}

func (s *SettingsService) Start(ctx context.Context, cancelCtx context.CancelFunc) {
	s.ctx = ctx
	s.cancelCtx = cancelCtx
}

func (s *SettingsService) GetSettings() domain.Settings {
	return s.cfg.DomainSettings()
}

func (s *SettingsService) UpdateSettings(settings domain.Settings, showWindow func()) (domain.Settings, error) {
	oldShortcut := s.cfg.UI.GlobalShortcut
	oldLimit := s.cfg.History.Limit
	oldStorageDir := s.cfg.Storage.RootDir

	s.cfg.ApplySettings(settings)
	if err := s.cfg.Save(); err != nil {
		return domain.Settings{}, err
	}

	// 1. Storage Migration
	if settings.StorageDirectory != "" && settings.StorageDirectory != oldStorageDir {
		if err := s.storageService.MigrateDirectory(settings.StorageDirectory); err != nil {
			s.logger.Error("Storage migration failed, rolling back settings", "error", err)
			// Rollback to old directory
			s.cfg.Storage.RootDir = oldStorageDir
			s.cfg.Save()
		}
	}

	// 2. Hotkey rebinding
	if settings.GlobalShortcut != oldShortcut {
		s.logger.Info("global shortcut changed, re-registering", "new", settings.GlobalShortcut)
		if s.cancelCtx != nil {
			s.cancelCtx()
		}
		newCtx, newCancel := context.WithCancel(context.Background())
		s.ctx = newCtx
		s.cancelCtx = newCancel
		if err := s.hotkeyManager.Start(newCtx, settings.GlobalShortcut, showWindow); err != nil {
			s.logger.Warn("failed to re-register hotkey", "error", err)
		}
	}

	// 3. Trim History
	newLimit := settings.HistoryLimit
	if newLimit > 0 && (oldLimit == 0 || newLimit < oldLimit) {
		if err := s.trimmer.TrimHistory(s.ctx, newLimit); err != nil {
			s.logger.Warn("failed to trim history", "error", err)
		}
	}

	result := s.cfg.DomainSettings()
	s.eventBus.Emit("settings:updated", result)
	return result, nil
}
