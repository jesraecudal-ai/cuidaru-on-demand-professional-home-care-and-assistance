import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * getConnectStatus
 * Checks if the provider's Stripe Connect account is fully onboarded.
 * Also syncs the status to the ServiceProvider record.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
    if (providers.length === 0) return Response.json({ account_id: null, onboarding_complete: false });
    const provider = providers[0];

    if (!provider.stripe_account_id) {
      return Response.json({ account_id: null, onboarding_complete: false });
    }

    const account = await stripe.accounts.retrieve(provider.stripe_account_id);
    const onboardingComplete = account.details_submitted && !account.requirements?.currently_due?.length;

    // Sync status if it changed
    if (provider.stripe_onboarding_complete !== onboardingComplete) {
      await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
        stripe_onboarding_complete: onboardingComplete,
      });
    }

    console.log(`[getConnectStatus] Account ${provider.stripe_account_id}: details_submitted=${account.details_submitted}, complete=${onboardingComplete}`);

    return Response.json({
      account_id: provider.stripe_account_id,
      onboarding_complete: onboardingComplete,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    });
  } catch (error) {
    console.error('[getConnectStatus] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});