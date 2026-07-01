package app

import (
	"context"
	"log/slog"
	"strings"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/hey-granth/Glyph/internal/domain"
	"github.com/hey-granth/Glyph/internal/platform/clipboard"
	"github.com/hey-granth/Glyph/internal/services"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// ─── Interfaces ───────────────────────────────────────────────────────────────

type Repository interface {
	Bootstrap(context.Context, domain.Settings) (domain.BootstrapPayload, error)
	Search(context.Context, domain.SearchQuery) ([]domain.ClipboardItem, error)
	ListRecent(context.Context, int) ([]domain.ClipboardItem, error)
	GetItem(context.Context, string) (domain.ClipboardItem, error)
	ToggleFavorite(context.Context, string) (domain.ClipboardItem, error)
	DeleteItem(context.Context, string) error
	ClearHistory(context.Context) error
	TrimHistory(context.Context, int) error
	ListTags(context.Context) ([]domain.Tag, error)
	CreateTag(context.Context, domain.Tag) (domain.Tag, error)
	AssignTag(context.Context, string, string) error
	ListCollections(context.Context) ([]domain.Collection, error)
	CreateCollection(context.Context, domain.Collection) (domain.Collection, error)
	AssignCollection(context.Context, string, string) error
}

type ClipboardMonitor interface {
	Start(context.Context, clipboard.Handler) error
}

type HotkeyManager interface {
	Start(context.Context, string, func()) error
}

type TrayManager interface {
	Start()
}

type Processor interface {
	Process(context.Context, clipboard.Capture) (domain.ClipboardItem, error)
}

// ─── App ──────────────────────────────────────────────────────────────────────

type App struct {
	logger    *slog.Logger
	config    *config.Config
	repo      Repository
	monitor   ClipboardMonitor
	processor Processor
	hotkey    HotkeyManager
	tray      TrayManager
	settings  *services.SettingsService
	ctx       context.Context
	cancelCtx context.CancelFunc
}

func New(
	logger *slog.Logger, 
	cfg *config.Config, 
	repo Repository, 
	monitor ClipboardMonitor, 
	processor Processor, 
	hotkey HotkeyManager, 
	tray TrayManager,
	settingsService *services.SettingsService,
) *App {
	return &App{
		logger:    logger, 
		config:    cfg, 
		repo:      repo, 
		monitor:   monitor, 
		processor: processor, 
		hotkey:    hotkey, 
		tray:      tray,
		settings:  settingsService,
	}
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

func (a *App) Startup(ctx context.Context) {
	a.ctx, a.cancelCtx = context.WithCancel(ctx)
	a.tray.Start()
	
	// SettingsService gets the cancel context for hotkey restarts
	a.settings.Start(a.ctx, a.cancelCtx)

	if err := a.monitor.Start(a.ctx, a.handleClipboard); err != nil {
		a.logger.Warn("clipboard monitor unavailable", "error", err)
	}
	if err := a.hotkey.Start(a.ctx, a.config.UI.GlobalShortcut, a.ShowWindow); err != nil {
		a.logger.Warn("hotkey manager unavailable", "error", err)
	}
}

func (a *App) Shutdown(context.Context) {
	if a.cancelCtx != nil {
		a.cancelCtx()
	}
}

// ─── Window ───────────────────────────────────────────────────────────────────

// ShowWindow brings Glyph to the foreground and focuses the search field.
// Called by the global hotkey handler.
func (a *App) ShowWindow() {
	runtime.WindowShow(a.ctx)
	runtime.WindowSetAlwaysOnTop(a.ctx, true)
	runtime.WindowSetAlwaysOnTop(a.ctx, false)
	runtime.WindowExecJS(a.ctx, `
		window.dispatchEvent(new CustomEvent('glyph:focus-search'));
	`)
}

// HideWindow hides the Glyph window. Called by the frontend Escape handler.
func (a *App) HideWindow() {
	runtime.WindowHide(a.ctx)
}

// ─── Bootstrap & History ─────────────────────────────────────────────────────

func (a *App) Bootstrap() (domain.BootstrapPayload, error) {
	return a.repo.Bootstrap(a.ctx, a.config.DomainSettings())
}

func (a *App) SearchHistory(query domain.SearchQuery) ([]domain.ClipboardItem, error) {
	return a.repo.Search(a.ctx, query)
}

func (a *App) GetRecentItems(limit int) ([]domain.ClipboardItem, error) {
	return a.repo.ListRecent(a.ctx, limit)
}

func (a *App) GetItem(id string) (domain.ClipboardItem, error) {
	return a.repo.GetItem(a.ctx, id)
}

func (a *App) ToggleFavorite(id string) (domain.ClipboardItem, error) {
	return a.repo.ToggleFavorite(a.ctx, id)
}

func (a *App) DeleteItem(id string) error {
	return a.repo.DeleteItem(a.ctx, id)
}

func (a *App) ClearHistory() error {
	return a.repo.ClearHistory(a.ctx)
}

// ─── Settings ─────────────────────────────────────────────────────────────────

func (a *App) GetSettings() domain.Settings {
	return a.settings.GetSettings()
}

// UpdateSettings delegates to SettingsService
func (a *App) UpdateSettings(settings domain.Settings) (domain.Settings, error) {
	return a.settings.UpdateSettings(settings, a.ShowWindow)
}

// ─── Actions ──────────────────────────────────────────────────────────────────

func (a *App) ExecuteAction(itemID, action string) error {
	item, err := a.repo.GetItem(a.ctx, itemID)
	if err != nil {
		return err
	}

	switch action {
	case "copy_again":
		return runtime.ClipboardSetText(a.ctx, item.TextContent)
	case "copy_plain":
		return runtime.ClipboardSetText(a.ctx, item.TextContent)
	case "uppercase":
		return runtime.ClipboardSetText(a.ctx, strings.ToUpper(item.TextContent))
	case "lowercase":
		return runtime.ClipboardSetText(a.ctx, strings.ToLower(item.TextContent))
	case "open_url":
		runtime.BrowserOpenURL(a.ctx, item.TextContent)
		return nil
	case "open_file":
		runtime.BrowserOpenURL(a.ctx, "file://"+item.FilePath)
		return nil
	default:
		return nil
	}
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

// OpenDirectoryDialog opens the native OS directory picker and returns
// the selected path. Returns empty string if cancelled.
func (a *App) OpenDirectoryDialog() (string, error) {
	path, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Storage Directory",
	})
	if err != nil {
		return "", err
	}
	return path, nil
}

// ─── Tags & Collections (legacy) ──────────────────────────────────────────────

func (a *App) CreateTag(name string) (domain.Tag, error) {
	tag := domain.Tag{ID: slugID(name), Name: name}
	return a.repo.CreateTag(a.ctx, tag)
}

func (a *App) AssignTag(itemID, tagID string) error {
	return a.repo.AssignTag(a.ctx, itemID, tagID)
}

func (a *App) CreateCollection(name string) (domain.Collection, error) {
	collection := domain.Collection{ID: slugID(name), Name: name}
	return a.repo.CreateCollection(a.ctx, collection)
}

func (a *App) AssignCollection(itemID, collectionID string) error {
	return a.repo.AssignCollection(a.ctx, itemID, collectionID)
}

// ─── Internal ─────────────────────────────────────────────────────────────────

func (a *App) handleClipboard(ctx context.Context, capture clipboard.Capture) {
	item, err := a.processor.Process(ctx, capture)
	if err != nil {
		a.logger.Error("process clipboard", "error", err)
		return
	}
	if item.ID == "" {
		return
	}
	runtime.EventsEmit(a.ctx, "history:updated", item)
}

func slugID(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	value = strings.ReplaceAll(value, " ", "-")
	return value
}
