const fractions = {
  "½": 1 / 2,
  "¼": 1 / 4,
  "¾": 3 / 4,
  "⅓": 1 / 3,
  "⅔": 2 / 3,
  "⅛": 1 / 8,
  "⅜": 3 / 8,
  "⅝": 5 / 8,
  "⅞": 7 / 8,
};
export function numericAmount(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(",", ".");
  let amount;
  const unicode = text.match(/^(\d+)?\s*([½¼¾⅓⅔⅛⅜⅝⅞])$/);
  const fraction = text.match(/^(?:(\d+)\s+)?(\d+)\/(\d+)$/);
  if (unicode) amount = Number(unicode[1] || 0) + fractions[unicode[2]];
  else if (fraction) {
    if (Number(fraction[3]) === 0) return null;
    amount =
      Number(fraction[1] || 0) + Number(fraction[2]) / Number(fraction[3]);
  } else if (/^\d+(?:\.\d+)?$/.test(text)) amount = Number(text);
  else return null;
  return Number.isFinite(amount) && amount >= 0 && amount <= 1000000
    ? amount
    : null;
}
export function scaleAmount(value, multiplier) {
  const amount = numericAmount(value);
  if (
    amount === null ||
    !Number.isFinite(multiplier) ||
    multiplier <= 0 ||
    multiplier > 10000
  )
    return value;
  const scaled = amount * multiplier;
  if (!Number.isFinite(scaled) || scaled > 1e10) return value;
  return String(Number(scaled.toFixed(4)));
}
