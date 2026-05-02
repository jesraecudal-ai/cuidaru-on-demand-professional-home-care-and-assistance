import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, Star, Globe, Shield, Users, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function About() {
  const { t } = useI18n();

  const values = [
    { icon: Shield, bg: 'bg-blue-100', text: 'text-blue-600', title: t('about_val1_title'), desc: t('about_val1_desc') },
    { icon: Heart, bg: 'bg-red-100', text: 'text-red-600', title: t('about_val2_title'), desc: t('about_val2_desc') },
    { icon: Globe, bg: 'bg-green-100', text: 'text-green-600', title: t('about_val3_title'), desc: t('about_val3_desc') },
    { icon: Users, bg: 'bg-purple-100', text: 'text-purple-600', title: t('about_val4_title'), desc: t('about_val4_desc') },
  ];

  const stats = [
    { label: t('about_stat_countries'), value: '4' },
    { label: t('about_stat_categories'), value: '14' },
    { label: t('about_stat_languages'), value: '3' },
    { label: t('about_stat_founded'), value: '2024' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/3961b9c00_Cuidaru.png" alt="Cuidaru" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold">Cuidaru</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about_title')}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('about_subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Our Story */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">✦</span>
            {t('about_story_title')}
          </h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>{t('about_story_p1')}</p>
            <p dangerouslySetInnerHTML={{ __html: t('about_story_p2') }} />
            <p>{t('about_story_p3')}</p>
          </div>
        </section>

        {/* Who We Are */}
        <section className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about_who_title')}</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 text-gray-600">
              <p>{t('about_who_p1')}</p>
              <p>{t('about_who_p2')}</p>
              <p>{t('about_who_p3')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {stats.map(item => (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">{t('about_vmg_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about_vision_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('about_vision_desc')}</p>
            </div>
            <div className="bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about_mission_title')}</h3>
              <p className="text-gray-600 leading-relaxed">{t('about_mission_desc')}</p>
            </div>
            <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('about_goals_title')}</h3>
              <ul className="text-gray-600 space-y-2 text-sm leading-relaxed">
                {[t('about_goal1'), t('about_goal2'), t('about_goal3'), t('about_goal4'), t('about_goal5')].map((g, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> {g}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('about_values_title')}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, bg, text, title, desc }) => (
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
          <h2 className="text-2xl font-bold mb-3">{t('about_cta_title')}</h2>
          <p className="text-blue-100 mb-6">{t('about_cta_body')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/browse" className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              {t('about_cta_find')}
            </Link>
            <Link to="/my-profile" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              {t('about_cta_become')}
            </Link>
          </div>
        </section>

        {/* Back link */}
        <div>
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft className="w-4 h-4" /> {t('about_back')}
          </Link>
        </div>
      </div>
    </div>
  );
}