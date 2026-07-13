import { NextResponse } from 'next/server';
import { getDb, type MeasurementRow, type ProjectRow } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { draftStraightSkirt } from '@/lib/pattern/skirtBlock';
import { draftToSvg } from '@/lib/pattern/svg';
import { canExportFullSize } from '@/lib/payments/stripe';

export const dynamic = 'force-dynamic';

/** Streams the drafted pattern as a standalone print-accurate SVG. */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = requireUser();
    const db = getDb();
    const project = db
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(Number(params.id), user.id) as ProjectRow | undefined;
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!project.measurement_id) {
      return NextResponse.json({ error: 'No measurements attached' }, { status: 409 });
    }

    const m = db
      .prepare('SELECT * FROM measurements WHERE id = ?')
      .get(project.measurement_id) as MeasurementRow;

    const draft = draftStraightSkirt(m);
    const svg = draftToSvg(draft, {
      watermark: canExportFullSize(user, project) ? null : 'STYLIA · DRAFT',
    });

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': `inline; filename="stylia-pattern-${project.id}.svg"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
