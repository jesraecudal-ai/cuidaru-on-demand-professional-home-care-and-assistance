import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Bell, Check, Calendar, MessageCircle, DollarSign, AlertTriangle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS = {
  booking_accepted: <Calendar className="w-4 h-4 text-green-500" />,
  booking_pending: <Calendar className="w-4 h-4 text-blue-500" />,
  booking_cancelled: <Calendar className="w-4 h-4 text-red-500" />,
  message_received: <MessageCircle className="w-4 h-4 text-purple-500" />,
  payment_released: <DollarSign className="w-4 h-4 text-emerald-500" />,
  dispute_filed: <AlertTriangle className="w-4 h-4 text-orange-500" />,
};

export default function NotificationDropdown({ notifications, onMarkAllRead, onClose }) {
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleClick = async (notif) => {
    if (!notif.is_read) {
      await base44.entities.Notification.update(notif.id, { is_read: true });
    }
    onClose();
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="font-semibold text-gray-900 text-sm">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={onMarkAllRead} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
            <Check className="w-3 h-3" /> Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map(notif => (
            <Link
              key={notif.id}
              to={notif.link || '/'}
              onClick={() => handleClick(notif)}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
            >
              <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                {TYPE_ICONS[notif.type] || <Bell className="w-4 h-4 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                  {notif.title}
                </p>
                {notif.body && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.body}</p>}
                <p className="text-[11px] text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                </p>
              </div>
              {!notif.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}