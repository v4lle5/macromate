/** Wave Glass Echo: the shared warm glass / Boho palette for every surface. */
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
  unitSystem: "metric",
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
    unitSystem: "metric",
    showUnitConversion: false,
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

// Glass overlays an opaque cream canvas, keeping contrast independent of the
// Home Assistant dashboard. Palette supplied from the Wave Glass Echo theme.
export const GLASS_WAVE = Object.freeze({
  light: Object.freeze({
    "--rm-bg-canvas": "#F9EFDA",
    "--rm-bg-main": "#F9EFDA",
    "--rm-bg-surface": "rgba(253, 248, 239, 0.72)",
    "--rm-bg-elevated": "#FDF8EF",
    "--rm-dialog-bg": "#FDF8EF",
    "--rm-text": "#263B47",
    "--rm-text-secondary": "#53666E",
    "--rm-text-muted": "#53666E",
    "--rm-accent": "#DCCDB8",
    "--rm-primary": "#DCCDB8",
    "--rm-accent-text": "#263B47",
    "--rm-accent-ink": "#263B47",
    "--rm-accent-soft": "#EFE3CE",
    "--rm-border": "#C5CBC7",
    "--rm-border-subtle": "#EFE3CE",
    "--rm-border-strong": "#576C65",
    "--rm-focus": "#576C65",
    "--rm-success": "#576C65",
    "--rm-success-soft": "#C5CBC7",
    "--rm-success-ink": "#263B47",
    "--rm-success-text": "#ffffff",
    "--rm-warning": "#735A1F",
    "--rm-warning-soft": "#EFE3CE",
    "--rm-warning-text": "#ffffff",
    "--rm-danger": "#8C4936",
    "--rm-danger-soft": "#E4A9A3",
    "--rm-danger-text": "#ffffff",
    "--rm-error": "#8C4936",
    "--rm-error-soft": "#E4A9A3",
    "--rm-error-ink": "#263B47",
    "--rm-error-text": "#ffffff",
    "--rm-terracotta": "#B46F52",
    "--rm-rose": "#E4A9A3",
    "--rm-ochre": "#C19A3F",
    "--rm-sage": "#576C65",
    "--rm-disabled-bg": "#EFE3CE",
    "--rm-disabled-text": "#53666E",
    "--rm-shadow": "0 8px 28px rgba(91, 67, 44, 0.10)",
    "--rm-glass-highlight": "rgba(255, 255, 255, 0.7)",
  }),
  dark: Object.freeze({
    "--rm-bg-canvas": "#27231F",
    "--rm-bg-main": "#302A24",
    "--rm-bg-surface": "rgba(61, 52, 43, 0.90)",
    "--rm-bg-elevated": "#40362D",
    "--rm-dialog-bg": "#40362D",
    "--rm-text": "#F9EFDA",
    "--rm-text-secondary": "#DCCDB8",
    "--rm-text-muted": "#C5CBC7",
    "--rm-accent": "#DCCDB8",
    "--rm-primary": "#DCCDB8",
    "--rm-accent-text": "#263B47",
    "--rm-accent-ink": "#DCCDB8",
    "--rm-accent-soft": "#514336",
    "--rm-border": "#776A5A",
    "--rm-border-subtle": "#514336",
    "--rm-border-strong": "#C5CBC7",
    "--rm-focus": "#DCCDB8",
    "--rm-success": "#a6d9b7",
    "--rm-success-soft": "#244837",
    "--rm-success-ink": "#a6d9b7",
    "--rm-success-text": "#173524",
    "--rm-warning": "#ecd28d",
    "--rm-warning-soft": "#494021",
    "--rm-warning-text": "#382b0e",
    "--rm-danger": "#ffb9a7",
    "--rm-danger-soft": "#55352f",
    "--rm-danger-text": "#47251d",
    "--rm-error": "#ffb9a7",
    "--rm-error-soft": "#55352f",
    "--rm-error-ink": "#ffb9a7",
    "--rm-error-text": "#47251d",
    "--rm-terracotta": "#B46F52",
    "--rm-rose": "#E4A9A3",
    "--rm-ochre": "#C19A3F",
    "--rm-sage": "#C5CBC7",
    "--rm-disabled-bg": "#514336",
    "--rm-disabled-text": "#C5CBC7",
    "--rm-shadow": "0 8px 28px rgba(0, 0, 0, 0.22)",
    "--rm-glass-highlight": "rgba(253, 248, 239, 0.08)",
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
