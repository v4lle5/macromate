// Dashboard destinations are local paths, never external credential handoffs.
export function navigationPath(value) {
  if (value === undefined || value === "") return null;
  if (
    typeof value !== "string" ||
    !/^\/(?!\/)[A-Za-z0-9_./~-]+$/.test(value) ||
    value.includes("..")
  ) {
    throw new Error("Navigation path must be a local dashboard path.");
  }
  return value;
}
