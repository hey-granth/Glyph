package services

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type StorageService struct {
	logger *slog.Logger
	cfg    *config.Config
	ctx    context.Context
}

func NewStorageService(logger *slog.Logger, cfg *config.Config) *StorageService {
	return &StorageService{
		logger: logger,
		cfg:    cfg,
	}
}

func (s *StorageService) Start(ctx context.Context) {
	s.ctx = ctx
}

// MigrateDirectory moves the database and assets to a new directory, then restarts
// the connection. Not fully implemented in prototype phase.
func (s *StorageService) MigrateDirectory(newPath string) error {
	// 1. Verify directory exists and is writable
	info, err := os.Stat(newPath)
	if err != nil {
		if os.IsNotExist(err) {
			if err := os.MkdirAll(newPath, 0755); err != nil {
				return fmt.Errorf("failed to create new storage directory: %w", err)
			}
		} else {
			return fmt.Errorf("failed to stat new storage directory: %w", err)
		}
	} else if !info.IsDir() {
		return fmt.Errorf("path is not a directory: %s", newPath)
	}

	// 2. Here we would typically:
	// - Pause clipboard monitoring
	// - Close SQLite connection
	// - Copy files to new path
	// - Reopen SQLite connection
	// - Update Config
	// - Resume monitoring
	
	s.logger.Info("Storage migration requested", "newPath", newPath)

	// Since we cannot safely close and reopen the global DB pool without passing it
	// around, we'll notify the user to restart the application for now.
	if s.ctx != nil {
		runtime.MessageDialog(s.ctx, runtime.MessageDialogOptions{
			Type:          runtime.InfoDialog,
			Title:         "Restart Required",
			Message:       "The storage location has been changed. Please restart Glyph for the changes to take effect securely.",
			DefaultButton: "OK",
		})
	}

	return nil
}

// CopyFile is a utility for migrating files.
func (s *StorageService) CopyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	if _, err = io.Copy(out, in); err != nil {
		return err
	}
	return out.Sync()
}
