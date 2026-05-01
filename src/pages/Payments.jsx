import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CreditCard, Wallet, ArrowDownCircle, TrendingUp, ExternalLink,
  Loader2, AlertCircle, RefreshCw, CheckCircle2, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import FinanceSummaryCards from '@/components/payments/FinanceSummaryCards';
import TransactionList from '@/components/payments/TransactionList';
import PayoutRequestModal from '@/components/payments/PayoutRequestModal';
import MonthlyReportDownload from '@/components/reports/MonthlyReportDownload';
import { useUserProfile } from '@/lib/useUserProfile';
import { COUNTRY_SETTINGS } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';

const STATUS_STYLE = {
  pending_approval: 'bg-gray-100 text-gray-600',
  accepted:         'bg-blue-100 text-blue-700',
  paid_confirmed:   'bg-purple-100 text-purple-700',
  in_progress:      'bg-yellow-100 text-yellow-700',
  completed:        'bg-amber-100 text-amber-700',
  payment_released: 'bg-green-100 text-green-700',
  disputed:         'bg-red-100 text-red-700',
  cancelled:        'bg-gray-100 text-gray-400',
};

export default function Payments() {
  const { t } = useI18n();
  const { user, profile } = useUserProfile();
  const [providerProfile, setProviderProfile] = useState(null);
  const [finance, setFinance] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(true);
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [payoutBooking, setPayoutBooking] = useState(null);
  const queryClient = useQueryClient();

  const country = profile?.country || 'brazil';
  const symbol = COUNTRY_SETTINGS[country]?.symbol || '$';
  const isProvider = profile?.role === 'provider' || profile?.role === 'both' || !!providerProfile;

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) setProviderProfile(list[0]);
    });
  }, [user]);

  const loadFinance = useCallback(async () => {
    if (!user) return;
    setFinanceLoading(true);
    const res = await base44.functions.invoke('getFinanceSummary', { role: isProvider ? 'provider' : 'client' });
    setFinance(res.data);
    setFinanceLoading(false);
  }, [user, isProvider]);

  useEffect(() => { loadFinance(); }, [loadFinance]);

  // Check for Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const bookingId = params.get('booking_id');
    if (paymentStatus === 'success' && bookingId) {
      toast.success(t('payment_successful'), { duration: 5000 });
      window.history.replaceState({}, '', '/payments');
      setTimeout(loadFinance, 2000);
    } else if (paymentStatus === 'cancelled') {
      toast.info(t('payment_cancelled'));
      window.history.replaceState({}, '', '/payments');
    }
  }, []);

  const { data: clientBookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ['paymentsClientBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_email: user.email }, '-created_date'),
    enabled: !!user?.email && !isProvider,
  });

  const { data: providerBookings = [], isLoading: loadingProviderBookings } = useQuery({
    queryKey: ['paymentsProviderBookings', providerProfile?.id],
    queryFn: () => base44.entities.Booking.filter({ provider_id: providerProfile.id }, '-created_date'),
    enabled: !!providerProfile?.id,
  });

  const handlePay = async (booking) => {
    // Block if running in iframe (preview mode)
    if (window.self !== window.top) {
      toast.error('Checkout only works from the published app. Please open the app directly.', { duration: 6000 });
      return;
    }
    setPayingBookingId(booking.id);
    const res = await base44.functions.invoke('createCheckoutSession', {
      booking_id: booking.id,
      amount: booking.total_amount,
      currency: COUNTRY_SETTINGS[booking.country]?.currency?.toLowerCase() || 'usd',
      provider_name: booking.provider_name,
      provider_id: booking.provider_id,
      provider_email: booking.provider_email,
      description: `${booking.category} service — ${booking.booking_type} booking`,
      platform_fee: booking.platform_fee,
      provider_payout: booking.provider_payout,
    });
    setPayingBookingId(null);
    if (res.data?.url) {
      window.location.href = res.data.url;
    } else {
      toast.error(res.data?.error || 'Failed to start checkout');
    }
  };

  const earningsBookings = (providerBookings || []).filter(b => b.payment_status === 'released');

  const payableBookings = clientBookings.filter(b => b.status === 'accepted' && b.payment_status === 'unpaid');
  const escrowBookings = clientBookings.filter(b => b.payment_status === 'paid_held');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" /> {t('payments_finance')}
          </h1>
          <p className="text-gray-500 mt-1">{t('track_income')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-400">{t('powered_by')}</span>
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
          </div>
          <Button variant="outline" size="sm" onClick={loadFinance} className="gap-2">
            <RefreshCw className="w-4 h-4" /> {t('refresh')}
          </Button>
        </div>
      </div>

      {/* Finance Summary */}
      {financeLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : finance?.summary ? (
        <div className="mb-6">
          <FinanceSummaryCards summary={finance.summary} role={isProvider ? 'provider' : 'client'} symbol={symbol} />
        </div>
      ) : null}

      <Tabs defaultValue={isProvider ? 'earnings' : 'pay'}>
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          {!isProvider && (
            <>
              <TabsTrigger value="pay" className="gap-1.5">
                <CreditCard className="w-3.5 h-3.5" /> {t('pay_for_service')}
                {payableBookings.length > 0 && (
                  <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5">{payableBookings.length}</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="escrow" className="gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {t('in_escrow')}
              </TabsTrigger>
            </>
          )}
          {isProvider && (
            <>
              <TabsTrigger value="earnings" className="gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> {t('completed_earnings')}
              </TabsTrigger>
              <TabsTrigger value="payout" className="gap-1.5">
                <ArrowDownCircle className="w-3.5 h-3.5" /> {t('request_payout')}
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="history" className="gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> {t('all_transactions')}
          </TabsTrigger>
        </TabsList>

        {/* CLIENT — Pay for service */}
        {!isProvider && (
          <TabsContent value="pay">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-800">{t('ready_to_pay')}</CardTitle>
                <p className="text-sm text-gray-500">{t('accepted_bookings')}</p>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="space-y-3">{Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                ) : payableBookings.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('no_pending_payments')}</p>
                  </div>
                ) : payableBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{b.provider_name}</p>
                      <p className="text-sm text-gray-500">{b.category} · {b.start_date} · {b.booking_type}</p>
                      <Badge className={`text-xs mt-1 border-0 ${STATUS_STYLE[b.status]}`}>{b.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-700">{symbol}{b.total_amount?.toFixed(2)}</p>
                      <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700 gap-1.5"
                        onClick={() => handlePay(b)} disabled={payingBookingId === b.id}>
                        {payingBookingId === b.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                         {t('pay_with_stripe')}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* CLIENT — Escrow view */}
        {!isProvider && (
          <TabsContent value="escrow">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" /> {t('funds_in_escrow')}
                </CardTitle>
                <p className="text-sm text-gray-500">{t('funds_held_securely')}</p>
              </CardHeader>
              <CardContent>
                {escrowBookings.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('no_funds_in_escrow')}</p>
                  </div>
                ) : escrowBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{b.provider_name}</p>
                      <p className="text-sm text-gray-500">{b.start_date} · {b.booking_type}</p>
                      <Badge className="text-xs mt-1 bg-amber-100 text-amber-700 border-0">{t('in_escrow_protected')}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-amber-700">{symbol}{b.total_amount?.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">{t('held_until_complete')}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* PROVIDER — Earnings */}
        {isProvider && (
          <TabsContent value="earnings">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-800">{t('completed_earnings')}</CardTitle>
                <p className="text-sm text-gray-500">{t('earnings_from_escrow')}</p>
              </CardHeader>
              <CardContent>
                {loadingProviderBookings ? (
                  <div className="space-y-3">{Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                ) : earningsBookings.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('no_released_earnings')}</p>
                  </div>
                ) : earningsBookings.map(b => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-xl border border-green-100 bg-green-50 mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{b.client_name}</p>
                      <p className="text-sm text-gray-500">{b.category} · {b.start_date}</p>
                      <Badge className="text-xs mt-1 bg-green-100 text-green-700 border-0">{t('released')}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-700">{symbol}{b.provider_payout?.toFixed(2)}</p>
                      <Button size="sm" variant="outline" className="mt-2 gap-1 border-green-300 text-green-700"
                        onClick={() => setPayoutBooking(b)}>
                        <ArrowDownCircle className="w-3.5 h-3.5" /> {t('request_payout')}
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* PROVIDER — Request Payout */}
        {isProvider && (
          <TabsContent value="payout">
            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-gray-800">{t('payout_history')}</CardTitle>
                <p className="text-sm text-gray-500">{t('earnings_sent')}</p>
              </CardHeader>
              <CardContent>
                {!finance?.payouts || finance.payouts.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <ArrowDownCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">{t('no_payouts_requested')}</p>
                    <p className="text-xs mt-1">{t('go_to_earnings_tab')}</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {finance.payouts.map(p => (
                      <div key={p.id} className="flex items-center gap-4 py-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 capitalize">{p.card_brand} •••• {p.card_last4}</p>
                          <p className="text-xs text-gray-400">{p.created_date && format(new Date(p.created_date), 'MMM d, yyyy')}</p>
                        </div>
                        <p className="font-bold text-green-600">{symbol}{p.amount?.toFixed(2)}</p>
                        <Badge className={`text-xs border-0 ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {p.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* All Transactions */}
        <TabsContent value="history" className="space-y-6">
          <MonthlyReportDownload userRole={isProvider ? 'provider' : 'client'} />
          <Card className="border border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-gray-800">{t('transaction_history')}</CardTitle>
              <p className="text-sm text-gray-500">{t('complete_record')}</p>
            </CardHeader>
            <CardContent>
              {financeLoading ? (
                <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
              ) : (
                <TransactionList transactions={finance?.transactions || []} symbol={symbol} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout modal */}
      {payoutBooking && (
        <PayoutRequestModal
          open={!!payoutBooking}
          onClose={() => setPayoutBooking(null)}
          booking={payoutBooking}
          onSuccess={loadFinance}
        />
      )}
    </div>
  );
}