/**
 * ThemeManager — Applies design token overrides to document.documentElement
 * based on user settings. This is the single place where settings produce
 * visible changes.
 *
 * Strategy:
 *  - Large Text  → sets a CSS class that bumps :root font-size to 114%
 *  - High Contrast → sets a CSS class that overrides opacity-based text dims
 *  - Theme       → sets data-theme attribute for future theme expansion
 */

import type { Settings } from './types';

/** Apply all theme-affecting settings to the document root. */
export function applyTheme(settings: Settings): void {
  const root = document.documentElement;

  // Large Text: 14% larger base → all rem-based sizes scale accordingly
  root.classList.toggle('glyph-large-text', settings.largeText);

  // High Contrast: override dim text opacities
  root.classList.toggle('glyph-high-contrast', settings.highContrast);

  // Theme attribute — future-proof for additional themes
  root.setAttribute('data-theme', settings.theme || 'graphite');
}
