import { NextResponse } from 'next/server';
import { getDb, type MeasurementRow, type ProjectRow } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { draftGarment } from '@/lib/pattern/garments';
import { draftToPdf, type PaperFormat } from '@/lib/export/pdf';
import { canExportFullSize } from '@/lib/payments/stripe';

export const dynamic = 'force-dynamic';

/**
 * Full-size PDF export, tiled to the requested paper format.
 * Gating: Hobbyists with a draft/unpaid project receive 402 Payment Required
 * until a successful payment webhook or an active subscription is verified.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
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

    if (!canExportFullSize(user, project)) {
      return NextResponse.json(
        { error: 'Payment required', code: 'payment_required' },
        { status: 402 },
      );
    }

    const url = new URL(req.url);
    const requested = url.searchParams.get('format') ?? user.paper_format;
    const format: PaperFormat = ['A4', 'USLetter', 'A0', 'FullSize'].includes(requested)
      ? (requested as PaperFormat)
      : 'A4';

    const m = db
      .prepare('SELECT * FROM measurements WHERE id = ?')
      .get(project.measurement_id) as MeasurementRow;

    const pdf = draftToPdf(draftGarment(project.garment_type, m), {
      format,
      title: `StylIA · ${project.name}`,
      watermark: null,
    });

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="stylia-${project.id}-${format}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
