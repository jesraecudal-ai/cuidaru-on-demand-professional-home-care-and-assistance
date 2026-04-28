import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Check, Clock } from 'lucide-react';

export default function ReferralRewardCard() {
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const res = await base44.functions.invoke('checkReferralRewards', {});
        setReward(res.data);
      } catch (err) {
        console.error('Error fetching reward:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReward();
  }, []);

  if (loading) return <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />;

  if (!reward) return null;

  const { user_role, referral_count, threshold, threshold_met, reward: rewardData } = reward;
  const progress = Math.min((referral_count / threshold) * 100, 100);

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-600" />
            <CardTitle className="text-green-900">Referral Reward</CardTitle>
          </div>
          {threshold_met && (
            <Badge className="bg-green-600">
              <Check className="w-3 h-3 mr-1" /> Unlocked
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-green-700 font-medium mb-2">
            {referral_count} / {threshold} {user_role === 'provider' ? 'Clients or Providers' : 'Clients or Providers'} Invited
          </p>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {threshold_met && rewardData ? (
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                {user_role === 'provider' ? (
                  <p className="text-sm text-green-900 font-medium">
                    ✨ Free Premium for 1 Month Unlocked!
                  </p>
                ) : (
                  <p className="text-sm text-green-900 font-medium">
                    ✨ Platform Fee Waived on Your First 3 Bookings!
                  </p>
                )}
                <p className="text-xs text-green-700 mt-1">
                  {user_role === 'provider' 
                    ? `Valid until ${new Date(rewardData.premium_free_until).toLocaleDateString()}`
                    : `${3 - (rewardData.fee_waivers_used || 0)} waivers remaining`}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-3 border border-green-200 flex items-start gap-2">
            <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700">
              Invite {threshold - referral_count} more to unlock your reward!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}