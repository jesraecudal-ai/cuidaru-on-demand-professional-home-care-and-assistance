import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="bg-card rounded-xl border shadow-sm p-8 sm:p-10">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-foreground">
            <section>
              <p className="text-base leading-relaxed mb-4">
                At CareBook, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold">Account Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Name, email address, phone number</li>
                  <li>Profile information and preferences</li>
                  <li>Identity verification documents (for providers)</li>
                </ul>

                <p className="font-semibold mt-4">Service Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Booking details and history</li>
                  <li>Payment and transaction records</li>
                  <li>Location data (with permission)</li>
                  <li>Reviews and ratings</li>
                </ul>

                <p className="font-semibold mt-4">Technical Information:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Device type and operating system</li>
                  <li>IP address and browser type</li>
                  <li>App usage and analytics</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>To provide and improve our services</li>
                  <li>To process payments and bookings</li>
                  <li>To verify identity and prevent fraud</li>
                  <li>To send notifications and updates</li>
                  <li>To resolve disputes and provide support</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Data Protection</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  We implement industry-standard security measures to protect your data, including encryption, secure servers, and access controls. However, no system is completely secure.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  We share information only as necessary:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>With service providers (clients share info with their selected providers)</li>
                  <li>With payment processors (Stripe)</li>
                  <li>With legal authorities if required by law</li>
                  <li>We do NOT sell your personal data to third parties</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request deletion of your data (subject to legal obligations)</li>
                  <li>Opt out of certain communications</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  We use cookies and similar technologies to enhance your experience, remember preferences, and analyze usage. You can control cookies through your browser settings.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  CareBook is not intended for children under 18. We do not knowingly collect information from minors.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  We may update this Privacy Policy periodically. Continued use of CareBook constitutes acceptance of any changes.
                </p>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-xl font-bold mb-4">Contact Us</h2>
              <p className="text-sm">
                If you have privacy concerns, contact us through the app support.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}