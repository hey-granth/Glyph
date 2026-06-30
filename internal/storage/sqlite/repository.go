package sqlite

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/granthio/glyph/internal/domain"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Bootstrap(ctx context.Context, settings domain.Settings) (domain.BootstrapPayload, error) {
	items, err := r.ListRecent(ctx, 200)
	if err != nil {
		return domain.BootstrapPayload{}, err
	}
	tags, err := r.ListTags(ctx)
	if err != nil {
		return domain.BootstrapPayload{}, err
	}
	collections, err := r.ListCollections(ctx)
	if err != nil {
		return domain.BootstrapPayload{}, err
	}
	return domain.BootstrapPayload{Items: items, Tags: tags, Collections: collections, Settings: settings}, nil
}

func (r *Repository) UpsertItem(ctx context.Context, item domain.ClipboardItem) (domain.ClipboardItem, error) {
	var existingID string
	err := r.db.QueryRowContext(ctx, `SELECT id FROM items WHERE hash = ?`, item.Hash).Scan(&existingID)
	now := time.Now().UTC()
	if err == nil {
		_, err = r.db.ExecContext(ctx, `
			UPDATE items
			SET title = ?, text_content = ?, rich_text = ?, file_path = ?, storage_path = ?, source_app = ?,
				ocr_text = ?, metadata = ?, preview_kind = ?, preview_summary = ?, preview_body = ?,
				thumbnail_path = ?, copy_count = copy_count + 1, updated_at = ?, last_copied_at = ?
			WHERE id = ?`,
			item.Title, item.TextContent, item.RichText, item.FilePath, item.StoragePath, item.SourceApp,
			item.OCRText, item.Metadata, string(item.Preview.Kind), item.Preview.Summary, item.Preview.Body,
			item.Preview.ThumbnailPath, now, now, existingID,
		)
		if err != nil {
			return domain.ClipboardItem{}, err
		}
		return r.GetItem(ctx, existingID)
	}
	if err != sql.ErrNoRows {
		return domain.ClipboardItem{}, err
	}

	item.CreatedAt = now
	item.UpdatedAt = now
	item.LastCopiedAt = now
	item.CopyCount = 1

	_, err = r.db.ExecContext(ctx, `
		INSERT INTO items (
			id, type, title, text_content, rich_text, file_path, storage_path, source_app, hash,
			copy_count, favorite, ocr_text, metadata, preview_kind, preview_summary, preview_body,
			thumbnail_path, created_at, updated_at, last_copied_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		item.ID, string(item.Type), item.Title, item.TextContent, item.RichText, item.FilePath, item.StoragePath,
		item.SourceApp, item.Hash, item.CopyCount, boolToInt(item.Favorite), item.OCRText, item.Metadata,
		string(item.Preview.Kind), item.Preview.Summary, item.Preview.Body, item.Preview.ThumbnailPath,
		item.CreatedAt, item.UpdatedAt, item.LastCopiedAt,
	)
	if err != nil {
		return domain.ClipboardItem{}, err
	}
	return item, nil
}

func (r *Repository) ListRecent(ctx context.Context, limit int) ([]domain.ClipboardItem, error) {
	if limit <= 0 {
		limit = 200
	}
	rows, err := r.db.QueryContext(ctx, baseSelect()+` ORDER BY last_copied_at DESC LIMIT ?`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItems(rows)
}

func (r *Repository) Search(ctx context.Context, query domain.SearchQuery) ([]domain.ClipboardItem, error) {
	if query.Limit <= 0 {
		query.Limit = 200
	}

	args := []any{}
	sqlBuilder := strings.Builder{}
	sqlBuilder.WriteString(baseSelect())

	if strings.TrimSpace(query.Term) != "" {
		sqlBuilder.WriteString(` JOIN items_fts ON items_fts.rowid = items.rowid WHERE items_fts MATCH ?`)
		args = append(args, escapeFTS5(query.Term))
	} else {
		sqlBuilder.WriteString(` WHERE 1=1`)
	}

	if len(query.Types) > 0 {
		placeholders := make([]string, 0, len(query.Types))
		for _, itemType := range query.Types {
			placeholders = append(placeholders, "?")
			args = append(args, string(itemType))
		}
		sqlBuilder.WriteString(` AND items.type IN (` + strings.Join(placeholders, ",") + `)`)
	}

	if query.DateFrom != nil {
		sqlBuilder.WriteString(` AND items.last_copied_at >= ?`)
		args = append(args, query.DateFrom.UTC())
	}
	if query.DateTo != nil {
		sqlBuilder.WriteString(` AND items.last_copied_at <= ?`)
		args = append(args, query.DateTo.UTC())
	}

	sqlBuilder.WriteString(` ORDER BY items.last_copied_at DESC LIMIT ?`)
	args = append(args, query.Limit)
	rows, err := r.db.QueryContext(ctx, sqlBuilder.String(), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItems(rows)
}

func (r *Repository) GetItem(ctx context.Context, id string) (domain.ClipboardItem, error) {
	rows, err := r.db.QueryContext(ctx, baseSelect()+` WHERE items.id = ?`, id)
	if err != nil {
		return domain.ClipboardItem{}, err
	}
	defer rows.Close()
	items, err := scanItems(rows)
	if err != nil {
		return domain.ClipboardItem{}, err
	}
	if len(items) == 0 {
		return domain.ClipboardItem{}, sql.ErrNoRows
	}
	return items[0], nil
}

func (r *Repository) ToggleFavorite(ctx context.Context, id string) (domain.ClipboardItem, error) {
	_, err := r.db.ExecContext(ctx, `UPDATE items SET favorite = CASE favorite WHEN 1 THEN 0 ELSE 1 END, updated_at = ? WHERE id = ?`, time.Now().UTC(), id)
	if err != nil {
		return domain.ClipboardItem{}, err
	}
	return r.GetItem(ctx, id)
}

func (r *Repository) DeleteItem(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM items WHERE id = ?`, id)
	return err
}

