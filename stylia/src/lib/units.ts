/**
 * Unit conversion — canonical storage unit is the centimetre.
 * 1 inch = 2.54 cm exactly.
 */
export type Unit = 'cm' | 'inch';

export const CM_PER_INCH = 2.54;

export function cmToInch(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inchToCm(inch: number): number {
  return inch * CM_PER_INCH;
}

/** Convert a value between arbitrary units, rounded to 0.01. */
export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  const out = from === 'cm' ? cmToInch(value) : inchToCm(value);
  return Math.round(out * 100) / 100;
}

/** Display a canonical-cm value in the requested unit, to the millimetre. */
export function display(cmValue: number, unit: Unit, digits = 1): string {
  const v = unit === 'cm' ? cmValue : cmToInch(cmValue);
  return `${v.toFixed(unit === 'cm' ? digits : 2)} ${unit === 'cm' ? 'cm' : 'in'}`;
}
