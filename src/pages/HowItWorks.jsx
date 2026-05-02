import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search, UserCheck, Calendar, CreditCard, Star,
  Briefcase, ClipboardList, DollarSign, CheckCircle, Shield,
  ArrowRight, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const clientSteps = [
  {
    icon: Search,
    color: 'bg-blue-100 text-blue-600',
    title: 'Search & Browse',
    desc: 'Search for verified caregivers, nurses, doctors, cleaners, cooks and more. Filter by category, location, rating, and price.',
  },
  {
    icon: UserCheck,
    color: 'bg-indigo-100 text-indigo-600',
    title: 'View Profiles & Reviews',
    desc: 'Read detailed profiles, check certifications, view past reviews from other families, and confirm the provider is verified.',
  },
  {
    icon: Calendar,
    color: 'bg-cyan-100 text-cyan-600',
    title: 'Book a Service',
    desc: 'Choose hourly, daily, or weekly service. Pick your start date and time, add instructions, and send the booking request.',
  },
  {
    icon: CreditCard,
    color: 'bg-teal-100 text-teal-600',
    title: 'Pay Securely',
    desc: 'Your payment is held in escrow by Stripe — the provider is only paid after you confirm the job is complete.',
  },
  {
    icon: Star,
    color: 'bg-amber-100 text-amber-600',
    title: 'Leave a Review',
    desc: 'Once the service is done, leave a review to help other families make the right choice.',
  },
];

const providerSteps = [
  {
    icon: ClipboardList,
    color: 'bg-green-100 text-green-600',
    title: 'Create Your Profile',
    desc: 'Sign up and build your professional profile. Add your services, experience, certifications, rates, and availability.',
  },
  {
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-600',
    title: 'Get Verified',
    desc: 'Upload your ID document to become a verified provider. Verification builds trust and increases your bookings.',
  },
  {
    icon: Briefcase,
    color: 'bg-lime-100 text-lime-600',
    title: 'Receive Bookings',
    desc: 'Clients send you booking requests. Review the details, accept or negotiate the terms using our counter-offer feature.',
  },
  {
    icon: CheckCircle,
    color: 'bg-orange-100 text-orange-600',
    title: 'Complete the Job',
    desc: 'Arrive on time, complete the service, and keep the client updated via in-app chat. Mark the job complete when done.',
  },
  {
    icon: DollarSign,
    color: 'bg-rose-100 text-rose-600',
    title: 'Get Paid',
    desc: 'Once the client releases payment, your earnings are transferred directly to your account. Fast and reliable.',
  },
];

function StepCard({ step, index }) {
  const Icon = step.icon;
  return (
    <div className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="shrink-0">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-gray-400">STEP {index + 1}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold">Cuidaru</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
          Whether you're looking for care or offering your services, Cuidaru makes it simple, safe, and transparent.
        </p>
      </div>

      {/* 2-Column Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Client Column */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Search className="w-4 h-4" /> For Clients
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">I need a service</h2>
              <p className="text-gray-500">Find and book trusted professionals for home care, health, cleaning, and more.</p>
            </div>
            <div className="space-y-4">
              {clientSteps.map((step, i) => (
                <StepCard key={i} step={step} index={i} />
              ))}
            </div>
            <div className="mt-8">
              <Link to="/browse">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2 w-full md:w-auto">
                  Find a Provider <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Provider Column */}
          <div>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Briefcase className="w-4 h-4" /> For Providers
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">I offer a service</h2>
              <p className="text-gray-500">Join thousands of verified professionals earning on their own schedule.</p>
            </div>
            <div className="space-y-4">
              {providerSteps.map((step, i) => (
                <StepCard key={i} step={step} index={i} />
              ))}
            </div>
            <div className="mt-8">
              <Link to="/my-profile">
                <Button className="bg-green-600 hover:bg-green-700 gap-2 w-full md:w-auto">
                  Become a Provider <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Safe, Transparent & Fair</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            All payments are held in secure escrow. Providers are identity-verified. Every interaction is protected by our dispute resolution system.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse">
              <Button className="bg-blue-600 hover:bg-blue-700">Find a Provider</Button>
            </Link>
            <Link to="/about">
              <Button variant="outline">Learn About Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}