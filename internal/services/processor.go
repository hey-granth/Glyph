package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/hey-granth/Glyph/internal/config"
	"github.com/hey-granth/Glyph/internal/domain"
	"github.com/hey-granth/Glyph/internal/platform/clipboard"
	"github.com/hey-granth/Glyph/internal/platform/ocr"
	"github.com/hey-granth/Glyph/internal/platform/preview"
)

type Repository interface {
	UpsertItem(context.Context, domain.ClipboardItem) (domain.ClipboardItem, error)
}

type ClipboardProcessor struct {
	logger    *slog.Logger
	config    *config.Config
	repo      Repository
	previewer *preview.Service
	ocr       *ocr.Service
}

func NewClipboardProcessor(logger *slog.Logger, cfg *config.Config, repo Repository, previewer *preview.Service, ocrService *ocr.Service) *ClipboardProcessor {
	return &ClipboardProcessor{logger: logger, config: cfg, repo: repo, previewer: previewer, ocr: ocrService}
}

func (p *ClipboardProcessor) Process(ctx context.Context, capture clipboard.Capture) (domain.ClipboardItem, error) {
	if p.config.Privacy.PrivateMode || p.config.Privacy.PauseHistory {
		return domain.ClipboardItem{}, nil
	}

	item := domain.ClipboardItem{
		ID:          newID(),
		TextContent: strings.TrimSpace(capture.Text),
		SourceApp:   capture.SourceApp,
		Hash:        capture.Hash,
		Metadata:    "{}",
	}

	if len(capture.Image) > 0 {
		storagePath := p.config.EnsureStoragePath(item.ID + ".png")
		if err := os.WriteFile(storagePath, capture.Image, 0o644); err == nil {
			item.StoragePath = storagePath
			item.OCRText = strings.TrimSpace(p.ocr.ExtractText(ctx, storagePath))
		}
	}

	item.Type = preview.DetectType(item.TextContent, item.FilePath, len(capture.Image) > 0)
	item.Title = deriveTitle(item)
	item.Preview = p.previewer.FromItem(item)
	stored, err := p.repo.UpsertItem(ctx, item)
	if err != nil {
		return domain.ClipboardItem{}, err
	}
	p.logger.Info("clipboard item processed", "id", stored.ID, "type", stored.Type, "at", time.Now().UTC())
	return stored, nil
}

func deriveTitle(item domain.ClipboardItem) string {
	switch item.Type {
	case domain.ItemTypeImage:
		return "Image capture"
	case domain.ItemTypeURL:
		return item.TextContent
	default:
		if item.TextContent == "" {
			return filepath.Base(item.FilePath)
		}
		summary := strings.Join(strings.Fields(item.TextContent), " ")
		if len(summary) > 72 {
			return summary[:72] + "…"
		}
		return summary
	}
}

func newID() string {
	var raw [16]byte
	_, _ = rand.Read(raw[:])
	return hex.EncodeToString(raw[:])
}
