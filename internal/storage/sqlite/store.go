package sqlite

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type Store struct {
	DB *sql.DB
}

func Open(path string) (*Store, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	if err := migrate(db); err != nil {
		return nil, err
	}
	return &Store{DB: db}, nil
}

func (s *Store) Close() error {
	return s.DB.Close()
}

func migrate(db *sql.DB) error {
	schema := `
	PRAGMA journal_mode = WAL;
	PRAGMA synchronous = NORMAL;
	PRAGMA foreign_keys = ON;

	CREATE TABLE IF NOT EXISTS items (
		id TEXT PRIMARY KEY,
		type TEXT NOT NULL,
		title TEXT NOT NULL,
		text_content TEXT NOT NULL DEFAULT '',
		rich_text TEXT NOT NULL DEFAULT '',
		file_path TEXT NOT NULL DEFAULT '',
		storage_path TEXT NOT NULL DEFAULT '',
		source_app TEXT NOT NULL DEFAULT '',
		hash TEXT NOT NULL UNIQUE,
		copy_count INTEGER NOT NULL DEFAULT 1,
		favorite INTEGER NOT NULL DEFAULT 0,
		ocr_text TEXT NOT NULL DEFAULT '',
		metadata TEXT NOT NULL DEFAULT '{}',
		preview_kind TEXT NOT NULL,
		preview_summary TEXT NOT NULL DEFAULT '',
		preview_body TEXT NOT NULL DEFAULT '',
		thumbnail_path TEXT NOT NULL DEFAULT '',
		created_at DATETIME NOT NULL,
		updated_at DATETIME NOT NULL,
		last_copied_at DATETIME NOT NULL
	);

	CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
		title,
		text_content,
		ocr_text,
		metadata,
		content='items',
		content_rowid='rowid'
	);

	CREATE TRIGGER IF NOT EXISTS items_ai AFTER INSERT ON items BEGIN
		INSERT INTO items_fts(rowid, title, text_content, ocr_text, metadata)
		VALUES (new.rowid, new.title, new.text_content, new.ocr_text, new.metadata);
	END;

	CREATE TRIGGER IF NOT EXISTS items_ad AFTER DELETE ON items BEGIN
		INSERT INTO items_fts(items_fts, rowid, title, text_content, ocr_text, metadata)
		VALUES ('delete', old.rowid, old.title, old.text_content, old.ocr_text, old.metadata);
	END;

	CREATE TRIGGER IF NOT EXISTS items_au AFTER UPDATE ON items BEGIN
		INSERT INTO items_fts(items_fts, rowid, title, text_content, ocr_text, metadata)
		VALUES ('delete', old.rowid, old.title, old.text_content, old.ocr_text, old.metadata);
		INSERT INTO items_fts(rowid, title, text_content, ocr_text, metadata)
		VALUES (new.rowid, new.title, new.text_content, new.ocr_text, new.metadata);
	END;

	CREATE TABLE IF NOT EXISTS tags (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL UNIQUE
	);

	CREATE TABLE IF NOT EXISTS item_tags (
		item_id TEXT NOT NULL,
		tag_id TEXT NOT NULL,
		PRIMARY KEY (item_id, tag_id),
		FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
		FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
	);

	CREATE TABLE IF NOT EXISTS collections (
		id TEXT PRIMARY KEY,
		name TEXT NOT NULL UNIQUE
	);

	CREATE TABLE IF NOT EXISTS collection_items (
		item_id TEXT NOT NULL,
		collection_id TEXT NOT NULL,
		PRIMARY KEY (item_id, collection_id),
		FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE,
		FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
	);
	`
	_, err := db.Exec(schema)
	return err
}
