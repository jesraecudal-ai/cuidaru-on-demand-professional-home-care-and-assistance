import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';

export default function ConsultationCard({ consultation, onChat, onPay, isDoctor }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const paymentColors = {
    unpaid: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800'
  };

  const otherPerson = isDoctor ? consultation.client_name : consultation.doctor_name;
  const otherEmail = isDoctor ? consultation.client_email : consultation.doctor_email;

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-gray-400" />
              <p className="font-semibold text-gray-900">{otherPerson}</p>
            </div>
            <p className="text-xs text-gray-500">{otherEmail}</p>
          </div>
          <div className="flex gap-1">
            <Badge className={`text-xs border-0 ${statusColors[consultation.status]}`}>
              {consultation.status}
            </Badge>
            <Badge className={`text-xs border-0 ${paymentColors[consultation.payment_status]}`}>
              {consultation.payment_status}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {format(new Date(consultation.scheduled_date), 'MMM d, yyyy')}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {format(new Date(consultation.scheduled_date), 'h:mm a')} ({consultation.duration_minutes} min)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-semibold">${consultation.fee.toFixed(2)}</span>
            <span className="text-xs">•</span>
            <span className="text-gray-500">{consultation.consultation_type}</span>
          </div>
        </div>

        {consultation.notes && (
          <div className="bg-gray-50 p-2 rounded mb-3 text-sm text-gray-700 text-xs">
            {consultation.notes}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onChat(consultation)}
            className="flex-1 gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5" /> Chat
          </Button>
          {consultation.payment_status === 'unpaid' && !isDoctor && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => onPay(consultation)}
            >
              Pay ${consultation.fee.toFixed(2)}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}