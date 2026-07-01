package ocr

import (
	"context"
	"log/slog"
	"os"
	"os/exec"

	"github.com/hey-granth/Glyph/internal/config"
)

type Service struct {
	logger *slog.Logger
	config *config.Config
}

func NewService(logger *slog.Logger, cfg *config.Config) *Service {
	return &Service{logger: logger, config: cfg}
}

func (s *Service) ExtractText(ctx context.Context, imagePath string) string {
	if !s.config.Features.OCREnabled {
		return ""
	}
	if _, err := exec.LookPath("tesseract"); err != nil {
		return ""
	}
	if _, err := os.Stat(imagePath); err != nil {
		return ""
	}
	cmd := exec.CommandContext(ctx, "tesseract", imagePath, "stdout", "--dpi", "300")
	output, err := cmd.Output()
	if err != nil {
		s.logger.Warn("ocr failed", "error", err)
		return ""
	}
	return string(output)
}
