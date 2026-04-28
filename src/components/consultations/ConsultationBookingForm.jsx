import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ConsultationBookingForm({ doctor, onBooked, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    consultation_type: 'chat',
    scheduled_date: '',
    duration_minutes: 30,
    notes: ''
  });

  const handleBook = async () => {
    if (!form.scheduled_date) {
      toast.error('Please select a date and time');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      const consultation = await base44.entities.Consultation.create({
        doctor_id: doctor.id,
        doctor_email: doctor.user_email,
        doctor_name: doctor.full_name,
        client_email: user.email,
        client_name: user.full_name,
        consultation_type: form.consultation_type,
        scheduled_date: form.scheduled_date,
        duration_minutes: form.duration_minutes,
        fee: doctor.consultation_fee || 0,
        currency: 'usd',
        notes: form.notes,
        conversation_id: `${user.email}__${doctor.id}__consultation`
      });

      toast.success('Consultation booked! Proceeding to payment...');
      onBooked(consultation);
    } catch (error) {
      toast.error('Failed to book consultation');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date();
  minDateTime.setHours(minDateTime.getHours() + 2);
  const minDateTimeStr = minDateTime.toISOString().slice(0, 16);

  return (
    <Card className="border border-blue-100 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Book Consultation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {doctor.consultation_fee ? (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600">Consultation Fee</p>
            <p className="text-2xl font-bold text-blue-600">${doctor.consultation_fee?.toFixed(2)}</p>
          </div>
        ) : (
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">This doctor has not set a consultation fee yet.</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Type</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <Calendar className="w-4 h-4" /> Date & Time
          </label>
          <Input
            type="datetime-local"
            value={form.scheduled_date}
            onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))}
            min={minDateTimeStr}
          />
          <p className="text-xs text-gray-500 mt-1">At least 2 hours from now</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <Clock className="w-4 h-4" /> Duration
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <FileText className="w-4 h-4" /> What's this about?
          </label>
          <Textarea
            placeholder="Briefly describe your consultation needs or symptoms..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleBook}
            disabled={loading || !doctor.consultation_fee}
            className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Booking...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}