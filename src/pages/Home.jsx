import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, DollarSign, ArrowRight, CheckCircle2, MapPin, Zap, Lock, GitBranch, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES, CATEGORY_COLORS } from '@/lib/constants';
import { usePricing } from '@/lib/usePricing';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';

export default function Home() {
  const { t } = useI18n();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  // Route to onboarding if needed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_complete) {
      navigate('/onboarding');
    }
  }, [loading, profile]);

  const country = profile?.country || 'brazil';
  const countryInfo = usePricing(country);

  const STEPS = [
    { icon: '🔍', title: t('step1_title'), desc: t('step1_desc') },
    { icon: '📅', title: t('step2_title'), desc: t('step2_desc') },
    { icon: '✅', title: t('step3_title'), desc: t('step3_desc') },
    { icon: '⭐', title: t('step4_title'), desc: t('step4_desc') },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <Badge className="mb-5 bg-white/20 text-white border-white/30 hover:bg-white/20 px-4 py-1.5">
              <Shield className="w-3.5 h-3.5 mr-1.5" />
              {t('hero_badge')}
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              {t('hero_title_1')}{' '}
              <span className="text-green-300">{t('hero_title_2')}</span>
              <br />{t('hero_title_3')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="h-14 px-8 text-base bg-white text-blue-700 hover:bg-blue-50 gap-2 shadow-lg">
                  {t('hero_cta_find')} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {(!profile || profile.role === 'client') && (
                <Link to="/onboarding">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base border-white/40 text-white hover:bg-white/10">
                    {t('hero_cta_provider')}
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-100">
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-300" /> {t('hero_trust_1')}</span>
              <span className="flex items-center gap-2"><Lock className="w-4 h-4 text-green-300" /> {t('hero_trust_2')}</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-300" /> {t('hero_trust_3')}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-green-300" /> GPS Matching</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('browse_by_category')}</h2>
          <p className="mt-3 text-gray-500 text-lg">{t('browse_subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={cat.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
              <Link to={`/browse?category=${cat.key}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border border-gray-100 h-full">
                  <CardContent className="p-5 text-center">
                    <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${CATEGORY_COLORS[cat.key]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-2xl shadow-sm`}>
                      {cat.icon}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 leading-tight">{t(`cat_${cat.key}`)}</h3>
                    <p className="text-xs text-gray-400 mt-1 leading-tight">{t(`cat_desc_${cat.key}`)}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Premium Feature Banner */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-amber-700 text-sm uppercase tracking-wide">Premium Boost</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Stand out. Get hired faster.</h3>
              <p className="text-gray-600 mt-2">Premium providers appear first in searches, boosted to nearby clients. Premium clients pay 0% platform fees.</p>
              <ul className="mt-4 space-y-2">
                {[
                  'Providers: Appear first in all nearby searches',
                  `Providers: From ${countryInfo.symbol}${countryInfo.sub_provider}/${t('per_month') || 'month'}`,
                  'Clients: 0% platform fee on all bookings',
                  `Clients: From ${countryInfo.symbol}${countryInfo.sub_client}/${t('per_month') || 'month'}`,
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/premium">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white h-12 px-8 gap-2 shadow-lg">
                <Zap className="w-5 h-5" /> Explore Premium
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{t('how_it_works')}</h2>
            <p className="mt-3 text-gray-500 text-lg">{t('how_subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <div className="text-5xl mb-4">{s.icon}</div>
                <div className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-2">0{i+1}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral & Affiliate Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 border-y border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Earn Rewards & Grow Your Network</h2>
            <p className="mt-3 text-gray-600 text-lg">Join our referral program and unlock exclusive benefits</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Referral Rewards Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-2 border-purple-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center mb-4">
                    <Gift className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Referral Rewards</h3>
                  <p className="text-gray-600 mb-6">Invite friends and family to CareBook and get rewarded when they join.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span><strong>Clients:</strong> Invite 5+ friends → Get 3 free bookings with zero platform fees</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span><strong>Providers:</strong> Invite 6+ professionals → Get 1 month of free premium</span>
                    </li>
                  </ul>
                  <Link to="/premium">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                      <Gift className="w-4 h-4" /> Check Your Rewards
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affiliate Program Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card className="h-full border-2 border-pink-200 bg-white hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-4">
                    <GitBranch className="w-6 h-6 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Affiliate Program</h3>
                  <p className="text-gray-600 mb-6">Earn 5% commission on every user you refer who completes their first booking.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <span>Share your unique affiliate code</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <span>Earn 5% on each referred user's first transaction</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0" />
                      <span>Withdraw via Stripe, debit or prepaid card</span>
                    </li>
                  </ul>
                  <Link to="/affiliate">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2">
                      <GitBranch className="w-4 h-4" /> Join Affiliate Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {t('trust_title_1')} <span className="text-blue-600">{t('trust_title_2')}</span>
            </h2>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed">{t('trust_body')}</p>
            <div className="mt-8 space-y-3">
              {[t('trust_1'), t('trust_2'), t('trust_3'), t('trust_4'), t('trust_5')].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/browse">
              <Button size="lg" className="mt-8 h-12 px-8 bg-blue-600 hover:bg-blue-700 gap-2">
                {t('get_started')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: '🛡️', title: 'ID Verified', desc: 'All providers go through identity checks' },
              { icon: '🔒', title: 'Escrow Payments', desc: 'Funds held until job is complete' },
              { icon: '📍', title: 'GPS Matching', desc: 'Find providers near you in real time' },
              { icon: '⭐', title: 'Vetted Reviews', desc: 'Only real clients can leave reviews' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full border border-gray-100 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}