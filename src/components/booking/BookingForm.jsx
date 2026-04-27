import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

const PLATFORM_FEE_RATE = 0.10;

export default function BookingForm({ provider }) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    booking_type: 'hourly',
    start_date: '',
    end_date: '',
    hours: 1,
    address: '',
    notes: '',
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const getRate = () => {
    if (form.booking_type === 'hourly') return provider.hourly_rate || 0;
    if (form.booking_type === 'daily') return provider.daily_rate || (provider.hourly_rate * 8) || 0;
    if (form.booking_type === 'weekly') return provider.weekly_rate || (provider.hourly_rate * 40) || 0;
    return 0;
  };

  const getMultiplier = () => {
    if (form.booking_type === 'hourly') return form.hours || 1;
    if (form.booking_type === 'daily') {
      if (!form.start_date || !form.end_date) return 1;
      return Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 86400000) + 1);
    }
    if (form.booking_type === 'weekly') {
      if (!form.start_date || !form.end_date) return 1;
      return Math.max(1, Math.ceil((new Date(form.end_date) - new Date(form.start_date)) / 604800000));
    }
    return 1;
  };

  const subtotal = getRate() * getMultiplier();
  const platformFee = subtotal * PLATFORM_FEE_RATE;
  const total = subtotal + platformFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.Booking.create({
      client_email: user?.email,
      client_name: user?.full_name,
      provider_id: provider.id,
      provider_email: provider.user_email,
      provider_name: provider.full_name,
      category: provider.category,
      booking_type: form.booking_type,
      start_date: form.start_date,
      end_date: form.end_date || form.start_date,
      hours: form.booking_type === 'hourly' ? form.hours : null,
      rate_applied: getRate(),
      subtotal,
      platform_fee: platformFee,
      total_amount: total,
      provider_payout: subtotal,
      status: 'pending',
      payment_status: 'held',
      notes: form.notes,
      address: form.address,
    });
    toast.success(t('booking_success'));
    setLoading(false);
    navigate('/bookings');
  };

  return (
    <Card className="sticky top-24 shadow-lg border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-primary" />
          {t('book_title')} {provider.full_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('booking_type')}</Label>
            <Select value={form.booking_type} onValueChange={(v) => setForm({ ...form, booking_type: v })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">{t('hourly')} (${provider.hourly_rate}/hr)</SelectItem>
                <SelectItem value="daily">{t('daily')} (${provider.daily_rate || (provider.hourly_rate * 8)}/day)</SelectItem>
                <SelectItem value="weekly">{t('weekly')} (${provider.weekly_rate || (provider.hourly_rate * 40)}/wk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>{t('start_date')}</Label>
            <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="mt-1.5" required />
          </div>

          {form.booking_type !== 'hourly' && (
            <div>
              <Label>{t('end_date')}</Label>
              <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} className="mt-1.5" required />
            </div>
          )}

          {form.booking_type === 'hourly' && (
            <div>
              <Label>{t('num_hours')}</Label>
              <Input type="number" min={1} max={24} value={form.hours} onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) || 1 })} className="mt-1.5" />
            </div>
          )}

          <div>
            <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {t('address')}</Label>
            <Input placeholder={t('service_location')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5" required />
          </div>

          <div>
            <Label>{t('notes')}</Label>
            <Textarea placeholder={t('notes_placeholder')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1.5" rows={3} />
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                ${getRate()} × {getMultiplier()} {form.booking_type === 'hourly' ? 'hrs' : form.booking_type === 'daily' ? 'days' : 'wks'}
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('platform_fee')}</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>{t('total')}</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{t('escrow_notice')}</span>
          </div>

          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? t('processing') : `${t('book_now')} — $${total.toFixed(2)}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}