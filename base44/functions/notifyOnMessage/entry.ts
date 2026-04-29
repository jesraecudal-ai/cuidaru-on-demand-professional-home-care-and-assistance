import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    if (!data || event?.type !== 'create') return Response.json({ ok: true, skipped: 'not a new message' });

    let recipientEmail = null;
    let recipientName = null;
    if (data.sender_role === 'client') {
      recipientEmail = data.provider_email;
    } else if (data.sender_role === 'provider') {
      recipientEmail = data.client_email;
    }

    if (!recipientEmail) return Response.json({ ok: true, skipped: 'no recipient determined' });

    await base44.asServiceRole.entities.Notification.create({
      user_email: recipientEmail,
      type: 'message_received',
      title: 'New Message 💬',
      body: `${data.sender_name} sent you a message.`,
      link: '/messages',
      is_read: false,
      reference_id: data.conversation_id,
    });

    // Send email notification (non-blocking)
    base44.asServiceRole.functions.invoke('sendEmailNotification', {
      template: 'message_received',
      to: recipientEmail,
      data: {
        recipientName: recipientEmail,
        senderName: data.sender_name || 'Someone',
      },
    }).catch(err => console.error('Message email failed:', err.message));

    return Response.json({ ok: true });
  } catch (error) {
    console.error('notifyOnMessage error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});