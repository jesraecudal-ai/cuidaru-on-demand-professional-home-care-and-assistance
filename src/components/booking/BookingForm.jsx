import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Zap, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import DoctorAvailabilityCalendar from '../doctors/DoctorAvailabilityCalendar';

export default function BookingForm({ provider, clientProfile }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);

  const isDoctor = provider?.categories?.includes('doctor') || provider?.category === 'doctor';

  // For doctors: show consultation booking
  // For non-doctors: show hourly/daily/weekly booking
  return isDoctor ? 
    <ConsultationBookingPanel provider={provider} clientProfile={clientProfile} /> :
    <RegularBookingForm provider={provider} clientProfile={clientProfile} />;
}

function ConsultationBookingPanel({ provider, clientProfile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [form, setForm] = useState({
    consultation_type: 'chat',
    scheduled_date: '',
    duration_minutes: 30,
    notes: ''
  });

  const isOnline = provider?.availability === 'available';

  const handleBookScheduled = async () => {
    if (!form.scheduled_date) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Consultation.create({
        doctor_id: provider.id,
        doctor_email: provider.user_email,
        doctor_name: provider.full_name,
        client_email: user.email,
        client_name: user.full_name,
        consultation_type: form.consultation_type,
        scheduled_date: form.scheduled_date,
        duration_minutes: form.duration_minutes,
        fee: provider.consultation_fee || 0,
        currency: 'usd',
        notes: form.notes,
        conversation_id: `${user.email}__${provider.id}__consultation`
      });

      toast.success('Consultation booked!');
      navigate('/consultations');
    } catch (error) {
      toast.error('Failed to book consultation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnDemand = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();

      await base44.entities.Consultation.create({
        doctor_id: provider.id,
        doctor_email: provider.user_email,
        doctor_name: provider.full_name,
        client_email: user.email,
        client_name: user.full_name,
        consultation_type: 'chat',
        scheduled_date: new Date().toISOString(),
        duration_minutes: 30,
        fee: provider.consultation_fee || 0,
        currency: 'usd',
        notes: 'On-demand consultation',
        status: 'confirmed',
        conversation_id: `${user.email}__${provider.id}__consultation`
      });

      toast.success('Consultation started!');
      navigate('/consultations');
    } catch (error) {
      toast.error('Failed to start consultation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 2);
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg border border-gray-100">
        <CardHeader className="pb-4 px-6 pt-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
            <Calendar className="w-4 h-4" /> Book Consultation
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 space-y-4">
        {!provider.consultation_fee && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            This doctor has not set a consultation fee yet.
          </div>
        )}

        {provider.consultation_fee && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="text-2xl font-bold text-blue-600">${provider.consultation_fee?.toFixed(2)}</p>
          </div>
        )}

        {/* On-Demand Option */}
        {isOnline && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Zap className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900">Doctor is online now</p>
                <p className="text-xs text-green-700 mt-1">Start an immediate consultation via chat</p>
              </div>
            </div>
            <Button
              onClick={handleOnDemand}
              disabled={loading || !provider.consultation_fee}
              className="w-full bg-green-600 hover:bg-green-700 gap-2"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Starting...' : 'Start Consultation Now'}
            </Button>
          </div>
        )}

        {/* Scheduled Consultation */}
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-800 mb-4">Schedule a Consultation</p>

          <div className="space-y-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Type</Label>
              <Select value={form.consultation_type} onValueChange={v => setForm(f => ({ ...f, consultation_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chat">💬 Chat</SelectItem>
                  <SelectItem value="phone">☎️ Phone Call</SelectItem>
                  <SelectItem value="video">📹 Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</Label>
              <Input
                type="datetime-local"
                value={form.scheduled_date}
                onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
                min={minDateTimeStr}
              />
              <p className="text-xs text-gray-500 mt-1">At least 2 hours from now</p>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Duration</Label>
              <Select value={form.duration_minutes.toString()} onValueChange={v => setForm(f => ({ ...f, duration_minutes: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">What's this about?</Label>
              <Textarea
                placeholder="Briefly describe your consultation needs..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
              />
            </div>

            <Button
              onClick={handleBookScheduled}
              disabled={loading || !provider.consultation_fee || !form.scheduled_date}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Booking...' : `Book Consultation — $${provider.consultation_fee?.toFixed(2) || '0.00'}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Doctor Availability Calendar */}
    <Card className="shadow-lg border border-gray-100">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full justify-between px-0"
        >
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Calendar className="w-4 h-4" /> Availability Calendar
          </CardTitle>
          <span className="text-xs text-gray-500">{showCalendar ? '−' : '+'}</span>
        </Button>
      </CardHeader>
      {showCalendar && (
        <CardContent className="pt-0">
          <DoctorAvailabilityCalendar
            provider={provider}
            isOwnProfile={false}
            userEmail={clientProfile?.user_email}
          />
        </CardContent>
      )}
    </Card>
    </div>
  );
}

// Booking form for non-doctors (hourly/daily/weekly rates)
function RegularBookingForm({ provider, clientProfile }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);
  const [step, setStep] = useState(1);
  const [availability, setAvailability] = useState(null);

  const [form, setForm] = useState({
    booking_type: 'hourly',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    duration: 1,
    daily_hours: 8,
    weekly_days_hours: 6,
    weekly_days: [1, 2, 3, 4, 5],
    address: '',
    instructions: '',
  });

  useEffect(() => {
    if (!provider?.id) return;
    base44.entities.ProviderAvailability.filter({ provider_id: provider.id }).then(list => {
      if (list.length > 0) setAvailability(list[0]);
    });
  }, [provider?.id]);

  const validateForm = () => {
    if (!form.start_date) {
      toast.error('Please select a start date');
      return false;
    }
    if (form.booking_type !== 'hourly' && !form.end_date) {
      toast.error('Please select an end date');
      return false;
    }
    if (!provider.hourly_rate && form.booking_type === 'hourly') {
      toast.error('This provider has not set hourly rates');
      return false;
    }
    if (!provider.daily_rate && form.booking_type === 'daily') {
      toast.error('This provider has not set daily rates');
      return false;
    }
    if (!provider.weekly_rate && form.booking_type === 'weekly') {
      toast.error('This provider has not set weekly rates');
      return false;
    }
    return true;
  };

  const calculateCost = () => {
    let subtotal = 0;
    const rate = form.booking_type === 'hourly' ? provider.hourly_rate :
                 form.booking_type === 'daily' ? provider.daily_rate :
                 provider.weekly_rate;

    if (form.booking_type === 'hourly') {
      subtotal = form.duration * rate;
    } else if (form.booking_type === 'daily') {
      const days = Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24)) + 1;
      subtotal = days * rate;
    } else if (form.booking_type === 'weekly') {
      const weeks = Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / (1000 * 60 * 60 * 24 * 7)) + 1;
      subtotal = weeks * rate;
    }

    const platformFeePercent = 10;
    const platformFee = subtotal * (platformFeePercent / 100);
    // Client pays only the subtotal; platform fee is deducted from provider payout
    const total = subtotal;
    const providerPayout = subtotal - platformFee;

    return { subtotal, platformFee, total, platformFeePercent, providerPayout };
  };

  const handleCreateBooking = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await base44.auth.me();
      const { subtotal, platformFee, total, providerPayout } = calculateCost();

      const bookingData = {
        client_email: user.email,
        client_name: user.full_name,
        provider_id: provider.id,
        provider_email: provider.user_email,
        provider_name: provider.full_name,
        category: provider.categories?.[0] || provider.category,
        booking_type: form.booking_type,
        start_date: form.start_date,
        start_time: form.start_time,
        end_date: form.end_date || form.start_date,
        duration: form.duration,
        rate_applied: form.booking_type === 'hourly' ? provider.hourly_rate :
                      form.booking_type === 'daily' ? provider.daily_rate :
                      provider.weekly_rate,
        subtotal,
        platform_fee_pct: 10,
        platform_fee: platformFee,
        total_amount: total,
        provider_payout: providerPayout,
        address: form.address,
        instructions: form.instructions,
        country: provider.country
      };

      await base44.entities.Booking.create(bookingData);
      toast.success('Booking request sent!');
      navigate('/bookings');
    } catch (error) {
      toast.error('Failed to create booking');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, platformFee, total, providerPayout } = calculateCost();

  return (
    <Card className="sticky top-24 shadow-lg border border-gray-100">
      <CardHeader className="pb-4 px-6 pt-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-xl">
        <CardTitle className="text-sm font-semibold text-white">Book {provider.full_name}</CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Booking Type Selection */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Booking Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'hourly', label: 'Hourly', rate: provider.hourly_rate },
              { value: 'daily', label: 'Daily', rate: provider.daily_rate },
              { value: 'weekly', label: 'Weekly', rate: provider.weekly_rate }
            ].map(type => (
              <button
                key={type.value}
                onClick={() => setForm(f => ({ ...f, booking_type: type.value }))}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  form.booking_type === type.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-semibold text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-600 mt-1">${type.rate?.toFixed(2) || 'N/A'}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</Label>
          <Input
            type="date"
            value={form.start_date}
            onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {form.booking_type === 'hourly' && (
          <>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</Label>
              <Input
                type="time"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (hours)</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={form.duration}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '') {
                    setForm(f => ({ ...f, duration: '' }));
                  } else {
                    const num = parseInt(val);
                    if (!isNaN(num)) {
                      setForm(f => ({ ...f, duration: num }));
                    }
                  }
                }}
              />
            </div>
          </>
        )}

        {form.booking_type !== 'hourly' && (
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1.5">End Date</Label>
            <Input
              type="date"
              value={form.end_date}
              onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
              min={form.start_date}
            />
          </div>
        )}

        {/* Location & Instructions */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1.5">Address/Location</Label>
          <Input
            placeholder="Where should the service take place?"
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
          />
        </div>

        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-1.5">Special Instructions</Label>
          <Textarea
            placeholder="Any special requests or notes for the provider?"
            value={form.instructions}
            onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
            rows={2}
          />
        </div>

        {/* Pricing Summary */}
        <div className="border-t pt-4 space-y-2 bg-gray-50 rounded-lg p-3">
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="font-semibold text-gray-900">Total:</span>
            <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
          <p className="text-xs text-gray-400">* Stripe processing fee applies at checkout. Provider receives ${providerPayout.toFixed(2)} after platform fee.</p>
        </div>

        {!provider.hourly_rate && !provider.daily_rate && !provider.weekly_rate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Rates not set</p>
              <p className="text-xs mt-1">This provider hasn't set their rates yet.</p>
            </div>
          </div>
        )}

        <Button
          onClick={handleCreateBooking}
          disabled={loading || !provider.hourly_rate || !provider.daily_rate || !provider.weekly_rate}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Creating Booking...' : `Request Booking — $${total.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}