import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, Star, Globe, Shield, Users, ArrowLeft } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/3961b9c00_Cuidaru.png" alt="Cuidaru" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold">Cuidaru</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Connecting families with trusted care and service professionals — built with heart, designed for trust.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Our Story */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">✦</span>
            How Cuidaru Was Born
          </h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>
              Cuidaru was born out of a deeply personal experience. Our founder, after struggling to find a reliable, trustworthy caregiver for a family member in need, realized that the existing solutions were fragmented, opaque, and difficult to navigate — especially for families in Latin America.
            </p>
            <p>
              The word <strong className="text-gray-800">"Cuidaru"</strong> is inspired by the Portuguese word <em>"cuidar"</em> — meaning <em>to care</em> — combined with the idea of a connected community. It represents not just a service, but a promise: that every family deserves access to safe, vetted, and compassionate professionals.
            </p>
            <p>
              Founded in 2024 and launched in 2025, Cuidaru started in Brazil and Uruguay and has since expanded its vision to serve families across the Americas, including the USA and Canada.
            </p>
          </div>
        </section>

        {/* Who Owns It */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 text-gray-600">
              <p>
                Cuidaru is an independent platform founded and operated by a dedicated team of entrepreneurs, caregivers, and technology professionals passionate about improving lives through better access to care services.
              </p>
              <p>
                Our team is distributed across Brazil, Uruguay, and the United States — giving us deep local knowledge in each market we serve. We are committed to building a platform that is fair, transparent, and empowering for both service seekers and service providers.
              </p>
              <p>
                We believe that the people who dedicate their lives to caring for others deserve recognition, fair pay, and a platform that works for them — not just against them.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {[
                { label: 'Countries', value: '4' },
                { label: 'Categories', value: '14' },
                { label: 'Languages', value: '3' },
                { label: 'Founded', value: '2024' },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision, Mission, Goals */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Our Vision, Mission & Goals</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where every family has safe, affordable, and immediate access to trusted care and home service professionals — regardless of location or economic background.
              </p>
            </div>

            <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To build the most trusted marketplace for care and home services in Latin America and beyond — connecting verified professionals with families through a secure, transparent, and easy-to-use platform.
              </p>
            </div>

            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Our Goals</h3>
              <ul className="text-gray-600 space-y-2 text-sm leading-relaxed">
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Expand to 10+ countries by 2027</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Verify and onboard 100,000+ professionals</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Ensure fair and fast payments for every provider</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Build AI tools that match families with the best professional</li>
                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> Become the leading care platform in LATAM</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: Shield, bg: 'bg-blue-100', text: 'text-blue-600', title: 'Trust & Safety', desc: 'Every provider is identity-verified. We never compromise on who we allow on our platform.' },
              { icon: Heart, bg: 'bg-red-100', text: 'text-red-600', title: 'Compassion First', desc: 'We believe care work is noble. We treat every professional and client with dignity and respect.' },
              { icon: Globe, bg: 'bg-green-100', text: 'text-green-600', title: 'Inclusive Access', desc: 'We build for everyone — multilingual, multi-currency, and available across borders.' },
              { icon: Users, bg: 'bg-purple-100', text: 'text-purple-600', title: 'Community Driven', desc: 'Our platform grows through reviews, referrals, and real relationships between people who care.' },
            ].map(({ icon: Icon, bg, text, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-10 text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to experience Cuidaru?</h2>
          <p className="text-blue-100 mb-6">Join thousands of families and professionals already on the platform.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Find a Provider
            </Link>
            <Link to="/my-profile" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Become a Provider
            </Link>
          </div>
        </section>

        {/* Back link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}