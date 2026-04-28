import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { booking_id } = await req.json();

    if (!booking_id) {
      return Response.json({ error: 'booking_id required' }, { status: 400 });
    }

    // Get the booking
    const bookings = await base44.entities.Booking.filter({ id: booking_id });
    if (!bookings.length) {
      return Response.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];

    // Verify user is the client
    if (booking.client_email !== user.email) {
      return Response.json({ error: 'Not authorized for this booking' }, { status: 403 });
    }

    // Get user's referral reward
    const rewards = await base44.asServiceRole.entities.ReferralReward.filter({
      user_email: user.email,
      reward_type: 'booking_fee_waiver',
      reward_status: 'earned'
    });

    if (!rewards.length) {
      return Response.json({ waiver_applied: false, reason: 'No fee waiver earned' }, { status: 200 });
    }

    const reward = rewards[0];

    // Check if waivers are still available
    if ((reward.fee_waivers_used || 0) >= 3) {
      return Response.json({ waiver_applied: false, reason: 'All waivers used' }, { status: 200 });
    }

    // Apply waiver to booking
    const platformFee = booking.platform_fee || 0;
    const newTotal = booking.total_amount - platformFee;
    const providerPayout = booking.provider_payout + platformFee;

    await base44.asServiceRole.entities.Booking.update(booking_id, {
      platform_fee: 0,
      platform_fee_pct: 0,
      total_amount: newTotal,
      provider_payout: providerPayout
    });

    // Increment waiver usage
    await base44.asServiceRole.entities.ReferralReward.update(reward.id, {
      fee_waivers_used: (reward.fee_waivers_used || 0) + 1,
      reward_status: (reward.fee_waivers_used || 0) + 1 >= 3 ? 'applied' : 'earned'
    });

    return Response.json({
      waiver_applied: true,
      platform_fee_waived: platformFee,
      new_total: newTotal,
      waivers_remaining: 3 - ((reward.fee_waivers_used || 0) + 1)
    });
  } catch (error) {
    console.error('Error applying fee waiver:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});