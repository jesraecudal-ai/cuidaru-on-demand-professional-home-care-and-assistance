import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * getConnectStatus
 * Retrieves and syncs the Stripe Connect onboarding status for the current provider.
 * Uses charges_enabled + payouts_enabled as the definitive "ready" signal.
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

    // An account is "ready" when Stripe says charges and payouts are enabled
    const onboardingComplete = account.charges_enabled && account.payouts_enabled;

    // Sync back to DB if changed
    if (provider.stripe_onboarding_complete !== onboardingComplete) {
      await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
        stripe_onboarding_complete: onboardingComplete,
      });
    }

    console.log(`[getConnectStatus] ${provider.stripe_account_id}: charges_enabled=${account.charges_enabled}, payouts_enabled=${account.payouts_enabled}`);

    return Response.json({
      account_id: provider.stripe_account_id,
      onboarding_complete: onboardingComplete,
      details_submitted: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (error) {
    console.error('[getConnectStatus] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});