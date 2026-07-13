/**
 * Shared pattern-drafting geometry types.
 * All coordinates are in CENTIMETRES (canonical unit, 0.1 mm precision),
 * origin at the top-left of the block, X rightwards, Y downwards.
 */

export type Point = { x: number; y: number };

export type Segment =
  | { type: 'move'; to: Point }
  | { type: 'line'; to: Point }
  | { type: 'quad'; control: Point; to: Point };

export type LineKind = 'cut' | 'construction' | 'dart';

export interface PatternLine {
  id: string;
  kind: LineKind;
  label?: string;
  segments: Segment[];
}

/** A drafted 2D pattern block, garment-agnostic. */
export interface PatternDraft {
  /** overall bounding box of the block, cm */
  widthCm: number;
  heightCm: number;
  lines: PatternLine[];
  /** named numeric results of the drafting formulas, for annotations */
  computed: Record<string, number>;
  /** named construction points */
  points: Record<string, Point>;
}

/** keep 0.01 cm = 0.1 mm precision */
export const mm = (v: number): number => Math.round(v * 100) / 100;

/**
 * Quadratic control chosen so the curve passes exactly through `through`
 * at t = 0.5:  control = 2·P − (P₀ + P₂)/2.
 */
export function curveControl(p0: Point, through: Point, p2: Point): Point {
  return {
    x: mm(2 * through.x - (p0.x + p2.x) / 2),
    y: mm(2 * through.y - (p0.y + p2.y) / 2),
  };
}

/** Isoceles waist dart (solid legs + dash-dotted axis) on a vertical axis. */
export function verticalDart(
  id: string,
  axisX: number,
  topY: number,
  value: number,
  length: number,
): PatternLine[] {
  const half = value / 2;
  return [
    {
      id: `${id}-legs`,
      kind: 'dart',
      segments: [
        { type: 'move', to: { x: mm(axisX - half), y: mm(topY) } },
        { type: 'line', to: { x: mm(axisX), y: mm(topY + length) } },
        { type: 'line', to: { x: mm(axisX + half), y: mm(topY) } },
      ],
    },
    {
      id: `${id}-axis`,
      kind: 'construction',
      segments: [
        { type: 'move', to: { x: mm(axisX), y: mm(topY) } },
        { type: 'line', to: { x: mm(axisX), y: mm(topY + length) } },
      ],
    },
  ];
}

/** Horizontal dash-dotted construction line across the block. */
export function horizontalLine(id: string, y: number, x0: number, x1: number): PatternLine {
  return {
    id,
    kind: 'construction',
    segments: [
      { type: 'move', to: { x: mm(x0), y: mm(y) } },
      { type: 'line', to: { x: mm(x1), y: mm(y) } },
    ],
  };
}
