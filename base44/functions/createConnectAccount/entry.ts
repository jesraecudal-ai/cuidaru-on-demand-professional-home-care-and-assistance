import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * createConnectAccount
 * Creates a Stripe Connect account for a provider using the modern
 * controller-based approach (no deprecated "type: express").
 * Returns an Account Link URL for onboarding.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const origin = req.headers.get('origin') || 'https://app.base44.com';

    // Find the provider's ServiceProvider record
    const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
    if (providers.length === 0) return Response.json({ error: 'Provider profile not found' }, { status: 404 });
    const provider = providers[0];

    let accountId = provider.stripe_account_id;

    // Create a new Connect account if they don't have one yet
    if (!accountId) {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: { type: 'express' },
          fees: { payer: 'application' },
          losses: { payments: 'application' },
          requirement_collection: 'stripe',
        },
        capabilities: {
          transfers: { requested: true },
        },
        country: 'US',
        email: user.email,
        metadata: {
          provider_id: provider.id,
          user_email: user.email,
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
        },
      });
      accountId = account.id;

      await base44.asServiceRole.entities.ServiceProvider.update(provider.id, {
        stripe_account_id: accountId,
        stripe_onboarding_complete: false,
      });

      console.log(`[createConnectAccount] Created Stripe Connect account ${accountId} for ${user.email}`);
    }

    // Generate an Account Link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/payouts?connect=refresh`,
      return_url: `${origin}/payouts?connect=success`,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url, account_id: accountId });
  } catch (error) {
    console.error('[createConnectAccount] Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});