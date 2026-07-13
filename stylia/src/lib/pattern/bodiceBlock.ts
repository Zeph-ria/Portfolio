/**
 * ============================================================================
 * StylIA — Mathematical Engine · Bodice Block (Corsage de Base)
 * ============================================================================
 * Simplified basic bodice (back + front drafted in one frame, side seam in
 * the middle) following the classic flat-pattern logic: construction frame
 * from the bust girth, bust line, necklines, sloped shoulders, armhole
 * curve at the side seam, and waist darts.
 *
 * Secondary body measures (back length, shoulder, neck, across-back/front,
 * bust height, bust span) are interpolated from the standard size chart by
 * bust girth when not measured — the chart progresses linearly between
 * sizes, which is what makes this interpolation sound.
 *
 * Frame:
 *   Width  = (Bust + ease) / 2   (ease 4 cm total on the bust)
 *   Height = back waist length + back neck rise
 *   Bust line at bust height (hauteur de poitrine) from the shoulder line
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
import { SIZE_CHART } from './sizeChart';

export const BODICE_EASE_CM = 4; // total ease on the bust for the base block

/** Chart columns used by the bodice, keyed by bust girth (cm). */
const CHART = SIZE_CHART.map((s) => ({ bust: s.bust_circ, fr: s.fr }));

/**
 * Linear interpolation of a size-chart series against bust girth.
 * `series` holds the values for sizes 34..48 in chart order.
 */
