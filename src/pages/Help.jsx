import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Help() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "How do I find a service provider?",
      answer: "Go to the 'Browse' section, select your service category, and browse available providers in your area. You can filter by rating, availability, and price."
    },
    {
      id: 2,
      question: "How do bookings work?",
      answer: "Select a provider, choose your date and time, review the total cost, and pay securely through the app. Your payment is held safely in escrow until the service is complete."
    },
    {
      id: 3,
      question: "What is the escrow system?",
      answer: "Your payment is held by Cuidaru until you confirm the service is complete. After 24 hours without a dispute, payment automatically releases to the provider."
    },
    {
      id: 4,
      question: "Can I cancel a booking?",
      answer: "Yes, you can cancel before the provider accepts. Once accepted, cancellation policies may apply. Check the booking details for specific terms."
    },
    {
      id: 5,
      question: "How do I become a service provider?",
      answer: "Go to 'My Profile' and select 'Become a Provider'. Complete your profile, pass identity verification, and set your rates. You'll be visible to clients once approved."
    },
    {
      id: 6,
      question: "What happens if there's a dispute?",
      answer: "Either party can file a dispute within a reasonable timeframe. Cuidaru's team reviews the case and decides how to handle the payment. Our decision is final."
    },
    {
      id: 7,
      question: "What are the platform fees?",
      answer: "Cuidaru charges a 10% service fee per transaction. This fee is waived for clients with an active premium subscription."
    },
    {
      id: 8,
      question: "Is my information safe?",
      answer: "Yes. We use industry-standard encryption and security measures to protect your data. See our Privacy Policy for more details."
    },
    {
      id: 9,
      question: "Can I use the app internationally?",
      answer: "Cuidaru is available in Brazil, Uruguay, USA, and Canada. Pricing and fees vary by country."
    },
    {
      id: 10,
      question: "How do I contact support?",
      answer: "You can reach support directly through the app using the support button, or email us with any questions or concerns."
    }
  ];

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

        <div className="bg-card rounded-xl border shadow-sm p-8 sm:p-10 mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Help & Support</h1>
          <p className="text-muted-foreground text-lg">
            Find answers to common questions about using Cuidaru.
          </p>
        </div>

        {/* FAQ Section */}
        <div className="space-y-4 mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
          {faqs.map((faq) => (
            <Card
              key={faq.id}
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-foreground leading-relaxed flex-1">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {expandedFaq === faq.id && (
                  <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-8 text-center">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Still need help?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is here to assist you with any questions or issues.
          </p>
          <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}