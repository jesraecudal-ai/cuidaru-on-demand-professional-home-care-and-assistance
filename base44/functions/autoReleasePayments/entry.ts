import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Find all bookings that are in release_pending and past auto_release_at
    const pendingBookings = await base44.asServiceRole.entities.Booking.filter({
      payment_status: 'release_pending',
      status: 'completed',
    });

    const now = new Date();
    const toRelease = pendingBookings.filter(b => {
      if (!b.auto_release_at) return false;
      return new Date(b.auto_release_at) <= now;
    });

    console.log(`[autoReleasePayments] Found ${toRelease.length} booking(s) to auto-release`);

    const results = [];
    for (const booking of toRelease) {
      await base44.asServiceRole.entities.Booking.update(booking.id, {
        status: 'payment_released',
        payment_status: 'released',
      });

      // Notify the provider
      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.provider_email,
        type: 'payment_released',
        title: 'Payment Auto-Released 💰',
        body: `Your payment for the booking with ${booking.client_name} was automatically released after 24 hours.`,
        link: '/payments',
        is_read: false,
        reference_id: booking.id,
      });

      // Notify the client
      await base44.asServiceRole.entities.Notification.create({
        user_email: booking.client_email,
        type: 'payment_released',
        title: 'Payment Released Automatically',
        body: `The 24-hour review window passed. Payment for your booking with ${booking.provider_name} was released.`,
        link: '/bookings',
        is_read: false,
        reference_id: booking.id,
      });

      console.log(`[autoReleasePayments] Released booking ${booking.id}`);
      results.push(booking.id);
    }

    return Response.json({ ok: true, released: results.length, booking_ids: results });
  } catch (error) {
    console.error('[autoReleasePayments] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});