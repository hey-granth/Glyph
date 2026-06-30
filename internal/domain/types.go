package domain

import "time"

type ClipboardItemType string

const (
	ItemTypeText     ClipboardItemType = "text"
	ItemTypeMarkdown ClipboardItemType = "markdown"
	ItemTypeCode     ClipboardItemType = "code"
	ItemTypeRichText ClipboardItemType = "richtext"
	ItemTypeImage    ClipboardItemType = "image"
	ItemTypeFile     ClipboardItemType = "file"
	ItemTypeFolder   ClipboardItemType = "folder"
	ItemTypePDF      ClipboardItemType = "pdf"
	ItemTypeURL      ClipboardItemType = "url"
	ItemTypeJSON     ClipboardItemType = "json"
)

type PreviewKind string

const (
	PreviewKindText     PreviewKind = "text"
	PreviewKindMarkdown PreviewKind = "markdown"
	PreviewKindCode     PreviewKind = "code"
	PreviewKindImage    PreviewKind = "image"
	PreviewKindPDF      PreviewKind = "pdf"
	PreviewKindURL      PreviewKind = "url"
	PreviewKindJSON     PreviewKind = "json"
	PreviewKindFile     PreviewKind = "file"
	PreviewKindFolder   PreviewKind = "folder"
)

type Preview struct {
	Kind          PreviewKind `json:"kind"`
	Summary       string      `json:"summary"`
	Body          string      `json:"body"`
	ThumbnailPath string      `json:"thumbnailPath"`
}

type ClipboardItem struct {
	ID           string            `json:"id"`
	Type         ClipboardItemType `json:"type"`
	Title        string            `json:"title"`
	TextContent  string            `json:"textContent"`
	RichText     string            `json:"richText"`
	FilePath     string            `json:"filePath"`
	StoragePath  string            `json:"storagePath"`
	SourceApp    string            `json:"sourceApp"`
	Hash         string            `json:"hash"`
	CopyCount    int               `json:"copyCount"`
	Favorite     bool              `json:"favorite"`
	OCRText      string            `json:"ocrText"`
	Metadata     string            `json:"metadata"`
	Preview      Preview           `json:"preview"`
	Tags         []Tag             `json:"tags"`
	Collections  []Collection      `json:"collections"`
	CreatedAt    time.Time         `json:"createdAt"`
	UpdatedAt    time.Time         `json:"updatedAt"`
	LastCopiedAt time.Time         `json:"lastCopiedAt"`
}

type Tag struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type Collection struct {
	ID   string `json:"id"`
	Name string `json:"name"`
}

type SearchQuery struct {
	Term     string              `json:"term"`
	Types    []ClipboardItemType `json:"types"`
	DateFrom *time.Time          `json:"dateFrom"`
	DateTo   *time.Time          `json:"dateTo"`
	Limit    int                 `json:"limit"`
}

type Settings struct {
	LaunchOnBoot       bool     `json:"launchOnBoot"`
	Theme              string   `json:"theme"`
	GlobalShortcut     string   `json:"globalShortcut"`
	HistoryLimit       int      `json:"historyLimit"`
	OCREnabled         bool     `json:"ocrEnabled"`
	PrivateMode        bool     `json:"privateMode"`
	PauseHistory       bool     `json:"pauseHistory"`
	IgnoreApplications []string `json:"ignoreApplications"`
	StorageDirectory   string   `json:"storageDirectory"`
	LargeText          bool     `json:"largeText"`
	HighContrast       bool     `json:"highContrast"`
}

type BootstrapPayload struct {
	Items       []ClipboardItem `json:"items"`
	Tags        []Tag           `json:"tags"`
	Collections []Collection    `json:"collections"`
	Settings    Settings        `json:"settings"`
}
