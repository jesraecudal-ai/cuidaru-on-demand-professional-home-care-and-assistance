import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { role } = await req.json();

    let transactions = [];
    let payouts = [];

    if (role === 'client') {
      transactions = await base44.entities.PaymentTransaction.filter({ client_email: user.email });
    } else {
      transactions = await base44.entities.PaymentTransaction.filter({ provider_email: user.email });
      payouts = await base44.asServiceRole.entities.ProviderPayout.filter({ provider_email: user.email });
    }

    const completed = transactions.filter(t => t.status === 'completed');
    const totalIn = completed.filter(t => t.type === 'escrow_deposit').reduce((s, t) => s + (t.amount || 0), 0);
    const totalOut = completed.filter(t => t.type === 'payout_released').reduce((s, t) => s + (t.amount || 0), 0);
    const pending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0);
    const totalFees = completed.reduce((s, t) => s + (t.platform_fee || 0), 0);

    return Response.json({
      transactions,
      payouts,
      summary: {
        totalIn,
        totalOut,
        pending,
        totalFees,
        balance: totalIn - totalOut,
        count: completed.length,
      }
    });
  } catch (error) {
    console.error('getFinanceSummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});