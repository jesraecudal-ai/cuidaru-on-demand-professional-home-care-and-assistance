import React from 'react';
import { Heart, Zap } from 'lucide-react';

export default function Payments() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
        <Heart className="w-10 h-10 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Cuidaru is Free!</h1>
      <p className="text-lg text-gray-500 mb-6">
        We've removed all payment requirements. Clients and service providers connect directly — no fees, no escrow, no Stripe.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-gray-700 text-sm">Browse and book service providers at no cost.</p>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-gray-700 text-sm">Payments are arranged directly between clients and providers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-600 shrink-0" />
          <p className="text-gray-700 text-sm">Zero platform fees. No hidden charges.</p>
        </div>
      </div>
    </div>
  );
}