package services_test

import (
	"context"
	"io/ioutil"
	"log/slog"
	"os"
	"path/filepath"
	"testing"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/hey-granth/Glyph/internal/domain"
	"github.com/hey-granth/Glyph/internal/services"
)

type mockHotkeyManager struct {
	lastShortcut string
}

func (m *mockHotkeyManager) Start(ctx context.Context, shortcut string, cb func()) error {
	m.lastShortcut = shortcut
	return nil
}

type mockHistoryTrimmer struct {
	lastLimit int
}

func (m *mockHistoryTrimmer) TrimHistory(ctx context.Context, limit int) error {
	m.lastLimit = limit
	return nil
}

func TestSettingsService_UpdateSettings(t *testing.T) {
	// Setup config in a temp dir
	tmpDir, err := ioutil.TempDir("", "glyph_test_*")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(tmpDir)

	os.Setenv("HOME", tmpDir) // Hack for default config path, or we can just inject
	cfg, err := config.Load()
	if err != nil {
		// If load fails because default uses HOME, we just instantiate one
		cfg = &config.Config{}
		cfg.Storage.RootDir = tmpDir
	}
	cfg.Storage.RootDir = tmpDir
	cfg.Storage.DatabasePath = filepath.Join(tmpDir, "glyph.db")
	cfg.Storage.AssetsDir = filepath.Join(tmpDir, "assets")

	logger := slog.New(slog.NewTextHandler(ioutil.Discard, nil))
	eventBus := services.NewEventBus()
	storage := services.NewStorageService(logger, cfg)
	hotkey := &mockHotkeyManager{}
	trimmer := &mockHistoryTrimmer{}

	srv := services.NewSettingsService(logger, cfg, eventBus, hotkey, storage, trimmer)
	srv.Start(context.Background(), func() {})

	// Act
	newSettings := domain.Settings{
		GlobalShortcut: "Ctrl+Space",
		HistoryLimit:   100,
	}
	_, err = srv.UpdateSettings(newSettings, func() {})
	if err != nil {
		t.Fatalf("UpdateSettings failed: %v", err)
	}

	// Assert
	if hotkey.lastShortcut != "Ctrl+Space" {
		t.Errorf("Expected hotkey to be 'Ctrl+Space', got %v", hotkey.lastShortcut)
	}
	if trimmer.lastLimit != 100 {
		t.Errorf("Expected trimmer limit to be 100, got %v", trimmer.lastLimit)
	}
}
