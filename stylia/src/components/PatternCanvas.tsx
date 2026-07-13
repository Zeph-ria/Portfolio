'use client';

import { useMemo } from 'react';
import type { SkirtDraft, PatternLine } from '@/lib/pattern/skirtBlock';
import { segmentsToPath } from '@/lib/pattern/svg';
import { useI18n } from './I18nProvider';

const CM_TO_MM = 10;

function strokeProps(kind: PatternLine['kind'], highlighted: boolean) {
  const base =
    kind === 'cut'
      ? { stroke: '#141210', strokeWidth: 1.4 }
      : kind === 'construction'
        ? { stroke: '#8a8378', strokeWidth: 0.7, strokeDasharray: '8 3 1.5 3' }
        : { stroke: '#b08d57', strokeWidth: 1.1 };
  return highlighted ? { ...base, stroke: '#b08d57', strokeWidth: base.strokeWidth + 1 } : base;
}

/**
 * Interactive SVG canvas: renders the drafted block in real time,
 * revealing lines progressively as the guide steps advance and
 * highlighting the lines belonging to the active step.
 */
export function PatternCanvas({
  draft,
  visibleLineIds,
  activeLineIds,
  watermark,
}: {
  draft: SkirtDraft;
  visibleLineIds: string[];
  activeLineIds: string[];
  watermark?: string | null;
}) {
  const { t } = useI18n();
  const margin = 25; // mm
  const w = draft.widthCm * CM_TO_MM + margin * 2;
  const h = draft.heightCm * CM_TO_MM + margin * 2;

  const paths = useMemo(
    () =>
      draft.lines.map((line) => ({
        line,
        d: segmentsToPath(line.segments),
      })),
    [draft],
  );

  const hipY = draft.computed.hipLineY * CM_TO_MM;

  return (
    <div className="relative h-full w-full overflow-auto rounded-2xl border border-ink/10 bg-white shadow-couture">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto min-h-full w-full" role="img" aria-label={t.guide.canvasTitle}>
        <rect width={w} height={h} fill="#fdfcf9" />
        {/* faint 5 cm grid, like pattern paper */}
        <g stroke="#141210" strokeOpacity="0.05" strokeWidth="0.5">
          {Array.from({ length: Math.floor(w / 50) }, (_, i) => (
            <line key={`v${i}`} x1={(i + 1) * 50} y1={0} x2={(i + 1) * 50} y2={h} />
          ))}
          {Array.from({ length: Math.floor(h / 50) }, (_, i) => (
            <line key={`h${i}`} x1={0} y1={(i + 1) * 50} x2={w} y2={(i + 1) * 50} />
          ))}
        </g>

        {watermark && (
          <text
            x={w / 2}
            y={h / 2}
            fontSize={Math.min(w, h) / 9}
            fill="#141210"
            fillOpacity="0.06"
            textAnchor="middle"
            transform={`rotate(-30 ${w / 2} ${h / 2})`}
          >
            {watermark}
          </text>
        )}

        <g transform={`translate(${margin} ${margin})`}>
          {paths
            .filter(({ line }) => visibleLineIds.includes(line.id))
            .map(({ line, d }) => (
              <path
                key={line.id}
                d={d}
                fill="none"
                className="transition-all duration-300"
                {...strokeProps(line.kind, activeLineIds.includes(line.id))}
              />
            ))}

          {/* dimension annotations */}
          {visibleLineIds.includes('hip-line') && (
            <text x={4} y={hipY - 4} fontSize="11" fill="#8a8378">
              {t.wizard.hip} · {draft.computed.totalWidth} cm
            </text>
          )}
          <text x={4} y={-8} fontSize="11" fill="#8a8378">
            {t.wizard.waist}
          </text>
        </g>
      </svg>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-4 rounded-full bg-white/85 px-4 py-2 text-[11px] text-ink/70 backdrop-blur">
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-ink" /> {t.guide.legendCut}
        </span>
        <span className="flex items-center gap-2">
          <svg width="24" height="2">
            <line x1="0" y1="1" x2="24" y2="1" stroke="#8a8378" strokeWidth="2" strokeDasharray="6 2 1 2" />
          </svg>
          {t.guide.legendConstruction}
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-gold" /> {t.guide.legendDart}
        </span>
      </div>
    </div>
  );
}
