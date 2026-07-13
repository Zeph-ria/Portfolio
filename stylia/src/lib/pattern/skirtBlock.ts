/**
 * ============================================================================
 * StylIA — "Teresa Gilewska" Mathematical Engine
 * Basic Straight Skirt block (Jupe Droite de Base)
 * ============================================================================
 * All inputs and outputs are in CENTIMETRES (canonical unit, 1 mm precision).
 * Coordinate system: origin at point A (centre back × waist line),
 * X grows towards the centre front, Y grows downwards.
 *
 *          A ────────────── side ────────────── B      ← waist line (y = 0)
 *          │        back        │     front     │
 *          │                    │               │
 *          ├────────────────────┼───────────────┤      ← hip line (y = H_height)
 *          │                    │               │
 *          D ────────────────────────────────── C      ← hem (y = L)
 *
 * Core outer framing (aisance/ease = 2 cm on the hips):
 *   Total Width        = (H + 2) / 2
 *   Front Panel Width  = (H + 2) / 4 + 1
 *   Back  Panel Width  = (H + 2) / 4 − 1
 *   Total Height       = L
 *   Hip Line Position  = H_height from the waist edge
 *
 * Dart calculation (calcul des pinces de taille):
 *   Total Waist Reduction = Total Width − W / 2
 *   Side curve (each side) = 0.4 × reduction / 2
 *   Back dart value        = 0.35 × reduction
 *   Front dart value       = 0.25 × reduction
 *   Front dart length 10–12 cm (we draft at 11), back 13–15 cm (we draft at 14)
 * ============================================================================
 */

export const EASE_CM = 2; // Total ease allowance (aisance) applied to hips
export const FRONT_DART_LENGTH_CM = 11; // within the 10–12 cm textbook range
export const BACK_DART_LENGTH_CM = 14; // within the 13–15 cm textbook range

export interface SkirtMeasurementsCm {
  hip_circ: number;
  waist_circ: number;
  total_length: number;
  waist_to_hip_height: number;
}

export type Point = { x: number; y: number };

export type Segment =
  | { type: 'move'; to: Point }
  | { type: 'line'; to: Point }
  | { type: 'quad'; control: Point; to: Point };

export type LineKind = 'cut' | 'construction' | 'dart';

export interface PatternLine {
  id: string;
  kind: LineKind;
  /** i18n label key suffix (optional annotation on the canvas) */
  label?: string;
  segments: Segment[];
}

export interface SkirtDraft {
  /** overall bounding box of the block, cm */
  widthCm: number;
  heightCm: number;
  lines: PatternLine[];
  computed: {
    totalWidth: number;
    frontPanelWidth: number;
    backPanelWidth: number;
    hipLineY: number;
    totalWaistReduction: number;
    sideCurveEach: number;
    backDartValue: number;
    frontDartValue: number;
    backDartAxisX: number;
    frontDartAxisX: number;
  };
  /** named construction points, for the interactive canvas */
  points: Record<string, Point>;
}

const mm = (v: number) => Math.round(v * 100) / 100; // keep 0.01 cm = 0.1 mm

/** Builds an isoceles waist dart (two solid legs) on a vertical axis. */
function dart(id: string, axisX: number, value: number, length: number): PatternLine[] {
  const half = value / 2;
  return [
    {
      id: `${id}-legs`,
      kind: 'dart',
      segments: [
        { type: 'move', to: { x: mm(axisX - half), y: 0 } },
        { type: 'line', to: { x: mm(axisX), y: mm(length) } },
        { type: 'line', to: { x: mm(axisX + half), y: 0 } },
      ],
    },
    {
      id: `${id}-axis`,
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: mm(axisX), y: 0 } },
        { type: 'line', to: { x: mm(axisX), y: mm(length) } },
      ],
    },
  ];
}

export function draftStraightSkirt(m: SkirtMeasurementsCm): SkirtDraft {
  const H = m.hip_circ;
  const W = m.waist_circ;
  const L = m.total_length;
  const Hh = m.waist_to_hip_height;

  // --- Core outer framing -------------------------------------------------
  const totalWidth = (H + EASE_CM) / 2;
  const frontPanelWidth = (H + EASE_CM) / 4 + 1;
  const backPanelWidth = (H + EASE_CM) / 4 - 1;
  const hipLineY = Hh;

  // --- Dart calculation ---------------------------------------------------
  const totalWaistReduction = totalWidth - W / 2;
  const sideCurveEach = (0.4 * totalWaistReduction) / 2;
  const backDartValue = 0.35 * totalWaistReduction;
  const frontDartValue = 0.25 * totalWaistReduction;

  // Dart axes sit at the midpoint of each finished panel waistline —
  // the standard textbook placement for the basic block.
  const sideSeamX = backPanelWidth; // measured from centre back
  const backDartAxisX = (sideSeamX - sideCurveEach) / 2;
  const frontDartAxisX = sideSeamX + sideCurveEach + (totalWidth - (sideSeamX + sideCurveEach)) / 2;

  // --- Named points -------------------------------------------------------
  const A: Point = { x: 0, y: 0 }; // centre back × waist
  const B: Point = { x: mm(totalWidth), y: 0 }; // centre front × waist
  const C: Point = { x: mm(totalWidth), y: mm(L) }; // centre front × hem
  const D: Point = { x: 0, y: mm(L) }; // centre back × hem
  const sideWaistBack: Point = { x: mm(sideSeamX - sideCurveEach), y: 0 };
  const sideWaistFront: Point = { x: mm(sideSeamX + sideCurveEach), y: 0 };
  const sideHip: Point = { x: mm(sideSeamX), y: mm(hipLineY) };
  const sideHem: Point = { x: mm(sideSeamX), y: mm(L) };

  const lines: PatternLine[] = [
    // -- Cutting paths (solid) ----------------------------------------------
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: A },
        { type: 'line', to: sideWaistBack },
        // hip curve: waist → hip line, bulging towards the frame edge
        { type: 'quad', control: { x: mm(sideSeamX), y: mm(hipLineY * 0.45) }, to: sideHip },
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
        { type: 'quad', control: { x: mm(sideSeamX), y: mm(hipLineY * 0.45) }, to: sideHip },
        { type: 'line', to: sideHem },
        { type: 'line', to: C },
        { type: 'line', to: B },
      ],
    },
    // -- Construction lines (dash-dotted) ------------------------------------
    {
      id: 'hip-line',
      kind: 'construction',
      label: 'hipLine',
      segments: [
        { type: 'move', to: { x: 0, y: mm(hipLineY) } },
        { type: 'line', to: { x: mm(totalWidth), y: mm(hipLineY) } },
      ],
    },
    {
      id: 'side-seam-axis',
      kind: 'construction',
      label: 'sideSeam',
      segments: [
        { type: 'move', to: { x: mm(sideSeamX), y: 0 } },
        { type: 'line', to: sideHem },
      ],
    },
    // -- Darts (solid legs + dash-dotted axis) -------------------------------
    ...dart('back-dart', backDartAxisX, backDartValue, BACK_DART_LENGTH_CM),
    ...dart('front-dart', frontDartAxisX, frontDartValue, FRONT_DART_LENGTH_CM),
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
      totalWaistReduction: mm(totalWaistReduction),
      sideCurveEach: mm(sideCurveEach),
      backDartValue: mm(backDartValue),
      frontDartValue: mm(frontDartValue),
      backDartAxisX: mm(backDartAxisX),
      frontDartAxisX: mm(frontDartAxisX),
    },
    points: {
      A,
      B,
      C,
      D,
      sideWaistBack,
      sideWaistFront,
      sideHip,
      sideHem,
    },
  };
}
