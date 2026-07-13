import { randomBytes } from 'node:crypto';
import { getDb, type PaymentRow, type ProjectRow, type UserRow } from '../db';

/**
 * Stripe integration — mock-first, swappable for the native SDK.
 *
 * When STRIPE_SECRET_KEY is unset (development / demo), checkout sessions
 * are simulated: `createCheckoutSession` returns an internal /checkout/<id>
 * URL and the "webhook" is fired by the mock checkout page hitting
 * /api/webhooks/stripe with a checkout.session.completed event.
 *
 * To go native: set STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET and replace
 * the body of `createCheckoutSession` with a stripe.checkout.sessions.create
 * call — the webhook handler and the gating logic stay identical.
 */

export const EXPORT_PRICE_CENTS = 490; // €4.90 one-time unlock

export function isMockMode(): boolean {
  return !process.env.STRIPE_SECRET_KEY;
}

export interface CheckoutSession {
  sessionId: string;
  url: string;
}

export function createCheckoutSession(user: UserRow, projectId: number): CheckoutSession {
  const db = getDb();
  const sessionId = `cs_${isMockMode() ? 'mock' : 'live'}_${randomBytes(12).toString('hex')}`;
  db.prepare(
    `INSERT INTO payments (user_id, project_id, stripe_session_id, amount_cents, currency)
     VALUES (?, ?, ?, ?, 'eur')`,
  ).run(user.id, projectId, sessionId, EXPORT_PRICE_CENTS);

  return { sessionId, url: `/checkout/${sessionId}` };
}

/**
 * Handles a (mock or live) `checkout.session.completed` webhook event:
 * marks the payment paid and unlocks full-size export on the project.
 */
export function handleCheckoutCompleted(sessionId: string): PaymentRow | null {
  const db = getDb();
  const payment = db
    .prepare('SELECT * FROM payments WHERE stripe_session_id = ?')
    .get(sessionId) as PaymentRow | undefined;
  if (!payment) return null;

  db.prepare(
    `UPDATE payments SET status = 'paid', updated_at = datetime('now') WHERE id = ?`,
  ).run(payment.id);
  if (payment.project_id) {
    db.prepare(
      `UPDATE projects SET paid = 1, updated_at = datetime('now') WHERE id = ?`,
    ).run(payment.project_id);
  }
  return { ...payment, status: 'paid' };
}

/**
 * Export gating rule:
 *  - Professional Tailors always export full size.
 *  - Users with an active subscription always export full size.
 *  - Hobbyists must have generated the project AND paid the one-time unlock;
 *    a Hobbyist draft is never exportable full size.
 */
export function canExportFullSize(user: UserRow, project: ProjectRow): boolean {
  if (user.role === 'professional') return true;
  if (user.subscription_status === 'active') return true;
  return project.status === 'generated' && project.paid === 1;
}
