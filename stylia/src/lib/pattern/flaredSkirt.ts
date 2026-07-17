/**
 * ============================================================================
 * StylIA — Mathematical Engine · Flared Skirt (Jupe Évasée)
 * ============================================================================
 * Classic flat-pattern transformation of the straight-skirt base: the waist
 * darts are CLOSED and their value pivots into hem flare (slash-and-spread),
 * plus an additional style flare at the side seam. The result per panel is a
 * trapezoid with a curved hem and a slightly curved waistline.
 *
 * Parameters derived from the straight-skirt base:
 *   Total Width (at hips)  = (H + 2) / 2, split back/front at ±1 cm
 *   Waist reduction        = Total Width − W / 2 (side 40%, back 35%, front 25%)
 *   Hem flare per side     = dart value transferred + STYLE_FLARE_CM
 * ============================================================================
 */

import {
  mm,
  curveControl,
  horizontalLine,
  type PatternDraft,
  type PatternLine,
  type Point,
} from './types';
import { EASE_CM, type BodyMeasurementsCm } from './skirtBlock';

/** Extra hem flare added at each side seam beyond the transferred darts. */
export const STYLE_FLARE_CM = 6;

export function draftFlaredSkirt(m: BodyMeasurementsCm): PatternDraft {
  const H = m.hip_circ;
  const W = m.waist_circ;
  const L = m.total_length;
  const Hh = m.waist_to_hip_height;

  const totalWidth = (H + EASE_CM) / 2;
  const backPanelWidth = (H + EASE_CM) / 4 - 1;
  const sideSeamX = backPanelWidth;

  const totalWaistReduction = totalWidth - W / 2;
  const sideCurveEach = (0.4 * totalWaistReduction) / 2;
  const backDartValue = 0.35 * totalWaistReduction;
  const frontDartValue = 0.25 * totalWaistReduction;

  // Closing each panel's dart pivots its value into the hem; add style flare.
  const backHemFlare = backDartValue + STYLE_FLARE_CM;
  const frontHemFlare = frontDartValue + STYLE_FLARE_CM;

  // --- Named points -------------------------------------------------------
  // The two panels share the vertical side-seam axis; the flare swings the
  // hem outward on both sides of it.
  const A: Point = { x: 0, y: 0 }; // centre back × waist
  const B: Point = { x: mm(totalWidth), y: 0 }; // centre front × waist
  const sideWaistBack: Point = { x: mm(sideSeamX - sideCurveEach), y: 0 };
  const sideWaistFront: Point = { x: mm(sideSeamX + sideCurveEach), y: 0 };
  const sideHip: Point = { x: mm(sideSeamX), y: mm(Hh) };

  // Flare geometry: from the hip point the seam slants outward to reach
  // hem width = panel width + flare. The hem is raised at the side by ~1.5 cm
  // per 6 cm of flare so its curve stays perpendicular to the seam.
  const hemLiftBack = mm(Math.min((backHemFlare / 6) * 1.5, 4));
  const hemLiftFront = mm(Math.min((frontHemFlare / 6) * 1.5, 4));

  const backHem: Point = { x: mm(sideSeamX + backHemFlare), y: mm(L - hemLiftBack) };
  const frontHem: Point = { x: mm(sideSeamX - frontHemFlare), y: mm(L - hemLiftFront) };
  const backCentreHem: Point = { x: 0, y: mm(L) };
  const frontCentreHem: Point = { x: mm(totalWidth), y: mm(L) };

  // NOTE ON LAYOUT: to keep the two flared panels from overlapping on the
  // canvas we draw them side by side: back panel occupies [0, sideSeamX+flare],
  // front panel occupies [sideSeamX-flare, totalWidth]; the shared side-seam
  // axis stays visible as a construction line.
  const lines: PatternLine[] = [
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: A },
        // waistline slightly curved after dart closure
        {
          type: 'quad',
          control: { x: mm((sideSeamX - sideCurveEach) / 2), y: mm(-0.75) },
          to: sideWaistBack,
        },
        // side seam: straight from waist through hip, flaring to the hem
        { type: 'line', to: sideHip },
        { type: 'line', to: backHem },
        // hem curve back to the centre line
        {
          type: 'quad',
          control: { x: mm((backHem.x + 0) / 2), y: mm(L + hemLiftBack * 0.6) },
          to: backCentreHem,
        },
        { type: 'line', to: A },
      ],
    },
    {
      id: 'front-outline',
      kind: 'cut',
      label: 'front',
      segments: [
        { type: 'move', to: B },
        {
          type: 'quad',
          control: { x: mm(sideSeamX + sideCurveEach + (totalWidth - sideSeamX - sideCurveEach) / 2), y: mm(-0.75) },
          to: sideWaistFront,
        },
        { type: 'line', to: sideHip },
        { type: 'line', to: frontHem },
        {
          type: 'quad',
          control: { x: mm((frontHem.x + totalWidth) / 2), y: mm(L + hemLiftFront * 0.6) },
          to: frontCentreHem,
        },
        { type: 'line', to: B },
      ],
    },
    horizontalLine('hip-line', Hh, 0, totalWidth),
    {
      id: 'side-seam-axis',
      kind: 'construction',
      label: 'sideSeam',
      segments: [
        { type: 'move', to: { x: mm(sideSeamX), y: 0 } },
        { type: 'line', to: { x: mm(sideSeamX), y: mm(L) } },
      ],
    },
    // pivot rays showing where the closed darts spread the hem
    {
      id: 'back-pivot-ray',
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: mm((sideSeamX - sideCurveEach) / 2), y: 0 } },
        { type: 'line', to: { x: mm(sideSeamX * 0.45 + backHemFlare * 0.3), y: mm(L) } },
      ],
    },
    {
      id: 'front-pivot-ray',
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: mm(sideSeamX + sideCurveEach + (totalWidth - sideSeamX - sideCurveEach) / 2), y: 0 } },
        { type: 'line', to: { x: mm(totalWidth - sideSeamX * 0.45 - frontHemFlare * 0.3), y: mm(L) } },
      ],
    },
  ];

  const overflow = Math.max(backHemFlare, frontHemFlare);
  return {
    widthCm: mm(totalWidth + overflow),
    heightCm: mm(L + Math.max(hemLiftBack, hemLiftFront)),
    lines,
    computed: {
      totalWidth: mm(totalWidth),
      hipLineY: mm(Hh),
      totalWaistReduction: mm(totalWaistReduction),
      sideCurveEach: mm(sideCurveEach),
      backHemFlare: mm(backHemFlare),
      frontHemFlare: mm(frontHemFlare),
      hemWidthTotal: mm(totalWidth + backHemFlare + frontHemFlare),
    },
    points: { A, B, sideWaistBack, sideWaistFront, sideHip, backHem, frontHem },
  };
}
