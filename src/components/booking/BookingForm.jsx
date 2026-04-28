import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Shield, AlertTriangle, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { detectBypass } from '@/lib/constants';
import { usePricing } from '@/lib/usePricing';
import AvailabilityViewer from '@/components/availability/AvailabilityViewer';
import { useQuery } from '@tanstack/react-query';

export default function BookingForm({ provider, clientProfile }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [step, setStep] = useState(1); // 1: type, 2: date/time, 3: details

  // Check if client has an unreviewed completed booking with THIS specific provider
  const { data: clientBookings = [] } = useQuery({
    queryKey: ['clientBookingsForReviewGate', clientProfile?.user_email, provider?.id],
    queryFn: () => base44.entities.Booking.filter({ client_email: clientProfile.user_email, provider_id: provider.id, status: 'payment_released' }),
    enabled: !!clientProfile?.user_email && !!provider?.id,
  });
  const { data: myReviews = [] } = useQuery({
    queryKey: ['myReviewsForGate', clientProfile?.user_email, provider?.id],
    queryFn: () => base44.entities.Review.filter({ reviewer_email: clientProfile.user_email, provider_id: provider.id }),
    enabled: !!clientProfile?.user_email && !!provider?.id,
  });
  const reviewedIds = new Set(myReviews.map(r => r.booking_id));
  const hasPendingReview = clientBookings.some(b => !reviewedIds.has(b.id));

  const [form, setForm] = useState({
    booking_type: 'hourly',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    duration: 1,
    address: '',
    instructions: '',
  });

  useEffect(() => {
    if (!provider?.id) return;
    base44.entities.ProviderAvailability.filter({ provider_id: provider.id }).then(list => {
      if (list.length > 0) setAvailability(list[0]);
    });
  }, [provider?.id]);

  const country = clientProfile?.country || provider.country || 'brazil';
  const countryInfo = usePricing(country);
  const isPremiumClient = clientProfile?.is_premium;
  const feePct = isPremiumClient ? 0 : countryInfo.fee_pct;

  const getRate = () => {
    if (form.booking_type === 'hourly') return provider.hourly_rate || 0;
    if (form.booking_type === 'daily') return provider.daily_rate || (provider.hourly_rate * 8) || 0;
    return provider.weekly_rate || (provider.hourly_rate * 40) || 0;
  };

  const subtotal = getRate() * (form.duration || 1);
  const platformFee = subtotal * (feePct / 100);
  const total = subtotal + platformFee;
  const providerPayout = subtotal;

  const handleInstructionChange = (val) => {
    setBypassWarning(detectBypass(val));
    setForm(f => ({ ...f, instructions: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (bypassWarning) {
      toast.error('Please remove contact info from instructions.');
      return;
    }
    if (!form.start_date) {
      toast.error('Please select a start date');
      return;
    }
    if (!form.address) {
      toast.error('Please enter a service address');
      return;
    }
    setLoading(true);
    try {
      const me = await base44.auth.me();
      await base44.entities.Booking.create({
        client_email: me.email,
        client_name: me.full_name,
        provider_id: provider.id,
        provider_email: provider.user_email,
        provider_name: provider.full_name,
        category: provider.category,
        booking_type: form.booking_type,
        start_date: form.start_date,
        start_time: form.start_time,
        end_date: form.end_date || form.start_date,
        duration: form.duration,
        rate_applied: getRate(),
        subtotal,
        platform_fee_pct: feePct,
        platform_fee: platformFee,
        total_amount: total,
        provider_payout: providerPayout,
        address: form.address,
        instructions: form.instructions,
        status: 'pending_approval',
        payment_status: 'unpaid',
        country,
      });
      toast.success(t('booking_success'));
      setLoading(false);
      navigate('/bookings');
    } catch (error) {
      console.error(error);
      toast.error('Booking failed');
      setLoading(false);
    }
  };

  const durationLabel = form.booking_type === 'hourly' ? 'hours' : form.booking_type === 'daily' ? 'days' : 'weeks';
  const durationMax = form.booking_type === 'hourly' ? 24 : form.booking_type === 'daily' ? 30 : 52;

  return (
    <Card className="sticky top-24 shadow-lg border border-gray-100">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Calendar className="w-4 h-4" /> Book {provider.full_name}
        </CardTitle>
        {isPremiumClient && (
          <p className="text-xs text-blue-100 mt-1">✨ Premium client — 0% platform fee</p>
        )}
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Service Type & Duration */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">What type of service?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'hourly', label: 'Hourly', price: provider.hourly_rate },
                    { value: 'daily', label: 'Daily', price: provider.daily_rate || (provider.hourly_rate * 8) },
                    { value: 'weekly', label: 'Weekly', price: provider.weekly_rate || (provider.hourly_rate * 40) },
                  ].map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, booking_type: type.value, duration: 1 }))}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        form.booking_type === type.value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 bg-white'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{type.label}</p>
                      <p className="text-xs text-gray-600">{countryInfo.symbol}{type.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">How many {durationLabel}?</Label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, duration: Math.max(1, f.duration - 1) }))}
                    className="h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    −
                  </button>
                  <Input
                    type="number"
                    min={1}
                    max={durationMax}
                    value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: Math.min(durationMax, Math.max(1, parseInt(e.target.value) || 1)) }))}
                    className="flex-1 h-10 text-center text-lg font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, duration: Math.min(durationMax, f.duration + 1) }))}
                    className="h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max {durationMax} {durationLabel}</p>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 h-10"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Select a date</Label>
                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
                  <AvailabilityViewer
                    availability={availability}
                    selectedDate={form.start_date}
                    onDateSelect={date => setForm(f => ({ ...f, start_date: date, start_time: availability?.work_start || '09:00' }))}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Start time</Label>
                <Input
                  type="time"
                  value={form.start_time}
                  onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                  className="h-10"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!form.start_date}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 h-10"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Details & Summary */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Service location</Label>
                <Input
                  placeholder="Enter address or area"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  className="h-10"
                  required
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-800 mb-2 block">Additional notes (optional)</Label>
                <Textarea
                  placeholder="Any special requests or details..."
                  value={form.instructions}
                  onChange={e => handleInstructionChange(e.target.value)}
                  rows={3}
                  className="text-sm"
                />
                {bypassWarning && (
                  <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    Keep payments & communication inside CareBook for safety.
                  </div>
                )}
              </div>

              <Separator />

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{form.duration} {durationLabel === 'hours' ? 'hr' : durationLabel === 'days' ? 'day' : 'wk'}{form.duration > 1 ? 's' : ''}</span>
                  <span className="font-semibold">{countryInfo.symbol}{getRate()} × {form.duration} = {countryInfo.symbol}{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform fee ({feePct}%){isPremiumClient && ' 🎉'}</span>
                  <span className="font-semibold">{countryInfo.symbol}{platformFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="text-blue-700">{countryInfo.symbol}{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-700">Your payment is held securely. Provider gets paid after you confirm completion.</p>
              </div>

              {hasPendingReview && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <Star className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Review required before booking</p>
                    <p className="text-xs text-amber-700 mt-0.5">You have a completed job waiting for your review. Please go to <a href="/bookings" className="underline font-medium">My Bookings</a> and leave a review first.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1 h-10"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
                {!hasPendingReview && (
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 font-semibold"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Confirm Booking — ${countryInfo.symbol}${total.toFixed(2)}`}
                  </Button>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}