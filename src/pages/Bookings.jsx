import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookingCard from '../components/booking/BookingCard';
import ReviewForm from '../components/reviews/ReviewForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useI18n } from '@/lib/i18n';

export default function Bookings() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [providerProfile, setProviderProfile] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const init = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const providers = await base44.entities.ServiceProvider.filter({ user_email: me.email });
      if (providers.length > 0) setProviderProfile(providers[0]);
    };
    init();
  }, []);

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
      toast.success('Updated!');
    },
  });

  const handleAction = (bookingId, action) => {
    if (action === 'release') {
      updateMutation.mutate({ id: bookingId, data: { payment_status: 'released' } });
      const booking = clientBookings.find((b) => b.id === bookingId);
      if (booking && !existingReviews.some((r) => r.booking_id === bookingId)) {
        setReviewBooking(booking);
      }
    } else {
      updateMutation.mutate({ id: bookingId, data: { status: action } });
    }
  };

  const completedUnreviewed = clientBookings.filter(
    (b) => b.status === 'completed' && b.payment_status === 'released' && !existingReviews.some((r) => r.booking_id === b.id)
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-display font-bold mb-6">{t('my_bookings')}</h1>

      <Tabs defaultValue="client">
        <TabsList className="mb-6">
          <TabsTrigger value="client" className="gap-2">
            <Calendar className="w-4 h-4" /> {t('as_client')}
          </TabsTrigger>
          {providerProfile && (
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
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold">{t('no_bookings')}</h3>
              <p className="text-muted-foreground">{t('no_bookings_sub')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clientBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isProvider={false} onAction={handleAction} />
              ))}
            </div>
          )}
          {completedUnreviewed.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="font-semibold text-lg">{t('pending_reviews')}</h3>
              {completedUnreviewed.map((booking) => (
                <ReviewForm key={booking.id} bookingId={booking.id} providerId={booking.provider_id} reviewerName={user?.full_name} onSubmitted={() => queryClient.invalidateQueries({ queryKey: ['myReviews'] })} />
              ))}
            </div>
          )}
        </TabsContent>

        {providerProfile && (
          <TabsContent value="provider">
            {loadingProvider ? (
              <div className="space-y-4">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : providerBookings.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-semibold">{t('no_requests')}</h3>
                <p className="text-muted-foreground">{t('no_requests_sub')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {providerBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isProvider onAction={handleAction} />
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('how_was_service')}</DialogTitle>
          </DialogHeader>
          {reviewBooking && (
            <ReviewForm
              bookingId={reviewBooking.id}
              providerId={reviewBooking.provider_id}
              reviewerName={user?.full_name}
              onSubmitted={() => { setReviewBooking(null); queryClient.invalidateQueries({ queryKey: ['myReviews'] }); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}