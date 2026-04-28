import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.3.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { prescriptionId } = body;

    if (!prescriptionId) {
      return Response.json({ error: 'Prescription ID required' }, { status: 400 });
    }

    // Fetch prescription
    const prescriptions = await base44.asServiceRole.entities.Prescription.filter({ id: prescriptionId });
    if (!prescriptions || prescriptions.length === 0) {
      return Response.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const prescription = prescriptions[0];

    // Verify patient
    if (prescription.patient_email !== user.email) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: prescription.currency || 'usd',
            product_data: {
              name: `Prescription - ${prescription.doctor_name}`,
              description: `Download prescription for ${prescription.patient_name}`
            },
            unit_amount: Math.round(prescription.download_price * 100)
          },
          quantity: 1
        }
      ],
      success_url: `${new URL(req.url).origin}/prescriptions?payment=success&prescription_id=${prescriptionId}`,
      cancel_url: `${new URL(req.url).origin}/prescriptions?payment=cancelled`,
      metadata: {
        prescription_id: prescriptionId,
        doctor_email: prescription.doctor_email,
        patient_email: user.email,
        base44_app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    return Response.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    });
  } catch (error) {
    console.error('Payment error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});