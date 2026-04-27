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
import { useI18n } from '@/lib/i18n';

const CATEGORY_ICONS = {
  assistant_nurse: { icon: Heart, color: 'from-pink-500 to-rose-500' },
  nurse: { icon: Stethoscope, color: 'from-blue-500 to-cyan-500' },
  doctor: { icon: UserCheck, color: 'from-indigo-500 to-purple-500' },
  cleaner: { icon: Sparkles, color: 'from-emerald-500 to-teal-500' },
  nanny: { icon: Baby, color: 'from-amber-500 to-orange-500' },
  laundry_worker: { icon: Shirt, color: 'from-violet-500 to-fuchsia-500' },
  caregiver: { icon: HandHelping, color: 'from-teal-500 to-cyan-500' },
  errand_person: { icon: ArrowRightLeft, color: 'from-orange-500 to-red-500' },
};

export default function Home() {
  const { t } = useI18n();

  const CATEGORIES = Object.entries(CATEGORY_ICONS).map(([key, val]) => ({
    key,
    label: t(`cat_${key}`),
    desc: t(`cat_desc_${key}`),
    icon: val.icon,
    color: val.color,
  }));

  const STEPS = [
    { step: '01', title: t('step1_title'), desc: t('step1_desc'), icon: '🔍' },
    { step: '02', title: t('step2_title'), desc: t('step2_desc'), icon: '📅' },
    { step: '03', title: t('step3_title'), desc: t('step3_desc'), icon: '✅' },
    { step: '04', title: t('step4_title'), desc: t('step4_desc'), icon: '⭐' },
  ];

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
              {t('hero_badge')}
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight leading-tight">
              {t('hero_title_1')}
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero_title_2')}
              </span>
              {t('hero_title_3')}
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" className="h-14 px-8 text-base gap-2 shadow-lg shadow-primary/20">
                  {t('hero_cta_find')} <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/my-profile">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  {t('hero_cta_provider')}
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                {t('hero_trust_1')}
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                {t('hero_trust_2')}
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                {t('hero_trust_3')}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">{t('browse_by_category')}</h2>
          <p className="mt-3 text-muted-foreground text-lg">{t('browse_subtitle')}</p>
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
            <h2 className="text-3xl sm:text-4xl font-display font-bold">{t('how_it_works')}</h2>
            <p className="mt-3 text-muted-foreground text-lg">{t('how_subtitle')}</p>
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
              {t('trust_title_1')}
              <span className="text-primary"> {t('trust_title_2')}</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{t('trust_body')}</p>
            <div className="mt-8 space-y-4">
              {[t('trust_1'), t('trust_2'), t('trust_3'), t('trust_4'), t('trust_5')].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <Link to="/browse">
              <Button size="lg" className="mt-8 gap-2">
                {t('get_started')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="w-3/4 space-y-4">
                {[
                  { icon: Shield, label: t('hero_trust_1'), value: 'ID Checked' },
                  { icon: DollarSign, label: t('hero_trust_2'), value: 'Held in Escrow' },
                  { icon: Star, label: t('rating'), value: '4.9 ★ (124 reviews)' },
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