// Prepares a value for change detection in item history: "no value" in any form (null,
// undefined, '' or an empty list) counts as the same, and empty fields inside objects
// (e.g. metadata) are ignored. Otherwise saving an unchanged form shows fake changes.
function normalizeForDiff(value) {
  if (value === undefined || value === null || value === '') return null;
  if (Array.isArray(value)) return value.length ? value.map(normalizeForDiff) : null;
  if (typeof value === 'object' && !(value instanceof Date)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => [key, normalizeForDiff(value[key])])
      .filter(([, v]) => v !== null);
    return entries.length ? Object.fromEntries(entries) : null;
  }
  return value;
}

module.exports = { normalizeForDiff };
