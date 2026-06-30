package sqlite

import (
	"context"
	"testing"

	"github.com/granthio/glyph/internal/domain"
)

func TestRepositoryUpsertAndSearch(t *testing.T) {
	store, err := Open(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	defer store.Close()

	repo := NewRepository(store.DB)
	ctx := context.Background()

	item := domain.ClipboardItem{
		ID:          "1",
		Type:        domain.ItemTypeMarkdown,
		Title:       "Release plan",
		TextContent: "# Release\n\nShip the build",
		Hash:        "hash-1",
		Metadata:    "{}",
		Preview: domain.Preview{
			Kind:    domain.PreviewKindMarkdown,
			Summary: "Release plan",
			Body:    "# Release\n\nShip the build",
		},
	}

	if _, err := repo.UpsertItem(ctx, item); err != nil {
		t.Fatalf("upsert item: %v", err)
	}

	results, err := repo.Search(ctx, domain.SearchQuery{
		Term:  "Release",
		Types: []domain.ClipboardItemType{domain.ItemTypeMarkdown},
		Limit: 50,
	})
	if err != nil {
		t.Fatalf("search: %v", err)
	}
	if len(results) != 1 {
		t.Fatalf("expected 1 result, got %d", len(results))
	}
	if results[0].Title != item.Title {
		t.Fatalf("unexpected item title: %s", results[0].Title)
	}
}
