import { el, button, display } from "./dom.js";
import { profilePayload } from "./nutrition-profiles.js";

export function reportControls(panel) {
  const de = panel.hass.language?.startsWith("de");
  const output = el("section", {
    "aria-live": "polite",
    "data-testid": "nutrition-report",
  });
  let sequence = 0;
  const show = async (period) => {
    const current = ++sequence,
      profile = panel.profileId;
    try {
      const report = await panel.client.read(
        "nutrition_report",
        profilePayload(panel, { period, date: panel.date }),
      );
      if (
        current !== sequence ||
        profile !== panel.profileId ||
        !panel.isConnected
      )
        return;
      const table = el(
        "table",
        {},
        el("caption", {}, `${report.start} – ${report.end}`),
        el(
          "thead",
          {},
          el(
            "tr",
            {},
            ...[de ? "Tag" : "Day", "kcal", de ? "Tagesziel" : "Target"].map(
              (label) => el("th", { scope: "col" }, label),
            ),
          ),
        ),
        el(
          "tbody",
          {},
          ...report.days.map((day) =>
            el(
              "tr",
              {},
              el("th", { scope: "row" }, day.date),
              el(
                "td",
                {},
                day.entry_count
                  ? `${display(day.totals.calories, "", panel.hass.language)}${day.nutrition_missing.includes("calories") ? " *" : ""}`
                  : "—",
              ),
              el(
                "td",
                {},
                display(day.calorie_target, "", panel.hass.language),
              ),
            ),
          ),
        ),
      );
      output.replaceChildren(
        el(
          "h3",
          {},
          period === "week"
            ? de
              ? "Wochenauswertung"
              : "Weekly report"
            : de
              ? "Monatsauswertung"
              : "Monthly report",
        ),
        el(
          "p",
          {},
          `${de ? "Tage mit Einträgen" : "Days with entries"}: ${report.logged_days}`,
        ),
        el(
          "p",
          {},
          `${de ? "Bekannter Durchschnitt pro erfasstem Tag" : "Known average per logged day"}: ${display(report.average_per_logged_day.calories, "kcal", panel.hass.language)}`,
        ),
        el(
          "p",
          {},
          de
            ? "Tage ohne Einträge gelten nicht als gemessene Null. Fehlende Nährwerte bleiben unvollständig."
            : "Unlogged days are not measured zeros. Undeclared nutrients remain incomplete.",
        ),
        table,
      );
    } catch (error) {
      if (current === sequence) panel.showError(error);
    }
  };
  return el(
    "details",
    {},
    el("summary", {}, de ? "Auswertungen" : "Reports"),
    el(
      "div",
      { class: "toolbar" },
      button(de ? "Woche" : "Week", () => show("week")),
      button(de ? "Monat" : "Month", () => show("month")),
    ),
    output,
  );
}
