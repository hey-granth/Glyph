# Development Guide

## Commands

```bash
go test ./...
cd frontend && npm install && npm run build
wails dev
wails build
```

## Environment

- Config and local data default to `~/.glyph`
- Images are stored under `~/.glyph/assets`
- OCR requires the `tesseract` executable in `PATH`

## Frontend Workflow

- `frontend/src/lib/bridge.ts` abstracts Wails bindings and supports browser-only mock data during UI work.
- `frontend/src/hooks/use-workspace.ts` centralizes search, selection, history updates, and settings state.
- Motion is intentionally subtle and concentrated in search, history row entry, and preview transitions.

## Backend Workflow

- `internal/services/processor.go` is the clipboard ingestion entrypoint.
- `internal/platform/preview/service.go` owns item classification and preview shaping.
- `internal/storage/sqlite/repository.go` owns FTS5 search and deduplicated upserts.

## Testing

- Unit tests cover preview classification and repository persistence/search.
- Additional platform-specific integration tests should be added once native hotkey and tray adapters replace the current no-op adapters.
