import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search, UserCheck, Calendar,
  Briefcase, ClipboardList, DollarSign, CheckCircle, Shield,
  ArrowRight, Star, PenLine, Bell, MessageSquare, ThumbsUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const { t } = useI18n();

  const clientSteps = [
    { icon: Search, color: 'bg-blue-100 text-blue-600', title: 'Browse & Find', desc: 'Search verified providers by category, location, ratings, and availability. Filter by service type to find the perfect match.' },
    { icon: UserCheck, color: 'bg-indigo-100 text-indigo-600', title: 'Review Profiles', desc: 'Check provider profiles, experience, certifications, and client reviews to make an informed decision.' },
    { icon: Calendar, color: 'bg-cyan-100 text-cyan-600', title: 'Book', desc: 'Send a booking request — hourly, daily, or weekly. Discuss details directly with the provider via chat and agree on everything before starting.' },
    { icon: DollarSign, color: 'bg-teal-100 text-teal-600', title: 'Pay Privately', desc: 'Pay the provider directly however you both agree — no platform middleman, no fees taken. You keep full control of your money.' },
    { icon: Star, color: 'bg-amber-100 text-amber-600', title: 'Leave a Review', desc: 'After the service, rate your experience and leave a review to help other families in the community make informed decisions.' },
  ];

  const jobPostSteps = [
    { icon: PenLine, color: 'bg-violet-100 text-violet-600', title: 'Describe Your Need', desc: 'Post a job with your requirements — category, location, schedule, and budget. It takes less than 2 minutes and is completely free.' },
    { icon: Bell, color: 'bg-purple-100 text-purple-600', title: 'Receive Proposals', desc: 'Qualified providers in your area will send you proposals. Review their profiles, rates, and experience before deciding.' },
    { icon: MessageSquare, color: 'bg-fuchsia-100 text-fuchsia-600', title: 'Chat & Agree', desc: 'Message providers directly to ask questions, negotiate terms, and confirm details before making any commitment.' },
    { icon: CheckCircle, color: 'bg-pink-100 text-pink-600', title: 'Accept & Book', desc: 'Accept the best proposal and confirm the booking. The provider will be notified and the service is set.' },
    { icon: ThumbsUp, color: 'bg-rose-100 text-rose-600', title: 'Get It Done & Review', desc: 'The provider completes the job. Pay them directly and leave a review to help the Cuidaru community.' },
  ];

  const providerSteps = [
    { icon: ClipboardList, color: 'bg-green-100 text-green-600', title: 'Create Your Profile', desc: 'Sign up and build your professional profile. Add your services, experience, certifications, and availability — completely free.' },
    { icon: Shield, color: 'bg-emerald-100 text-emerald-600', title: 'Get Verified', desc: 'Upload your ID documents to get a verified badge. Verification builds trust and helps you stand out to clients.' },
    { icon: Briefcase, color: 'bg-lime-100 text-lime-600', title: 'Receive Bookings', desc: 'Clients find you and send booking requests. Review them, chat directly, and agree on the details before accepting.' },
    { icon: CheckCircle, color: 'bg-orange-100 text-orange-600', title: 'Deliver the Service', desc: 'Complete the job on the agreed terms. Communicate with the client throughout to ensure a great experience.' },
    { icon: DollarSign, color: 'bg-rose-100 text-rose-600', title: 'Get Paid Directly', desc: 'Receive payment directly from the client — no platform cut, no delays, no middleman. 100% of what you agree goes to you.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 text-center"
      >
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/3961b9c00_Cuidaru.png" alt="Cuidaru" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold">Cuidaru</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('hiw_title')}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('hiw_subtitle')}</p>
        </motion.div>
      </motion.div>

      {/* 3-Column Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-10">

          {/* Client Column */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Search className="w-4 h-4" /> {t('hiw_for_clients')}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('hiw_client_heading')}</h2>
              <p className="text-gray-500">{t('hiw_client_subheading')}</p>
            </div>
            <div className="space-y-4">
              {clientSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="shrink-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 mb-1">{t('hiw_step')} {i + 1}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8">
              <Link to="/browse">
                <Button className="bg-blue-600 hover:bg-blue-700 gap-2 w-full md:w-auto">
                  {t('hiw_cta_client')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Post a Job Column */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <PenLine className="w-4 h-4" /> For Clients — Post a Job
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Need someone specific?</h2>
              <p className="text-gray-500">Post a job and let providers come to you.</p>
            </div>
            <div className="space-y-4">
              {jobPostSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="shrink-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 mb-1">{t('hiw_step')} {i + 1}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8">
              <Link to="/jobs">
                <Button className="bg-violet-600 hover:bg-violet-700 gap-2 w-full md:w-auto">
                  Post a Job <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Provider Column */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <Briefcase className="w-4 h-4" /> {t('hiw_for_providers')}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('hiw_provider_heading')}</h2>
              <p className="text-gray-500">{t('hiw_provider_subheading')}</p>
            </div>
            <div className="space-y-4">
              {providerSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 + i * 0.07 }} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="shrink-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 mb-1">{t('hiw_step')} {i + 1}</div>
                      <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-8">
              <Link to="/my-profile">
                <Button className="bg-green-600 hover:bg-green-700 gap-2 w-full md:w-auto">
                  {t('hiw_cta_provider')} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Trust strip */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('hiw_trust_title')}</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">{t('hiw_trust_body')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse"><Button className="bg-blue-600 hover:bg-blue-700">{t('hero_cta_find')}</Button></Link>
            <Link to="/about"><Button variant="outline">{t('hiw_trust_about')}</Button></Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}