/** Glass Wave is the single application theme, shared by every surface. */
export const DEFAULT_SETTINGS = Object.freeze({
  theme: "glass-wave",
  darkMode: "system",
  fontSize: "medium",
  columns: 3,
  showFavourites: true,
  showPlanner: true,
  recentCount: 12,
  timerSound: "beep",
  keepScreenOn: false,
  keepScreenOnMins: 30,
  showUnitConversion: false,
  language: "en",
  unitSystem: "imperial",
});

/** Migrate a removed palette without discarding unrelated user preferences.
 * Persisted settings remain scoped to the authenticated actor on the server;
 * this function never reads the obsolete shared browser storage keys.
 */
export function normalizeSettings(settings = {}) {
  const source =
    settings && typeof settings === "object" && !Array.isArray(settings)
      ? settings
      : {};
  return {
    ...DEFAULT_SETTINGS,
    ...source,
    theme: "glass-wave",
    darkMode: ["off", "system", "on"].includes(source.darkMode)
      ? source.darkMode
      : DEFAULT_SETTINGS.darkMode,
    fontSize: ["small", "medium", "large"].includes(source.fontSize)
      ? source.fontSize
      : DEFAULT_SETTINGS.fontSize,
    columns: [2, 3, 4, 5, 8, 10].includes(source.columns)
      ? source.columns
      : DEFAULT_SETTINGS.columns,
  };
}

const SHARED_TOKENS = {
  "--rm-font-family":
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  "--rm-font-size-sm": "calc(var(--rm-font-size-base) * 0.875)",
  "--rm-font-size-xs": "max(12px, calc(var(--rm-font-size-base) * 0.8125))",
  "--rm-line-height": "1.55",
  "--rm-touch-target": "44px",
  "--rm-radius": "18px",
  "--rm-radius-sm": "12px",
  "--rm-radius-lg": "24px",
  "--rm-space-1": "4px",
  "--rm-space-2": "8px",
  "--rm-space-3": "12px",
  "--rm-space-4": "16px",
  "--rm-space-5": "24px",
  "--rm-space-6": "32px",
  "--rm-disabled-opacity": "1",
};

// Main and elevated surfaces are opaque, so text contrast never depends on
// the Home Assistant dashboard behind the card. Glass is reserved for chrome.
export const GLASS_WAVE = Object.freeze({
  light: Object.freeze({
    "--rm-bg-canvas": "#e9efed",
    "--rm-bg-main": "#f7f4ed",
    "--rm-bg-surface": "rgba(255, 252, 246, 0.96)",
    "--rm-bg-elevated": "#fffdf8",
    "--rm-dialog-bg": "#fffdf8",
    "--rm-text": "#233b47",
    "--rm-text-secondary": "#4c626c",
    "--rm-text-muted": "#536873",
    "--rm-accent": "#326382",
    "--rm-primary": "#326382",
    "--rm-accent-text": "#ffffff",
    "--rm-accent-soft": "#e2edf1",
    "--rm-border": "#c6d1d0",
    "--rm-border-subtle": "#dce3df",
    "--rm-border-strong": "#738991",
    "--rm-focus": "#326382",
    "--rm-success": "#2e664a",
    "--rm-success-soft": "#e2eee5",
    "--rm-success-text": "#ffffff",
    "--rm-warning": "#765500",
    "--rm-warning-soft": "#f4ebd0",
    "--rm-warning-text": "#ffffff",
    "--rm-danger": "#9b3e2f",
    "--rm-danger-soft": "#f7e6df",
    "--rm-danger-text": "#ffffff",
    "--rm-error": "#9b3e2f",
    "--rm-error-soft": "#f7e6df",
    "--rm-error-text": "#ffffff",
    "--rm-disabled-bg": "#e4e6e0",
    "--rm-disabled-text": "#536873",
    "--rm-shadow": "0 8px 28px rgba(35, 59, 71, 0.08)",
    "--rm-glass-highlight": "rgba(255, 255, 255, 0.7)",
  }),
  dark: Object.freeze({
    "--rm-bg-canvas": "#101e25",
    "--rm-bg-main": "#14262f",
    "--rm-bg-surface": "rgba(28, 49, 60, 0.97)",
    "--rm-bg-elevated": "#213c48",
    "--rm-dialog-bg": "#213c48",
    "--rm-text": "#f1f5f3",
    "--rm-text-secondary": "#c0d0d6",
    "--rm-text-muted": "#b3c7d0",
    "--rm-accent": "#9ccce2",
    "--rm-primary": "#9ccce2",
    "--rm-accent-text": "#163442",
    "--rm-accent-soft": "#294957",
    "--rm-border": "#43616d",
    "--rm-border-subtle": "#304d59",
    "--rm-border-strong": "#7e9aa7",
    "--rm-focus": "#b6e1ef",
    "--rm-success": "#a6d9b7",
    "--rm-success-soft": "#244837",
    "--rm-success-text": "#173524",
    "--rm-warning": "#ecd28d",
    "--rm-warning-soft": "#494021",
    "--rm-warning-text": "#382b0e",
    "--rm-danger": "#ffb9a7",
    "--rm-danger-soft": "#55352f",
    "--rm-danger-text": "#47251d",
    "--rm-error": "#ffb9a7",
    "--rm-error-soft": "#55352f",
    "--rm-error-text": "#47251d",
    "--rm-disabled-bg": "#2a414b",
    "--rm-disabled-text": "#b3c7d0",
    "--rm-shadow": "0 8px 28px rgba(0, 0, 0, 0.22)",
    "--rm-glass-highlight": "rgba(216, 239, 245, 0.06)",
  }),
});

export function getGlassWaveTokens(settings = {}, systemDark = false) {
  const normalized = normalizeSettings(settings);
  const dark =
    normalized.darkMode === "on" ||
    (normalized.darkMode === "system" && systemDark);
  return {
    ...SHARED_TOKENS,
    ...GLASS_WAVE[dark ? "dark" : "light"],
    "--rm-font-size-base": { small: "14px", medium: "16px", large: "18px" }[
      normalized.fontSize
    ],
    "--rm-grid-columns": `repeat(${normalized.columns}, minmax(0, 1fr))`,
  };
}

export function applyGlassWaveTheme(
  element,
  settings = {},
  systemDark = false,
) {
  const normalized = normalizeSettings(settings);
  const appearance =
    normalized.darkMode === "on" ||
    (normalized.darkMode === "system" && systemDark)
      ? "dark"
      : "light";
  for (const [name, value] of Object.entries(
    getGlassWaveTokens(normalized, systemDark),
  )) {
    element.style.setProperty(name, value);
  }
  element.toggleAttribute("glass-wave", true);
  element.setAttribute("data-appearance", appearance);
  element.style.colorScheme = appearance;
}
