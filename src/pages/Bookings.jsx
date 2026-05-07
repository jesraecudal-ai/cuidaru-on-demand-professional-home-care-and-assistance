import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingCard from '../components/booking/BookingCard';
import ReviewForm from '../components/reviews/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Briefcase, AlertTriangle, ShieldAlert, ClipboardList } from 'lucide-react';
import JobOrdersTab from '../components/jobs/JobOrdersTab';
import PostJobModal from '../components/jobs/PostJobModal';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { useUserProfile } from '@/lib/useUserProfile';


export default function Bookings() {
  const { t } = useI18n();
  const { user, profile } = useUserProfile();
  const [providerProfile, setProviderProfile] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [disputeState, setDisputeState] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showPostJob, setShowPostJob] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    base44.entities.ServiceProvider.filter({ user_email: user.email }).then(list => {
      if (list.length > 0) setProviderProfile(list[0]);
    });
  }, [user]);

  const { data: clientBookings = [], isLoading: loadingClient } = useQuery({
    queryKey: ['clientBookings', user?.email],
    queryFn: () => base44.entities.Booking.filter({ client_email: user.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: providerBookings = [], isLoading: loadingProvider } = useQuery({
    queryKey: ['providerBookings', providerProfile?.id],
    queryFn: () => base44.entities.Booking.filter({ provider_id: providerProfile.id }, '-created_date'),
    enabled: !!providerProfile?.id,
  });

  const { data: myDisputes = [] } = useQuery({
    queryKey: ['myDisputes', user?.email],
    queryFn: () => base44.entities.Dispute.list('-created_date'),
    enabled: !!user?.email,
    select: (all) => all.filter(d => d.client_email === user.email || d.provider_email === user.email),
  });

  const { data: existingReviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ['myReviews', user?.email],
    queryFn: () => base44.entities.Review.filter({ reviewer_email: user.email }),
    enabled: !!user?.email,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Booking.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientBookings'] });
      queryClient.invalidateQueries({ queryKey: ['providerBookings'] });
    },
  });

  const handleAction = async (bookingId, action, booking) => {
    switch (action) {
      case 'accepted':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'accepted' } });
        toast.success(t('booking_accepted_toast'));
        break;
      case 'pay': {
        // Check if running inside iframe (Base44 preview) — Stripe checkout won't work there
        if (window.self !== window.top) {
          toast.error('Checkout only works from the published app, not the preview.');
          break;
        }
        toast.loading('Redirecting to payment...', { id: 'pay-toast' });
        const checkoutRes = await base44.functions.invoke('createCheckoutSession', {
          booking_id: bookingId,
          amount: booking.total_amount,
          currency: booking.country ? (booking.country === 'brazil' ? 'brl' : booking.country === 'uruguay' ? 'uyu' : 'usd') : 'usd',
          provider_name: booking.provider_name,
          provider_id: booking.provider_id,
          provider_email: booking.provider_email,
          description: `${booking.category} service booking`,
          platform_fee_pct: booking.platform_fee_pct ?? 10,
        });
        toast.dismiss('pay-toast');
        if (checkoutRes.data?.url) {
          window.location.href = checkoutRes.data.url;
        } else {
          toast.error(checkoutRes.data?.error || 'Failed to create checkout session');
        }
        break;
      }
      case 'in_progress':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'in_progress' } });
        toast.success(t('job_started_toast'));
        break;
      case 'completed': {
        const autoRelease = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'completed', payment_status: 'release_pending', auto_release_at: autoRelease } });
        toast.success(t('marked_complete_toast'));
        break;
      }
      case 'release': {
        const releaseRes = await base44.functions.invoke('releasePayment', { booking_id: bookingId });
        if (releaseRes.data?.success) {
          toast.success(t('payment_released_toast'));
          queryClient.invalidateQueries({ queryKey: ['clientBookings'] });
          queryClient.invalidateQueries({ queryKey: ['providerBookings'] });
          if (!existingReviews.some(r => r.booking_id === bookingId)) {
            setReviewBooking(booking);
          }
        } else {
          toast.error(releaseRes.data?.error || 'Failed to release payment');
        }
        break;
      }
      case 'dispute':
        setDisputeState({ bookingId, booking });
        break;
      case 'cancelled':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'cancelled' } });
        toast.info(t('booking_cancelled_toast'));
        break;
    }
  };

  const handleDispute = async () => {
    const booking = disputeState.booking;
    const isProvider = !!providerProfile && booking.provider_id === providerProfile.id;

    await updateMutation.mutateAsync({
      id: disputeState.bookingId,
      data: { status: 'disputed', payment_status: 'disputed', dispute_reason: disputeReason, disputed_by: user?.email }
    });

    // Create a Dispute entity record for admin management
    await base44.entities.Dispute.create({
      booking_id: disputeState.bookingId,
      client_email: booking.client_email,
      client_name: booking.client_name,
      provider_id: booking.provider_id,
      provider_email: booking.provider_email,
      provider_name: booking.provider_name,
      filed_by_email: user.email,
      filed_by_name: user.full_name,
      filed_by_role: isProvider ? 'provider' : 'client',
      reason: disputeReason,
      status: 'open',
    });

    toast.warning(t('dispute_filed_toast'));
    setDisputeState(null);
    setDisputeReason('');
  };

  // Reviews already left by current user (as client or provider)
  const reviewedBookingIds = new Set(existingReviews.map(r => r.booking_id));

  // Client: completed jobs not yet reviewed by client
  const completedUnreviewed = clientBookings.filter(
    b => b.status === 'payment_released' && !reviewedBookingIds.has(b.id)
  );

  // Provider: completed jobs not yet reviewed by provider
  const providerUnreviewed = providerBookings.filter(
    b => b.status === 'payment_released' && !reviewedBookingIds.has(b.id)
  );

  const isProvider = !!providerProfile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('my_bookings')}</h1>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={() => setShowPostJob(true)}>
          <ClipboardList className="w-4 h-4" /> {t('post_a_job')}
        </Button>
      </div>

      <Tabs defaultValue={profile?.role === 'provider' ? 'provider' : 'client'}>
        <TabsList className="mb-6">
          <TabsTrigger value="client" className="gap-2">
            <Calendar className="w-4 h-4" /> {t('as_client')}
          </TabsTrigger>
          {isProvider && (
            <TabsTrigger value="provider" className="gap-2">
              <Briefcase className="w-4 h-4" /> {t('as_provider')}
            </TabsTrigger>
          )}
          {isProvider && (
            <TabsTrigger value="job_orders" className="gap-2">
              <ClipboardList className="w-4 h-4" /> {t('job_board')}
            </TabsTrigger>
          )}
          {myDisputes.length > 0 && (
            <TabsTrigger value="disputes" className="gap-2 text-orange-600">
              <ShieldAlert className="w-4 h-4" /> {t('disputes')} {myDisputes.filter(d => d.status === 'open' || d.status === 'under_review').length > 0 && `(${myDisputes.filter(d => d.status === 'open' || d.status === 'under_review').length})`}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="client">
          {loadingClient ? (
            <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          ) : clientBookings.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700">{t('no_bookings')}</h3>
              <p className="text-gray-400">{t('no_bookings_sub')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientBookings.map(b => <BookingCard key={b.id} booking={b} isProvider={false} onAction={handleAction} />)}
            </div>
          )}
          {completedUnreviewed.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">{t('pending_reviews')}</h3>
              <div className="space-y-4">
                {completedUnreviewed.map(b => (
                  <ReviewForm
                    key={b.id}
                    bookingId={b.id}
                    providerId={b.provider_id}
                    reviewerName={user?.full_name}
                    reviewerRole="client"
                    revieweeEmail={b.provider_email}
                    revieweeName={b.provider_name}
                    onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['myReviews'] })}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {isProvider && (
          <TabsContent value="provider">
            {loadingProvider ? (
              <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : providerBookings.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-700">{t('no_requests')}</h3>
                <p className="text-gray-400">{t('no_requests_sub')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {providerBookings.map(b => {
                  // Block accepting only if there's an unreviewed completed booking with THIS specific client
                  const pendingWithClient = providerUnreviewed.some(u => u.client_email === b.client_email);
                  return <BookingCard key={b.id} booking={b} isProvider onAction={handleAction} hasPendingReview={pendingWithClient} />;
                })}
              </div>
            )}
            {providerUnreviewed.length > 0 && (
              <div className="mt-8">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">{t('rate_your_clients')}</h3>
                <div className="space-y-4">
                  {providerUnreviewed.map(b => (
                    <ReviewForm
                      key={b.id}
                      bookingId={b.id}
                      providerId={providerProfile?.id}
                      reviewerName={user?.full_name}
                      reviewerRole="provider"
                      revieweeEmail={b.client_email}
                      revieweeName={b.client_name}
                      onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['myReviews'] })}
                    />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        )}

        {isProvider && (
          <TabsContent value="job_orders">
            <JobOrdersTab user={user} providerProfile={providerProfile} />
          </TabsContent>
        )}

        {myDisputes.length > 0 && (
          <TabsContent value="disputes">
            <div className="space-y-4">
              {myDisputes.map(d => {
                const statusColors = { open: 'bg-red-100 text-red-700', under_review: 'bg-amber-100 text-amber-700', resolved_client: 'bg-blue-100 text-blue-700', resolved_provider: 'bg-green-100 text-green-700', resolved_split: 'bg-purple-100 text-purple-700', closed: 'bg-gray-100 text-gray-600' };
                return (
                  <div key={d.id} className="bg-white rounded-xl border border-orange-100 p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-2 font-semibold text-gray-800 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500" /> {t('booking_hash')}{d.booking_id?.slice(-6)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[d.status] || 'bg-gray-100 text-gray-600'}`}>{d.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600"><span className="font-medium">{t('your_reason')}:</span> {d.reason}</p>
                    {d.resolution_details && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-700 mb-1">{t('admin_resolution')}</p>
                        <p className="text-sm text-gray-700">{d.resolution_details}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Leave review dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>How was the service?</DialogTitle></DialogHeader>
          {reviewBooking && (
            <ReviewForm
              bookingId={reviewBooking.id}
              providerId={reviewBooking.provider_id}
              reviewerName={user?.full_name}
              reviewerRole="client"
              revieweeEmail={reviewBooking.provider_email}
              revieweeName={reviewBooking.provider_name}
              onSubmitted={() => { setReviewBooking(null); queryClient.invalidateQueries({ queryKey: ['myReviews'] }); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Post Job Modal */}
      {showPostJob && (
        <PostJobModal
          user={user}
          userProfile={profile}
          onClose={() => setShowPostJob(false)}
          onSuccess={() => setShowPostJob(false)}
        />
      )}

      {/* Dispute dialog */}
      <Dialog open={!!disputeState} onOpenChange={() => setDisputeState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="w-5 h-5" /> {t('file_dispute')}

            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">{t('file_dispute_desc')}</p>
          <Textarea placeholder={t('describe_issue')} value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDisputeState(null)}>{t('cancel')}</Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleDispute} disabled={!disputeReason.trim()}>
              {t('submit_dispute')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}