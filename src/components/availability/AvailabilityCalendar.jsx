import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, getDay, isSameDay, parseISO, isToday } from 'date-fns';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityCalendar({ providerId, userEmail }) {
  const [availability, setAvailability] = useState(null);
  const [availabilityId, setAvailabilityId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [saving, setSaving] = useState(false);
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri default
  const [workStart, setWorkStart] = useState('08:00');
  const [workEnd, setWorkEnd] = useState('18:00');
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    if (!providerId) return;
    base44.entities.ProviderAvailability.filter({ provider_id: providerId }).then(list => {
      if (list.length > 0) {
        const a = list[0];
        setAvailabilityId(a.id);
        setWorkingDays(a.working_days || [1, 2, 3, 4, 5]);
        setWorkStart(a.work_start || '08:00');
        setWorkEnd(a.work_end || '18:00');
        setBlockedDates(a.blocked_dates || []);
      }
    });
  }, [providerId]);

  const toggleWorkDay = (day) => {
    setWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleBlockedDate = (dateStr) => {
    setBlockedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      provider_id: providerId,
      user_email: userEmail,
      working_days: workingDays,
      work_start: workStart,
      work_end: workEnd,
      blocked_dates: blockedDates,
    };
    if (availabilityId) {
      await base44.entities.ProviderAvailability.update(availabilityId, data);
    } else {
      const created = await base44.entities.ProviderAvailability.create(data);
      setAvailabilityId(created.id);
    }
    setSaving(false);
    toast.success('Availability saved!');
  };

  // Build calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // empty cells before month start

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    if (blockedDates.includes(dateStr)) return 'blocked';
    if (!workingDays.includes(dayOfWeek)) return 'off';
    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Working Days */}
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
                <button key={idx} type="button" onClick={() => toggleWorkDay(idx)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    workingDays.includes(idx)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                  }`}>
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

      {/* Calendar for blocked dates */}
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2 text-gray-800">
              <CalendarDays className="w-4 h-4 text-blue-600" /> Block Specific Dates
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
        <CardContent>
          <p className="text-xs text-gray-400 mb-3">Click dates to block/unblock them. Gray = day off, red = blocked, green = available.</p>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const status = getDayStatus(date);
              const today = isToday(date);
              return (
                <button key={dateStr} type="button" onClick={() => toggleBlockedDate(dateStr)}
                  className={`relative aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center border ${
                    status === 'blocked'
                      ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                      : status === 'off'
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-default'
                      : 'bg-green-50 text-green-800 border-green-100 hover:bg-green-100'
                  } ${today ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                  disabled={status === 'off'}>
                  {format(date, 'd')}
                  {status === 'blocked' && (
                    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-200" /><span className="text-xs text-gray-500">Available</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-100 border border-red-200" /><span className="text-xs text-gray-500">Blocked</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-50 border border-gray-100" /><span className="text-xs text-gray-500">Day Off</span></div>
          </div>

          {/* Blocked date chips */}
          {blockedDates.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Blocked dates:</p>
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
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-11">
        <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Availability'}
      </Button>
    </div>
  );
}