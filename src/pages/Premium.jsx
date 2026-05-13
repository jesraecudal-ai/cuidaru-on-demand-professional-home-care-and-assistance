import React from 'react';
import { Zap, CheckCircle2, Star, Shield, MapPin, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserProfile } from '@/lib/useUserProfile';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ReferralRewardCard from '@/components/referral/ReferralRewardCard';

export default function Premium() {
  const { t } = useI18n();
  const { profile, user, refetch } = useUserProfile();

  const handleActivate = async () => {
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
    if (providers.length > 0) {
      await base44.entities.ServiceProvider.update(providers[0].id, { is_premium: true, premium_expires_at: expiresAt });
      toast.success(t('premium_activated_toast'));
      refetch();
    } else {
      toast.error('No provider profile found. Create a provider profile first.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <Zap className="w-4 h-4" /> Cuidaru+
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{t('premium_upgrade_title')}</h1>
        <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">{t('premium_upgrade_subtitle')}</p>
        <div className="inline-flex items-center gap-2 mt-4 bg-green-100 text-green-700 rounded-full px-4 py-1.5 text-sm font-semibold">
          🎉 Completely Free — No payment required
        </div>
      </div>

      {user && (
        <div className="mb-12">
          <ReferralRewardCard />
        </div>
      )}

      <Card className="border-2 border-amber-300 shadow-lg relative overflow-hidden max-w-md mx-auto">
        <div className="absolute top-4 right-4"><Badge className="bg-amber-500 text-white">For Providers</Badge></div>
        <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
        <CardHeader className="pt-8">
          <div className="text-4xl mb-2">💼</div>
          <CardTitle className="text-xl text-gray-900">{t('premium_provider')}</CardTitle>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-4xl font-bold text-green-600">FREE</span>
          </div>
          <p className="text-sm text-green-600 font-medium mt-1">No subscription cost</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: CheckCircle2, text: t('premium_feat_1') },
            { icon: TrendingUp, text: t('premium_feat_2') },
            { icon: MapPin, text: t('premium_feat_3') },
            { icon: Star, text: t('premium_feat_4') },
            { icon: Zap, text: t('premium_feat_5') },
            { icon: Shield, text: t('premium_feat_6') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-sm text-gray-700">{item.text}</span>
            </div>
          ))}
          <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white h-11" onClick={handleActivate}>
            <Zap className="w-4 h-4 mr-2" /> {t('activate_premium')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}