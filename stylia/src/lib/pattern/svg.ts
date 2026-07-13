import type { PatternLine, Segment, SkirtDraft } from './skirtBlock';

/**
 * SVG rendering of a pattern draft.
 * The SVG user unit is the MILLIMETRE (1 unit = 1 mm) so a full-size print
 * at 100% scale is dimensionally exact.
 */

const CM_TO_MM = 10;

export function segmentsToPath(segments: Segment[]): string {
  return segments
    .map((s) => {
      switch (s.type) {
        case 'move':
          return `M ${s.to.x * CM_TO_MM} ${s.to.y * CM_TO_MM}`;
        case 'line':
          return `L ${s.to.x * CM_TO_MM} ${s.to.y * CM_TO_MM}`;
        case 'quad':
          return `Q ${s.control.x * CM_TO_MM} ${s.control.y * CM_TO_MM} ${s.to.x * CM_TO_MM} ${s.to.y * CM_TO_MM}`;
      }
    })
    .join(' ');
}

/** Technical pattern-marker styles per line kind. */
export function strokeAttrs(kind: PatternLine['kind']): string {
  switch (kind) {
    case 'cut':
      // solid cutting path
      return 'stroke="#141210" stroke-width="1.2" fill="none"';
    case 'construction':
      // dash-dotted construction line
      return 'stroke="#8a8378" stroke-width="0.6" stroke-dasharray="8 3 1.5 3" fill="none"';
    case 'dart':
      return 'stroke="#b08d57" stroke-width="1" fill="none"';
  }
}

export interface SvgOptions {
  watermark?: string | null;
  marginMm?: number;
}

/** Standalone, print-accurate SVG document for a drafted skirt block. */
export function draftToSvg(draft: SkirtDraft, opts: SvgOptions = {}): string {
  const margin = opts.marginMm ?? 20;
  const w = draft.widthCm * CM_TO_MM + margin * 2;
  const h = draft.heightCm * CM_TO_MM + margin * 2;

  const paths = draft.lines
    .map(
      (line) =>
        `  <path id="${line.id}" d="${segmentsToPath(line.segments)}" ${strokeAttrs(line.kind)} />`,
    )
    .join('\n');

  const watermark = opts.watermark
    ? `  <text x="${w / 2}" y="${h / 2}" font-size="${Math.min(w, h) / 8}" fill="#141210" fill-opacity="0.08" text-anchor="middle" transform="rotate(-30 ${w / 2} ${h / 2})" font-family="sans-serif">${opts.watermark}</text>`
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#faf7f2" />
${watermark}
  <g transform="translate(${margin} ${margin})">
${paths}
  </g>
</svg>
`;
}
