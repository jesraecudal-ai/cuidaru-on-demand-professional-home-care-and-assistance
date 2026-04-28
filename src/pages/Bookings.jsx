import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingCard from '../components/booking/BookingCard';
import ReviewForm from '../components/reviews/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Briefcase, AlertTriangle } from 'lucide-react';
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

  const { data: existingReviews = [] } = useQuery({
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
        toast.success('Booking accepted! Waiting for client payment.');
        break;
      case 'pay':
        // Simulate payment — in production connect real payment
        const releaseAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'paid_confirmed', payment_status: 'paid_held' } });
        toast.success('Payment held in escrow. Provider has been notified!');
        break;
      case 'in_progress':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'in_progress' } });
        toast.success('Job started!');
        break;
      case 'completed': {
        const autoRelease = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'completed', payment_status: 'release_pending', auto_release_at: autoRelease } });
        toast.success('Marked as complete. Payment auto-releases in 24h if no dispute.');
        break;
      }
      case 'release':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'payment_released', payment_status: 'released' } });
        toast.success('Payment released to provider!');
        if (!existingReviews.some(r => r.booking_id === bookingId)) {
          setReviewBooking(booking);
        }
        break;
      case 'dispute':
        setDisputeState({ bookingId, booking });
        break;
      case 'cancelled':
        await updateMutation.mutateAsync({ id: bookingId, data: { status: 'cancelled' } });
        toast.info('Booking cancelled.');
        break;
    }
  };

  const handleDispute = async () => {
    await updateMutation.mutateAsync({
      id: disputeState.bookingId,
      data: { status: 'disputed', payment_status: 'disputed', dispute_reason: disputeReason, disputed_by: user?.email }
    });
    toast.warning('Dispute filed. Admin will review and resolve within 48 hours.');
    setDisputeState(null);
    setDisputeReason('');
  };

  const completedUnreviewed = clientBookings.filter(
    b => b.status === 'payment_released' && !existingReviews.some(r => r.booking_id === b.id)
  );

  const isProvider = !!providerProfile;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('my_bookings')}</h1>

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
                  <ReviewForm key={b.id} bookingId={b.id} providerId={b.provider_id} reviewerName={user?.full_name}
                    onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['myReviews'] })} />
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
                {providerBookings.map(b => <BookingCard key={b.id} booking={b} isProvider onAction={handleAction} />)}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Leave review dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>How was the service?</DialogTitle></DialogHeader>
          {reviewBooking && (
            <ReviewForm bookingId={reviewBooking.id} providerId={reviewBooking.provider_id}
              reviewerName={user?.full_name}
              onSubmitted={() => { setReviewBooking(null); queryClient.invalidateQueries({ queryKey: ['myReviews'] }); }} />
          )}
        </DialogContent>
      </Dialog>

      {/* Dispute dialog */}
      <Dialog open={!!disputeState} onOpenChange={() => setDisputeState(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="w-5 h-5" /> File a Dispute
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">Explain what went wrong. Admin will review and resolve within 48 hours.</p>
          <Textarea placeholder="Describe the issue..." value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={4} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDisputeState(null)}>Cancel</Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleDispute} disabled={!disputeReason.trim()}>
              Submit Dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}