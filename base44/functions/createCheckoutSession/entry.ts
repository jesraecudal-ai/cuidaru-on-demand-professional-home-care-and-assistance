import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id, amount, currency, provider_name, provider_id, provider_email, description, platform_fee_pct } = await req.json();

    if (!booking_id || !amount) return Response.json({ error: 'Missing required fields' }, { status: 400 });

    // Client pays only the service subtotal (no platform fee added to client bill)
    // Platform fee is deducted from provider payout on release
    const feePct = platform_fee_pct ?? 10;
    const platform_fee = parseFloat((amount * feePct / 100).toFixed(2));
    const provider_payout = parseFloat((amount - platform_fee).toFixed(2));

    const amountCents = Math.round(amount * 100);

    // Get or create Stripe customer for this client
    let customerId;
    const saved = await base44.asServiceRole.entities.SavedPaymentMethod.filter({ user_email: user.email, user_role: 'client' });
    if (saved.length > 0 && saved[0].stripe_customer_id) {
      customerId = saved[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email: user.email, name: user.full_name });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency || 'usd',
          product_data: {
            name: `CareBook Escrow — ${provider_name}`,
            description: description || 'Home care service booking',
            images: [],
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      }],
      mode: 'payment',
      payment_intent_data: {
        capture_method: 'automatic',
        description: `Escrow for booking ${booking_id}`,
        metadata: { booking_id, provider_id, provider_email, client_email: user.email },
      },
      success_url: `${req.headers.get('origin') || 'https://app.base44.com'}/bookings?payment=success&booking_id=${booking_id}`,
      cancel_url: `${req.headers.get('origin') || 'https://app.base44.com'}/bookings?payment=cancelled`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        booking_id,
        provider_id,
        provider_email,
        client_email: user.email,
        platform_fee: String(platform_fee || 0),
        provider_payout: String(provider_payout || 0),
      },
    });

    // Record pending transaction
    await base44.asServiceRole.entities.PaymentTransaction.create({
      booking_id,
      client_email: user.email,
      provider_id,
      provider_email,
      amount,
      platform_fee: platform_fee || 0,
      provider_payout: provider_payout || 0,
      currency: currency || 'usd',
      type: 'escrow_deposit',
      status: 'pending',
      stripe_session_id: session.id,
      description: description || `Escrow payment for booking ${booking_id}`,
    });

    return Response.json({ url: session.url, session_id: session.id });
  } catch (error) {
    console.error('createCheckoutSession error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});