import { NextResponse } from 'next/server';
import { createSession, registerUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const displayName = String(body?.displayName ?? '').trim();
  const role = body?.role === 'professional' ? 'professional' : 'hobbyist';

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !displayName) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  try {
    const user = await registerUser({ email, password, displayName, role, locale: body?.locale });
    createSession(user.id);
    return NextResponse.json({ id: user.id, email: user.email, role: user.role });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Account exists', code: 'exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
