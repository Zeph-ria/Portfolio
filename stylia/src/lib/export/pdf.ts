import type { PatternLine, PatternDraft as SkirtDraft } from '../pattern/types';

/**
 * Dependency-free vector PDF generator.
 *
 * The pattern is drafted in millimetres and rendered at TRUE SCALE
 * (1 mm on paper = 1 mm of pattern). Formats smaller than the pattern
 * (A4 / US Letter) are tiled into a page grid with alignment crop marks
 * and "row/column" labels so the sheets can be taped together; A0 usually
 * fits a block on a single sheet. 'FullSize' emits ONE page sized exactly
 * to the pattern (plus margins) for plotter / copy-shop printing at 100%.
 */

export type PaperFormat = 'A4' | 'USLetter' | 'A0' | 'FullSize';

const PT_PER_MM = 72 / 25.4;
const CM_TO_MM = 10;

const PAPER_PT: Record<Exclude<PaperFormat, 'FullSize'>, { w: number; h: number }> = {
  A4: { w: 595.28, h: 841.89 },
  USLetter: { w: 612, h: 792 },
  A0: { w: 2383.94, h: 3370.39 },
};

const PAGE_MARGIN_MM = 10;

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function dashFor(kind: PatternLine['kind']): string {
  switch (kind) {
    case 'cut':
      return '[] 0 d 1.2 w 0 0 0 RG';
    case 'construction':
      return '[8 3 1.5 3] 0 d 0.5 w 0.54 0.51 0.47 RG';
    case 'dart':
      return '[] 0 d 0.9 w 0.69 0.55 0.34 RG';
  }
}

export interface PdfOptions {
  format: PaperFormat;
  title: string;
  watermark?: string | null;
}

