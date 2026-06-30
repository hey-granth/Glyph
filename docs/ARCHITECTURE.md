# Architecture

Glyph uses a clean architecture split between orchestration, domain, infrastructure, and UI.

## Layers

- UI
  - Wails window hosting the React desktop client
  - Keyboard-first search, list, preview, actions, and settings flows
- Application
  - `internal/app` exposes Wails bindings and coordinates startup, window behavior, and event emission
- Business Logic
  - `internal/services` handles clipboard processing, deduplication, preview generation, OCR enrichment, and persistence flow
- Infrastructure
  - `internal/storage/sqlite` owns schema, migrations, FTS5 indexing, and repository queries
  - `internal/platform` owns environment-specific adapters
- Configuration
  - `internal/config` persists TOML settings inside the local storage root

## Clipboard Pipeline

1. Clipboard monitor polls local clipboard formats.
2. Captured content is hashed for duplicate detection.
3. Processor classifies the item type.
4. Preview generator derives preview kind, summary, and body.
5. OCR extracts searchable text for images when enabled.
6. Repository upserts the item and updates the FTS5 index.
7. Wails emits `history:updated` to the React client.

## Storage

- SQLite runs in WAL mode for responsive reads while writes continue.
- `items` stores canonical clipboard records.
- `items_fts` stores searchable title, body, OCR text, and metadata.
- Tag and collection tables keep organization separate from the core item record.
- Binary assets such as captured images are stored in the configured local assets directory.

## Extensibility

- Platform concerns are hidden behind small interfaces.
- The repository contract keeps services testable.
- Future plugin hooks can attach at the processor, preview, or action layers without coupling to the UI.
