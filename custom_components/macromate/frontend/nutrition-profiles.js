import { translate } from "./i18n.js";
import { el, button, field } from "./dom.js";
import { selectField } from "./foods-ui.js";
import { openDialog } from "./entry-ui.js";

const labels = {
  profile: "Nutrition profile",
  create: "Add person",
  edit: "Edit profile",
  name: "Name",
  owner: "Owner",
  sharing: "Share with",
  save: "Save",
  cancel: "Cancel",
  remove: "Delete profile",
  confirm: "Delete this person’s entire diary and settings?",
  empty: "No nutrition profile is shared with this account.",
  sex: "Formula sex",
  birthday: "Birth date",
  height: "Height (cm)",
  weight: "Weight (kg)",
  target: "Target weight (kg)",
  goal: "Goal",
  pace: "Weekly change (kg)",
  activity: "Activity",
  macros: "Macro plan",
};
const text = (panel) =>
  Object.fromEntries(
    Object.entries(labels).map(([key, message]) => [
      key,
      translate(message, panel.hass?.language || "en"),
    ]),
  );
export async function loadProfiles(panel) {
  const identity = panel.hass.user?.id,
    connection = panel.hass.connection,
    sequence = (panel.profileSequence = (panel.profileSequence || 0) + 1);
  const result = await panel.client.read("profiles_list");
  if (!Array.isArray(result.profiles)) throw { code: "read_failed" };
  if (
    sequence !== panel.profileSequence ||
    identity !== panel.hass.user?.id ||
    connection !== panel.hass.connection ||
    !panel.isConnected
  )
    return false;
  panel.profiles = result.profiles || [];
  panel.canCreateProfile = result.can_create === true;
  if (!panel.profiles.some((row) => row.id === panel.profileId))
    panel.profileId = panel.profiles[0]?.id || null;
  panel.client.profileId =
    panel.profileId && panel.profileId !== "default" ? panel.profileId : null;
  panel.profileControls.replaceChildren(profileControls(panel));
  if (!panel.dialog?.contains(panel.profileControls))
    panel.profileControls.hidden = panel.profiles.length > 0;
  return panel.profileId !== null;
}

export function profilePayload(panel, payload = {}) {
  return panel.profileId && panel.profileId !== "default"
    ? { ...payload, profile_id: panel.profileId }
    : payload;
}

function profileControls(panel) {
  const l = text(panel);
  if (!panel.profiles.length) return el("p", { role: "status" }, l.empty);
  const select = selectField(
    l.profile,
    "nutrition_profile",
    panel.profiles.map((row) => [
      row.id,
      row.id === "default"
        ? translate("Default profile", panel.hass.language)
        : row.name,
    ]),
    panel.profileId,
  );
  select.addEventListener("change", async () => {
    if (panel.client.pending || panel.dialog?.open) {
      select.querySelector("select").value = panel.profileId;
      return;
    }
    panel.diarySequence++;
    panel.foodBrowser.invalidate();
    panel.barcode?.stop();
    panel.data = null;
    panel.profileId = select.querySelector("select").value;
    panel.client.profileId =
      panel.profileId === "default" ? null : panel.profileId;
    await panel.loadDiary(panel.date);
    panel.profileControls.replaceChildren(profileControls(panel));
  });
  const controls = el("div", { class: "toolbar" }, select);
  if (panel.profileId !== "default")
    controls.append(button(l.edit, () => editProfile(panel, panel.profileId)));
  if (panel.canCreateProfile)
    controls.append(button(l.create, () => editProfile(panel)));
  return controls;
}

