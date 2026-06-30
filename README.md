# Glyph

Glyph is a local-first clipboard workspace for Windows and Linux built with Go, Wails, React, TypeScript, TailwindCSS, SQLite FTS5, and TOML configuration.

It is designed to sit quietly in the background, capture clipboard changes, index them instantly, and present them through a premium keyboard-first interface when invoked.

## Principles

- Local-first
- Offline-only
- Zero telemetry
- Zero analytics
- Zero cloud dependencies
- Keyboard-first
- Privacy-centric by default

## MVP Scope

- Clipboard history for text and images with deduplication and timestamps
- FTS5-backed instant search
- Favorites, tags, collections, and recent sorting
- Rich previews for text, markdown, code, JSON, URLs, files, folders, and images
- Local OCR via `tesseract` when available
- Context-aware quick actions
- Private mode, pause history, app ignore list, manual delete, and clear history
- Customizable settings stored in TOML

## Project Layout

- `main.go`: Wails entrypoint
- `internal/app`: desktop app orchestration and Wails bindings
- `internal/config`: TOML config load/save
- `internal/domain`: shared domain models
- `internal/platform`: clipboard, preview, OCR, hotkey, and tray adapters
- `internal/services`: business logic services
- `internal/storage/sqlite`: SQLite schema, migrations, repository, FTS5 search
- `frontend`: React, TypeScript, Vite, and Tailwind desktop UI
- `docs`: architecture, development, and shortcut documentation

## Development

### Prerequisites

- Go 1.26+
- Node.js 20+
- npm 10+
- Wails CLI v2
- `tesseract` in `PATH` for OCR support

### Install

```bash
go mod tidy
cd frontend
npm install
cd ..
```

### Run

```bash
wails dev
```

### Build

```bash
wails build
```

## Notes

- The repository is Wails-compatible, but the `wails` CLI was not installed in this environment during implementation, so full packaging was not executed here.
- The clipboard monitor uses `golang.design/x/clipboard` polling for a portable local-first baseline.
- OCR gracefully disables itself when `tesseract` is unavailable.

See [Architecture](./docs/ARCHITECTURE.md), [Development](./docs/DEVELOPMENT.md), and [Keyboard Shortcuts](./docs/KEYBOARD_SHORTCUTS.md).
