import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  try {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    let event;
    if (webhookSecret) {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    const base44 = createClientFromRequest(req);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const { booking_id, provider_id, provider_email, client_email, platform_fee, provider_payout } = session.metadata || {};

      if (!booking_id) {
        console.log('No booking_id in metadata, skipping');
        return Response.json({ received: true });
      }

      // Update transaction to completed
      const transactions = await base44.asServiceRole.entities.PaymentTransaction.filter({ stripe_session_id: session.id });
      if (transactions.length > 0) {
        await base44.asServiceRole.entities.PaymentTransaction.update(transactions[0].id, {
          status: 'completed',
          stripe_payment_intent_id: session.payment_intent,
        });
      }

      // Update booking to paid, store payment_intent_id for later release
      const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
      if (bookings.length > 0) {
        await base44.asServiceRole.entities.Booking.update(bookings[0].id, {
          status: 'paid_confirmed',
          payment_status: 'paid_held',
          stripe_payment_intent_id: session.payment_intent,
        });
      }

      console.log(`Payment completed for booking ${booking_id}, PI: ${session.payment_intent}`);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const pi = event.data.object;
      const { booking_id } = pi.metadata || {};
      if (booking_id) {
        const transactions = await base44.asServiceRole.entities.PaymentTransaction.filter({ booking_id });
        if (transactions.length > 0) {
          await base44.asServiceRole.entities.PaymentTransaction.update(transactions[0].id, { status: 'failed' });
        }
      }
      console.log(`Payment failed for booking ${booking_id}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});