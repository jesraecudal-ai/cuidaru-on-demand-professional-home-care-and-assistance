import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check role
    const userProfiles = await base44.entities.UserProfile.filter({ user_email: user.email });
    if (!userProfiles.length) {
      return Response.json({ error: 'User profile not found' }, { status: 404 });
    }

    const userProfile = userProfiles[0];
    const userRole = userProfile.role === 'provider' ? 'provider' : 'client';

    // Get all referrals (both ways - they invited or were invited)
    const sentReferrals = await base44.entities.AffiliateReferral.filter({
      affiliate_email: user.email
    });

    const referralCount = sentReferrals.length;
    const threshold = userRole === 'provider' ? 6 : 5;

    // Check if threshold met
    const thresholdMet = referralCount >= threshold;

    // Determine reward type
    const rewardType = userRole === 'provider' ? 'premium_free_month' : 'booking_fee_waiver';

    // Check if reward already exists
    const existingRewards = await base44.asServiceRole.entities.ReferralReward.filter({
      user_email: user.email,
      reward_type: rewardType
    });

    let reward = null;

    if (thresholdMet && !existingRewards.length) {
      // Create new reward
      const premiumFreeUntil = new Date();
      premiumFreeUntil.setMonth(premiumFreeUntil.getMonth() + 1);

      reward = await base44.asServiceRole.entities.ReferralReward.create({
        user_email: user.email,
        user_role: userRole,
        reward_type: rewardType,
        referral_count: referralCount,
        threshold_met: threshold,
        reward_status: 'earned',
        fee_waivers_used: 0,
        premium_free_until: premiumFreeUntil.toISOString(),
        earned_date: new Date().toISOString()
      });
    } else if (existingRewards.length) {
      reward = existingRewards[0];
    }

    return Response.json({
      user_email: user.email,
      user_role: userRole,
      referral_count: referralCount,
      threshold: threshold,
      threshold_met: thresholdMet,
      reward: reward || null
    });
  } catch (error) {
    console.error('Error checking referral rewards:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});