func (r *Repository) ClearHistory(ctx context.Context) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM items`)
	return err
}

func (r *Repository) ListTags(ctx context.Context) ([]domain.Tag, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, name FROM tags ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tags []domain.Tag
	for rows.Next() {
		var tag domain.Tag
		if err := rows.Scan(&tag.ID, &tag.Name); err != nil {
			return nil, err
		}
		tags = append(tags, tag)
	}
	return tags, rows.Err()
}

func (r *Repository) CreateTag(ctx context.Context, tag domain.Tag) (domain.Tag, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO tags(id, name) VALUES (?, ?)`, tag.ID, tag.Name)
	return tag, err
}

func (r *Repository) AssignTag(ctx context.Context, itemID, tagID string) error {
	_, err := r.db.ExecContext(ctx, `INSERT OR IGNORE INTO item_tags(item_id, tag_id) VALUES (?, ?)`, itemID, tagID)
	return err
}

func (r *Repository) ListCollections(ctx context.Context) ([]domain.Collection, error) {
	rows, err := r.db.QueryContext(ctx, `SELECT id, name FROM collections ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var collections []domain.Collection
	for rows.Next() {
		var collection domain.Collection
		if err := rows.Scan(&collection.ID, &collection.Name); err != nil {
			return nil, err
		}
		collections = append(collections, collection)
	}
	return collections, rows.Err()
}

func (r *Repository) CreateCollection(ctx context.Context, collection domain.Collection) (domain.Collection, error) {
	_, err := r.db.ExecContext(ctx, `INSERT INTO collections(id, name) VALUES (?, ?)`, collection.ID, collection.Name)
	return collection, err
}

func (r *Repository) AssignCollection(ctx context.Context, itemID, collectionID string) error {
	_, err := r.db.ExecContext(ctx, `INSERT OR IGNORE INTO collection_items(item_id, collection_id) VALUES (?, ?)`, itemID, collectionID)
	return err
}

func baseSelect() string {
	return `
	SELECT
		items.id, items.type, items.title, items.text_content, items.rich_text, items.file_path,
		items.storage_path, items.source_app, items.hash, items.copy_count, items.favorite,
		items.ocr_text, items.metadata, items.preview_kind, items.preview_summary, items.preview_body,
		items.thumbnail_path, items.created_at, items.updated_at, items.last_copied_at
	FROM items`
}

func scanItems(rows *sql.Rows) ([]domain.ClipboardItem, error) {
	var items []domain.ClipboardItem
	for rows.Next() {
		var item domain.ClipboardItem
		var itemType string
		var previewKind string
		var favorite int
		err := rows.Scan(
			&item.ID, &itemType, &item.Title, &item.TextContent, &item.RichText, &item.FilePath,
			&item.StoragePath, &item.SourceApp, &item.Hash, &item.CopyCount, &favorite,
			&item.OCRText, &item.Metadata, &previewKind, &item.Preview.Summary, &item.Preview.Body,
			&item.Preview.ThumbnailPath, &item.CreatedAt, &item.UpdatedAt, &item.LastCopiedAt,
		)
		if err != nil {
			return nil, err
		}
		item.Type = domain.ClipboardItemType(itemType)
		item.Preview.Kind = domain.PreviewKind(previewKind)
		item.Favorite = favorite == 1
		items = append(items, item)
	}
	return items, rows.Err()
}

func escapeFTS5(term string) string {
	parts := strings.Fields(term)
	for index, part := range parts {
		parts[index] = fmt.Sprintf(`"%s"*`, strings.ReplaceAll(part, `"`, `""`))
	}
	return strings.Join(parts, " ")
}

func boolToInt(v bool) int {
	if v {
		return 1
	}
	return 0
}
