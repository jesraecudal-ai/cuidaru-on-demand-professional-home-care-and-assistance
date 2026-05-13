import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, Star, Globe, Shield, Users, ArrowLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

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

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4"
      >
        <motion.div {...fadeUp(0.1)} className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/3961b9c00_Cuidaru.png" alt="Cuidaru" className="w-12 h-12 object-contain" />
            <span className="text-3xl font-bold">Cuidaru</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('about_title')}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">{t('about_subtitle')}</p>
        </motion.div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-20">

        {/* Our Story */}
        <motion.section {...fadeUp(0)} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg">✦</span>
            {t('about_story_title')}
          </h2>
          <div className="prose prose-lg text-gray-600 space-y-4">
            <p>{t('about_story_p1')}</p>
            <p dangerouslySetInnerHTML={{ __html: t('about_story_p2') }} />
            <p>{t('about_story_p3')}</p>
          </div>
        </motion.section>

        {/* Who We Are */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about_who_title')}</h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-4 text-gray-600">
              <p>{t('about_who_p1')}</p>
              <p>{t('about_who_p2')}</p>
              <p>{t('about_who_p3')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {stats.map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="bg-white rounded-xl p-4 text-center shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">{item.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Vision, Mission, Goals */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">{t('about_vmg_title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { border: 'border-blue-100', bg: 'bg-blue-100', Icon: Eye, iconClass: 'text-blue-600', title: t('about_vision_title'), content: <p className="text-gray-600 leading-relaxed">{t('about_vision_desc')}</p> },
              { border: 'border-green-100', bg: 'bg-green-100', Icon: Target, iconClass: 'text-green-600', title: t('about_mission_title'), content: <p className="text-gray-600 leading-relaxed">{t('about_mission_desc')}</p> },
              { border: 'border-amber-100', bg: 'bg-amber-100', Icon: Star, iconClass: 'text-amber-600', title: t('about_goals_title'), content: (
                <ul className="text-gray-600 space-y-2 text-sm leading-relaxed">
                  {[t('about_goal1'), t('about_goal2'), t('about_goal3'), t('about_goal4'), t('about_goal5')].map((g, i) => (
                    <li key={i} className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> {g}</li>
                  ))}
                </ul>
              )},
            ].map(({ border, bg, Icon, iconClass, title, content }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${iconClass}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                {content}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Values */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{t('about_values_title')}</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ icon: Icon, bg, text, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }} className="flex gap-4 p-5 bg-gray-50 rounded-xl">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${text}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Founder Section */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Meet the Founder</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="shrink-0 text-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-3 shadow-lg text-white text-4xl font-bold">
                JL
              </div>
              <p className="font-bold text-gray-900 text-lg">Jesrae Cudal Laguna</p>
              <p className="text-blue-600 font-medium text-sm">Founder & Creator of Cuidaru</p>
              <a href="https://www.linkedin.com/in/jesrae-l-a23716110/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn Profile
              </a>
            </div>
            <div className="flex-1 space-y-4 text-gray-600 leading-relaxed">
              <p>
                Cuidaru was born from a deeply personal vision — to create a platform where families can find trusted care professionals, and where skilled providers can connect with clients who need them, without barriers, fees, or complexity.
              </p>
              <p>
                Jesrae Cudal Laguna, the Founder and Creator of Cuidaru, built this platform with one goal: to make quality care accessible to everyone. With a background rooted in service and a passion for technology, Jesrae envisioned a community-first marketplace that puts people before profit.
              </p>
              <p>
                Cuidaru is free for everyone — no subscriptions, no commissions, no hidden costs — because Jesrae believes that connecting families with the care they need should never come with a price tag.
              </p>
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-10 text-white">
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
        </motion.section>

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