function interp(bust: number, series: number[]): number {
  const xs = CHART.map((c) => c.bust);
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

// Size-chart series (sizes 34 → 48) for the secondary measures.
const BACK_LENGTH = [41.25, 41.5, 41.75, 42, 42.25, 42.5, 42.75, 43];
const NECK_GIRTH = [35, 36, 37, 38, 39, 40, 41, 42];
const SHOULDER_LEN = [13.4, 13.6, 13.8, 14, 14.2, 14.4, 14.6, 14.8];
const ACROSS_BACK = [34.5, 35, 35.5, 36, 36.5, 37, 37.5, 38];
const BUST_HEIGHT = [25.5, 26, 26.5, 27, 27.5, 28, 28.5, 29];
const BUST_SPAN = [18.5, 19, 19.5, 20, 20.5, 21, 21.5, 22];

export function draftBodiceBlock(m: BodyMeasurementsCm): PatternDraft {
  const bust = m.bust_circ;
  const W = m.waist_circ;

  const backLength = interp(bust, BACK_LENGTH);
  const neck = interp(bust, NECK_GIRTH);
  const shoulder = interp(bust, SHOULDER_LEN);
  const acrossBack = interp(bust, ACROSS_BACK);
  const bustHeight = interp(bust, BUST_HEIGHT);
  const bustSpan = interp(bust, BUST_SPAN);

  const totalWidth = (bust + BODICE_EASE_CM) / 2;
  const backWidth = totalWidth / 2 - 1; // back half narrower, like the skirt split
  const sideSeamX = backWidth;

  const neckWidth = neck / 6 + 0.5; // half-neck opening on the fold
  const backNeckRise = 2; // back neckline depth
  const frontNeckDrop = neck / 6 + 1.5; // front neckline depth
  const shoulderDrop = 4; // shoulder slope at the armhole end
  const armholeDepth = bust / 4 - 1; // scye depth from the top line
  const totalHeight = backLength + backNeckRise;

  // Waist shaping: distribute (half bust frame − half waist) into side + darts
  const waistReduction = totalWidth - (W + BODICE_EASE_CM) / 2;
  const sideTake = Math.max(waistReduction * 0.4, 0);
  const backDart = Math.max(waistReduction * 0.3, 0);
  const frontDart = Math.max(waistReduction * 0.3, 0);

  const topY = 0; // shoulder construction line
  const bustY = bustHeight; // bust line from the top
  const scyeY = armholeDepth; // armhole depth line
  const waistY = totalHeight;

  // --- Back panel points (left of side seam) -------------------------------
  const backNeckTop: Point = { x: mm(neckWidth), y: mm(topY) };
  const backNeckBase: Point = { x: 0, y: mm(backNeckRise) };
  const backShoulderEnd: Point = {
    x: mm(Math.min(acrossBack / 2 + 1, sideSeamX - 1)),
    y: mm(shoulderDrop),
  };
  const backScye: Point = { x: mm(sideSeamX), y: mm(scyeY) };
  const backWaistSide: Point = { x: mm(sideSeamX - sideTake / 2), y: mm(waistY) };
  const backWaistCentre: Point = { x: 0, y: mm(waistY) };

  // --- Front panel points (right of side seam) -----------------------------
  const frontNeckTop: Point = { x: mm(totalWidth - neckWidth), y: mm(topY) };
  const frontNeckBase: Point = { x: mm(totalWidth), y: mm(frontNeckDrop) };
  const frontShoulderEnd: Point = {
    x: mm(Math.max(totalWidth - acrossBack / 2 - 1.5, sideSeamX + 1)),
    y: mm(shoulderDrop),
  };
  const frontWaistSide: Point = { x: mm(sideSeamX + sideTake / 2), y: mm(waistY) };
  const frontWaistCentre: Point = { x: mm(totalWidth), y: mm(waistY) };

  // Armhole curve passes through a point slightly inside the side seam
  const backArmholeMid: Point = {
    x: mm(sideSeamX - 1.5),
    y: mm((shoulderDrop + scyeY) / 2 + 1),
  };
  const frontArmholeMid: Point = {
    x: mm(sideSeamX + 1.8),
    y: mm((shoulderDrop + scyeY) / 2 + 1.3),
  };

  const backDartAxisX = (sideSeamX - sideTake / 2) / 2;
  const frontDartAxisX = totalWidth - bustSpan / 2;
  const dartTopY = bustY + 2; // darts start below the bust line
  const dartLen = waistY - dartTopY;

  const lines: PatternLine[] = [
    {
      id: 'back-outline',
      kind: 'cut',
      label: 'back',
      segments: [
        { type: 'move', to: backNeckBase },
        // back neckline curve up to the neck point
        { type: 'quad', control: { x: mm(neckWidth * 0.55), y: mm(backNeckRise * 0.15) }, to: backNeckTop },
        // shoulder slope
        { type: 'line', to: backShoulderEnd },
        // armhole curve down to the side seam
        { type: 'quad', control: curveControl(backShoulderEnd, backArmholeMid, backScye), to: backScye },
        // side seam shaped to the waist
        { type: 'line', to: backWaistSide },
        { type: 'line', to: backWaistCentre },
        { type: 'line', to: backNeckBase },
      ],
    },
    {
      id: 'front-outline',
      kind: 'cut',
      label: 'front',
      segments: [
        { type: 'move', to: frontNeckBase },
        { type: 'quad', control: { x: mm(totalWidth - neckWidth * 0.4), y: mm(frontNeckDrop * 0.9) }, to: frontNeckTop },
        { type: 'line', to: frontShoulderEnd },
        { type: 'quad', control: curveControl(frontShoulderEnd, frontArmholeMid, backScye), to: backScye },
        { type: 'line', to: frontWaistSide },
        { type: 'line', to: frontWaistCentre },
        { type: 'line', to: frontNeckBase },
      ],
    },
    horizontalLine('bust-line', bustY, 0, totalWidth),
    horizontalLine('scye-line', scyeY, 0, totalWidth),
    {
      id: 'side-seam-axis',
      kind: 'construction',
      label: 'sideSeam',
      segments: [
        { type: 'move', to: { x: mm(sideSeamX), y: mm(scyeY) } },
        { type: 'line', to: { x: mm(sideSeamX), y: mm(waistY) } },
      ],
    },
    ...verticalDart('back-dart', backDartAxisX, dartTopY, backDart, dartLen),
    ...verticalDart('front-dart', frontDartAxisX, dartTopY, frontDart, dartLen),
  ];

  return {
    widthCm: mm(totalWidth),
    heightCm: mm(waistY),
    lines,
    computed: {
      totalWidth: mm(totalWidth),
      backLength: mm(backLength),
      bustLineY: mm(bustY),
      scyeLineY: mm(scyeY),
      neckWidth: mm(neckWidth),
      shoulderLength: mm(shoulder),
      waistReduction: mm(waistReduction),
      backDartValue: mm(backDart),
      frontDartValue: mm(frontDart),
      bustSpan: mm(bustSpan),
    },
    points: {
      backNeckTop,
      backNeckBase,
      backShoulderEnd,
      frontNeckTop,
      frontNeckBase,
      frontShoulderEnd,
      backScye,
      backWaistCentre,
      frontWaistCentre,
    },
  };
}
