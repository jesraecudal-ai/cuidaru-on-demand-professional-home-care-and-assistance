import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, DollarSign, User, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';

const STATUS_STYLES = {
  pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  confirmed: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
  in_progress: { color: 'bg-primary/10 text-primary border-primary/20', icon: Clock },
  completed: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
  disputed: { color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
};

const PAYMENT_STYLES = {
  held: 'bg-amber-50 text-amber-700',
  released: 'bg-emerald-50 text-emerald-700',
  refunded: 'bg-red-50 text-red-700',
};

export default function BookingCard({ booking, isProvider, onAction }) {
  const { t } = useI18n();
  const status = STATUS_STYLES[booking.status] || STATUS_STYLES.pending;
  const StatusIcon = status.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <CategoryBadge category={booking.category} />
              <Badge variant="outline" className={status.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {t(`status_${booking.status?.replace(' ', '_')}`) || booking.status}
              </Badge>
              <Badge variant="outline" className={PAYMENT_STYLES[booking.payment_status]}>
                <DollarSign className="w-3 h-3 mr-1" />
                {t(`payment_${booking.payment_status}`) || booking.payment_status}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">
                  {isProvider ? booking.client_name : booking.provider_name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {booking.start_date && format(new Date(booking.start_date), 'MMM d, yyyy')}
                {booking.end_date && booking.end_date !== booking.start_date && (
                  <> — {format(new Date(booking.end_date), 'MMM d, yyyy')}</>
                )}
              </div>
              {booking.address && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" /> {booking.address}
                </div>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div>
              <span className="text-2xl font-bold">${booking.total_amount?.toFixed(2)}</span>
              <p className="text-xs text-muted-foreground">
                {booking.booking_type} @ ${booking.rate_applied}/{booking.booking_type === 'hourly' ? 'hr' : booking.booking_type === 'daily' ? 'day' : 'wk'}
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              {isProvider && booking.status === 'pending' && (
                <>
                  <Button size="sm" onClick={() => onAction(booking.id, 'confirmed')}>{t('accept')}</Button>
                  <Button size="sm" variant="outline" onClick={() => onAction(booking.id, 'cancelled')}>{t('decline')}</Button>
                </>
              )}
              {isProvider && booking.status === 'confirmed' && (
                <Button size="sm" onClick={() => onAction(booking.id, 'in_progress')}>{t('start_job')}</Button>
              )}
              {isProvider && booking.status === 'in_progress' && (
                <Button size="sm" onClick={() => onAction(booking.id, 'completed')}>{t('mark_complete')}</Button>
              )}
              {!isProvider && booking.status === 'completed' && booking.payment_status === 'held' && (
                <Button size="sm" onClick={() => onAction(booking.id, 'release')}>{t('release_payment')}</Button>
              )}
              {!isProvider && booking.status === 'pending' && (
                <Button size="sm" variant="outline" onClick={() => onAction(booking.id, 'cancelled')}>{t('cancel')}</Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}