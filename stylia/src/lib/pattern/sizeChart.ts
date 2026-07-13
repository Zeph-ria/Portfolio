/**
 * Barème des tailles — standard French ready-to-wear size chart (IFTH),
 * as referenced in the knowledge base (Gilewska, "Le modélisme de mode",
 * vol. 1, Coupe à plat : les bases — Généralités). Stature 168–172 cm.
 *
 * Values in centimetres. Only the measures used by skirt drafting are
 * kept here; extend with bust-block measures when new garments land.
 *
 * Two structural facts from the chart, used as fallbacks when a client
 * profile omits the "petites hanches" measures:
 *  - tour du bassin − tour des petites hanches = 11 cm at every size;
 *  - the small-hip line sits at ≈ half the waist-to-hip height
 *    (≈ 10 cm vs ≈ 20 cm below the waist).
 */

export interface SizeEntry {
  /** French size */
  fr: number;
  /** international letter size, when defined */
  intl?: string;
  bust_circ: number;
  waist_circ: number;
  small_hip_circ: number; // tour des petites hanches (~10 cm below waist)
  hip_circ: number; // tour du bassin (~20 cm below waist)
  small_hip_height: number; // hauteur des petites hanches
  waist_to_hip_height: number; // hauteur du bassin
}

export const SIZE_CHART: SizeEntry[] = [
  { fr: 34, intl: 'XS', bust_circ: 80, waist_circ: 58, small_hip_circ: 73, hip_circ: 84, small_hip_height: 8.8, waist_to_hip_height: 19.25 },
  { fr: 36, intl: 'S', bust_circ: 84, waist_circ: 62, small_hip_circ: 77, hip_circ: 88, small_hip_height: 9, waist_to_hip_height: 19.5 },
  { fr: 38, intl: 'M', bust_circ: 88, waist_circ: 66, small_hip_circ: 81, hip_circ: 92, small_hip_height: 9.2, waist_to_hip_height: 19.75 },
  { fr: 40, intl: 'L', bust_circ: 92, waist_circ: 70, small_hip_circ: 85, hip_circ: 96, small_hip_height: 9.4, waist_to_hip_height: 20 },
  { fr: 42, intl: 'XL', bust_circ: 96, waist_circ: 74, small_hip_circ: 89, hip_circ: 100, small_hip_height: 9.6, waist_to_hip_height: 20.25 },
  { fr: 44, bust_circ: 100, waist_circ: 78, small_hip_circ: 93, hip_circ: 104, small_hip_height: 9.8, waist_to_hip_height: 20.5 },
  { fr: 46, bust_circ: 104, waist_circ: 82, small_hip_circ: 97, hip_circ: 108, small_hip_height: 10, waist_to_hip_height: 20.75 },
  { fr: 48, bust_circ: 106, waist_circ: 86, small_hip_circ: 101, hip_circ: 112, small_hip_height: 10.2, waist_to_hip_height: 21 },
];

/** Chart-derived fallback: small-hip girth from the constant 11 cm offset. */
export function estimateSmallHipCirc(hipCirc: number): number {
  return Math.max(hipCirc - 11, 0);
}

/** Chart-derived fallback: small-hip line at half the waist-to-hip height. */
export function estimateSmallHipHeight(waistToHipHeight: number): number {
  return Math.round((waistToHipHeight / 2) * 10) / 10;
}
