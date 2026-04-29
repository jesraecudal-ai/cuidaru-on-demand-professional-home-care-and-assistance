import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Beautiful HTML email builder for Cuidaru
function buildEmail({ preheader = '', headerColor = '#2563eb', headerEmoji = '', title, subtitle = '', bodyHtml, ctaText = '', ctaUrl = '' }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <!--[if mso]><table width="600" align="center"><tr><td><![endif]-->
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,${headerColor},${headerColor}cc);padding:40px 32px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:50%;width:64px;height:64px;line-height:64px;font-size:30px;margin-bottom:16px;">${headerEmoji}</div>
      <div style="font-size:22px;font-weight:700;color:#ffffff;margin-bottom:6px;">${title}</div>
      ${subtitle ? `<div style="font-size:14px;color:rgba(255,255,255,0.85);">${subtitle}</div>` : ''}
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      ${bodyHtml}
      ${ctaText && ctaUrl ? `
      <div style="text-align:center;margin:28px 0 8px;">
        <a href="${ctaUrl}" style="display:inline-block;background:${headerColor};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 36px;border-radius:50px;">
          ${ctaText}
        </a>
      </div>` : ''}
    </div>
    <!-- Footer -->
    <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
        <div style="width:24px;height:24px;background:#2563eb;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;">❤️</div>
        <span style="font-weight:700;color:#1e293b;font-size:14px;">Cuidaru</span>
      </div>
      <p style="margin:0;font-size:12px;color:#94a3b8;">Trusted marketplace for healthcare & home service professionals.</p>
      <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1;">© 2026 Cuidaru. All rights reserved.</p>
    </div>
  </div>
  <!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;
}

function infoRow(label, value) {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748b;font-weight:500;width:40%;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;
}

function tableWrap(rows) {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;margin:16px 0;border:1px solid #e2e8f0;">${rows}</table>`;
}

function paragraph(text) {
  return `<p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;">${text}</p>`;
}

// --- EMAIL TEMPLATES ---

