//go:build linux || openbsd

package hotkey

import (
	"strings"

	xhotkey "golang.design/x/hotkey"
)

// modifierFromString maps modifier names to X11 modifier bitmasks.
// On Linux, Alt = Mod1 (0x8) and Super/Win = Mod4 (0x40).
func modifierFromString(s string) (xhotkey.Modifier, bool) {
	switch strings.ToLower(strings.TrimSpace(s)) {
	case "ctrl", "control":
		return xhotkey.ModCtrl, true
	case "shift":
		return xhotkey.ModShift, true
	case "alt", "option":
		return xhotkey.Mod1, true // Alt on X11
	case "super", "win", "cmd", "command", "meta":
		return xhotkey.Mod4, true // Super on X11
	default:
		return 0, false
	}
}
