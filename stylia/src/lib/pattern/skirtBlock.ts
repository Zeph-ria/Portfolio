/**
 * ============================================================================
 * StylIA — Mathematical Engine · Basic Straight Skirt (Jupe Droite de Base)
 * Flat-pattern method, vol. 1 of the knowledge base ("Coupe à plat : les bases")
 * ============================================================================
 * Coordinate system: origin at point A (centre back × waist line),
 * X grows towards the centre front, Y grows downwards.
 *
 * Core outer framing (aisance/ease = 2 cm on the hips):
 *   Total Width        = (H + 2) / 2
 *   Front Panel Width  = (H + 2) / 4 + 1
 *   Back  Panel Width  = (H + 2) / 4 − 1
 *   Total Height       = L
 *   Hip Line Position  = H_height from the waist edge
 *   Small-hip line (ligne des petites hanches) at ≈ H_height / 2;
 *   small-hip girth defaults to H − 11 (constant offset in the size chart).
 *
 * Dart calculation (calcul des pinces de taille):
 *   Total Waist Reduction = Total Width − W / 2
 *   Side curve (each side) = 0.4 × reduction / 2
 *   Back dart value        = 0.35 × reduction
 *   Front dart value       = 0.25 × reduction
 *   Front dart length 10–12 cm (drafted at 11), back 13–15 cm (drafted at 14)
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

export const EASE_CM = 2; // Total ease allowance (aisance) applied to hips
export const FRONT_DART_LENGTH_CM = 11; // within the 10–12 cm range
export const BACK_DART_LENGTH_CM = 14; // within the 13–15 cm range

export interface BodyMeasurementsCm {
  bust_circ: number;
  waist_circ: number;
  hip_circ: number;
  waist_to_hip_height: number;
  total_length: number;
  small_hip_circ?: number | null;
  small_hip_height?: number | null;
}

// Backwards-compatible aliases (earlier modules import these names).
export type SkirtMeasurementsCm = BodyMeasurementsCm;
export type SkirtDraft = PatternDraft;
export type { PatternDraft, PatternLine, Point };
export type { Segment, LineKind } from './types';

export function draftStraightSkirt(m: BodyMeasurementsCm): PatternDraft {
  const H = m.hip_circ;
  const W = m.waist_circ;
  const L = m.total_length;
  const Hh = m.waist_to_hip_height;
  const smallHip = m.small_hip_circ ?? Math.max(H - 11, 0);
  const smallHipY = m.small_hip_height ?? Hh / 2;

  // --- Core outer framing -------------------------------------------------
  const totalWidth = (H + EASE_CM) / 2;
  const frontPanelWidth = (H + EASE_CM) / 4 + 1;
  const backPanelWidth = (H + EASE_CM) / 4 - 1;
  const hipLineY = Hh;

  const smallHipHalfWidth = (smallHip + EASE_CM) / 2;
  const smallHipInsetEach = Math.max((totalWidth - smallHipHalfWidth) / 2, 0);

  // --- Dart calculation ---------------------------------------------------
  const totalWaistReduction = totalWidth - W / 2;
  const sideCurveEach = (0.4 * totalWaistReduction) / 2;
  const backDartValue = 0.35 * totalWaistReduction;
  const frontDartValue = 0.25 * totalWaistReduction;

  const sideSeamX = backPanelWidth;
  const backDartAxisX = (sideSeamX - sideCurveEach) / 2;
  const frontDartAxisX = sideSeamX + sideCurveEach + (totalWidth - (sideSeamX + sideCurveEach)) / 2;

  // --- Named points -------------------------------------------------------
  const A: Point = { x: 0, y: 0 };
  const B: Point = { x: mm(totalWidth), y: 0 };
  const C: Point = { x: mm(totalWidth), y: mm(L) };
  const D: Point = { x: 0, y: mm(L) };
  const sideWaistBack: Point = { x: mm(sideSeamX - sideCurveEach), y: 0 };
  const sideWaistFront: Point = { x: mm(sideSeamX + sideCurveEach), y: 0 };
  const smallHipBack: Point = { x: mm(sideSeamX - smallHipInsetEach), y: mm(smallHipY) };
  const smallHipFront: Point = { x: mm(sideSeamX + smallHipInsetEach), y: mm(smallHipY) };
  const sideHip: Point = { x: mm(sideSeamX), y: mm(hipLineY) };
  const sideHem: Point = { x: mm(sideSeamX), y: mm(L) };

  const lines: PatternLine[] = [
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: A },
        { type: 'line', to: sideWaistBack },
        { type: 'quad', control: curveControl(sideWaistBack, smallHipBack, sideHip), to: sideHip },
        { type: 'line', to: sideHem },
        { type: 'line', to: D },
        { type: 'line', to: A },
      ],
    },
    {
      id: 'front-outline',
      kind: 'cut',
      label: 'front',
      segments: [
        { type: 'move', to: B },
        { type: 'line', to: sideWaistFront },
        { type: 'quad', control: curveControl(sideWaistFront, smallHipFront, sideHip), to: sideHip },
        { type: 'line', to: sideHem },
        { type: 'line', to: C },
        { type: 'line', to: B },
      ],
    },
    horizontalLine('small-hip-line', smallHipY, 0, totalWidth),
    horizontalLine('hip-line', hipLineY, 0, totalWidth),
    {
      id: 'side-seam-axis',
      kind: 'construction',
      label: 'sideSeam',
      segments: [
        { type: 'move', to: { x: mm(sideSeamX), y: 0 } },
        { type: 'line', to: sideHem },
      ],
    },
    ...verticalDart('back-dart', backDartAxisX, 0, backDartValue, BACK_DART_LENGTH_CM),
    ...verticalDart('front-dart', frontDartAxisX, 0, frontDartValue, FRONT_DART_LENGTH_CM),
  ];

  return {
    widthCm: mm(totalWidth),
    heightCm: mm(L),
    lines,
    computed: {
      totalWidth: mm(totalWidth),
      frontPanelWidth: mm(frontPanelWidth),
      backPanelWidth: mm(backPanelWidth),
      hipLineY: mm(hipLineY),
      smallHipLineY: mm(smallHipY),
      smallHipInsetEach: mm(smallHipInsetEach),
      totalWaistReduction: mm(totalWaistReduction),
      sideCurveEach: mm(sideCurveEach),
      backDartValue: mm(backDartValue),
      frontDartValue: mm(frontDartValue),
      backDartAxisX: mm(backDartAxisX),
      frontDartAxisX: mm(frontDartAxisX),
    },
    points: { A, B, C, D, sideWaistBack, sideWaistFront, smallHipBack, smallHipFront, sideHip, sideHem },
  };
}
