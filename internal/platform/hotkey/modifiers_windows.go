//go:build windows

package hotkey

import (
	"strings"

	xhotkey "golang.design/x/hotkey"
)

// modifierFromString maps modifier names to Windows modifier flags.
// On Windows, Alt = ModAlt, Super/Win = ModWin.
func modifierFromString(s string) (xhotkey.Modifier, bool) {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "ctrl", "control":
		return xhotkey.ModCtrl, true
	case "shift":
		return xhotkey.ModShift, true
	case "alt", "option":
		return xhotkey.ModAlt, true
	case "super", "win", "cmd", "command", "meta":
		return xhotkey.ModWin, true
	default:
		return 0, false
	}
}
