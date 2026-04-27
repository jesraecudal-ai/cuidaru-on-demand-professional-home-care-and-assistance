import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight, Shield, Clock, DollarSign, Star,
  Heart, Stethoscope, Sparkles, Baby, Shirt, HandHelping, UserCheck, ArrowRightLeft, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { key: 'assistant_nurse', label: 'Assistant Nurse', icon: Heart, desc: 'Support for daily health needs', color: 'from-pink-500 to-rose-500' },
  { key: 'nurse', label: 'Nurse', icon: Stethoscope, desc: 'Professional nursing care', color: 'from-blue-500 to-cyan-500' },
  { key: 'doctor', label: 'Doctor', icon: UserCheck, desc: 'Medical consultations at home', color: 'from-indigo-500 to-purple-500' },
  { key: 'cleaner', label: 'Cleaner', icon: Sparkles, desc: 'Spotless home cleaning', color: 'from-emerald-500 to-teal-500' },
  { key: 'nanny', label: 'Nanny', icon: Baby, desc: 'Trusted childcare professionals', color: 'from-amber-500 to-orange-500' },
  { key: 'laundry_worker', label: 'Laundry Worker', icon: Shirt, desc: 'Laundry & garment care', color: 'from-violet-500 to-fuchsia-500' },
  { key: 'caregiver', label: 'Caregiver', icon: HandHelping, desc: 'Elderly & special needs care', color: 'from-teal-500 to-cyan-500' },
  { key: 'errand_person', label: 'Errand Person', icon: ArrowRightLeft, desc: 'Errands & personal tasks', color: 'from-orange-500 to-red-500' },
];

const STEPS = [
  { step: '01', title: 'Browse & Find', desc: 'Search verified providers by category, ratings, and availability.', icon: '🔍' },
  { step: '02', title: 'Book & Pay', desc: 'Choose hourly, daily, or weekly. Payment is held securely in escrow.', icon: '📅' },
  { step: '03', title: 'Service Done', desc: 'Provider completes the task. Funds released upon your confirmation.', icon: '✅' },
  { step: '04', title: 'Review', desc: 'Rate your experience and help the community make informed decisions.', icon: '⭐' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/30 text-primary">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              Trusted & Verified Professionals
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
              Find Trusted
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Care & Service
              </span>
              Professionals
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Book identity-verified nurses, doctors, cleaners, nannies, and more.
              Pay securely — funds released only when the job is done.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="h-14 px-8 text-base gap-2 shadow-lg shadow-primary/20">
                  Find a Provider <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/my-profile">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  Become a Provider
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                ID Verified
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Secure Escrow
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Reviewed
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">Browse by Category</h2>
          <p className="mt-3 text-muted-foreground text-lg">Find the right professional for your needs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={`/browse?category=${cat.key}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-border/50 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <cat.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold">{cat.label}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{cat.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold">How It Works</h2>
            <p className="mt-3 text-muted-foreground text-lg">Simple, secure, and transparent</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-bold text-primary tracking-widest uppercase mb-2">Step {step.step}</div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold">
              Your Safety is Our
              <span className="text-primary"> Top Priority</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Every provider goes through identity verification.
              Your payment is held in escrow until you confirm the work is complete.
            </p>
            <div className="mt-8 space-y-4">
              {[
                'Identity verification for all providers',
                'Secure escrow payment system',
                'Transparent reviews from real clients',
                'Flexible booking — hourly, daily, or weekly',
                '10% platform fee only on completed jobs',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link to="/browse">
              <Button size="lg" className="mt-8 gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="w-3/4 space-y-4">
                {[
                  { icon: Shield, label: 'Verified Provider', value: 'ID Checked' },
                  { icon: DollarSign, label: 'Payment Status', value: 'Held in Escrow' },
                  { icon: Star, label: 'Client Rating', value: '4.9 ★ (124 reviews)' },
                  { icon: Clock, label: 'Response Time', value: 'Under 30 min' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-xl p-4 shadow-sm border border-border/50 flex items-center gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="font-semibold text-sm">{item.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}