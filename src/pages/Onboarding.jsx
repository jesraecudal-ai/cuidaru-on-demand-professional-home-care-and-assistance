import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Heart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function Onboarding() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(async (u) => {
        if (u) {
          setIsAuthed(true);
          // Auto-complete onboarding for already-authed users
          setLoading(true);
          const existing = await base44.entities.UserProfile.filter({ user_email: u.email });
          if (existing.length > 0) {
            if (!existing[0].onboarding_complete) {
              await base44.entities.UserProfile.update(existing[0].id, { onboarding_complete: true });
            }
          } else {
            await base44.entities.UserProfile.create({ user_email: u.email, role: 'client', onboarding_complete: true });
          }
          navigate('/browse');
        }
      })
      .catch(() => setIsAuthed(false))
      .finally(() => setLoading(false));
  }, []);

  const handleGetStarted = () => {
    base44.auth.redirectToLogin('/onboarding');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Cuidaru</span>
          </div>
          <p className="text-gray-500">{t('onboarding_welcome')}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h2 className="text-2xl font-bold mb-3 text-gray-800">Find trusted care & service professionals</h2>
          <p className="text-gray-500 mb-8">Book verified nurses, doctors, cleaners, nannies and more. Pay securely — funds released only when the job is done.</p>

          <Button className="w-full h-12 text-base" onClick={handleGetStarted}>
            {t('onboarding_signup_to_continue')} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <p className="text-center text-xs text-gray-400 mt-4">
            {t('onboarding_terms_notice')}{' '}
            <Link to="/terms" className="text-blue-500 underline hover:text-blue-600">
              {t('terms_title')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}