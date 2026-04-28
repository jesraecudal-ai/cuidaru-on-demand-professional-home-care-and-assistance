import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Shield, AlertTriangle, CalendarDays } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { detectBypass } from '@/lib/constants';
import { usePricing } from '@/lib/usePricing';
import AvailabilityViewer from '@/components/availability/AvailabilityViewer';

export default function BookingForm({ provider, clientProfile }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [bypassWarning, setBypassWarning] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [form, setForm] = useState({
    booking_type: 'hourly', start_date: '', start_time: '09:00',
    end_date: '', duration: 1, address: '', instructions: '',
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
    if (bypassWarning) { toast.error('Please remove contact info from instructions.'); return; }
    setLoading(true);
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
  };

  return (
    <Card className="sticky top-24 shadow-lg border border-gray-100">
      <CardHeader className="pb-4 bg-blue-600 text-white rounded-t-xl">
        <CardTitle className="flex items-center gap-2 text-base text-white">
          <Calendar className="w-4 h-4" /> {t('book_title')} {provider.full_name}
        </CardTitle>
        {isPremiumClient && (
          <p className="text-xs text-blue-100 mt-1">✨ Premium client — 0% platform fee</p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-medium text-gray-600">{t('booking_type')}</Label>
            <Select value={form.booking_type} onValueChange={v => setForm(f => ({ ...f, booking_type: v, duration: 1 }))}>
              <SelectTrigger className="mt-1 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t('hourly')} ({countryInfo.symbol}{provider.hourly_rate}/hr)</SelectItem>
                <SelectItem value="daily">{t('daily')} ({countryInfo.symbol}{provider.daily_rate || (provider.hourly_rate * 8)}/day)</SelectItem>
                <SelectItem value="weekly">{t('weekly')} ({countryInfo.symbol}{provider.weekly_rate || (provider.hourly_rate * 40)}/wk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Availability Calendar */}
          <div>
            <Label className="text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" /> {t('start_date')} — click an available day
            </Label>
            <div className="mt-1.5 border border-gray-100 rounded-xl p-3 bg-gray-50">
              <AvailabilityViewer
                availability={availability}
                selectedDate={form.start_date}
                onDateSelect={date => setForm(f => ({ ...f, start_date: date, start_time: availability?.work_start || '09:00' }))}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">Start Time</Label>
            <Input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} className="mt-1 h-10" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">
              Duration ({form.booking_type === 'hourly' ? 'hours' : form.booking_type === 'daily' ? 'days' : 'weeks'})
            </Label>
            <Input type="number" min={1} max={form.booking_type === 'hourly' ? 24 : form.booking_type === 'daily' ? 30 : 52}
              value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 1 }))} className="mt-1 h-10" />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600"><MapPin className="inline w-3 h-3 mr-1" />{t('address')}</Label>
            <Input placeholder={t('service_location')} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="mt-1 h-10" required />
          </div>

          <div>
            <Label className="text-xs font-medium text-gray-600">{t('notes')}</Label>
            <Textarea
              placeholder={t('notes_placeholder')}
              value={form.instructions}
              onChange={e => handleInstructionChange(e.target.value)}
              className="mt-1"
              rows={3}
            />
            {bypassWarning && (
              <div className="mt-2 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                For your safety, keep communication and payments inside CareBook.
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{countryInfo.symbol}{getRate()} × {form.duration} {form.booking_type === 'hourly' ? 'hrs' : form.booking_type === 'daily' ? 'days' : 'wks'}</span>
              <span>{countryInfo.symbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t('platform_fee')} ({feePct}%){isPremiumClient && ' 🎉'}</span>
              <span>{countryInfo.symbol}{platformFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>{t('total')}</span>
              <span className="text-blue-700">{countryInfo.symbol}{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700">{t('escrow_notice')}</p>
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-sm font-semibold" disabled={loading}>
            {loading ? t('processing') : `${t('book_now')} — ${countryInfo.symbol}${total.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}