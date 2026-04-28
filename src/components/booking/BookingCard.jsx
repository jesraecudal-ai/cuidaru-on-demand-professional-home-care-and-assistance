import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, DollarSign, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';
import { BOOKING_STATUSES, COUNTRY_SETTINGS } from '@/lib/constants';

export default function BookingCard({ booking, isProvider, onAction }) {
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
              <Badge variant="outline" className="text-xs">
                {booking.payment_status?.replace('_', ' ')}
              </Badge>
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
              <p className="text-xs text-gray-400">{booking.platform_fee_pct}% fee • {country.symbol}{booking.platform_fee?.toFixed(2)}</p>
            </div>
            <div className="flex sm:justify-end flex-wrap gap-2">
              {/* Provider actions */}
              {isProvider && booking.status === 'pending_approval' && (
                <>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => onAction(booking.id, 'accepted', booking)}>Accept</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => onAction(booking.id, 'cancelled', booking)}>Decline</Button>
                </>
              )}
              {isProvider && booking.status === 'paid_confirmed' && (
                <Button size="sm" className="h-8 text-xs bg-purple-600 hover:bg-purple-700" onClick={() => onAction(booking.id, 'in_progress', booking)}>Start Job</Button>
              )}
              {isProvider && booking.status === 'in_progress' && (
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onAction(booking.id, 'completed', booking)}>Mark Complete</Button>
              )}
              {/* Client actions */}
              {!isProvider && booking.status === 'accepted' && booking.payment_status === 'unpaid' && (
                <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => onAction(booking.id, 'pay', booking)}>
                  <DollarSign className="w-3 h-3 mr-1" /> Pay {country.symbol}{booking.total_amount?.toFixed(2)}
                </Button>
              )}
              {!isProvider && booking.status === 'completed' && booking.payment_status === 'release_pending' && (
                <Button size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => onAction(booking.id, 'release', booking)}>
                  Release Payment
                </Button>
              )}
              {!isProvider && ['completed','release_pending'].includes(booking.status) && booking.payment_status !== 'disputed' && (
                <Button size="sm" variant="outline" className="h-8 text-xs text-orange-600 border-orange-200" onClick={() => onAction(booking.id, 'dispute', booking)}>
                  Dispute
                </Button>
              )}
              {!isProvider && booking.status === 'pending_approval' && (
                <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200" onClick={() => onAction(booking.id, 'cancelled', booking)}>Cancel</Button>
              )}
            </div>
            {/* Auto-release timer */}
            {booking.auto_release_at && booking.payment_status === 'release_pending' && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Auto-releases: {format(new Date(booking.auto_release_at), 'MMM d, HH:mm')}
              </p>
            )}
          </div>
        </div>
        {booking.instructions && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500"><span className="font-medium">Instructions:</span> {booking.instructions}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}