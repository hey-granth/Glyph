package preview

import (
	"testing"

	"github.com/granthio/glyph/internal/domain"
)

func TestDetectType(t *testing.T) {
	tests := []struct {
		name string
		text string
		want domain.ClipboardItemType
	}{
		{name: "url", text: "https://example.com", want: domain.ItemTypeURL},
		{name: "json", text: `{"ok":true}`, want: domain.ItemTypeJSON},
		{name: "markdown", text: "# Header\n\n- list", want: domain.ItemTypeMarkdown},
		{name: "code", text: "func main() {}", want: domain.ItemTypeCode},
		{name: "plain", text: "hello world", want: domain.ItemTypeText},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := DetectType(test.text, "", false); got != test.want {
				t.Fatalf("DetectType() = %s, want %s", got, test.want)
			}
		})
	}
}

func TestPrettyJSON(t *testing.T) {
	value := prettyJSON(`{"name":"glyph","enabled":true}`)
	if value == `{"name":"glyph","enabled":true}` {
		t.Fatal("expected pretty JSON output")
	}
}
