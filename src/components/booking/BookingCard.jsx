import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, Star, MessageCircle, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';
import { BOOKING_STATUSES, COUNTRY_SETTINGS } from '@/lib/constants';

export default function BookingCard({ booking, isProvider, onAction, hasPendingReview }) {
  const { t } = useI18n();
  const statusInfo = BOOKING_STATUSES[booking.status] || { label: booking.status, color: 'bg-gray-100 text-gray-700' };
  const country = COUNTRY_SETTINGS[booking.country] || COUNTRY_SETTINGS.brazil;

  return (
    <Card className="hover:shadow-md transition-shadow border border-gray-100">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 space-y-2.5">
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <User className="w-4 h-4 text-gray-400" />
                {isProvider ? booking.client_name : booking.provider_name}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {booking.start_date && format(new Date(booking.start_date), 'MMM d, yyyy')}
                {booking.start_time && ` at ${booking.start_time}`}
                {booking.duration > 1 && ` • ${booking.duration} ${booking.booking_type === 'hourly' ? 'hrs' : booking.booking_type === 'daily' ? 'days' : 'wks'}`}
              </div>
              {booking.address && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" /> {booking.address}
                </div>
              )}
            </div>
          </div>
          <div className="sm:text-right space-y-2">
            <div>
              <span className="text-2xl font-bold text-gray-900">{country.symbol}{booking.total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex sm:justify-end flex-wrap gap-2">
              {/* Provider actions */}
              {isProvider && booking.status === 'pending_approval' && (
                <>
                  {hasPendingReview ? (
                    <div className="flex flex-col items-end gap-1">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs opacity-50 cursor-not-allowed" disabled>Accept</Button>
                      <p className="text-xs text-amber-600 flex items-center gap-1"><Star className="w-3 h-3" /> Review a past job first</p>
                    </div>
                  ) : (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => onAction(booking.id, 'accepted', booking)}>Accept</Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => onAction(booking.id, 'cancelled', booking)}>Decline</Button>
                </>
              )}
              {isProvider && (booking.status === 'paid_confirmed' || booking.status === 'accepted') && (
                <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => onAction(booking.id, 'in_progress', booking)}>Start Job</Button>
              )}
              {isProvider && booking.status === 'in_progress' && (
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onAction(booking.id, 'completed', booking)}>Mark Complete</Button>
              )}
              {/* Client actions */}
              {!isProvider && booking.status === 'accepted' && (
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onAction(booking.id, 'in_progress', booking)}>
                  Confirm Start
                </Button>
              )}
              {!isProvider && booking.status === 'pending_approval' && (
                <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => onAction(booking.id, 'cancelled', booking)}>Cancel</Button>
              )}
            </div>

          </div>
        </div>
        {/* Counter offer banner */}
        {booking.status === 'counter_offered' && (
          <div className="mt-3 pt-3 border-t border-violet-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <ArrowLeftRight className="w-4 h-4 text-violet-500" />
              <span className="text-violet-700 font-medium">
                Counter offer: {country.symbol}{booking.counter_offer_amount?.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">
                by {booking.counter_offer_by === (isProvider ? booking.provider_email : booking.client_email) ? 'you' : (isProvider ? booking.client_name : booking.provider_name)}
              </span>
            </div>
            <Link to="/messages">
              <Button size="sm" variant="outline" className="h-7 text-xs border-violet-200 text-violet-600 hover:bg-violet-50 gap-1">
                <MessageCircle className="w-3 h-3" /> Respond in Chat
              </Button>
            </Link>
          </div>
        )}
        {booking.instructions && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500"><span className="font-medium">Instructions:</span> {booking.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}