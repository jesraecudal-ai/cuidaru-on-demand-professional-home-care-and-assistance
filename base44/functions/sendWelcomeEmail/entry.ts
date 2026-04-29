import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Triggered by UserProfile entity automation on create
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    if (!data || event?.type !== 'create') return Response.json({ ok: true, skipped: 'not a create event' });

    const userEmail = data.user_email;
    if (!userEmail) return Response.json({ ok: true, skipped: 'no email' });

    // Get user's full name
    const users = await base44.asServiceRole.entities.User.list();
    const user = users.find(u => u.email === userEmail);
    const name = user?.full_name || userEmail.split('@')[0];

    await base44.asServiceRole.functions.invoke('sendEmailNotification', {
      template: 'welcome',
      to: userEmail,
      data: { name },
    });

    console.log(`Welcome email sent to ${userEmail}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendWelcomeEmail error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});