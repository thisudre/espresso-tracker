export function parsePositiveNumber(v: string): number | null {
  if (!v || v.trim() === '') return null;
  const n = Number(v);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

export function suggestedWater(dose: string, ratio: string): number | null {
  const d = parsePositiveNumber(dose);
  const r = parsePositiveNumber(ratio);
  if (d === null || r === null) return null;
  return Math.round(d * r);
}
