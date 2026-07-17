/**
 * ============================================================================
 * StylIA — Mathematical Engine · Bodice Block (Corsage / Buste de Base)
 * ============================================================================
 * Follows the construction of the knowledge base (vol. 1, FIG. 1 of the
 * bust chapter): back and front drafted in one frame that runs from the
 * shoulder line down to the HIP LINE (ligne du bassin), with the full set
 * of horizontal construction lines:
 *
 *   carrure (across-back)  →  poitrine (bust/armhole)  →  taille (waist)
 *   →  petites hanches (small hips)  →  bassin (hips, bottom edge)
 *
 * Distinctive elements reproduced from the reference figure:
 *   - back shoulder sloped at 18°, front shoulder at 26°
 *   - back shoulder dart (pince d'épaule), ~2 cm × 7 cm at mid-shoulder
 *   - front shoulder-to-bust dart (pince de poitrine) closing on the bust
 *     point, value ≈ bust/20
 *   - armhole framed by the across-back / across-front verticals (N1, N2)
 *   - waist shaping split between centre back (pince milieu dos), side
 *     seams (côtés) and DIAMOND darts (pince dos / pince devant) that
 *     cross the waistline and close again below it
 *   - side seams flare back out below the waist to reach the hip widths
 *     (largeur de bassin dos / devant) on the bottom line
 *
 * Secondary measures (back length, neck, shoulder, across back/front, bust
 * height, bust span) are interpolated from the size chart by bust girth.
 * ============================================================================
 */

import {
  mm,
  curveControl,
  diamondDart,
  horizontalLine,
  type PatternDraft,
  type PatternLine,
  type Point,
} from './types';
import type { BodyMeasurementsCm } from './skirtBlock';
import { SIZE_CHART } from './sizeChart';

export const BODICE_BUST_EASE_CM = 2; // ease on the bust for the base block
export const BODICE_WAIST_EASE_CM = 4;
export const BODICE_HIP_EASE_CM = 4;
export const BACK_SHOULDER_ANGLE = 18; // degrees below horizontal
export const FRONT_SHOULDER_ANGLE = 26;
export const BACK_SHOULDER_DART_CM = 2;
export const SMALL_HIP_DROP_CM = 10; // petites hanches below the waist
export const HIP_DROP_CM = 20; // bassin below the waist

const DEG = Math.PI / 180;

