import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ChevronRight, Search, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { COUNTRY_SETTINGS } from '@/lib/constants';

const SUPPORTED_COUNTRIES = ['brazil', 'uruguay', 'usa', 'canada'];

export default function Onboarding() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = role, 2 = country
  const [role, setRole] = useState(null);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => setIsAuthed(!!u))
      .catch(() => setIsAuthed(false));
  }, []);

  const handleRoleNext = () => {
    if (!isAuthed) {
      base44.auth.redirectToLogin('/onboarding');
      return;
    }
    setStep(2);
  };

  const handleComplete = async () => {
    if (!isAuthed) {
      base44.auth.redirectToLogin('/onboarding');
      return;
    }
    setLoading(true);
    const me = await base44.auth.me();
    const existing = await base44.entities.UserProfile.filter({ user_email: me.email });
    if (existing.length > 0) {
      await base44.entities.UserProfile.update(existing[0].id, { role, country, onboarding_complete: true });
    } else {
      await base44.entities.UserProfile.create({ user_email: me.email, role, country, onboarding_complete: true });
    }
    if (role === 'provider') {
      navigate('/my-profile');
    } else {
      navigate('/browse');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Cuidaru</span>
          </div>
          <p className="text-gray-500">{t('onboarding_welcome')}</p>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-1.5 rounded-full transition-colors ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{t('onboarding_iam_here')}</h2>
              <div className="grid gap-4">
                <Card
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${role === 'client' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  onClick={() => setRole('client')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl"><Search className="w-7 h-7 text-blue-600" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('onboarding_looking_help')}</h3>
                      <p className="text-sm text-gray-500">{t('onboarding_looking_help_desc')}</p>
                    </div>
                    {role === 'client' && <ChevronRight className="ml-auto text-blue-500 w-5 h-5" />}
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer border-2 transition-all hover:shadow-lg ${role === 'provider' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                  onClick={() => setRole('provider')}
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center"><Briefcase className="w-7 h-7 text-green-600" /></div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{t('onboarding_looking_work')}</h3>
                      <p className="text-sm text-gray-500">{t('onboarding_looking_work_desc')}</p>
                    </div>
                    {role === 'provider' && <ChevronRight className="ml-auto text-green-500 w-5 h-5" />}
                  </CardContent>
                </Card>


              </div>

              <Button
                className="w-full mt-6 h-12"
                disabled={!role}
                onClick={handleRoleNext}
              >
                {isAuthed ? 'Continue' : t('onboarding_signup_to_continue')} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}>
              <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Select Your Country</h2>
              <p className="text-center text-sm text-gray-500 mb-6">You'll see providers and clients in your country, using your local currency.</p>
              <div className="grid gap-3">
                {SUPPORTED_COUNTRIES.map(key => {
                  const info = COUNTRY_SETTINGS[key];
                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer border-2 transition-all hover:shadow-lg ${country === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                      onClick={() => setCountry(key)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <span className="text-3xl">{info.flag}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{info.label}</h3>
                          <p className="text-sm text-gray-500">{info.currency} — {info.symbol}</p>
                        </div>
                        {country === key && <ChevronRight className="text-blue-500 w-5 h-5" />}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  className="flex-1 h-12"
                  disabled={!country || loading}
                  onClick={handleComplete}
                >
                  {loading ? 'Setting up...' : "Let's Go!"} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-xs text-gray-400 mt-4">
          {t('onboarding_terms_notice')}{' '}
          <Link to="/terms" className="text-blue-500 underline hover:text-blue-600">
            {t('terms_title')}
          </Link>
        </p>
      </div>
    </div>
  );
}