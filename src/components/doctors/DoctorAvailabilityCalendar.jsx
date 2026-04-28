import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO, startOfDay, endOfDay } from 'date-fns';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 10 }, (_, i) => `${8 + i}:00`);

export default function DoctorAvailabilityCalendar({ provider, isOwnProfile, userEmail }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [workingDays, setWorkingDays] = useState(provider?.working_days || [1, 2, 3, 4, 5]);
  const [workStart, setWorkStart] = useState(provider?.work_start || '08:00');
  const [workEnd, setWorkEnd] = useState(provider?.work_end || '18:00');
  const [blockedDates, setBlockedDates] = useState(provider?.blocked_dates || []);
  const [consultations, setConsultations] = useState([]);
  const [availabilityId, setAvailabilityId] = useState(provider?.availability_id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!provider?.id) return;
    // Fetch availability data
    base44.entities.ProviderAvailability.filter({ provider_id: provider.id }).then(list => {
      if (list.length > 0) {
        const a = list[0];
        setAvailabilityId(a.id);
        setWorkingDays(a.working_days || [1, 2, 3, 4, 5]);
        setWorkStart(a.work_start || '08:00');
        setWorkEnd(a.work_end || '18:00');
        setBlockedDates(a.blocked_dates || []);
      }
    });
    // Fetch booked consultations
    base44.entities.Consultation.filter({ doctor_id: provider.id }).then(list => {
      setConsultations(list.filter(c => ['pending', 'confirmed', 'completed'].includes(c.status)));
    });
  }, [provider?.id]);

  const toggleWorkDay = (day) => {
    setWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleBlockedDate = (dateStr) => {
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSave = async () => {
    if (!isOwnProfile) return;
    setSaving(true);
    const data = {
      provider_id: provider.id,
      user_email: userEmail,
      working_days: workingDays,
      work_start: workStart,
      work_end: workEnd,
      blocked_dates: blockedDates,
    };
    try {
      if (availabilityId) {
        await base44.entities.ProviderAvailability.update(availabilityId, data);
      } else {
        const created = await base44.entities.ProviderAvailability.create(data);
        setAvailabilityId(created.id);
      }
      toast.success('Availability saved!');
    } catch (error) {
      toast.error('Failed to save availability');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  // Build calendar
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const getConsultationsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return consultations.filter(c => c.scheduled_date?.startsWith(dateStr));
  };

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    if (blockedDates.includes(dateStr)) return 'blocked';
    if (!workingDays.includes(dayOfWeek)) return 'off';
    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Working Hours & Days */}
      {isOwnProfile && (
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <Clock className="w-4 h-4 text-blue-600" /> Working Hours & Days
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">Working Days</Label>
              <div className="flex gap-2 flex-wrap">
                {DAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWorkDay(idx)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      workingDays.includes(idx)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">Start Time</Label>
                <Input type="time" value={workStart} onChange={e => setWorkStart(e.target.value)} className="mt-1.5 h-9" />
              </div>
              <div>
                <Label className="text-sm text-gray-600">End Time</Label>
                <Input type="time" value={workEnd} onChange={e => setWorkEnd(e.target.value)} className="mt-1.5 h-9" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View-only working hours for clients */}
      {!isOwnProfile && (
        <Card className="border border-gray-100 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">Available Hours</p>
                <p className="text-sm text-gray-600">
                  {DAY_LABELS.filter((_, i) => workingDays.includes(i)).join(', ')} • {workStart} - {workEnd}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Calendar */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Availability Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1 rounded hover:bg-gray-100">
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[100px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1 rounded hover:bg-gray-100">
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500">
            {isOwnProfile ? 'Click dates to block/unblock them. ' : ''}
            Green = available, Red = blocked, Gray = day off, Blue = booked consultations
          </p>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(startPad)
              .fill(null)
              .map((_, i) => (
                <div key={`pad-${i}`} />
              ))}
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const status = getDayStatus(date);
              const isCurrentDay = isToday(date);
              const dayConsultations = getConsultationsForDate(date);
              const bgClass =
                status === 'blocked'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : status === 'off'
                  ? 'bg-gray-50 text-gray-300 border-gray-100'
                  : dayConsultations.length > 0
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-green-50 text-green-700 border-green-100';

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => isOwnProfile && status !== 'off' && toggleBlockedDate(dateStr)}
                  disabled={status === 'off' || !isOwnProfile}
                  className={`relative aspect-square rounded-lg text-xs font-medium transition-all flex flex-col items-center justify-center border ${bgClass} ${
                    isCurrentDay ? 'ring-2 ring-blue-400 ring-offset-1' : ''
                  } ${isOwnProfile && status !== 'off' ? 'cursor-pointer hover:opacity-80' : ''}`}
                >
                  <span>{format(date, 'd')}</span>
                  {status === 'blocked' && <X className="w-2.5 h-2.5 mt-0.5" />}
                  {dayConsultations.length > 0 && (
                    <span className="text-xs font-bold mt-0.5">{dayConsultations.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" />
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span className="text-gray-600">Blocked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gray-50 border border-gray-100" />
              <span className="text-gray-600">Day Off</span>
            </div>
          </div>

          {/* Blocked dates list */}
          {isOwnProfile && blockedDates.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-medium">Blocked dates:</p>
              <div className="flex flex-wrap gap-2">
                {blockedDates.sort().map(d => (
                  <Badge key={d} variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 pr-1 text-xs">
                    {format(parseISO(d), 'MMM d')}
                    <button onClick={() => setBlockedDates(prev => prev.filter(x => x !== d))}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming consultations */}
          {consultations.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-700 mb-2 font-medium">Upcoming Consultations</p>
              <div className="space-y-2">
                {consultations
                  .filter(c => c.scheduled_date && new Date(c.scheduled_date) >= new Date())
                  .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                  .slice(0, 5)
                  .map(c => (
                    <div key={c.id} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">{c.client_name}</p>
                        <p className="text-xs text-gray-600">
                          {format(new Date(c.scheduled_date), 'MMM d, h:mm a')} ({c.consultation_type})
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                        {c.status}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save button for own profile */}
      {isOwnProfile && (
        <Button onClick={handleSave} disabled={saving} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Availability'}
        </Button>
      )}
    </div>
  );
}