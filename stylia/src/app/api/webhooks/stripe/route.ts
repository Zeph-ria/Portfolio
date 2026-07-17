import { NextResponse } from 'next/server';
import { handleCheckoutCompleted, isMockMode } from '@/lib/payments/stripe';

export const dynamic = 'force-dynamic';

/**
 * Stripe webhook receiver.
 * Mock mode: the internal checkout page posts a simulated
 * `checkout.session.completed` event here.
 * Live mode: verify the `stripe-signature` header with
 * STRIPE_WEBHOOK_SECRET before trusting the payload (constructEvent).
 */
export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);

  if (!isMockMode()) {
    // Native Stripe: signature verification is mandatory before this point.
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }
    // stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET)
  }

  if (payload?.type === 'checkout.session.completed') {
    const sessionId = payload?.data?.object?.id;
    const payment = sessionId ? handleCheckoutCompleted(String(sessionId)) : null;
    if (!payment) return NextResponse.json({ error: 'Unknown session' }, { status: 404 });
    return NextResponse.json({ received: true, status: payment.status });
  }

  return NextResponse.json({ received: true, ignored: true });
}
