import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, DollarSign, ArrowRight, CheckCircle2, MapPin, Zap, Lock, GitBranch, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORY_COLORS } from '@/lib/constants';
import { usePricing } from '@/lib/usePricing';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import CategoryCarousel from '@/components/home/CategoryCarousel';

const heroImages = [
  'https://images.unsplash.com/photo-1576091160399-86c54dcb98fe?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1631217314830-e63c9a1c5b44?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1579154204601-01d82b944c47?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1638281846519-e1b7b72f87d7?w=800&h=600&fit=crop',
];

export default function Home() {
  const { t } = useI18n();
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Cuidaru | Care & Service Professionals';
  }, []);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Route to onboarding if needed
  useEffect(() => {
    if (!loading && profile && !profile.onboarding_complete) {
      navigate('/onboarding');
    }
  }, [loading, profile]);

  // Carousel rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const country = profile?.country || 'brazil';
  const countryInfo = usePricing(country);

  const STEPS = [
    { icon: '🔍', title: t('step1_title'), desc: t('step1_desc') },
    { icon: '📅', title: t('step2_title'), desc: t('step2_desc') },
    { icon: '✅', title: t('step3_title'), desc: t('step3_desc') },
    { icon: '⭐', title: t('step4_title'), desc: t('step4_desc') },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-transparent to-slate-100" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-20" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 px-4 py-1.5">
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              {t('hero_badge')}
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              {t('hero_title_1')}{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{t('hero_title_2')}</span>
              <br/>{t('hero_title_3')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="h-14 px-8 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 shadow-lg">
                  {t('hero_cta_find')} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              {(!profile || profile.role === 'client') && (
                <Link to="/onboarding">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-base border-gray-300 text-gray-900 hover:bg-gray-100">
                    {t('hero_cta_provider')}
                  </Button>
                </Link>
              )}
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> {t('hero_trust_1')}</span>
              <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" /> {t('hero_trust_2')}</span>
              <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-600" /> {t('hero_trust_3')}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Carousel */}
      <CategoryCarousel />

      {/* Premium Feature Banner */}
      <section className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-t-2 border-amber-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-700 text-sm uppercase tracking-wider">Cuidaru+ Advantage</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get ahead with Cuidaru+</h3>
              <p className="text-gray-700 text-lg mb-6">Stand out in searches and reach more clients. Cuidaru+ members enjoy priority visibility and zero fees.</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Providers: Featured in top searches',
                  `Providers: From ${countryInfo.symbol}${countryInfo.sub_provider}/${t('per_month') || 'month'}`,
                  'Clients: Zero platform fees on bookings',
                  `Clients: From ${countryInfo.symbol}${countryInfo.sub_client}/${t('per_month') || 'month'}`,
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-800">
                    <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <Link to="/premium" className="flex-shrink-0">
               <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white h-14 px-10 gap-2 shadow-lg text-base">
                 <Zap className="w-5 h-5" /> Explore Cuidaru+
               </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">{t('how_it_works')}</h2>
            <p className="mt-4 text-lg text-gray-600">{t('how_subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center mb-6 text-4xl shadow-md">
                    {s.icon}
                  </div>
                  <div className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">Step {i+1}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-10 text-gray-400">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Referral & Affiliate Section */}
      <section className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-t-2 border-purple-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900">Earn & Grow Your Network</h2>
             <p className="mt-4 text-lg text-gray-600">Get rewarded for sharing Cuidaru</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Referral Rewards Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="h-full border-2 border-purple-200 bg-white hover:shadow-2xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mb-5">
                    <Gift className="w-7 h-7 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Referral Rewards</h3>
                  <p className="text-gray-600 mb-6 text-sm">Invite friends and family to Cuidaru and get rewarded.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Clients:</strong> Invite 5+ friends → Get 3 free bookings</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Providers:</strong> Invite 6+ → Get 1 free premium month</span>
                    </li>
                  </ul>
                  <Link to="/premium" className="block">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white gap-2">
                      <Gift className="w-4 h-4" /> Check Your Rewards
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affiliate Program Block */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <Card className="h-full border-2 border-pink-200 bg-white hover:shadow-2xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center mb-5">
                    <GitBranch className="w-7 h-7 text-pink-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Affiliate Program</h3>
                  <p className="text-gray-600 mb-6 text-sm">Earn 5% commission on every referral's first booking.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Share your unique affiliate code</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Earn 5% on each referred user</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                      <span>Easy withdrawal via Stripe</span>
                    </li>
                  </ul>
                  <Link to="/affiliate" className="block">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white gap-2">
                      <GitBranch className="w-4 h-4" /> Join Program
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {t('trust_title_1')} <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{t('trust_title_2')}</span>
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">{t('trust_body')}</p>
            <div className="space-y-4 mb-10">
              {[t('trust_1'), t('trust_2'), t('trust_3'), t('trust_4'), t('trust_5')].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <Link to="/browse">
              <Button size="lg" className="h-13 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white gap-2 text-base">
                {t('get_started')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&h=600&fit=crop" 
              alt="Healthcare professional" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </div>
      </section>
    </div>
  );
}