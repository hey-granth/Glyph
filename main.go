package main

import (
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/hey-granth/Glyph/internal/app"
	"github.com/hey-granth/Glyph/internal/config"
	"github.com/hey-granth/Glyph/internal/platform/clipboard"
	"github.com/hey-granth/Glyph/internal/platform/hotkey"
	"github.com/hey-granth/Glyph/internal/platform/ocr"
	"github.com/hey-granth/Glyph/internal/platform/preview"
	"github.com/hey-granth/Glyph/internal/platform/tray"
	"github.com/hey-granth/Glyph/internal/services"
	sqlitestore "github.com/hey-granth/Glyph/internal/storage/sqlite"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))

	cfg, err := config.Load()
	if err != nil {
		logger.Error("load config", "error", err)
		os.Exit(1)
	}

	store, err := sqlitestore.Open(cfg.Storage.DatabasePath)
	if err != nil {
		logger.Error("open database", "error", err)
		os.Exit(1)
	}
	defer store.Close()

	repo := sqlitestore.NewRepository(store.DB)
	previewer := preview.NewService()
	ocrService := ocr.NewService(logger, cfg)
	processor := services.NewClipboardProcessor(logger, cfg, repo, previewer, ocrService)
	monitor := clipboard.NewMonitor(logger)
	
	windowManager := services.NewWindowManager(logger, cfg)
	eventBus := services.NewEventBus()
	storageService := services.NewStorageService(logger, cfg)
	settingsService := services.NewSettingsService(logger, cfg, eventBus, hotkey.NewManager(logger), storageService, repo)
	
	application := app.New(
		logger, 
		cfg, 
		repo, 
		monitor, 
		processor, 
		hotkey.NewManager(logger), 
		tray.NewManager(logger),
		settingsService,
	)

	err = wails.Run(&options.App{
		Title:            "Glyph",
		Width:            1360,
		Height:           860,
		MinWidth:         1100,
		MinHeight:        700,
		Frameless:        true,
		DisableResize:    false,
		WindowStartState: options.Normal,
		BackgroundColour: &options.RGBA{R: 13, G: 13, B: 13, A: 255},
		// Hide the window on close instead of quitting.
		// The global shortcut (Ctrl+Shift+Space) will restore it.
		// Users quit via the system tray menu.
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			windowManager.Stop()
			application.HideWindow()
			return true // true = prevent actual close
		},
		OnStartup: func(ctx context.Context) {
			windowManager.Start(ctx)
			eventBus.Start(ctx)
			application.Startup(ctx)
		},
		OnShutdown: func(ctx context.Context) {
			application.Shutdown(ctx)
		},
		AssetServer: &assetserver.Options{Assets: assets},
		Bind:        []any{application},
	})
	if err != nil {
		logger.Error("run app", "error", err)
		os.Exit(1)
	}
}
