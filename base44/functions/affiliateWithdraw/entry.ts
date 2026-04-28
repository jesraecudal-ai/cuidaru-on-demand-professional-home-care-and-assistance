import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, method, payout_details } = await req.json();

    if (!amount || amount <= 0) return Response.json({ error: 'Invalid amount' }, { status: 400 });
    if (!method) return Response.json({ error: 'Payout method required' }, { status: 400 });

    // Get affiliate record
    const affiliates = await base44.asServiceRole.entities.AffiliateUser.filter({ user_email: user.email });
    if (affiliates.length === 0) return Response.json({ error: 'Affiliate account not found' }, { status: 404 });

    const affiliate = affiliates[0];

    if ((affiliate.pending_commission || 0) < amount) {
      return Response.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Create withdrawal record
    const withdrawal = await base44.asServiceRole.entities.AffiliateWithdrawal.create({
      affiliate_id: affiliate.id,
      affiliate_email: user.email,
      amount,
      method,
      payout_details: payout_details || '',
      status: 'processing',
      notes: `Withdrawal via ${method}`,
    });

    // Deduct from pending and add to total_withdrawn
    await base44.asServiceRole.entities.AffiliateUser.update(affiliate.id, {
      pending_commission: (affiliate.pending_commission || 0) - amount,
      total_withdrawn: (affiliate.total_withdrawn || 0) + amount,
    });

    // Mark referrals as paid
    const earnedReferrals = await base44.asServiceRole.entities.AffiliateReferral.filter({
      affiliate_id: affiliate.id,
      commission_status: 'earned',
    });
    for (const r of earnedReferrals) {
      await base44.asServiceRole.entities.AffiliateReferral.update(r.id, { commission_status: 'paid' });
    }

    // Mark withdrawal as paid
    await base44.asServiceRole.entities.AffiliateWithdrawal.update(withdrawal.id, { status: 'paid' });

    console.log(`Affiliate ${user.email} withdrew ${amount} via ${method}`);
    return Response.json({ success: true, withdrawal_id: withdrawal.id });
  } catch (error) {
    console.error('affiliateWithdraw error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});