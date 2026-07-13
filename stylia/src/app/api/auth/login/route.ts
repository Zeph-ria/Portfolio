import { NextResponse } from 'next/server';
import { createSession, verifyCredentials } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const user = await verifyCredentials(String(body?.email ?? ''), String(body?.password ?? ''));
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  createSession(user.id);
  return NextResponse.json({ id: user.id, email: user.email, role: user.role });
}
