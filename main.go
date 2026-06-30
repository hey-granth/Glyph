package main

import (
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/granthio/glyph/internal/app"
	"github.com/granthio/glyph/internal/config"
	"github.com/granthio/glyph/internal/platform/clipboard"
	"github.com/granthio/glyph/internal/platform/hotkey"
	"github.com/granthio/glyph/internal/platform/ocr"
	"github.com/granthio/glyph/internal/platform/preview"
	"github.com/granthio/glyph/internal/platform/tray"
	"github.com/granthio/glyph/internal/services"
	sqlitestore "github.com/granthio/glyph/internal/storage/sqlite"
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
	application := app.New(logger, cfg, repo, monitor, processor, hotkey.NewManager(logger), tray.NewManager(logger))

	err = wails.Run(&options.App{
		Title:            "Glyph",
		Width:            1360,
		Height:           860,
		MinWidth:         1100,
		MinHeight:        700,
		Frameless:        true,
		DisableResize:    false,
		WindowStartState: options.Normal,
		BackgroundColour: &options.RGBA{R: 12, G: 16, B: 18, A: 0},
		OnStartup: func(ctx context.Context) {
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
