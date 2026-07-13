'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from './I18nProvider';

/**
 * Mock Stripe Checkout. "Pay now" fires the same
 * `checkout.session.completed` webhook a live Stripe account would send,
 * so the downstream unlock flow is identical in both modes.
 */
export function CheckoutClient({
  sessionId,
  projectId,
  amountCents,
  currency,
}: {
  sessionId: string;
  projectId: number | null;
  amountCents: number;
  currency: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    const res = await fetch('/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: { object: { id: sessionId } },
      }),
    });
    if (res.ok) {
      router.push(projectId ? `/projects/${projectId}/guide?paid=1` : '/dashboard');
      router.refresh();
    } else {
      setBusy(false);
      setError(t.errors.generic);
    }
  }

  const amount = (amountCents / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-0">
      <div className="card text-center">
        <h1 className="text-3xl">{t.payment.checkoutTitle}</h1>
        <p className="mt-4 font-display text-5xl">
          {amount} <span className="text-2xl uppercase">{currency}</span>
        </p>
        <p className="mt-2 text-xs uppercase tracking-widest text-ink/40">{sessionId}</p>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex flex-col gap-3">
          <button className="btn-primary" onClick={pay} disabled={busy}>
            {busy ? t.payment.processing : t.payment.payNow}
          </button>
          <button
            className="btn-secondary"
            onClick={() => router.push(projectId ? `/projects/${projectId}/guide` : '/dashboard')}
          >
            {t.payment.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
