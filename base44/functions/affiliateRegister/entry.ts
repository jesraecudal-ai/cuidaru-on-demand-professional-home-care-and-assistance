import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Registers a new affiliate (called from admin panel or self-signup)
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Check not already an affiliate
    const existing = await base44.asServiceRole.entities.AffiliateUser.filter({ user_email: user.email });
    if (existing.length > 0) {
      return Response.json({ affiliate: existing[0], already_exists: true });
    }

    // Generate unique code from name + random suffix
    const namePart = (user.full_name || user.email).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5);
    const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
    const affiliate_code = `${namePart}${suffix}`;

    const affiliate = await base44.asServiceRole.entities.AffiliateUser.create({
      user_email: user.email,
      full_name: user.full_name || user.email,
      affiliate_code,
      status: 'active',
      total_referrals: 0,
      total_commission_earned: 0,
      pending_commission: 0,
      total_withdrawn: 0,
    });

    console.log(`New affiliate registered: ${user.email} → code ${affiliate_code}`);
    return Response.json({ success: true, affiliate });
  } catch (error) {
    console.error('affiliateRegister error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});