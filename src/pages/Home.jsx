import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, ArrowRight, CheckCircle2, Zap, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
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
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600" /> 100% Free — No fees ever</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Carousel */}
      <CategoryCarousel />

      {/* Free Platform Banner */}
      <section className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-t-2 border-green-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
              <CheckCircle2 className="w-4 h-4" /> Always Free
            </div>
            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Zero fees. Zero subscriptions. Zero limits.</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
              Cuidaru is a free powerhouse platform connecting clients and service professionals directly. No platform cuts, no hidden charges — ever.
            </p>
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: '🙌', title: 'Free for Clients', desc: 'Browse and book any service at no cost.' },
                { icon: '💼', title: 'Free for Providers', desc: 'List your services and earn 100% of your rate.' },
                { icon: '🔒', title: 'No Hidden Fees', desc: 'What you agree is what you pay. Always.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-b from-slate-50 to-white">
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
                  <div className="text-sm font-bold text-blue-600 tracking-widest uppercase mb-3">{t('step_label')} {i+1}</div>
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

      {/* Donation Section */}
      <section className="bg-gradient-to-br from-rose-50 via-pink-50 to-red-50 border-t-2 border-rose-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Help Keep Cuidaru Free</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-4">
            Cuidaru is and will always be free for everyone. No subscriptions, no commissions, no hidden fees.
          </p>
          <p className="text-gray-500 text-base max-w-2xl mx-auto mb-10">
            Running the platform has real costs — servers, security, development, and support. If Cuidaru has helped you, consider making a small donation to keep it alive and free for the families and professionals who need it most.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-10">
            {[{ amount: '$5', label: 'A coffee ☕' }, { amount: '$15', label: 'A month of hosting 🖥️' }, { amount: '$50', label: 'Keep us going 💪' }].map((tier, i) => (
              <div key={i} className="bg-white border-2 border-rose-100 rounded-2xl p-5 shadow-sm">
                <div className="text-2xl font-bold text-rose-600 mb-1">{tier.amount}</div>
                <div className="text-gray-500 text-sm">{tier.label}</div>
              </div>
            ))}
          </div>
          <a href="https://donate.stripe.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-rose-500 hover:bg-rose-600 text-white h-14 px-10 gap-2 shadow-lg text-base">
              <Heart className="w-5 h-5" /> Donate & Support Cuidaru
            </Button>
          </a>
          <p className="mt-4 text-xs text-gray-400">Donations are voluntary and go directly towards platform maintenance costs.</p>
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