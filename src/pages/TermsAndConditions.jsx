import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms and Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: April 2026</p>

          <div className="space-y-8 text-foreground">
            {/* Introduction */}
            <section>
              <p className="text-base leading-relaxed mb-4">
                Welcome to <span className="font-semibold">Cuidaru</span>, a marketplace platform that connects clients with independent service providers. By using Cuidaru, you agree to these Terms and Conditions. Please read them carefully.
              </p>
            </section>

            {/* 1. Role of Cuidaru */}
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Our Role</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold">Cuidaru is ONLY a technology platform</span> that helps connect clients with independent service providers. We are not a service provider ourselves.
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cuidaru does NOT employ, manage, or supervise service providers</li>
                    <li>All service providers are independent contractors</li>
                    <li>Cuidaru does NOT guarantee the quality, safety, legality, or outcome of any service</li>
                    <li>Any service agreement is strictly between you (client) and the provider</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2. User Responsibility */}
            <section>
              <h2 className="text-2xl font-bold mb-4">2. Your Responsibility</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold">Clients are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verifying provider information before booking</li>
                  <li>Selecting providers carefully</li>
                  <li>Communicating clearly about service expectations</li>
                  <li>Assuming all risks when engaging with providers</li>
                </ul>

                <p className="font-semibold mt-4">Providers are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Delivering services as agreed</li>
                  <li>Maintaining their own qualifications and insurance (if required)</li>
                  <li>Complying with all applicable laws and regulations</li>
                  <li>Maintaining professional conduct</li>
                </ul>

                <p className="font-semibold mt-4">All users are responsible for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Providing accurate and truthful information</li>
                  <li>Protecting their account credentials</li>
                  <li>Using the platform lawfully and ethically</li>
                </ul>
              </div>
            </section>

            {/* 3. Payments and Escrow */}
            <section>
              <h2 className="text-2xl font-bold mb-4">3. Payments and Escrow System</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  <span className="font-semibold">All bookings must be paid through Cuidaru.</span> We use an escrow system to protect both clients and providers:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Client pays upfront when booking is confirmed</li>
                  <li>Payment is held safely by Cuidaru (not released immediately)</li>
                  <li>After service completion, provider marks the job as done</li>
                  <li>Client has 24 hours to review and release payment manually</li>
                  <li>If client takes no action, payment automatically releases after 24 hours</li>
                  <li>If a dispute is raised, payment is held until resolved</li>
                </ul>
              </div>
            </section>

            {/* 4. Platform Fees */}
            <section>
              <h2 className="text-2xl font-bold mb-4">4. Platform Fees</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  Cuidaru charges a <span className="font-semibold">service fee of 10%</span> per transaction. This fee:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Is deducted from the total amount</li>
                  <li>Covers payment processing, platform maintenance, and support</li>
                  <li>May be waived with an active premium subscription</li>
                  <li>May vary by country</li>
                </ul>
              </div>
            </section>

            {/* 5. Subscriptions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">5. Subscriptions</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold">Clients:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Can subscribe to remove or reduce platform fees</li>
                  <li>Subscriptions are recurring monthly (unless canceled)</li>
                  <li>You may cancel anytime; cancellation takes effect at the next billing cycle</li>
                  <li>No refunds for unused time (unless required by law)</li>
                </ul>

                <p className="font-semibold mt-4">Providers:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Can subscribe for premium visibility and benefits</li>
                  <li>Same cancellation and refund policies apply</li>
                </ul>
              </div>
            </section>

            {/* 6. Disputes */}
            <section>
              <h2 className="text-2xl font-bold mb-4">6. Disputes and Resolution</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>If either the client or provider is unhappy with a service:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The dissatisfied party can file a dispute within a reasonable timeframe</li>
                  <li>When a dispute is filed, the payment is paused and held by Cuidaru</li>
                  <li>Cuidaru's team reviews the case and evidence from both parties</li>
                  <li>Cuidaru may decide to: award full payment to provider, partial payment, or issue a refund</li>
                  <li><span className="font-semibold">Cuidaru's decision is final</span> and binding</li>
                </ul>
              </div>
            </section>

            {/* 7. No Off-Platform Transactions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">7. Platform-Only Transactions</h2>
              <div className="space-y-3 text-sm leading-relaxed bg-amber-50 p-4 rounded-lg">
                <p className="font-semibold text-amber-900">Users must NOT:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Arrange payments outside of Cuidaru</li>
                  <li>Bypass the platform to avoid fees</li>
                  <li>Share contact information to conduct transactions privately</li>
                </ul>
                <p className="font-semibold text-amber-900 mt-3">Consequences:</p>
                <p>Violation of this rule may result in immediate account suspension or permanent termination.</p>
              </div>
            </section>

            {/* 8. Tax Responsibility */}
            <section>
              <h2 className="text-2xl font-bold mb-4">8. Tax Responsibility</h2>
              <div className="space-y-3 text-sm leading-relaxed bg-blue-50 p-4 rounded-lg">
                <p className="font-semibold text-blue-900">This is VERY important:</p>
                <p>
                  <span className="font-semibold">Cuidaru is NOT responsible</span> for calculating, collecting, reporting, or paying taxes on behalf of users.
                </p>

                <p className="font-semibold mt-4 text-blue-900">Service Providers must:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Declare all income earned through Cuidaru to tax authorities</li>
                  <li>Pay all applicable income taxes, contributions, and fees required by law in your country</li>
                  <li>Keep records of all transactions for tax purposes</li>
                  <li>Consult with a tax professional if unsure about obligations</li>
                </ul>

                <p className="font-semibold mt-4 text-blue-900">Clients must:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Be aware that services purchased may be subject to taxes or VAT</li>
                  <li>Report any relevant expenses as required by law</li>
                </ul>

                <p className="font-semibold mt-4 text-blue-900">What Cuidaru does:</p>
                <p>Cuidaru only reports and pays taxes on its own earnings (service fees and subscriptions), not on behalf of users.</p>
              </div>
            </section>

            {/* 9. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold">Cuidaru is NOT liable for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Service quality or outcome</li>
                  <li>Injuries, damages, or losses resulting from services</li>
                  <li>Disputes between users</li>
                  <li>Inaccurate information provided by users</li>
                  <li>Provider qualifications or conduct</li>
                  <li>Platform downtime or technical issues (beyond reasonable control)</li>
                </ul>
                <p className="mt-4">
                  Cuidaru's sole responsibility is providing the platform and payment processing. Users use the platform at their own risk.
                </p>
              </div>
            </section>

            {/* 10. User Conduct */}
            <section>
              <h2 className="text-2xl font-bold mb-4">10. User Conduct</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p className="font-semibold">You agree NOT to:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Provide false or misleading information</li>
                  <li>Engage in fraud, deception, or illegal activities</li>
                  <li>Harass, abuse, or disrespect other users</li>
                  <li>Attempt to hack or disrupt the platform</li>
                  <li>Post inappropriate, offensive, or illegal content</li>
                  <li>Use the platform for any unlawful purpose</li>
                </ul>
              </div>
            </section>

            {/* 11. Account Suspension */}
            <section>
              <h2 className="text-2xl font-bold mb-4">11. Account Suspension and Termination</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>Cuidaru reserves the right to suspend or permanently terminate accounts for:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Fraud or deception</li>
                  <li>Abuse or harassment</li>
                  <li>Attempting to bypass the platform or avoid fees</li>
                  <li>Violation of these Terms and Conditions</li>
                  <li>Illegal activity</li>
                  <li>Multiple disputes or complaints</li>
                </ul>
              </div>
            </section>

            {/* 12. Country-Specific Rules */}
            <section>
              <h2 className="text-2xl font-bold mb-4">12. Country-Specific Information</h2>
              <div className="space-y-3 text-sm leading-relaxed">
                <p>
                  Cuidaru operates in multiple countries. Fees, subscription costs, and currencies may vary by location. By using the app, you agree to the rules and pricing applicable to your country.
                </p>
              </div>
            </section>

            {/* 13. Agreement */}
            <section>
              <h2 className="text-2xl font-bold mb-4">13. Your Agreement</h2>
              <div className="space-y-3 text-sm leading-relaxed bg-green-50 p-4 rounded-lg">
                <p>
                  By signing up and using Cuidaru, you confirm that you:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Have read and understand these Terms and Conditions</li>
                  <li>Understand that Cuidaru is ONLY a marketplace platform</li>
                  <li>Accept full responsibility for your actions and transactions</li>
                  <li>Agree to all terms outlined above</li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section className="border-t pt-8">
              <h2 className="text-xl font-bold mb-4">Questions?</h2>
              <p className="text-sm">
                If you have questions about these Terms and Conditions, please contact our support team through the app.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}