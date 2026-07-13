import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getDb, type Role, type UserRow } from './db';

const SESSION_COOKIE = 'stylia_session';
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function registerUser(opts: {
  email: string;
  password: string;
  displayName: string;
  role: Role;
  locale?: string;
}): Promise<UserRow> {
  const db = getDb();
  const password_hash = await bcrypt.hash(opts.password, 10);
  const locale = ['fr', 'en', 'es'].includes(opts.locale ?? '') ? opts.locale : 'fr';
  const info = db
    .prepare(
      `INSERT INTO users (email, password_hash, display_name, role, locale)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(opts.email.trim().toLowerCase(), password_hash, opts.displayName.trim(), opts.role, locale);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as UserRow;
}

export async function verifyCredentials(email: string, password: string): Promise<UserRow | null> {
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? user : null;
}

export function createSession(userId: number): void {
  const db = getDb();
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + SESSION_DAYS * 86400_000);
  db.prepare(
    `INSERT INTO sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
  ).run(userId, hashToken(token), expires.toISOString());

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires,
    path: '/',
  });
}

export function destroySession(): void {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  }
  cookies().delete(SESSION_COOKIE);
}

/** Returns the authenticated user for the current request, or null. */
export function getCurrentUser(): UserRow | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const db = getDb();
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ? AND s.expires_at > datetime('now')`,
    )
    .get(hashToken(token)) as UserRow | undefined;
  return row ?? null;
}

/** Throws a 401-style error object for API routes when unauthenticated. */
export function requireUser(): UserRow {
  const user = getCurrentUser();
  if (!user) throw Object.assign(new Error('Unauthorized'), { status: 401 });
  return user;
}
