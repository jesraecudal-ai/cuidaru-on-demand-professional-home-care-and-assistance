import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data, old_data, changed_fields } = payload;

    if (!data) return Response.json({ ok: true, skipped: 'no data' });

    const notifications = [];
    const emails = [];

    const startDate = data.start_date || 'TBD';
    const bookingType = data.booking_type || '';
    const total = data.total_amount ? `${data.total_amount}` : '—';
    const category = data.category || 'Service';

    // New booking: notify provider
    if (event?.type === 'create' && data.status === 'pending_approval') {
      notifications.push({
        user_email: data.provider_email,
        type: 'booking_pending',
        title: 'New Booking Request 📋',
        body: `${data.client_name} has requested a booking with you.`,
        link: '/bookings',
        is_read: false,
        reference_id: data.id,
      });
      if (data.provider_email) {
        emails.push({ template: 'booking_new_provider', to: data.provider_email, data: {
          providerName: data.provider_name || 'Provider',
          clientName: data.client_name || 'A client',
          category, startDate, bookingType, total,
        }});
      }
    }

    // Booking accepted: notify client
    if (changed_fields?.includes('status') && data.status === 'accepted' && old_data?.status !== 'accepted') {
      notifications.push({
        user_email: data.client_email,
        type: 'booking_accepted',
        title: 'Booking Accepted! 🎉',
        body: `${data.provider_name} accepted your booking request.`,
        link: '/bookings',
        is_read: false,
        reference_id: data.id,
      });
      if (data.client_email) {
        emails.push({ template: 'booking_accepted_client', to: data.client_email, data: {
          clientName: data.client_name || 'Client',
          providerName: data.provider_name || 'Provider',
          category, startDate, total,
        }});
      }
    }

    // Payment released: notify provider
    if (changed_fields?.includes('payment_status') && data.payment_status === 'released' && old_data?.payment_status !== 'released') {
      notifications.push({
        user_email: data.provider_email,
        type: 'payment_released',
        title: 'Payment Released 💰',
        body: `Your payment for the booking with ${data.client_name} has been released.`,
        link: '/payments',
        is_read: false,
        reference_id: data.id,
      });
      if (data.provider_email) {
        emails.push({ template: 'payment_released_provider', to: data.provider_email, data: {
          providerName: data.provider_name || 'Provider',
          clientName: data.client_name || 'Client',
          amount: data.provider_payout || total,
        }});
      }
    }

    // Booking cancelled
    if (changed_fields?.includes('status') && data.status === 'cancelled' && old_data?.status !== 'cancelled') {
      notifications.push({
        user_email: data.provider_email,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        body: `The booking with ${data.client_name} has been cancelled.`,
        link: '/bookings',
        is_read: false,
        reference_id: data.id,
      });
      if (data.provider_email) {
        emails.push({ template: 'booking_cancelled', to: data.provider_email, data: {
          recipientName: data.provider_name || 'Provider',
          otherPartyName: data.client_name || 'Client',
          startDate,
        }});
      }
      if (data.client_email) {
        emails.push({ template: 'booking_cancelled', to: data.client_email, data: {
          recipientName: data.client_name || 'Client',
          otherPartyName: data.provider_name || 'Provider',
          startDate,
        }});
      }
    }

    // Dispute filed: notify admins
    if (changed_fields?.includes('status') && data.status === 'disputed' && old_data?.status !== 'disputed') {
      const allUsers = await base44.asServiceRole.entities.User.list();
      const admins = allUsers.filter(u => u.role === 'admin');
      for (const admin of admins) {
        notifications.push({
          user_email: admin.email,
          type: 'dispute_filed',
          title: 'Dispute Filed ⚠️',
          body: `A dispute has been filed for a booking between ${data.client_name} and ${data.provider_name}.`,
          link: '/admin/disputes',
          is_read: false,
          reference_id: data.id,
        });
        emails.push({ template: 'dispute_filed_admin', to: admin.email, data: {
          clientName: data.client_name || 'Client',
          providerName: data.provider_name || 'Provider',
          bookingDate: startDate,
        }});
      }
    }

    if (notifications.length > 0) {
      await base44.asServiceRole.entities.Notification.bulkCreate(notifications);
    }

    // Send emails in parallel
    await Promise.all(emails.map(e =>
      base44.asServiceRole.functions.invoke('sendEmailNotification', e).catch(err =>
        console.error('Email send failed:', err.message)
      )
    ));

    return Response.json({ ok: true, notifications: notifications.length, emails: emails.length });
  } catch (error) {
    console.error('notifyOnBookingChange error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});