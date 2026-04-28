import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Called when a user enters an affiliate code during onboarding or from their profile
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { affiliate_code } = await req.json();
    if (!affiliate_code) return Response.json({ error: 'No code provided' }, { status: 400 });

    // Check this user hasn't already used ANY affiliate code
    const existingUse = await base44.asServiceRole.entities.AffiliateReferral.filter({
      referred_user_email: user.email,
    });
    if (existingUse.length > 0) {
      return Response.json({ error: 'You have already used an affiliate code.' }, { status: 400 });
    }

    // Find the affiliate by code
    const affiliates = await base44.asServiceRole.entities.AffiliateUser.filter({
      affiliate_code: affiliate_code.toUpperCase().trim(),
    });
    if (affiliates.length === 0) {
      return Response.json({ error: 'Invalid affiliate code.' }, { status: 404 });
    }

    const affiliate = affiliates[0];

    if (affiliate.status !== 'active') {
      return Response.json({ error: 'This affiliate code is no longer active.' }, { status: 400 });
    }

    // Affiliate cannot refer themselves
    if (affiliate.user_email === user.email) {
      return Response.json({ error: 'You cannot use your own affiliate code.' }, { status: 400 });
    }

    // Fetch the user's profile to get their role
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ user_email: user.email });
    const profile = profiles[0] || {};

    // Create the referral record (commission starts as 'pending' until first booking completes)
    const referral = await base44.asServiceRole.entities.AffiliateReferral.create({
      affiliate_id: affiliate.id,
      affiliate_email: affiliate.user_email,
      affiliate_code: affiliate.affiliate_code,
      referred_user_email: user.email,
      referred_user_name: user.full_name || user.email,
      referred_user_role: profile.role || 'client',
      commission_pct: 5,
      commission_amount: 0,
      commission_status: 'pending',
    });

    // Increment referral count on affiliate
    await base44.asServiceRole.entities.AffiliateUser.update(affiliate.id, {
      total_referrals: (affiliate.total_referrals || 0) + 1,
    });

    console.log(`Affiliate code ${affiliate_code} applied by ${user.email} → affiliate ${affiliate.user_email}`);

    return Response.json({ success: true, referral_id: referral.id, affiliate_name: affiliate.full_name });
  } catch (error) {
    console.error('affiliateApplyCode error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});