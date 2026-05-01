import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link, GitBranch, DollarSign, Users, TrendingUp, Copy, CheckCircle2, Clock, CreditCard, Banknote, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import AffiliateWithdrawModal from '@/components/affiliate/AffiliateWithdrawModal';
import AffiliateApplyCode from '@/components/affiliate/AffiliateApplyCode';

export default function AffiliateDashboard() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [registering, setRegistering] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: affiliate, isLoading: loadingAffiliate, refetch: refetchAffiliate } = useQuery({
    queryKey: ['my-affiliate', user?.email],
    queryFn: async () => {
      const records = await base44.entities.AffiliateUser.filter({ user_email: user.email });
      return records[0] || null;
    },
    enabled: !!user,
  });

  const { data: referrals = [], isLoading: loadingReferrals } = useQuery({
    queryKey: ['my-referrals', affiliate?.id],
    queryFn: () => base44.entities.AffiliateReferral.filter({ affiliate_id: affiliate.id }, '-created_date'),
    enabled: !!affiliate,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['my-withdrawals', affiliate?.id],
    queryFn: () => base44.entities.AffiliateWithdrawal.filter({ affiliate_id: affiliate.id }, '-created_date'),
    enabled: !!affiliate,
  });

  const handleRegister = async () => {
    setRegistering(true);
    const res = await base44.functions.invoke('affiliateRegister', {});
    refetchAffiliate();
    setRegistering(false);
    toast.success(t('affiliate_account_created'));
  };

  const copyCode = () => {
    navigator.clipboard.writeText(affiliate.affiliate_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    toast.success('Code copied!');
  };

  if (!user || loadingAffiliate) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
    );
  }

  // Not yet an affiliate — show join page
  if (!affiliate) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
          <GitBranch className="w-10 h-10 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('join_affiliate_title')}</h1>
        <p className="text-gray-500 text-lg mb-3">{t('join_affiliate_subtitle')} <span className="font-semibold text-purple-700">{t('join_affiliate_commission')}</span> {t('join_affiliate_subtitle2')}</p>
        <ul className="text-left max-w-sm mx-auto mb-8 space-y-2 text-gray-600 text-sm">
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Share your unique code with anyone</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Earn once per referred user</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Withdraw via Stripe, debit or prepaid card</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Real-time dashboard to track referrals</li>
        </ul>
        <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8" onClick={handleRegister} disabled={registering}>
          {registering ? t('creating_account') : t('activate_affiliate')}
        </Button>

        {/* Enter someone else's code section */}
        <div className="mt-12 border-t border-gray-100 pt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('have_referral_code')}</h2>
          <p className="text-gray-500 text-sm mb-4">{t('have_referral_code_desc')}</p>
          <AffiliateApplyCode userEmail={user.email} />
        </div>
      </div>
    );
  }

  const pending = affiliate.pending_commission || 0;
  const earned = affiliate.total_commission_earned || 0;
  const withdrawn = affiliate.total_withdrawn || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="w-7 h-7 text-purple-600" /> {t('affiliate_dashboard')}
          </h1>
          <p className="text-gray-500 mt-1">{t('affiliate_dashboard_desc')}</p>
        </div>
        <Badge className={`text-sm px-3 py-1 ${affiliate.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {affiliate.status === 'active' ? t('active') : t('suspended')}
        </Badge>
      </div>

      {/* Affiliate Code Card */}
      <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-purple-700 mb-2">{t('your_affiliate_code')}</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-bold tracking-widest text-purple-900 font-mono">{affiliate.affiliate_code}</span>
            <Button variant="outline" size="sm" onClick={copyCode} className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
              {copiedCode ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copiedCode ? t('copied') : t('copy')}
            </Button>
          </div>
          <p className="text-xs text-purple-600 mt-2">{t('affiliate_code_desc')}</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('total_referrals'), value: affiliate.total_referrals || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: t('total_earned'), value: `$${earned.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: t('available_balance'), value: `$${pending.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: t('total_withdrawn'), value: `$${withdrawn.toFixed(2)}`, icon: Banknote, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map((stat) => (
          <Card key={stat.label} className="border border-gray-200">
            <CardContent className="p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdraw button */}
      {pending > 0 && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="font-semibold text-green-800">{t('withdraw_available', { amount: pending.toFixed(2) })}</p>
            <p className="text-sm text-green-600">{t('withdraw_methods')}</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700 text-white gap-2" onClick={() => setShowWithdraw(true)}>
            <CreditCard className="w-4 h-4" /> {t('withdraw')}
          </Button>
        </div>
      )}

      {/* Referrals Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" /> {t('my_referrals')} ({referrals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReferrals ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('no_referrals_yet')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {referrals.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.referred_user_name}</p>
                    <p className="text-xs text-gray-500 capitalize">{r.referred_user_role} · {new Date(r.created_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {r.commission_amount > 0 ? `$${r.commission_amount.toFixed(2)}` : t('pending_booking')}
                    </p>
                    <CommissionBadge status={r.commission_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      {withdrawals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" /> {t('withdrawal_history')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {withdrawals.map(w => (
                <div key={w.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">${w.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 capitalize">{w.method.replace('_', ' ')} · {new Date(w.created_date).toLocaleDateString()}</p>
                  </div>
                  <Badge className={w.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {w.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enter someone else's code */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">{t('enter_referral_code')}</h2>
        <AffiliateApplyCode userEmail={user.email} />
      </div>

      <AffiliateWithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        balance={pending}
        affiliateId={affiliate.id}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['my-affiliate'] });
          queryClient.invalidateQueries({ queryKey: ['my-withdrawals'] });
          refetchAffiliate();
        }}
      />
    </div>
  );
}

function CommissionBadge({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-700',
    earned: 'bg-green-100 text-green-700',
    paid: 'bg-gray-100 text-gray-600',
  };
  return <Badge className={`text-xs ${map[status] || 'bg-gray-100 text-gray-500'}`}>{status}</Badge>;
}