import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id, provider_id, amount, currency, card_last4, card_brand, payout_method } = await req.json();

    if (!booking_id || !amount) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    // Verify the booking belongs to this provider
    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    if (bookings.length === 0) return Response.json({ error: 'Booking not found' }, { status: 404 });

    const booking = bookings[0];
    if (booking.provider_email !== user.email) return Response.json({ error: 'Not authorized' }, { status: 403 });
    if (booking.payment_status !== 'released') return Response.json({ error: 'Payment not yet released from escrow' }, { status: 400 });

    // Record payout request (in production, would trigger real Stripe transfer to provider's card)
    const payout = await base44.asServiceRole.entities.ProviderPayout.create({
      provider_id,
      provider_email: user.email,
      amount,
      currency: currency || 'usd',
      status: 'processing',
      booking_id,
      card_last4: card_last4 || '****',
      card_brand: card_brand || 'card',
      payout_method: payout_method || 'debit_card',
      notes: `Payout for booking ${booking_id}`,
    });

    // Record outflow transaction for provider
    await base44.asServiceRole.entities.PaymentTransaction.create({
      booking_id,
      client_email: booking.client_email,
      provider_id,
      provider_email: user.email,
      amount,
      platform_fee: 0,
      provider_payout: amount,
      currency: currency || 'usd',
      type: 'payout_released',
      status: 'completed',
      description: `Payout sent to ${card_brand} •••• ${card_last4}`,
    });

    // Simulate processing → mark as paid after short delay (in production use real Stripe payouts API)
    await base44.asServiceRole.entities.ProviderPayout.update(payout.id, { status: 'paid' });

    return Response.json({ success: true, payout_id: payout.id });
  } catch (error) {
    console.error('requestPayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});