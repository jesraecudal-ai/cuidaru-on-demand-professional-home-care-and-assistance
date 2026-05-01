import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and delete the provider record for this user
    const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
    
    if (providers.length > 0) {
      await base44.entities.ServiceProvider.delete(providers[0].id);
      return Response.json({ success: true, message: 'Provider profile deleted' });
    }

    return Response.json({ success: false, message: 'No provider profile found' });
  } catch (error) {
    console.error('Error deleting provider profile:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});