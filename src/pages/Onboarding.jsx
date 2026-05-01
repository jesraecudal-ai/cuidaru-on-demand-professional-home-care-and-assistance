import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, ChevronRight, GitBranch } from 'lucide-react';
import AffiliateApplyCode from '@/components/affiliate/AffiliateApplyCode';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import { motion } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [showTerms, setShowTerms] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    base44.auth.me()
      .then(u => { setUserEmail(u?.email); setIsAuthed(!!u); })
      .catch(() => setIsAuthed(false));
  }, []);

  const handleComplete = async () => {
    if (!isAuthed) {
      base44.auth.redirectToLogin('/onboarding');
      return;
    }
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const existing = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (existing.length > 0) {
        await base44.entities.UserProfile.update(existing[0].id, { role, onboarding_complete: true });
      } else {
        await base44.entities.UserProfile.create({ user_email: me.email, role, onboarding_complete: true });
      }
      if (role === 'provider' || role === 'both') {
        navigate('/my-profile');
      } else {
        navigate('/browse');
      }
    } catch (err) {
      console.error('Onboarding error:', err);
      base44.auth.redirectToLogin('/onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <TermsAndConditionsModal
        open={showTerms && !termsAccepted}
        onAccept={() => { setTermsAccepted(true); setShowTerms(false); }}
        onDecline={() => navigate('/')}
      />

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Cuidaru</span>
          </div>
          <p className="text-gray-500">Welcome! Let's get you set up.</p>
        </div>

        {/* Step 1 — Role selection */}
        {termsAccepted && step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">I am here because...</h2>
            <div className="grid gap-4">
              <Card
                className={`cursor-pointer border-2 transition-all hover:shadow-lg ${role === 'client' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                onClick={() => setRole('client')}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl">🔍</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">I am looking for help</h3>
                    <p className="text-sm text-gray-500">Find trusted caregivers, nurses, cleaners & more</p>
                  </div>
                  {role === 'client' && <ChevronRight className="ml-auto text-blue-500 w-5 h-5" />}
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 transition-all hover:shadow-lg ${role === 'provider' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
                onClick={() => setRole('provider')}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl">💼</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">I am looking for work</h3>
                    <p className="text-sm text-gray-500">Offer your skills and get paid securely</p>
                  </div>
                  {role === 'provider' && <ChevronRight className="ml-auto text-green-500 w-5 h-5" />}
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer border-2 transition-all hover:shadow-lg ${role === 'both' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
                onClick={() => setRole('both')}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center text-2xl">🤝</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Both — hire & work</h3>
                    <p className="text-sm text-gray-500">Find help and offer your own services</p>
                  </div>
                  {role === 'both' && <ChevronRight className="ml-auto text-purple-500 w-5 h-5" />}
                </CardContent>
              </Card>
            </div>
            <Button
              className="w-full mt-6 h-12"
              disabled={!role}
              onClick={() => {
                if (!isAuthed) {
                  base44.auth.redirectToLogin('/onboarding');
                } else {
                  setStep(2);
                }
              }}
            >
              {isAuthed ? 'Continue' : 'Sign up / Sign in to continue'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {/* Step 2 — Referral code */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
                <GitBranch className="w-7 h-7 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Got a referral code?</h2>
              <p className="text-gray-500 text-sm mt-1">If someone referred you to Cuidaru, enter their code to reward them.</p>
            </div>

            <AffiliateApplyCode userEmail={userEmail} />

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 h-12" onClick={() => setStep(1)}>Back</Button>
              <Button className="flex-1 h-12" onClick={handleComplete} disabled={loading}>
                {loading ? 'Setting up...' : "Let's Go!"}
              </Button>
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">You can skip this — entering a code is optional.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}