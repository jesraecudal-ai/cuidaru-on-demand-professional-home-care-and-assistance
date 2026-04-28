import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ArrowLeftRight, Calendar, Clock } from 'lucide-react';
import { COUNTRY_SETTINGS } from '@/lib/constants';
import { format } from 'date-fns';

export default function CounterOfferBubble({ msg, isMe, currentUser, booking, onAccept, onDecline }) {
  const country = COUNTRY_SETTINGS[booking?.country] || COUNTRY_SETTINGS.brazil;
  const isPending = msg.offer_status === 'pending';
  const isSuperseded = msg.offer_status === 'superseded';

  // Only the OTHER party can accept/decline, and only if still pending
  const canAct = !isMe && isPending && !isSuperseded;

  const statusColors = {
    pending: 'border-violet-200 bg-violet-50',
    accepted: 'border-green-200 bg-green-50',
    declined: 'border-red-100 bg-red-50',
    superseded: 'border-gray-200 bg-gray-50 opacity-60',
  };

  const statusLabel = {
    pending: null,
    accepted: '✅ Accepted',
    declined: '❌ Declined',
    superseded: '↩ Superseded by new offer',
  };

  return (
    <div className={`rounded-2xl border p-4 w-72 ${statusColors[msg.offer_status] || 'border-violet-200 bg-violet-50'}`}>
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="w-4 h-4 text-violet-600" />
        <span className="text-sm font-semibold text-violet-700">Counter Offer</span>
        {statusLabel[msg.offer_status] && (
          <span className="ml-auto text-xs font-medium text-gray-500">{statusLabel[msg.offer_status]}</span>
        )}
      </div>

      <div className="space-y-1.5 text-sm text-gray-700 mb-3">
        <div className="flex justify-between">
          <span className="text-gray-500">Total</span>
          <span className="font-bold text-gray-900">{country.symbol}{msg.offer_amount?.toFixed(2)}</span>
        </div>
        {msg.offer_booking_type && (
          <div className="flex justify-between">
            <span className="text-gray-500">Type</span>
            <span className="capitalize">{msg.offer_booking_type}</span>
          </div>
        )}
        {msg.offer_duration && (
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span>{msg.offer_duration} {msg.offer_booking_type === 'hourly' ? 'hrs' : msg.offer_booking_type === 'daily' ? 'days' : 'wks'}</span>
          </div>
        )}
        {msg.offer_start_date && (
          <div className="flex justify-between">
            <span className="text-gray-500">Start</span>
            <span>{format(new Date(msg.offer_start_date), 'MMM d, yyyy')}</span>
          </div>
        )}
        {msg.content && msg.content !== '[counter_offer]' && (
          <p className="text-xs text-gray-500 italic border-t pt-2 mt-2">"{msg.content}"</p>
        )}
      </div>

      {canAct && (
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => onAccept(msg)}>
            <CheckCircle className="w-3 h-3 mr-1" /> Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => onDecline(msg)}>
            <XCircle className="w-3 h-3 mr-1" /> Decline
          </Button>
        </div>
      )}
    </div>
  );
}