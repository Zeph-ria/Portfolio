import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getDb, type PaymentRow } from '@/lib/db';
import { CheckoutClient } from '@/components/CheckoutClient';

export const dynamic = 'force-dynamic';

export default function CheckoutPage({ params }: { params: { sessionId: string } }) {
  const user = getCurrentUser();
  if (!user) redirect('/login');

  const payment = getDb()
    .prepare('SELECT * FROM payments WHERE stripe_session_id = ? AND user_id = ?')
    .get(params.sessionId, user.id) as PaymentRow | undefined;
  if (!payment) notFound();

  if (payment.status === 'paid' && payment.project_id) {
    redirect(`/projects/${payment.project_id}/guide?paid=1`);
  }

  return (
    <CheckoutClient
      sessionId={payment.stripe_session_id}
      projectId={payment.project_id}
      amountCents={payment.amount_cents}
      currency={payment.currency}
    />
  );
}