/** Linear interpolation of a size-chart series against bust girth. */
function interp(bust: number, series: number[]): number {
  const xs = SIZE_CHART.map((s) => s.bust_circ);
  if (bust <= xs[0]) return series[0];
  if (bust >= xs[xs.length - 1]) return series[series.length - 1];
  for (let i = 1; i < xs.length; i++) {
    if (bust <= xs[i]) {
      const t = (bust - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return series[i - 1] + t * (series[i] - series[i - 1]);
    }
  }
  return series[series.length - 1];
}

// Size-chart series (sizes 34 → 48).
const BACK_LENGTH = [41.25, 41.5, 41.75, 42, 42.25, 42.5, 42.75, 43];
const NECK_GIRTH = [35, 36, 37, 38, 39, 40, 41, 42];
const SHOULDER_LEN = [13.4, 13.6, 13.8, 14, 14.2, 14.4, 14.6, 14.8];
const ACROSS_BACK = [34.5, 35, 35.5, 36, 36.5, 37, 37.5, 38];
const ACROSS_FRONT = [33, 33.5, 34, 34.5, 35, 35.5, 36, 36.5];
const BUST_HEIGHT = [25.5, 26, 26.5, 27, 27.5, 28, 28.5, 29];
const BUST_SPAN = [18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22];

export function draftBodiceBlock(m: BodyMeasurementsCm): PatternDraft {
  const bust = m.bust_circ;
  const W = m.waist_circ;
  const H = m.hip_circ;

  const backLength = interp(bust, BACK_LENGTH);
  const neck = interp(bust, NECK_GIRTH);
  const shoulder = interp(bust, SHOULDER_LEN);
  const acrossBack = interp(bust, ACROSS_BACK);
  const acrossFront = interp(bust, ACROSS_FRONT);
  const bustHeight = interp(bust, BUST_HEIGHT);
  const bustSpan = interp(bust, BUST_SPAN);

  // --- Horizontal construction lines (A → W of the reference figure) ------
  const backNeckRise = 2; // G below A
  const scyeY = bust / 4 + 1; // ligne de poitrine / armhole depth
  const carrureY = scyeY * 0.55; // ligne de carrure
  const waistY = backNeckRise + backLength; // ligne de taille
  const smallHipY = waistY + SMALL_HIP_DROP_CM; // ligne des petites hanches
  const hipY = waistY + HIP_DROP_CM; // ligne du bassin (bottom edge)

  // --- Panel widths ---------------------------------------------------------
  // At the bust line the two panels together cover (bust + ease) / 2.
  const backBustWidth = (bust + BODICE_BUST_EASE_CM) / 4 - 0.5; // côté dos
  const frontBustWidth = (bust + BODICE_BUST_EASE_CM) / 4 + 0.5; // côté devant
  // At the hip line (largeur de bassin dos / devant, WX and YQ):
  const backHipWidth = (H + BODICE_HIP_EASE_CM) / 4 - 1;
  const frontHipWidth = (H + BODICE_HIP_EASE_CM) / 4 + 1;

  // Canvas: back drafted from the left edge (milieu dos), front from the
  // right edge (milieu devant); width leaves the panels a visible gap.
  const canvasW = Math.max(
    (bust + BODICE_BUST_EASE_CM) / 2 + 5,
    backHipWidth + frontHipWidth + 3,
  );

  // --- Waist shaping (pinces) ----------------------------------------------
  const waistTarget = (W + BODICE_WAIST_EASE_CM) / 2;
  const reduction = Math.max(backBustWidth + frontBustWidth - waistTarget, 0);
  const cbTake = reduction * 0.12; // pince milieu dos
  const sideTakeEach = reduction * 0.17; // côté dos / côté devant
  const backDartValue = reduction * 0.27; // pince dos (losange)
  const frontDartValue = reduction * 0.27; // pince devant (losange)

  const frontBustDart = bust / 20; // pince de poitrine (shoulder → bust point)

  // ==========================================================================
  // BACK (milieu dos at x = 0)
  // ==========================================================================
  const neckWidth = neck / 6 + 0.5;
  const G: Point = { x: 0, y: mm(backNeckRise) };
  const Hpt: Point = { x: mm(neckWidth), y: 0 };
  const backShoulderLen = shoulder + BACK_SHOULDER_DART_CM;
  const H1: Point = {
    x: mm(neckWidth + Math.cos(BACK_SHOULDER_ANGLE * DEG) * backShoulderLen),
    y: mm(Math.sin(BACK_SHOULDER_ANGLE * DEG) * backShoulderLen),
  };
  const N1: Point = { x: mm(acrossBack / 2), y: mm(carrureY) }; // carrure point
  const backScye: Point = { x: mm(backBustWidth), y: mm(scyeY) };
  const backWaistSide: Point = { x: mm(backBustWidth - sideTakeEach), y: mm(waistY) };
  const backSmallHip: Point = {
    x: mm((backBustWidth - sideTakeEach + backHipWidth) / 2 + 0.5),
    y: mm(smallHipY),
  };
  const backHipSide: Point = { x: mm(backHipWidth), y: mm(hipY) };
  const backHipCB: Point = { x: mm(cbTake), y: mm(hipY) };
  const backWaistCB: Point = { x: mm(cbTake), y: mm(waistY) };
  const backCarrureCB: Point = { x: 0, y: mm(carrureY) };

  // Back shoulder dart (pince d'épaule) at mid-shoulder, ~7 cm deep
  const sDir = { x: Math.cos(BACK_SHOULDER_ANGLE * DEG), y: Math.sin(BACK_SHOULDER_ANGLE * DEG) };
  const d1 = shoulder * 0.45;
  const sd1: Point = { x: mm(Hpt.x + sDir.x * d1), y: mm(Hpt.y + sDir.y * d1) };
  const sd2: Point = {
    x: mm(Hpt.x + sDir.x * (d1 + BACK_SHOULDER_DART_CM)),
    y: mm(Hpt.y + sDir.y * (d1 + BACK_SHOULDER_DART_CM)),
  };
  const sdApex: Point = { x: mm((sd1.x + sd2.x) / 2 - 0.5), y: mm(sd1.y + 7) };

  // ==========================================================================
  // FRONT (milieu devant at x = canvasW)
  // ==========================================================================
  const frontNeckDrop = neck / 6 + 1.5;
  const K: Point = { x: mm(canvasW - neckWidth), y: 0 };
  const C1: Point = { x: mm(canvasW), y: mm(frontNeckDrop) };
  const frontShoulderLen = shoulder + frontBustDart; // dart consumed on the way
  const fDir = { x: -Math.cos(FRONT_SHOULDER_ANGLE * DEG), y: Math.sin(FRONT_SHOULDER_ANGLE * DEG) };
  const T: Point = {
    x: mm(K.x + fDir.x * frontShoulderLen),
    y: mm(K.y + fDir.y * frontShoulderLen),
  };
  const N2: Point = { x: mm(canvasW - acrossFront / 2), y: mm(carrureY + 1) };
  const frontScye: Point = { x: mm(canvasW - frontBustWidth), y: mm(scyeY) };
  const frontWaistSide: Point = {
    x: mm(canvasW - frontBustWidth + sideTakeEach),
    y: mm(waistY),
  };
  const frontSmallHip: Point = {
    x: mm((canvasW - frontBustWidth + sideTakeEach + (canvasW - frontHipWidth)) / 2 - 0.5),
    y: mm(smallHipY),
  };
  const frontHipSide: Point = { x: mm(canvasW - frontHipWidth), y: mm(hipY) };
  const frontHipCF: Point = { x: mm(canvasW), y: mm(hipY) };

  // Bust point (N of the figure) and the shoulder→bust dart legs
  const bustPoint: Point = { x: mm(canvasW - bustSpan / 2), y: mm(bustHeight) };
  const f1 = shoulder * 0.4;
  const fd1: Point = { x: mm(K.x + fDir.x * f1), y: mm(K.y + fDir.y * f1) };
  const fd2: Point = {
    x: mm(K.x + fDir.x * (f1 + frontBustDart)),
    y: mm(K.y + fDir.y * (f1 + frontBustDart)),
  };

  // Diamond waist darts (cross the waistline, per the figure)
  const backDartAxisX = (cbTake + backWaistSide.x) / 2;
  const frontDartAxisX = bustPoint.x;

  const lines: PatternLine[] = [
    // ---- Back cutting outline ----------------------------------------------
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: G },
        { type: 'quad', control: { x: mm(neckWidth * 0.55), y: mm(backNeckRise * 0.2) }, to: Hpt },
        { type: 'line', to: H1 },
        { type: 'quad', control: curveControl(H1, N1, backScye), to: backScye },
        { type: 'quad', control: { x: mm(backBustWidth), y: mm((scyeY + waistY) / 2) }, to: backWaistSide },
        { type: 'quad', control: curveControl(backWaistSide, backSmallHip, backHipSide), to: backHipSide },
        { type: 'line', to: backHipCB },
        { type: 'line', to: backWaistCB },
        { type: 'line', to: backCarrureCB },
        { type: 'line', to: G },
      ],
    },
    // ---- Front cutting outline ---------------------------------------------
    {
      id: 'front-outline',
      kind: 'cut',
      label: 'front',
      segments: [
        { type: 'move', to: C1 },
        { type: 'quad', control: { x: mm(canvasW - neckWidth * 0.35), y: mm(frontNeckDrop * 0.9) }, to: K },
        { type: 'line', to: T },
        { type: 'quad', control: curveControl(T, N2, frontScye), to: frontScye },
        { type: 'quad', control: { x: mm(canvasW - frontBustWidth), y: mm((scyeY + waistY) / 2) }, to: frontWaistSide },
        { type: 'quad', control: curveControl(frontWaistSide, frontSmallHip, frontHipSide), to: frontHipSide },
        { type: 'line', to: frontHipCF },
        { type: 'line', to: C1 },
      ],
    },
    // ---- Construction lines (the figure's M, L, B, V horizontals) ----------
    horizontalLine('carrure-line', carrureY, 0, canvasW),
    horizontalLine('bust-line', scyeY, 0, canvasW),
    horizontalLine('waist-line', waistY, 0, canvasW),
    horizontalLine('small-hip-line', smallHipY, 0, canvasW),
    // across-back / across-front verticals framing the armhole (N1, N2)
    {
      id: 'across-back-axis',
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: N1.x, y: 0 } },
        { type: 'line', to: { x: N1.x, y: mm(scyeY) } },
      ],
    },
    {
      id: 'across-front-axis',
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: N2.x, y: 0 } },
        { type: 'line', to: { x: N2.x, y: mm(scyeY) } },
      ],
    },
    // ---- Shoulder darts ------------------------------------------------------
    {
      id: 'back-shoulder-dart',
      kind: 'dart',
      segments: [
        { type: 'move', to: sd1 },
        { type: 'line', to: sdApex },
        { type: 'line', to: sd2 },
      ],
    },
    {
      id: 'front-bust-dart',
      kind: 'dart',
      segments: [
        { type: 'move', to: fd1 },
        { type: 'line', to: bustPoint },
        { type: 'line', to: fd2 },
      ],
    },
    // ---- Diamond waist darts (pince dos / pince devant) ----------------------
    ...diamondDart('back-dart', backDartAxisX, carrureY + 4, waistY, waistY + 12, backDartValue),
    ...diamondDart(
      'front-dart',
      frontDartAxisX,
      bustHeight + 2,
      waistY,
      waistY + 10,
      frontDartValue,
    ),
  ];

  return {
    widthCm: mm(canvasW),
    heightCm: mm(hipY),
    lines,
    computed: {
      totalWidth: mm(canvasW),
      totalHeight: mm(hipY),
      backLength: mm(backLength),
      carrureLineY: mm(carrureY),
      bustLineY: mm(scyeY),
      waistLineY: mm(waistY),
      smallHipLineY: mm(smallHipY),
      neckWidth: mm(neckWidth),
      backShoulderAngle: BACK_SHOULDER_ANGLE,
      frontShoulderAngle: FRONT_SHOULDER_ANGLE,
      shoulderLength: mm(shoulder),
      waistReduction: mm(reduction),
      backDartValue: mm(backDartValue),
      frontDartValue: mm(frontDartValue),
      frontBustDart: mm(frontBustDart),
      backHipWidth: mm(backHipWidth),
      frontHipWidth: mm(frontHipWidth),
      bustSpan: mm(bustSpan),
    },
    points: { G, H: Hpt, H1, N1, N2, T, K, C1, bustPoint, backScye, frontScye },
  };
}
