import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, Star, Shield, MapPin, TrendingUp } from 'lucide-react';
import { usePricing } from '@/lib/usePricing';
import { useUserProfile } from '@/lib/useUserProfile';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import ReferralRewardCard from '@/components/referral/ReferralRewardCard';

export default function Premium() {
  const { profile, user, refetch } = useUserProfile();
  const country = profile?.country || 'brazil';
  const c = usePricing(country);

  const handleSubscribe = async (type) => {
    // Simulate subscription activation
    const expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    if (type === 'client') {
      const profiles = await base44.entities.UserProfile.filter({ user_email: user.email });
      if (profiles.length > 0) {
        await base44.entities.UserProfile.update(profiles[0].id, { is_premium: true, premium_expires_at: expiresAt });
      }
      toast.success('🎉 You are now a Premium Client!');
    } else {
      const providers = await base44.entities.ServiceProvider.filter({ user_email: user.email });
      if (providers.length > 0) {
        await base44.entities.ServiceProvider.update(providers[0].id, { is_premium: true, premium_expires_at: expiresAt });
      }
      toast.success('🎉 Premium activated! You now appear first in all searches.');
    }
    refetch();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
         <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
           <Zap className="w-4 h-4" /> Cuidaru+
         </div>
         <h1 className="text-4xl font-bold text-gray-900">Upgrade Your Experience</h1>
         <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">Cuidaru+ gives providers priority placement and visibility in the marketplace.</p>
       </div>

      {/* Referral Reward Card */}
      <div className="mb-12">
        <ReferralRewardCard />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Provider Premium */}
        <Card className="border-2 border-amber-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4"><Badge className="bg-amber-500 text-white">For Providers</Badge></div>
          <div className="h-2 bg-gradient-to-r from-amber-400 to-orange-400" />
          <CardHeader className="pt-8">
            <div className="text-4xl mb-2">💼</div>
            <CardTitle className="text-xl text-gray-900">Provider Cuidaru+</CardTitle>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl font-bold text-amber-600">{c.symbol}{c.sub_provider}</span>
              <span className="text-gray-400">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: TrendingUp, text: 'Appear first in all searches' },
              { icon: MapPin, text: 'Boosted to nearby clients (5-10km radius)' },
              { icon: Star, text: 'Premium badge on your profile' },
              { icon: Zap, text: 'Higher frequency in search results' },
              { icon: Shield, text: 'Priority customer support' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
            <Button className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white h-11" onClick={() => handleSubscribe('provider')}>
              <Zap className="w-4 h-4 mr-2" /> Activate Provider Cuidaru+
            </Button>
          </CardContent>
        </Card>

        {/* Client Premium */}
        <Card className="border-2 border-blue-300 shadow-lg relative overflow-hidden">
          <div className="absolute top-4 right-4"><Badge className="bg-blue-600 text-white">For Clients</Badge></div>
          <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
          <CardHeader className="pt-8">
            <div className="text-4xl mb-2">👑</div>
            <CardTitle className="text-xl text-gray-900">Client Cuidaru+</CardTitle>
            <div className="flex items-baseline gap-1 mt-3">
              <span className="text-4xl font-bold text-blue-600">{c.symbol}{c.sub_client}</span>
              <span className="text-gray-400">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: Star, text: 'See premium providers first' },
              { icon: Zap, text: 'Priority responses from providers' },
              { icon: Shield, text: 'Premium client badge' },
              { icon: TrendingUp, text: 'Exclusive access to top-rated providers' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
            <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-11" onClick={() => handleSubscribe('client')}>
              <Star className="w-4 h-4 mr-2" /> Activate Client Cuidaru+
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Country info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <span>{c.flag} Prices shown in {c.currency} for {c.label}. </span>
        <span>Provider platform fee: {c.fee_pct}%.</span>
      </div>
    </div>
  );
}