export function draftToPdf(draft: SkirtDraft, opts: PdfOptions): Buffer {
  const patternWmm = draft.widthCm * CM_TO_MM + 20; // 10 mm padding each side
  const patternHmm = draft.heightCm * CM_TO_MM + 20;
  const patternWpt = patternWmm * PT_PER_MM;
  const patternHpt = patternHmm * PT_PER_MM;

  // 'FullSize': one custom page matching the real pattern dimensions.
  const paper =
    opts.format === 'FullSize'
      ? {
          w: patternWpt + 2 * PAGE_MARGIN_MM * PT_PER_MM,
          h: patternHpt + 2 * PAGE_MARGIN_MM * PT_PER_MM,
        }
      : PAPER_PT[opts.format];
  const printW = paper.w - 2 * PAGE_MARGIN_MM * PT_PER_MM;
  const printH = paper.h - 2 * PAGE_MARGIN_MM * PT_PER_MM;

  const cols = Math.max(1, Math.ceil(patternWpt / printW));
  const rows = Math.max(1, Math.ceil(patternHpt / printH));

  // Pre-render the pattern path operators once (shared by all tiles).
  // Pattern space: millimetres, y DOWN. PDF space: points, y UP.
  // Mapping handled per-tile with a `cm` matrix [s 0 0 -s tx ty].
  const body: string[] = [];
  for (const line of draft.lines) {
    body.push(dashFor(line.kind));
    for (const seg of line.segments) {
      if (seg.type === 'move') {
        body.push(`${mmx(seg.to.x)} ${mmy(seg.to.y)} m`);
      } else if (seg.type === 'line') {
        body.push(`${mmx(seg.to.x)} ${mmy(seg.to.y)} l`);
      } else {
        // Quadratic → cubic Bézier elevation. The previous point is tracked
        // implicitly by PDF; we compute controls from stored segment data.
        body.push(quadToCubic(line, seg));
      }
    }
    body.push('S');
  }

  function mmx(cmVal: number): string {
    return ((cmVal * CM_TO_MM + 10) * PT_PER_MM).toFixed(2);
  }
  function mmy(cmVal: number): string {
    return (-(cmVal * CM_TO_MM + 10) * PT_PER_MM).toFixed(2);
  }
  function quadToCubic(line: PatternLine, seg: Extract<PatternLine['segments'][number], { type: 'quad' }>): string {
    // find the previous segment's endpoint
    const idx = line.segments.indexOf(seg);
    const prev = line.segments[idx - 1];
    const p0 = prev && 'to' in prev ? prev.to : seg.to;
    const c1x = p0.x + (2 / 3) * (seg.control.x - p0.x);
    const c1y = p0.y + (2 / 3) * (seg.control.y - p0.y);
    const c2x = seg.to.x + (2 / 3) * (seg.control.x - seg.to.x);
    const c2y = seg.to.y + (2 / 3) * (seg.control.y - seg.to.y);
    return `${mmx(c1x)} ${mmy(c1y)} ${mmx(c2x)} ${mmy(c2y)} ${mmx(seg.to.x)} ${mmy(seg.to.y)} c`;
  }

  const patternOps = body.join('\n');
  const marginPt = PAGE_MARGIN_MM * PT_PER_MM;

  const pageStreams: string[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tx = marginPt - c * printW;
      const ty = paper.h - marginPt + r * printH; // pattern y grows down
      const label = `${opts.title} — ${r + 1}/${rows} × ${c + 1}/${cols}  (${opts.format}, 100%)`;
      const watermark = opts.watermark
        ? `q BT /F1 ${Math.min(paper.w, paper.h) / 10} Tf 0.92 0.90 0.87 rg 1 0 0 1 ${paper.w * 0.12} ${paper.h * 0.35} Tm 30 Tz (${esc(opts.watermark)}) Tj ET Q`
        : '';
      pageStreams.push(
        [
          // crop-mark frame at the printable boundary
          `q 0.3 w 0.7 0.7 0.7 RG [2 3] 0 d ${marginPt.toFixed(2)} ${marginPt.toFixed(2)} ${printW.toFixed(2)} ${printH.toFixed(2)} re S Q`,
          `q BT /F1 8 Tf 0.4 0.37 0.33 rg ${marginPt.toFixed(2)} ${(marginPt - 10).toFixed(2)} Td (${esc(label)}) Tj ET Q`,
          watermark,
          // clip to the printable area, then draw the translated pattern
          `q ${marginPt.toFixed(2)} ${marginPt.toFixed(2)} ${printW.toFixed(2)} ${printH.toFixed(2)} re W n`,
          `1 0 0 1 ${tx.toFixed(2)} ${ty.toFixed(2)} cm`,
          patternOps,
          'Q',
        ].join('\n'),
      );
    }
  }

  // ---- Assemble the PDF file ------------------------------------------------
  const objects: string[] = [];
  const addObj = (content: string): number => {
    objects.push(content);
    return objects.length; // 1-indexed object number
  };

  const fontNum = addObj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const pageNums: number[] = [];
  const contentNums: number[] = [];
  for (const stream of pageStreams) {
    const bytes = Buffer.byteLength(stream, 'utf8');
    contentNums.push(addObj(`<< /Length ${bytes} >>\nstream\n${stream}\nendstream`));
  }
  // The Pages object is written right after the N page objects that follow.
  const pagesNum = objects.length + pageStreams.length + 1;

  for (const contentNum of contentNums) {
    pageNums.push(
      addObj(
        `<< /Type /Page /Parent ${pagesNum} 0 R /MediaBox [0 0 ${paper.w} ${paper.h}] ` +
          `/Resources << /Font << /F1 ${fontNum} 0 R >> >> /Contents ${contentNum} 0 R >>`,
      ),
    );
  }
  const actualPagesNum = addObj(
    `<< /Type /Pages /Kids [${pageNums.map((n) => `${n} 0 R`).join(' ')}] /Count ${pageNums.length} >>`,
  );
  const catalogNum = addObj(`<< /Type /Catalog /Pages ${actualPagesNum} 0 R >>`);

  let out = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out, 'utf8'));
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xrefStart = Buffer.byteLength(out, 'utf8');
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    out += `${off.toString().padStart(10, '0')} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogNum} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  return Buffer.from(out, 'utf8');
}