export const EMAIL_TEMPLATES = {

  welcome: ({ name }) => ({
    subject: '🎉 Welcome to Cuidaru!',
    html: buildEmail({
      headerColor: '#2563eb',
      headerEmoji: '🎉',
      title: `Welcome to Cuidaru, ${name}!`,
      subtitle: 'Your trusted care & service marketplace',
      bodyHtml: `
        ${paragraph(`Hi <strong>${name}</strong>, we're thrilled to have you on board!`)}
        ${paragraph('Cuidaru connects you with verified, trusted professionals for all your home care and service needs — from nurses and doctors to cleaners, nannies, tutors, and more.')}
        <div style="background:#eff6ff;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#1e40af;font-weight:600;">✅ All providers are ID-verified</p>
          <p style="margin:6px 0 0;font-size:14px;color:#1e40af;">🔒 Payments held securely in escrow until work is done</p>
          <p style="margin:6px 0 0;font-size:14px;color:#1e40af;">⭐ Real reviews from real clients</p>
        </div>
        ${paragraph('Start browsing professionals near you right now.')}
      `,
      ctaText: 'Find a Provider',
      ctaUrl: 'https://cuidaru.com/browse',
    }),
  }),

  booking_new_provider: ({ providerName, clientName, category, startDate, bookingType, total }) => ({
    subject: `📋 New Booking Request from ${clientName}`,
    html: buildEmail({
      headerColor: '#0891b2',
      headerEmoji: '📋',
      title: 'New Booking Request',
      subtitle: `${clientName} wants to book your services`,
      bodyHtml: `
        ${paragraph(`Hi <strong>${providerName}</strong>, you have a new booking request waiting for your approval.`)}
        ${tableWrap(
          infoRow('Client', clientName) +
          infoRow('Service', category) +
          infoRow('Start Date', startDate) +
          infoRow('Type', bookingType) +
          infoRow('Total', `$${total}`)
        )}
        ${paragraph('Please log in to accept or decline this request. Clients are waiting!')}
      `,
      ctaText: 'View Booking Request',
      ctaUrl: 'https://cuidaru.com/bookings',
    }),
  }),

  booking_accepted_client: ({ clientName, providerName, category, startDate, total }) => ({
    subject: `✅ Your booking with ${providerName} is confirmed!`,
    html: buildEmail({
      headerColor: '#059669',
      headerEmoji: '✅',
      title: 'Booking Confirmed!',
      subtitle: `${providerName} accepted your request`,
      bodyHtml: `
        ${paragraph(`Great news, <strong>${clientName}</strong>! Your booking has been accepted.`)}
        ${tableWrap(
          infoRow('Provider', providerName) +
          infoRow('Service', category) +
          infoRow('Start Date', startDate) +
          infoRow('Total', `$${total}`)
        )}
        ${paragraph('Your payment is now securely held in escrow and will be released to the provider once you confirm the service is complete.')}
        <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:0 8px 8px 0;padding:14px;margin:16px 0;">
          <p style="margin:0;font-size:13px;color:#166534;">🔒 Funds are protected in escrow until you confirm completion.</p>
        </div>
      `,
      ctaText: 'View My Bookings',
      ctaUrl: 'https://cuidaru.com/bookings',
    }),
  }),

  payment_released_provider: ({ providerName, clientName, amount }) => ({
    subject: `💰 Payment of $${amount} has been released!`,
    html: buildEmail({
      headerColor: '#7c3aed',
      headerEmoji: '💰',
      title: 'Payment Released!',
      subtitle: 'Your earnings are on the way',
      bodyHtml: `
        ${paragraph(`Hi <strong>${providerName}</strong>, great news — your payment has been released!`)}
        ${tableWrap(
          infoRow('Client', clientName) +
          infoRow('Amount Released', `$${amount}`) +
          infoRow('Status', 'Transferred to your account')
        )}
        ${paragraph('The funds are being processed and will appear in your payout account shortly. Thank you for delivering excellent service!')}
      `,
      ctaText: 'View My Earnings',
      ctaUrl: 'https://cuidaru.com/payments',
    }),
  }),

  booking_cancelled: ({ recipientName, otherPartyName, startDate }) => ({
    subject: `❌ Booking on ${startDate} has been cancelled`,
    html: buildEmail({
      headerColor: '#dc2626',
      headerEmoji: '❌',
      title: 'Booking Cancelled',
      subtitle: 'We\'re sorry to hear that',
      bodyHtml: `
        ${paragraph(`Hi <strong>${recipientName}</strong>, the booking with <strong>${otherPartyName}</strong> scheduled for <strong>${startDate}</strong> has been cancelled.`)}
        ${paragraph('If any payment was made, a refund will be processed within 5–7 business days.')}
        ${paragraph('We\'re sorry for any inconvenience. You can browse other providers and book again anytime.')}
      `,
      ctaText: 'Browse Providers',
      ctaUrl: 'https://cuidaru.com/browse',
    }),
  }),

  dispute_filed_admin: ({ clientName, providerName, bookingDate }) => ({
    subject: `⚠️ Dispute Filed — Requires Admin Review`,
    html: buildEmail({
      headerColor: '#d97706',
      headerEmoji: '⚠️',
      title: 'Dispute Requires Review',
      subtitle: 'Admin action needed',
      bodyHtml: `
        ${paragraph('A dispute has been filed and requires your attention.')}
        ${tableWrap(
          infoRow('Client', clientName) +
          infoRow('Provider', providerName) +
          infoRow('Booking Date', bookingDate) +
          infoRow('Priority', 'High')
        )}
        ${paragraph('Please review the dispute details and take appropriate action.')}
      `,
      ctaText: 'Review Dispute',
      ctaUrl: 'https://cuidaru.com/admin/disputes',
    }),
  }),

  message_received: ({ recipientName, senderName }) => ({
    subject: `💬 New message from ${senderName}`,
    html: buildEmail({
      headerColor: '#0891b2',
      headerEmoji: '💬',
      title: 'You have a new message',
      subtitle: `From ${senderName}`,
      bodyHtml: `
        ${paragraph(`Hi <strong>${recipientName}</strong>, <strong>${senderName}</strong> sent you a message on Cuidaru.`)}
        ${paragraph('Log in to read and reply to keep the conversation going.')}
      `,
      ctaText: 'Read Message',
      ctaUrl: 'https://cuidaru.com/messages',
    }),
  }),

  job_application_received: ({ applicantName, jobTitle, department }) => ({
    subject: `📩 New Application: ${jobTitle}`,
    html: buildEmail({
      headerColor: '#2563eb',
      headerEmoji: '📩',
      title: 'New Job Application',
      subtitle: `For ${jobTitle}`,
      bodyHtml: `
        ${paragraph(`A new application has been submitted for the <strong>${jobTitle}</strong> position.`)}
        ${tableWrap(
          infoRow('Applicant', applicantName) +
          infoRow('Position', jobTitle) +
          infoRow('Department', department)
        )}
        ${paragraph('Log in to the admin dashboard to review their profile and resume.')}
      `,
      ctaText: 'Review Application',
      ctaUrl: 'https://cuidaru.com/admin/careers',
    }),
  }),

  job_application_confirmation: ({ applicantName, jobTitle }) => ({
    subject: `✅ We received your application for ${jobTitle}`,
    html: buildEmail({
      headerColor: '#059669',
      headerEmoji: '🙌',
      title: 'Application Received!',
      subtitle: `Thank you for applying to Cuidaru`,
      bodyHtml: `
        ${paragraph(`Hi <strong>${applicantName}</strong>, thank you for applying to the <strong>${jobTitle}</strong> position at Cuidaru!`)}
        ${paragraph('We\'ve received your application and our team will review it carefully. We\'ll reach out to you via email if your profile matches what we\'re looking for.')}
        <div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:0 8px 8px 0;padding:14px;margin:16px 0;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">What happens next?</p>
          <p style="margin:6px 0 0;font-size:13px;color:#166534;">1. Our team reviews your application</p>
          <p style="margin:4px 0 0;font-size:13px;color:#166534;">2. If shortlisted, we'll reach out to schedule an interview</p>
          <p style="margin:4px 0 0;font-size:13px;color:#166534;">3. Final decision within 2–3 weeks</p>
        </div>
        ${paragraph('In the meantime, feel free to explore our platform at <a href="https://cuidaru.com" style="color:#2563eb;">cuidaru.com</a>.')}
      `,
      ctaText: 'Visit Cuidaru',
      ctaUrl: 'https://cuidaru.com',
    }),
  }),

};

// Main handler — called internally by other functions
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { template, to, data } = await req.json();

    if (!EMAIL_TEMPLATES[template]) {
      return Response.json({ error: `Unknown template: ${template}` }, { status: 400 });
    }

    const { subject, html } = EMAIL_TEMPLATES[template](data);

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject,
      body: html,
      from_name: 'Cuidaru (notifications@cuidaru.com)',
    });

    console.log(`Email sent: template=${template} to=${to}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error('sendEmailNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});