async function editProfile(panel, id) {
  const l = text(panel);
  try {
    const current = id
      ? (await panel.client.read("profiles_get", { profile_id: id })).profile
      : null;
    const s = current?.settings || {};
    const users = panel.canCreateProfile
      ? (await panel.client.read("profiles_users")).users
      : [];
    const name = field(l.name, {
      name: "profile_name",
      required: true,
      maxlength: 80,
      value: current?.name || "",
    });
    const owner = panel.canCreateProfile
      ? selectField(
          l.owner,
          "owner_id",
          users.map((user) => [user.id, user.name]),
          current?.owner_id || panel.hass.user.id,
        )
      : null;
    const sharing = panel.canCreateProfile
      ? el(
          "fieldset",
          {},
          el("legend", {}, l.sharing),
          ...users.map((user) =>
            field(user.name, {
              type: "checkbox",
              name: "shared_" + user.id,
              checked: current?.allowed_users?.includes(user.id),
            }),
          ),
        )
      : null;
    const inputs = {};
    for (const [key, label, type, min, max] of [
      ["birthday", l.birthday, "date"],
      ["height_cm", l.height, "number", 100, 250],
      ["weight_kg", l.weight, "number", 30, 350],
      ["target_weight_kg", l.target, "number", 30, 350],
      ["weekly_pace_kg", l.pace, "number", 0, 1.5],
    ]) {
      inputs[key] = field(label, {
        name: key,
        type,
        required: true,
        ...(type === "number" ? { min, max, step: "any" } : {}),
        value: s[key] ?? (key === "weekly_pace_kg" ? 0 : ""),
      });
    }
    const choices = {
      formula_sex: [
        l.sex,
        [
          ["female", translate("Female", panel.hass.language)],
          ["male", translate("Male", panel.hass.language)],
        ],
      ],
      goal: [
        l.goal,
        [
          ["lose", translate("Lose", panel.hass.language)],
          ["maintain", translate("Maintain", panel.hass.language)],
          ["gain", translate("Gain", panel.hass.language)],
        ],
      ],
      activity_level: [
        l.activity,
        [
          ["low", translate("Low", panel.hass.language)],
          ["moderate", translate("Moderate", panel.hass.language)],
          ["high", translate("High", panel.hass.language)],
          ["very_high", translate("Very high", panel.hass.language)],
        ],
      ],
      macro_plan: [
        l.macros,
        [
          ["balanced", translate("Balanced", panel.hass.language)],
          [
            "moderate_carb",
            translate("Moderate carbohydrate", panel.hass.language),
          ],
          ["low_carb", translate("Low carbohydrate", panel.hass.language)],
          ["high_protein", translate("High protein", panel.hass.language)],
          ["low_fat", translate("Low fat", panel.hass.language)],
        ],
      ],
    };
    for (const [key, [label, options]] of Object.entries(choices))
      inputs[key] = selectField(
        label,
        key,
        options,
        s[key] ?? (key === "goal" ? "maintain" : options[0][0]),
      );
    let dialog;
    const form = el(
      "form",
      {
        onsubmit: async (event) => {
          event.preventDefault();
          const settings = {};
          for (const [key, node] of Object.entries(inputs)) {
            const input = node.querySelector("input,select");
            settings[key] =
              input.type === "number" ? Number(input.value) : input.value;
          }
          // Keep explicitly selected wearable sources when editing demographics.
          for (const key of [
            "weight_entity",
            "bmr_entity",
            "active_calories_entity",
          ])
            settings[key] = s[key] || null;
          const payload = {
            name: name.querySelector("input").value,
            settings,
            ...(id ? { profile_id: id } : {}),
            ...(owner
              ? {
                  owner_id: owner.querySelector("select").value,
                  allowed_users: users
                    .filter(
                      (user) => form.elements["shared_" + user.id]?.checked,
                    )
                    .map((user) => user.id),
                }
              : {}),
          };
          const result = await panel.write(
            id ? "profiles_update" : "profiles_create",
            payload,
            false,
          );
          if (result) {
            panel.profileId = result.profile.id;
            dialog.close();
            await loadProfiles(panel);
            await panel.loadDiary(panel.date);
          }
        },
      },
      name,
      owner,
      sharing,
      el("div", { class: "form-grid" }, Object.values(inputs)),
      el(
        "div",
        { class: "actions" },
        el("button", { type: "submit", "data-write": true }, l.save),
        button(l.cancel, () => dialog.close()),
      ),
    );
    if (id && panel.canCreateProfile)
      form.append(
        button(
          l.remove,
          async () => {
            if (!window.confirm(l.confirm)) return;
            const result = await panel.write(
              "profiles_delete",
              { profile_id: id, confirm: true },
              false,
            );
            if (result) {
              dialog.close();
              panel.profileId = null;
              await loadProfiles(panel);
              await panel.loadDiary();
            }
          },
          { class: "danger", "data-write": true },
        ),
      );
    dialog = openDialog(panel, id ? l.edit : l.create, [form]);
  } catch (error) {
    panel.showError(error);
  }
}
