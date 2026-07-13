/**
 * ============================================================================
 * StylIA — Mathematical Engine · Straight Trousers (Pantalon Droit)
 * ============================================================================
 * Simplified straight-leg trouser block: front and back panels drafted side
 * by side, sharing the horizontal construction lines (waist, hip, crotch,
 * knee, hem). Classic parametric relations:
 *
 *   Crotch depth (montant)   = H / 4 + 3
 *   Front panel width at hip = H / 4 + ease/4
 *   Back  panel width at hip = H / 4 + ease/4 + 2
 *   Front fork extension     = H / 20
 *   Back  fork extension     = H / 10
 *   Knee line                = crotch + (length − crotch) / 2 − 4
 *   Hem width (straight leg) ≈ 22 cm per panel, taper from the knee
 * ============================================================================
 */

import {
  mm,
  curveControl,
  verticalDart,
  horizontalLine,
  type PatternDraft,
  type PatternLine,
  type Point,
} from './types';
import type { BodyMeasurementsCm } from './skirtBlock';

export const TROUSER_EASE_CM = 4; // total ease on the hips
export const HEM_WIDTH_CM = 22; // finished hem width per panel (straight leg)
const GAP = 6; // canvas gap between the two panels, cm

export function draftStraightTrousers(m: BodyMeasurementsCm): PatternDraft {
  const H = m.hip_circ;
  const W = m.waist_circ;
  const L = m.total_length; // waist to hem
  const Hh = m.waist_to_hip_height;

  const crotchY = H / 4 + 3; // montant
  const kneeY = crotchY + (L - crotchY) / 2 - 4;
  const hipY = Hh;

  const frontWidth = H / 4 + TROUSER_EASE_CM / 4;
  const backWidth = H / 4 + TROUSER_EASE_CM / 4 + 2;
  const frontFork = H / 20;
  const backFork = H / 10;

  // Waist shaping per panel: half the (hip − waist) difference each,
  // taken at the side seam and one dart.
  const frontWaistTake = Math.max((frontWidth - (W / 4 + 1)) / 2, 0);
  const backWaistTake = Math.max((backWidth - (W / 4 + 2)) / 2, 0);

  // --- FRONT panel (left), fork towards the panel gap ---------------------
  const fLeft = 0;
  const fRight = frontWidth;
  const fCrease = (frontWidth + frontFork) / 2; // crease line centred incl. fork
  const fForkTip: Point = { x: mm(fRight + frontFork), y: mm(crotchY) };
  const fWaistSide: Point = { x: mm(fLeft + frontWaistTake), y: 0 };
  const fWaistFork: Point = { x: mm(fRight - frontWaistTake), y: 0 };
  const fHip: Point = { x: mm(fRight), y: mm(hipY) };
  const fKneeOut: Point = { x: mm(fCrease - HEM_WIDTH_CM / 2 - 1), y: mm(kneeY) };
  const fKneeIn: Point = { x: mm(fCrease + HEM_WIDTH_CM / 2 + 1), y: mm(kneeY) };
  const fHemOut: Point = { x: mm(fCrease - HEM_WIDTH_CM / 2), y: mm(L) };
  const fHemIn: Point = { x: mm(fCrease + HEM_WIDTH_CM / 2), y: mm(L) };

  // --- BACK panel (right of the gap), fork towards the gap ----------------
  const bLeft = frontWidth + frontFork + GAP + backFork;
  const bRight = bLeft + backWidth;
  const bCrease = bLeft + (backWidth - backFork) / 2;
  const bForkTip: Point = { x: mm(bLeft - backFork), y: mm(crotchY) };
  const bWaistFork: Point = { x: mm(bLeft + backWaistTake), y: mm(-1) }; // back waist raised 1 cm
  const bWaistSide: Point = { x: mm(bRight - backWaistTake), y: 0 };
  const bHip: Point = { x: mm(bRight), y: mm(hipY) };
  const bKneeIn: Point = { x: mm(bCrease - HEM_WIDTH_CM / 2 - 2), y: mm(kneeY) };
  const bKneeOut: Point = { x: mm(bCrease + HEM_WIDTH_CM / 2 + 2), y: mm(kneeY) };
  const bHemIn: Point = { x: mm(bCrease - HEM_WIDTH_CM / 2 - 1), y: mm(L) };
  const bHemOut: Point = { x: mm(bCrease + HEM_WIDTH_CM / 2 + 1), y: mm(L) };

  const totalWidth = bRight;

  const lines: PatternLine[] = [
    {
      id: 'front-outline',
      kind: 'cut',
      label: 'front',
      segments: [
        { type: 'move', to: fWaistSide },
        { type: 'line', to: fWaistFork },
        // fly line down to the hip, then fork curve to the crotch tip
        { type: 'line', to: fHip },
        { type: 'quad', control: { x: mm(fRight + frontFork * 0.15), y: mm(crotchY * 0.97) }, to: fForkTip },
        // inseam: fork tip → knee → hem
        { type: 'quad', control: curveControl(fForkTip, { x: mm((fForkTip.x + fKneeIn.x) / 2 - 0.8), y: mm((crotchY + kneeY) / 2) }, fKneeIn), to: fKneeIn },
        { type: 'line', to: fHemIn },
        { type: 'line', to: fHemOut },
        // outseam: hem → knee → hip curve → waist
        { type: 'line', to: fKneeOut },
        { type: 'quad', control: { x: mm(fLeft - 0.5), y: mm((hipY + kneeY) / 2) }, to: { x: mm(fLeft), y: mm(hipY) } },
        { type: 'quad', control: { x: mm(fLeft), y: mm(hipY * 0.4) }, to: fWaistSide },
      ],
    },
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: bWaistFork },
        { type: 'line', to: bWaistSide },
        // outseam
        { type: 'quad', control: { x: mm(bRight), y: mm(hipY * 0.4) }, to: bHip },
        { type: 'quad', control: { x: mm(bRight + 0.5), y: mm((hipY + kneeY) / 2) }, to: bKneeOut },
        { type: 'line', to: bHemOut },
        { type: 'line', to: bHemIn },
        // inseam back up to the fork
        { type: 'line', to: bKneeIn },
        { type: 'quad', control: { x: mm((bForkTip.x + bKneeIn.x) / 2 - 1), y: mm((crotchY + kneeY) / 2) }, to: bForkTip },
        // seat curve up to the raised back waist
        { type: 'quad', control: { x: mm(bLeft - backFork * 0.1), y: mm(crotchY * 0.55) }, to: bWaistFork },
      ],
    },
    horizontalLine('hip-line', hipY, 0, totalWidth),
    horizontalLine('crotch-line', crotchY, 0, totalWidth),
    horizontalLine('knee-line', kneeY, 0, totalWidth),
    {
      id: 'front-crease',
      kind: 'construction',
      label: 'crease',
      segments: [
        { type: 'move', to: { x: mm(fCrease), y: mm(crotchY) } },
        { type: 'line', to: { x: mm(fCrease), y: mm(L) } },
      ],
    },
    {
      id: 'back-crease',
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: mm(bCrease), y: mm(crotchY) } },
        { type: 'line', to: { x: mm(bCrease), y: mm(L) } },
      ],
    },
    ...verticalDart('front-dart', (fWaistSide.x + fWaistFork.x) / 2, 0, 2, 9),
    ...verticalDart('back-dart', (bWaistFork.x + bWaistSide.x) / 2, -0.5, 3, 12),
  ];

  return {
    widthCm: mm(totalWidth),
    heightCm: mm(L + 1),
    lines,
    computed: {
      crotchDepth: mm(crotchY),
      kneeLineY: mm(kneeY),
      hipLineY: mm(hipY),
      frontWidth: mm(frontWidth),
      backWidth: mm(backWidth),
      frontFork: mm(frontFork),
      backFork: mm(backFork),
      hemWidth: HEM_WIDTH_CM,
    },
    points: { fForkTip, bForkTip, fWaistSide, bWaistSide },
  };
}
