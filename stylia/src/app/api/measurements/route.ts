import { NextResponse } from 'next/server';
import { getDb, type MeasurementRow } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { inchToCm } from '@/lib/units';

export const dynamic = 'force-dynamic';

const FIELDS = ['bust_circ', 'waist_circ', 'hip_circ', 'waist_to_hip_height', 'total_length'] as const;
// Optional "petites hanches" measures — the drafting engine derives
// size-chart fallbacks when they are absent.
const OPTIONAL_FIELDS = ['small_hip_circ', 'small_hip_height'] as const;

export async function GET() {
  try {
    const user = requireUser();
    const rows = getDb()
      .prepare('SELECT * FROM measurements WHERE user_id = ? ORDER BY updated_at DESC')
      .all(user.id) as MeasurementRow[];
    return NextResponse.json(rows);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = requireUser();
    const body = await req.json();
    const unit = body.unit === 'inch' ? 'inch' : 'cm';

    // Canonical storage is cm — convert incoming inch values.
    const cm: Record<string, number> = {};
    for (const f of FIELDS) {
      const v = Number(body[f]);
      if (!Number.isFinite(v) || v <= 0) {
        return NextResponse.json({ error: `Invalid ${f}` }, { status: 400 });
      }
      cm[f] = Math.round((unit === 'inch' ? inchToCm(v) : v) * 10) / 10;
    }

    const optional: Record<string, number | null> = {};
    for (const f of OPTIONAL_FIELDS) {
      const v = Number(body[f]);
      optional[f] =
        Number.isFinite(v) && v > 0 ? Math.round((unit === 'inch' ? inchToCm(v) : v) * 10) / 10 : null;
    }

    const profileName = String(body.profile_name ?? '').trim() || 'Myself';
    const info = getDb()
      .prepare(
        `INSERT INTO measurements
           (user_id, profile_name, unit, bust_circ, waist_circ, hip_circ, waist_to_hip_height, total_length,
            small_hip_circ, small_hip_height)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        user.id,
        profileName,
        unit,
        cm.bust_circ,
        cm.waist_circ,
        cm.hip_circ,
        cm.waist_to_hip_height,
        cm.total_length,
        optional.small_hip_circ,
        optional.small_hip_height,
      );

    const row = getDb()
      .prepare('SELECT * FROM measurements WHERE id = ?')
      .get(info.lastInsertRowid) as MeasurementRow;
    return NextResponse.json(row, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
