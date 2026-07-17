import { NextResponse } from 'next/server';
import { getDb, type ProjectRow } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/payments/stripe';

export const dynamic = 'force-dynamic';

/** Creates a (mock) Stripe Checkout session for a project export unlock. */
export async function POST(req: Request) {
  try {
    const user = requireUser();
    const body = await req.json();
    const projectId = Number(body.project_id);

    const project = getDb()
      .prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
      .get(projectId, user.id) as ProjectRow | undefined;
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const session = createCheckoutSession(user, project.id);
    return NextResponse.json(session, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
