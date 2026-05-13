import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Target, Eye, Star, Globe, Shield, Users, ArrowLeft, Gift, Coffee } from 'lucide-react';
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
          <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-full">
            <Gift className="w-4 h-4" /> 100% Free — No subscriptions, no commissions, ever.
          </div>
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

        {/* Free Platform + Donation */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-100">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-1.5 rounded-full">
                <Gift className="w-4 h-4" /> Always Free
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Cuidaru is free for everyone</h2>
              <p className="text-gray-600 leading-relaxed">
                We believe connecting families with the care they need should never come with a price tag. Cuidaru charges <strong>zero commissions, zero subscription fees, and zero hidden costs</strong> — for both clients and service providers.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Providers keep 100% of what they earn. Clients find help without paying platform fees. Direct payments, trusted connections, real community.
              </p>
            </div>
            <div className="shrink-0 text-center bg-white rounded-2xl p-7 shadow-sm border border-emerald-100 max-w-xs w-full">
              <Coffee className="w-10 h-10 text-amber-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Support Cuidaru</h3>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                Cuidaru is a passion project kept alive by its community. If it helped you, consider buying us a coffee to keep the platform running.
              </p>
              <a
                href="https://buymeacoffee.com/cuidaru"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 font-bold px-6 py-3 rounded-xl transition-colors w-full justify-center"
              >
                <Coffee className="w-4 h-4" /> Buy us a coffee ☕
              </a>
              <p className="text-xs text-gray-400 mt-3">Every contribution keeps Cuidaru free for everyone.</p>
            </div>
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
              <img
                src="https://media.base44.com/images/public/69ef625dd7c5f2aec1f5dc5d/ca7c9a8ef_469053292_18334390954196491_426818919358397822_n.jpg"
                alt="Jesrae Cudal Laguna"
                className="w-32 h-32 rounded-full object-cover object-top mx-auto mb-3 shadow-lg border-4 border-white"
              />
              <p className="font-bold text-gray-900 text-lg">Jesrae Cudal Laguna</p>
              <p className="text-blue-600 font-medium text-sm">Founder & Creator of Cuidaru</p>
              <div className="flex items-center justify-center gap-3 mt-3">
                <a href="https://www.linkedin.com/in/jesrae-l-a23716110/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <svg className="w-4 h-4 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.tiktok.com/@gesureee" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors" aria-label="TikTok">
                  <svg className="w-4 h-4 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
                </a>
                <a href="https://www.instagram.com/gesureee" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors" aria-label="Instagram">
                  <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                </a>
              </div>
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