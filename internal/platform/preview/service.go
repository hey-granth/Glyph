package preview

import (
	"encoding/json"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/granthio/glyph/internal/domain"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

func (s *Service) FromItem(item domain.ClipboardItem) domain.Preview {
	switch item.Type {
	case domain.ItemTypeMarkdown:
		return domain.Preview{Kind: domain.PreviewKindMarkdown, Summary: summarize(item.TextContent, 220), Body: item.TextContent}
	case domain.ItemTypeCode:
		return domain.Preview{Kind: domain.PreviewKindCode, Summary: summarize(item.TextContent, 220), Body: item.TextContent}
	case domain.ItemTypeImage:
		return domain.Preview{Kind: domain.PreviewKindImage, Summary: "Captured image", ThumbnailPath: item.StoragePath}
	case domain.ItemTypePDF:
		return domain.Preview{Kind: domain.PreviewKindPDF, Summary: filepath.Base(item.FilePath), Body: item.FilePath}
	case domain.ItemTypeURL:
		return domain.Preview{Kind: domain.PreviewKindURL, Summary: summarize(item.TextContent, 120), Body: item.TextContent}
	case domain.ItemTypeJSON:
		return domain.Preview{Kind: domain.PreviewKindJSON, Summary: summarize(item.TextContent, 220), Body: prettyJSON(item.TextContent)}
	case domain.ItemTypeFile:
		return domain.Preview{Kind: domain.PreviewKindFile, Summary: filepath.Base(item.FilePath), Body: item.FilePath}
	case domain.ItemTypeFolder:
		return domain.Preview{Kind: domain.PreviewKindFolder, Summary: filepath.Base(item.FilePath), Body: item.FilePath}
	default:
		return domain.Preview{Kind: domain.PreviewKindText, Summary: summarize(item.TextContent, 220), Body: item.TextContent}
	}
}

func DetectType(text string, filePath string, hasImage bool) domain.ClipboardItemType {
	if hasImage {
		return domain.ItemTypeImage
	}
	if filePath != "" {
		ext := strings.ToLower(filepath.Ext(filePath))
		if ext == ".pdf" {
			return domain.ItemTypePDF
		}
		return domain.ItemTypeFile
	}
	trimmed := strings.TrimSpace(text)
	if trimmed == "" {
		return domain.ItemTypeText
	}
	if strings.HasPrefix(trimmed, "http://") || strings.HasPrefix(trimmed, "https://") {
		return domain.ItemTypeURL
	}
	if json.Valid([]byte(trimmed)) {
		return domain.ItemTypeJSON
	}
	if strings.Contains(trimmed, "```") || codePattern.MatchString(trimmed) {
		return domain.ItemTypeCode
	}
	if markdownPattern.MatchString(trimmed) {
		return domain.ItemTypeMarkdown
	}
	return domain.ItemTypeText
}

var markdownPattern = regexp.MustCompile(`(?m)^(#|\* |- |\d+\. )`)
var codePattern = regexp.MustCompile(`(?m)(func\s+\w+|const\s+\w+|class\s+\w+|import\s+[\w{*])`)

func summarize(value string, limit int) string {
	compact := strings.Join(strings.Fields(value), " ")
	if len(compact) <= limit {
		return compact
	}
	return compact[:limit] + "…"
}

func prettyJSON(value string) string {
	var decoded any
	if err := json.Unmarshal([]byte(value), &decoded); err != nil {
		return value
	}
	output, err := json.MarshalIndent(decoded, "", "  ")
	if err != nil {
		return value
	}
	return string(output)
}
