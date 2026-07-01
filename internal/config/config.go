package config

import (
	"errors"
	"os"
	"path/filepath"

	"github.com/hey-granth/Glyph/internal/domain"
	"github.com/pelletier/go-toml/v2"
)

type Config struct {
	Storage struct {
		RootDir      string `toml:"root_dir"`
		DatabasePath string `toml:"database_path"`
		AssetsDir    string `toml:"assets_dir"`
	} `toml:"storage"`
	Privacy struct {
		IgnoreApplications []string `toml:"ignore_applications"`
		PrivateMode        bool     `toml:"private_mode"`
		PauseHistory       bool     `toml:"pause_history"`
	} `toml:"privacy"`
	Features struct {
		OCREnabled bool `toml:"ocr_enabled"`
	} `toml:"features"`
	UI struct {
		Theme          string `toml:"theme"`
		GlobalShortcut string `toml:"global_shortcut"`
		LargeText      bool   `toml:"large_text"`
		HighContrast   bool   `toml:"high_contrast"`
	} `toml:"ui"`
	History struct {
		Limit int `toml:"limit"`
	} `toml:"history"`
	Window struct {
		Width  int `toml:"width"`
		Height int `toml:"height"`
		X      int `toml:"x"`
		Y      int `toml:"y"`
	} `toml:"window"`
}

func Load() (*Config, error) {
	root, err := defaultRootDir()
	if err != nil {
		return nil, err
	}

	cfgPath := filepath.Join(root, "config.toml")
	cfg := defaultConfig(root)

	if _, err := os.Stat(cfgPath); errors.Is(err, os.ErrNotExist) {
		if err := os.MkdirAll(root, 0o755); err != nil {
			return nil, err
		}
		if err := cfg.Save(); err != nil {
			return nil, err
		}
		return cfg, nil
	}

	data, err := os.ReadFile(cfgPath)
	if err != nil {
		return nil, err
	}
	if err := toml.Unmarshal(data, cfg); err != nil {
		return nil, err
	}
	return cfg, cfg.ensureDirs()
}

func defaultRootDir() (string, error) {
	base, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}
	return filepath.Join(base, ".glyph"), nil
}

func defaultConfig(root string) *Config {
	cfg := &Config{}
	cfg.Storage.RootDir = root
	cfg.Storage.DatabasePath = filepath.Join(root, "glyph.db")
	cfg.Storage.AssetsDir = filepath.Join(root, "assets")
	cfg.Privacy.IgnoreApplications = []string{"1Password", "Bitwarden", "KeePassXC"}
	cfg.Features.OCREnabled = true
	cfg.UI.Theme = "graphite"
	cfg.UI.GlobalShortcut = "Ctrl+Shift+Space"
	cfg.History.Limit = 0
	cfg.Window.Width = 1360
	cfg.Window.Height = 860
	return cfg
}

func (c *Config) Save() error {
	if err := c.ensureDirs(); err != nil {
		return err
	}
	payload, err := toml.Marshal(c)
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(c.Storage.RootDir, "config.toml"), payload, 0o644)
}

func (c *Config) EnsureStoragePath(name string) string {
	return filepath.Join(c.Storage.AssetsDir, name)
}

func (c *Config) DomainSettings() domain.Settings {
	return domain.Settings{
		LaunchOnBoot:       false,
		Theme:              c.UI.Theme,
		GlobalShortcut:     c.UI.GlobalShortcut,
		HistoryLimit:       c.History.Limit,
		OCREnabled:         c.Features.OCREnabled,
		PrivateMode:        c.Privacy.PrivateMode,
		PauseHistory:       c.Privacy.PauseHistory,
		IgnoreApplications: c.Privacy.IgnoreApplications,
		StorageDirectory:   c.Storage.RootDir,
		LargeText:          c.UI.LargeText,
		HighContrast:       c.UI.HighContrast,
	}
}

func (c *Config) ApplySettings(settings domain.Settings) {
	c.UI.Theme = settings.Theme
	c.UI.GlobalShortcut = settings.GlobalShortcut
	c.History.Limit = settings.HistoryLimit
	c.Features.OCREnabled = settings.OCREnabled
	c.Privacy.PrivateMode = settings.PrivateMode
	c.Privacy.PauseHistory = settings.PauseHistory
	c.Privacy.IgnoreApplications = settings.IgnoreApplications
	c.UI.LargeText = settings.LargeText
	c.UI.HighContrast = settings.HighContrast
	if settings.StorageDirectory != "" && settings.StorageDirectory != c.Storage.RootDir {
		c.Storage.RootDir = settings.StorageDirectory
		c.Storage.DatabasePath = filepath.Join(settings.StorageDirectory, "glyph.db")
		c.Storage.AssetsDir = filepath.Join(settings.StorageDirectory, "assets")
	}
}

func (c *Config) ensureDirs() error {
	if err := os.MkdirAll(c.Storage.RootDir, 0o755); err != nil {
		return err
	}
	return os.MkdirAll(c.Storage.AssetsDir, 0o755)
}
