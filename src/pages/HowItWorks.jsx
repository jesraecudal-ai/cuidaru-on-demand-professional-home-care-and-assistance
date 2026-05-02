import React from 'react';
import { Link } from 'react-router-dom';
import {
  Search, UserCheck, Calendar, CreditCard, Star,
  Briefcase, ClipboardList, DollarSign, CheckCircle, Shield,
  ArrowRight, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

export default function HowItWorks() {
  const { t } = useI18n();

  const clientSteps = [
    { icon: Search, color: 'bg-blue-100 text-blue-600', title: t('hiw_client_step1_title'), desc: t('hiw_client_step1_desc') },
    { icon: UserCheck, color: 'bg-indigo-100 text-indigo-600', title: t('hiw_client_step2_title'), desc: t('hiw_client_step2_desc') },
    { icon: Calendar, color: 'bg-cyan-100 text-cyan-600', title: t('hiw_client_step3_title'), desc: t('hiw_client_step3_desc') },
    { icon: CreditCard, color: 'bg-teal-100 text-teal-600', title: t('hiw_client_step4_title'), desc: t('hiw_client_step4_desc') },
    { icon: Star, color: 'bg-amber-100 text-amber-600', title: t('hiw_client_step5_title'), desc: t('hiw_client_step5_desc') },
  ];

  const providerSteps = [
    { icon: ClipboardList, color: 'bg-green-100 text-green-600', title: t('hiw_provider_step1_title'), desc: t('hiw_provider_step1_desc') },
    { icon: Shield, color: 'bg-emerald-100 text-emerald-600', title: t('hiw_provider_step2_title'), desc: t('hiw_provider_step2_desc') },
    { icon: Briefcase, color: 'bg-lime-100 text-lime-600', title: t('hiw_provider_step3_title'), desc: t('hiw_provider_step3_desc') },
    { icon: CheckCircle, color: 'bg-orange-100 text-orange-600', title: t('hiw_provider_step4_title'), desc: t('hiw_provider_step4_desc') },
    { icon: DollarSign, color: 'bg-rose-100 text-rose-600', title: t('hiw_provider_step5_title'), desc: t('hiw_provider_step5_desc') },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/3961b9c00_Cuidaru.png" alt="Cuidaru" className="w-10 h-10 object-contain" />
          <span className="text-2xl font-bold">Cuidaru</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('hiw_title')}</h1>
        <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('hiw_subtitle')}</p>
      </div>

      {/* 2-Column Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10">

          {/* Client Column */}
          <div>
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
                  <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
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
                  </div>
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
          </div>

          {/* Provider Column */}
          <div>
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
                  <div key={i} className="flex gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
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
                  </div>
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
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('hiw_trust_title')}</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">{t('hiw_trust_body')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse"><Button className="bg-blue-600 hover:bg-blue-700">{t('hero_cta_find')}</Button></Link>
            <Link to="/about"><Button variant="outline">{t('hiw_trust_about')}</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
}