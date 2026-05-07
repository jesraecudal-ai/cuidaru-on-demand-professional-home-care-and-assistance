import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * releasePayment
 *
 * Called when:
 *   1. Client manually clicks "Release Payment" in the Bookings page
 *   2. autoReleasePayments scheduler fires after 24h
 *
 * In TEST MODE: skips all Stripe verification and directly marks payment as released.
 * In LIVE MODE: verifies Stripe PaymentIntent and optionally transfers via Connect.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { booking_id } = await req.json();
    if (!booking_id) return Response.json({ error: 'booking_id is required' }, { status: 400 });

    const bookings = await base44.asServiceRole.entities.Booking.filter({ id: booking_id });
    if (bookings.length === 0) return Response.json({ error: 'Booking not found' }, { status: 404 });
    const booking = bookings[0];

    if (booking.client_email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Not authorized to release this payment' }, { status: 403 });
    }

    const releasableStatuses = ['completed', 'release_pending', 'paid_confirmed'];
    if (!releasableStatuses.includes(booking.status) && booking.payment_status !== 'paid_held' && booking.payment_status !== 'release_pending') {
      return Response.json({ error: `Cannot release payment with status: ${booking.status}` }, { status: 400 });
    }

    // --- Check payment mode ---
    const settings = await base44.asServiceRole.entities.AppSettings.filter({ key: 'payment_mode' });
    const isTestMode = settings.length > 0 && settings[0].value === 'test';

    if (isTestMode) {
      console.log(`[releasePayment] TEST MODE — simulating release for booking ${booking_id}`);

      // Look up provider for premium check
      const providerProfiles = await base44.asServiceRole.entities.ServiceProvider.filter({ user_email: booking.provider_email });
      const providerProfile = providerProfiles[0] || null;
      const providerIsPremium = providerProfile?.is_premium === true &&
        (!providerProfile?.premium_expires_at || new Date(providerProfile.premium_expires_at) > new Date());

      let providerPayout = booking.provider_payout;
      if (providerIsPremium && booking.platform_fee > 0) {
        providerPayout = booking.subtotal || (booking.total_amount + booking.platform_fee);
        await base44.asServiceRole.entities.Booking.update(booking_id, { provider_payout: providerPayout, platform_fee: 0, platform_fee_pct: 0 });
      }

      await base44.asServiceRole.entities.Booking.update(booking_id, {
        status: 'payment_released',
        payment_status: 'released',
      });

      const transactions = await base44.asServiceRole.entities.PaymentTransaction.filter({ booking_id, type: 'escrow_deposit' });
      if (transactions.length > 0) {
        await base44.asServiceRole.entities.PaymentTransaction.update(transactions[0].id, { status: 'completed' });
      }

      const payoutRecord = await base44.asServiceRole.entities.ProviderPayout.create({
        provider_id: booking.provider_id,
        provider_email: booking.provider_email,
        amount: providerPayout,
        currency: 'usd',
        status: 'paid',
        booking_id,
        notes: '[TEST] Simulated payout release',
      });

      await base44.asServiceRole.entities.PaymentTransaction.create({
        booking_id,
        client_email: booking.client_email,
        provider_id: booking.provider_id,
        provider_email: booking.provider_email,
        amount: providerPayout,
        platform_fee: 0,
        provider_payout: providerPayout,
        currency: 'usd',
        type: 'payout_released',
        status: 'completed',
        description: '[TEST] Simulated payout release',
      });

      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.provider_email,
        type: 'payment_released',
        title: 'Payment Released 💰',
        body: `[TEST] Your payment of $${providerPayout?.toFixed(2)} for the job with ${booking.client_name} has been released.`,
        link: '/payouts',
        is_read: false,
        reference_id: booking_id,
      });

      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.client_email,
        type: 'payment_released',
        title: 'Payment Released',
        body: `[TEST] Your payment for ${booking.provider_name} has been released successfully.`,
        link: '/bookings',
        is_read: false,
        reference_id: booking_id,
      });

      return Response.json({ success: true, test_mode: true, booking_id, payout_id: payoutRecord.id });
    }

    // --- LIVE MODE ---
    const transactions = await base44.asServiceRole.entities.PaymentTransaction.filter({ booking_id, type: 'escrow_deposit' });
    const tx = transactions[0];
    let stripeVerified = false;
    let paymentIntentId = tx?.stripe_payment_intent_id || null;

    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
      console.log(`[releasePayment] PaymentIntent ${paymentIntentId} status: ${pi.status}`);
      if (pi.status === 'succeeded') {
        stripeVerified = true;
      } else {
        console.warn(`[releasePayment] PaymentIntent not succeeded, status: ${pi.status}`);
        return Response.json({ error: `Payment not confirmed by Stripe (status: ${pi.status}). Cannot release.` }, { status: 400 });
      }
    } else {
      const sessionTx = transactions.find(t => t.stripe_session_id);
      if (sessionTx) {
        const session = await stripe.checkout.sessions.retrieve(sessionTx.stripe_session_id);
        console.log(`[releasePayment] Session ${sessionTx.stripe_session_id} payment_status: ${session.payment_status}`);
        if (session.payment_status === 'paid') {
          paymentIntentId = session.payment_intent;
          stripeVerified = true;
          await base44.asServiceRole.entities.PaymentTransaction.update(sessionTx.id, {
            stripe_payment_intent_id: paymentIntentId,
          });
        } else {
          return Response.json({ error: `Stripe payment not confirmed (session status: ${session.payment_status}). Cannot release.` }, { status: 400 });
        }
      } else {
        console.warn(`[releasePayment] No Stripe record for booking ${booking_id}, allowing release (manual payment path)`);
        stripeVerified = true;
      }
    }

    const providerProfiles = await base44.asServiceRole.entities.ServiceProvider.filter({ user_email: booking.provider_email });
    const providerProfile = providerProfiles[0] || null;
    const connectAccountId = providerProfile?.stripe_account_id || null;

    const providerIsPremium = providerProfile?.is_premium === true &&
      (!providerProfile?.premium_expires_at || new Date(providerProfile.premium_expires_at) > new Date());

    if (providerIsPremium && booking.platform_fee > 0) {
      const newProviderPayout = booking.subtotal || (booking.total_amount + booking.platform_fee);
      await base44.asServiceRole.entities.Booking.update(booking_id, {
        provider_payout: newProviderPayout,
        platform_fee: 0,
        platform_fee_pct: 0,
      });
      booking.provider_payout = newProviderPayout;
      booking.platform_fee = 0;
      console.log(`[releasePayment] Provider is premium — fee waived. Payout updated to ${newProviderPayout}`);
    }

    const providerCards = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: booking.provider_email,
      user_role: 'provider',
    });
    const payoutCard = providerCards.find(c => c.is_default) || providerCards[0] || null;

    let stripeTransferId = null;
    let payoutStatus = 'processing';

    if (connectAccountId && paymentIntentId) {
      const payoutAmountCents = Math.round((booking.provider_payout || 0) * 100);
      if (payoutAmountCents > 0) {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        const chargeId = pi.latest_charge;

        const transferParams = {
          amount: payoutAmountCents,
          currency: 'usd',
          destination: connectAccountId,
          transfer_group: booking_id,
          metadata: {
            booking_id,
            provider_email: booking.provider_email,
            base44_app_id: Deno.env.get('BASE44_APP_ID'),
          },
        };

        if (chargeId) transferParams.source_transaction = chargeId;

        const transfer = await stripe.transfers.create(transferParams);
        stripeTransferId = transfer.id;
        payoutStatus = 'paid';
        console.log(`[releasePayment] Transfer ${stripeTransferId} → ${connectAccountId} (charge: ${chargeId || 'n/a'})`);
      }
    } else {
      console.log(`[releasePayment] No Connect account for provider ${booking.provider_email} — payout marked as processing`);
    }

    await base44.asServiceRole.entities.Booking.update(booking_id, {
      status: 'payment_released',
      payment_status: 'released',
    });

    if (tx) {
      await base44.asServiceRole.entities.PaymentTransaction.update(tx.id, {
        status: 'completed',
        stripe_payment_intent_id: paymentIntentId || tx.stripe_payment_intent_id,
        stripe_transfer_id: stripeTransferId,
      });
    }

    const payoutRecord = await base44.asServiceRole.entities.ProviderPayout.create({
      provider_id: booking.provider_id,
      provider_email: booking.provider_email,
      amount: booking.provider_payout,
      currency: 'usd',
      status: payoutStatus,
      booking_id,
      stripe_transfer_id: stripeTransferId,
      card_last4: payoutCard?.card_last4 || '????',
      card_brand: payoutCard?.card_brand || 'card',
      payout_method: connectAccountId ? 'bank_account' : (payoutCard?.card_type === 'prepaid' ? 'prepaid_card' : 'debit_card'),
      notes: stripeTransferId
        ? `Stripe Transfer: ${stripeTransferId}`
        : (stripeVerified ? `Stripe PI: ${paymentIntentId || 'n/a'} — Connect not configured` : 'Manual path'),
    });

    await base44.asServiceRole.entities.PaymentTransaction.create({
      booking_id,
      client_email: booking.client_email,
      provider_id: booking.provider_id,
      provider_email: booking.provider_email,
      amount: booking.provider_payout,
      platform_fee: 0,
      provider_payout: booking.provider_payout,
      currency: 'usd',
      type: 'payout_released',
      status: 'completed',
      stripe_transfer_id: stripeTransferId,
      description: stripeTransferId
        ? `Stripe Transfer to connected account ${connectAccountId}`
        : (payoutCard ? `Payout to ${payoutCard.card_brand} •••• ${payoutCard.card_last4}` : `Payout to provider (no card on file)`),
    });

    await base44.asServiceRole.entities.Notification.create({
      user_email: booking.provider_email,
      type: 'payment_released',
      title: 'Payment Released 💰',
      body: payoutCard
        ? `Your payment of $${booking.provider_payout?.toFixed(2)} for the job with ${booking.client_name} has been released to your ${payoutCard.card_brand} •••• ${payoutCard.card_last4}.`
        : `Your payment of $${booking.provider_payout?.toFixed(2)} for the job with ${booking.client_name} has been released. Please visit Payouts to withdraw.`,
      link: '/payouts',
      is_read: false,
      reference_id: booking_id,
    });

    await base44.asServiceRole.entities.Notification.create({
      user_email: booking.client_email,
      type: 'payment_released',
      title: 'Payment Released',
      body: `Your payment for ${booking.provider_name} has been released successfully.`,
      link: '/bookings',
      is_read: false,
      reference_id: booking_id,
    });

    console.log(`[releasePayment] Successfully released booking ${booking_id}, payout record: ${payoutRecord.id}`);

    return Response.json({
      success: true,
      booking_id,
      payout_id: payoutRecord.id,
      stripe_verified: stripeVerified,
      payout_card: payoutCard ? `${payoutCard.card_brand} •••• ${payoutCard.card_last4}` : null,
    });

  } catch (error) {
    console.error('[releasePayment] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});