import { NextResponse } from 'next/server';
import { getDb, type ProjectRow } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = requireUser();
    const rows = getDb()
      .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
      .all(user.id) as ProjectRow[];
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

/**
 * Creates a project. When a valid measurement profile is attached the
 * pattern is immediately draftable, so status flips to 'generated' and the
 * output SVG endpoint is recorded as output_svg_url.
 */
export async function POST(req: Request) {
  try {
    const user = requireUser();
    const body = await req.json();

    const measurementId = Number(body.measurement_id) || null;
    if (measurementId) {
      const owned = getDb()
        .prepare('SELECT id FROM measurements WHERE id = ? AND user_id = ?')
        .get(measurementId, user.id);
      if (!owned) return NextResponse.json({ error: 'Unknown measurement profile' }, { status: 400 });
    }

    const name = String(body.name ?? '').trim() || 'Untitled';
    const garment = String(body.garment_type ?? 'straight_skirt_base');
    const photo = typeof body.input_photo_url === 'string' ? body.input_photo_url.slice(0, 4_000_000) : null;
    const tags = Array.isArray(body.textile_tags) ? JSON.stringify(body.textile_tags.slice(0, 10)) : '[]';
    const status = measurementId ? 'generated' : 'draft';

    const info = getDb()
      .prepare(
        `INSERT INTO projects
           (user_id, measurement_id, name, garment_type, status, input_photo_url, textile_tags)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(user.id, measurementId, name, garment, status, photo, tags);

    const id = Number(info.lastInsertRowid);
    getDb()
      .prepare('UPDATE projects SET output_svg_url = ? WHERE id = ?')
      .run(`/api/projects/${id}/svg`, id);

    const row = getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as ProjectRow;
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
