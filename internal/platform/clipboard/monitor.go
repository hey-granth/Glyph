package clipboard

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"log/slog"
	"time"

	cliplib "golang.design/x/clipboard"
)

type Capture struct {
	Text      string
	Image     []byte
	SourceApp string
	Hash      string
}

type Handler func(context.Context, Capture)

type Monitor struct {
	logger   *slog.Logger
	lastHash string
}

func NewMonitor(logger *slog.Logger) *Monitor {
	return &Monitor{logger: logger}
}

func (m *Monitor) Start(ctx context.Context, handler Handler) error {
	if err := cliplib.Init(); err != nil {
		return err
	}
	ticker := time.NewTicker(700 * time.Millisecond)
	go func() {
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				capture := Capture{
					Text:  string(cliplib.Read(cliplib.FmtText)),
					Image: cliplib.Read(cliplib.FmtImage),
				}
				if len(capture.Image) == 0 && capture.Text == "" {
					continue
				}
				hashBytes := sha256.Sum256(append([]byte(capture.Text), capture.Image...))
				capture.Hash = hex.EncodeToString(hashBytes[:])
				if capture.Hash == m.lastHash {
					continue
				}
				m.lastHash = capture.Hash
				handler(ctx, capture)
			}
		}
	}()
	return nil
}
