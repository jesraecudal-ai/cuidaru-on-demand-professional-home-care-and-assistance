import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeftRight, X } from 'lucide-react';
import { COUNTRY_SETTINGS } from '@/lib/constants';

export default function CounterOfferForm({ booking, onSubmit, onCancel }) {
  const country = COUNTRY_SETTINGS[booking?.country] || COUNTRY_SETTINGS.brazil;

  const [amount, setAmount] = useState(booking?.total_amount || '');
  const [bookingType, setBookingType] = useState(booking?.booking_type || 'hourly');
  const [duration, setDuration] = useState(booking?.duration || 1);
  const [startDate, setStartDate] = useState(booking?.start_date || '');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    onSubmit({ amount: Number(amount), bookingType, duration: Number(duration), startDate, note });
  };

  return (
    <div className="border-t border-violet-100 bg-violet-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold text-violet-700">
          <ArrowLeftRight className="w-4 h-4" /> Make Counter Offer
        </span>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Total ({country.symbol})</label>
          <Input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Type</label>
          <Select value={bookingType} onValueChange={setBookingType}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hourly">Hourly</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Duration</label>
          <Input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min={1}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Textarea
        placeholder="Optional note..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={2}
        className="text-sm resize-none"
      />

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={handleSubmit} disabled={!amount || Number(amount) <= 0}>
          Send Offer
        </Button>
      </div>
    </div>
  );
}