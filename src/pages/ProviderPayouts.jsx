import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, Clock, ArrowDownCircle, Wallet,
  CreditCard, CheckCircle2, Loader2, RefreshCw, ShieldCheck, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { useUserProfile } from '@/lib/useUserProfile';
import { COUNTRY_SETTINGS } from '@/lib/constants';
import PayoutRequestModal from '@/components/payments/PayoutRequestModal';

export default function ProviderPayouts() {
  const { user, profile } = useUserProfile();
  const [providerProfile, setProviderProfile] = useState(null);
  const [finance, setFinance] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [payoutBooking, setPayoutBooking] = useState(null);
  const [withdrawingAll, setWithdrawingAll] = useState(false);
  const queryClient = useQueryClient();

  const country = profile?.country || 'brazil';
  const symbol = COUNTRY_SETTINGS[country]?.symbol || '$';

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) setProviderProfile(list[0]);
    });
  }, [user]);

  const loadFinance = useCallback(async () => {
    if (!user) return;
    setFinanceLoading(true);
    const res = await base44.functions.invoke('getFinanceSummary', { role: 'provider' });
    setFinance(res.data);
    setFinanceLoading(false);
  }, [user]);

  useEffect(() => { loadFinance(); }, [loadFinance]);

  const { data: providerBookings = [], isLoading: loadingBookings, refetch: refetchBookings } = useQuery({
    queryKey: ['providerPayoutBookings', providerProfile?.id],
    queryFn: () => base44.entities.Booking.filter({ provider_id: providerProfile.id }, '-created_date'),
    enabled: !!providerProfile?.id,
  });

  // Jobs with payment released — ready for payout withdrawal
  const readyToPayout = providerBookings.filter(
    b => b.payment_status === 'released' && b.status === 'payment_released'
  );

  // Jobs in escrow — awaiting client to release
  const inEscrow = providerBookings.filter(b => b.payment_status === 'paid_held');

  // Jobs completed but waiting for auto-release
  const pendingRelease = providerBookings.filter(b => b.payment_status === 'release_pending');

  // Total available to withdraw (not yet paid out)
  const alreadyPaidOut = new Set((finance?.payouts || []).map(p => p.booking_id));
  const withdrawableBookings = readyToPayout.filter(b => !alreadyPaidOut.has(b.id));
  const totalWithdrawable = withdrawableBookings.reduce((sum, b) => sum + (b.provider_payout || 0), 0);
  const totalEscrow = inEscrow.reduce((sum, b) => sum + (b.provider_payout || 0), 0);
  const totalPendingRelease = pendingRelease.reduce((sum, b) => sum + (b.provider_payout || 0), 0);

  const handleWithdrawAll = async () => {
    if (withdrawableBookings.length === 0) return;
    setWithdrawingAll(true);

    // Fetch provider's saved default card
    let defaultCard = null;
    if (user) {
      const cards = await base44.entities.SavedPaymentMethod.filter({ user_email: user.email, user_role: 'provider' });
      defaultCard = cards.find(c => c.is_default) || cards[0] || null;
    }

    if (!defaultCard) {
      setWithdrawingAll(false);
      // Fall back to modal for the first booking so provider can enter card details
      setPayoutBooking(withdrawableBookings[0]);
      toast.info('No saved card found. Please enter your card details to withdraw.');
      return;
    }

    let successCount = 0;
    for (const booking of withdrawableBookings) {
      const res = await base44.functions.invoke('requestPayout', {
        booking_id: booking.id,
        provider_id: booking.provider_id,
        amount: booking.provider_payout,
        currency: COUNTRY_SETTINGS[country]?.currency?.toLowerCase() || 'usd',
        card_last4: defaultCard.card_last4,
        card_brand: defaultCard.card_brand,
        payout_method: defaultCard.card_type === 'prepaid' ? 'prepaid_card' : 'debit_card',
      });
      if (res.data?.success) successCount++;
    }
    setWithdrawingAll(false);
    if (successCount > 0) {
      toast.success(`${successCount} payout(s) of ${symbol}${totalWithdrawable.toFixed(2)} sent to ${defaultCard.card_brand} •••• ${defaultCard.card_last4}!`);
      loadFinance();
      refetchBookings();
    } else {
      toast.error('Payout request failed. Please try again.');
    }
  };

  const isNotProvider = !financeLoading && providerProfile === null && !loadingBookings;

  if (isNotProvider) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Provider Payouts</h2>
        <p className="text-gray-400 text-sm">You need a provider profile to access this section.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-green-600" /> My Payouts
          </h1>
          <p className="text-gray-500 mt-1 text-sm">Track earnings and withdraw your funds</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { loadFinance(); refetchBookings(); }} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {financeLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">Available to Withdraw</p>
              <p className="text-2xl font-bold text-green-600">{symbol}{totalWithdrawable.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{withdrawableBookings.length} job(s)</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">In Escrow</p>
              <p className="text-2xl font-bold text-amber-500">{symbol}{totalEscrow.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{inEscrow.length} job(s)</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">Pending Release</p>
              <p className="text-2xl font-bold text-blue-500">{symbol}{totalPendingRelease.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">{pendingRelease.length} job(s)</p>
            </CardContent>
          </Card>
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 mb-1">Total Paid Out</p>
              <p className="text-2xl font-bold text-gray-700">
                {symbol}{(finance?.payouts || []).filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 mt-1">{(finance?.payouts || []).length} payout(s)</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Withdraw All banner */}
      {totalWithdrawable > 0 && (
        <Card className="mb-6 border-2 border-green-300 bg-green-50">
          <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-semibold text-green-800 text-lg">
                {symbol}{totalWithdrawable.toFixed(2)} ready to withdraw
              </p>
              <p className="text-sm text-green-700 mt-0.5">
                From {withdrawableBookings.length} completed job(s) — escrow period over
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6"
              onClick={handleWithdrawAll}
              disabled={withdrawingAll}
            >
              {withdrawingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownCircle className="w-4 h-4" />}
              Withdraw All Funds
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="ready">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="ready" className="gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready to Withdraw
            {withdrawableBookings.length > 0 && (
              <span className="ml-1 bg-green-600 text-white text-xs rounded-full px-1.5">{withdrawableBookings.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="escrow" className="gap-1.5">
            <Lock className="w-3.5 h-3.5" /> In Escrow
            {(inEscrow.length + pendingRelease.length) > 0 && (
              <span className="ml-1 bg-amber-500 text-white text-xs rounded-full px-1.5">{inEscrow.length + pendingRelease.length}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Payout History
          </TabsTrigger>
        </TabsList>

        {/* Ready to Withdraw */}
        <TabsContent value="ready">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" /> Completed Jobs — Funds Available
              </CardTitle>
              <p className="text-sm text-gray-500">These jobs are done and funds have been released from escrow.</p>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
              ) : withdrawableBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-gray-500">No funds ready to withdraw</p>
                  <p className="text-sm mt-1">Completed jobs will appear here once the client releases payment.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {withdrawableBookings.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-green-100 bg-green-50">
                      <div>
                        <p className="font-semibold text-gray-900">{b.client_name}</p>
                        <p className="text-sm text-gray-500">{b.category} · {b.start_date} · {b.booking_type}</p>
                        <Badge className="text-xs mt-1 bg-green-100 text-green-700 border-0">Payment Released ✓</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">{symbol}{b.provider_payout?.toFixed(2)}</p>
                        <Button
                          size="sm" variant="outline"
                          className="mt-2 gap-1 border-green-300 text-green-700 hover:bg-green-100"
                          onClick={() => setPayoutBooking(b)}
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" /> Withdraw
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* In Escrow */}
        <TabsContent value="escrow">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" /> Funds Held in Escrow
              </CardTitle>
              <p className="text-sm text-gray-500">These payments are secured but not yet released. They'll become available after the client confirms the job is complete.</p>
            </CardHeader>
            <CardContent>
              {(inEscrow.length + pendingRelease.length) === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Lock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-gray-500">No funds in escrow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[...inEscrow, ...pendingRelease].map(b => {
                    const isPendingRelease = b.payment_status === 'release_pending';
                    const autoReleaseDate = b.auto_release_at ? new Date(b.auto_release_at) : null;
                    return (
                      <div key={b.id} className={`flex items-center justify-between p-4 rounded-xl border ${isPendingRelease ? 'border-blue-100 bg-blue-50' : 'border-amber-100 bg-amber-50'}`}>
                        <div>
                          <p className="font-semibold text-gray-900">{b.client_name}</p>
                          <p className="text-sm text-gray-500">{b.category} · {b.start_date} · {b.booking_type}</p>
                          {isPendingRelease ? (
                            <Badge className="text-xs mt-1 bg-blue-100 text-blue-700 border-0">
                              {autoReleaseDate
                                ? `Auto-releases ${formatDistanceToNow(autoReleaseDate, { addSuffix: true })}`
                                : 'Pending Release'}
                            </Badge>
                          ) : (
                            <Badge className="text-xs mt-1 bg-amber-100 text-amber-700 border-0">
                              In Escrow — Awaiting Job Completion
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${isPendingRelease ? 'text-blue-700' : 'text-amber-700'}`}>
                            {symbol}{b.provider_payout?.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 justify-end">
                            <ShieldCheck className="w-3 h-3" /> Secured
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payout History */}
        <TabsContent value="history">
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-800">Payout History</CardTitle>
              <p className="text-sm text-gray-500">All withdrawals sent to your card.</p>
            </CardHeader>
            <CardContent>
              {financeLoading ? (
                <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}</div>
              ) : !finance?.payouts || finance.payouts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ArrowDownCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-gray-500">No payouts yet</p>
                  <p className="text-sm mt-1">Your withdrawal history will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {finance.payouts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 py-4">
                      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">{p.card_brand} •••• {p.card_last4}</p>
                        <p className="text-xs text-gray-400">{p.created_date && format(new Date(p.created_date), 'MMM d, yyyy · h:mm a')}</p>
                      </div>
                      <p className="font-bold text-green-600 text-lg">{symbol}{p.amount?.toFixed(2)}</p>
                      <Badge className={`text-xs border-0 flex-shrink-0 ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {p.status === 'paid' ? '✓ Paid' : p.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Individual payout modal */}
      {payoutBooking && (
        <PayoutRequestModal
          open={!!payoutBooking}
          onClose={() => setPayoutBooking(null)}
          booking={payoutBooking}
          onSuccess={() => { loadFinance(); refetchBookings(); }}
        />
      )}
    </div>
  );
}