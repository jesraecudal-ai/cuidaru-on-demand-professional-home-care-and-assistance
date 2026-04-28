import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AvailabilityViewer({ availability, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const workingDays = availability?.working_days || [1, 2, 3, 4, 5];
  const blockedDates = availability?.blocked_dates || [];
  const workStart = availability?.work_start || '08:00';
  const workEnd = availability?.work_end || '18:00';

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);
  const today = startOfDay(new Date());

  const getStatus = (date) => {
    if (isBefore(date, today)) return 'past';
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    if (blockedDates.includes(dateStr)) return 'blocked';
    if (!workingDays.includes(dayOfWeek)) return 'off';
    return 'available';
  };

  return (
    <div className="space-y-3">
      {/* Hours badge */}
      {availability && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg px-3 py-2">
          <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>Working hours: <strong>{workStart} – {workEnd}</strong></span>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1 rounded hover:bg-gray-100">
          <ChevronLeft className="w-4 h-4 text-gray-500" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1 rounded hover:bg-gray-100">
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7">
        {DAY_LABELS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array(startPad).fill(null).map((_, i) => <div key={`p${i}`} />)}
        {daysInMonth.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd');
          const status = getStatus(date);
          const isSelected = selectedDate === dateStr;
          const clickable = status === 'available';

          return (
            <button key={dateStr} type="button"
              onClick={() => clickable && onDateSelect(dateStr)}
              disabled={!clickable}
              className={`aspect-square rounded-lg text-xs font-medium transition-all flex items-center justify-center border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300'
                  : status === 'available'
                  ? 'bg-green-50 text-green-800 border-green-100 hover:bg-green-100 cursor-pointer'
                  : status === 'blocked'
                  ? 'bg-red-50 text-red-300 border-red-100 cursor-not-allowed'
                  : status === 'past'
                  ? 'bg-transparent text-gray-300 border-transparent cursor-not-allowed'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              } ${isToday(date) && !isSelected ? 'ring-1 ring-blue-400' : ''}`}>
              {format(date, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-3 mt-2 text-xs text-gray-500 flex-wrap">
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-green-100 border border-green-200" />Available</div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-red-50 border border-red-100" />Blocked</div>
        <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded bg-gray-50 border border-gray-100" />Day off</div>
      </div>

      {selectedDate && (
        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm text-green-800">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
          <span>Selected: <strong>{format(parseISO(selectedDate), 'EEEE, MMMM d')}</strong> · {workStart}–{workEnd}</span>
        </div>
      )}
    </div>
  );
}