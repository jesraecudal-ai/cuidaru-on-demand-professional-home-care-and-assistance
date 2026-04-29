import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Calendar, MessageCircle, User } from 'lucide-react';

const tabs = [
  { label: 'Browse', path: '/browse', icon: Search },
  { label: 'Bookings', path: '/bookings', icon: Calendar },
  { label: 'Messages', path: '/messages', icon: MessageCircle },
  { label: 'Profile', path: '/my-profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ label, path, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-h-[56px] ${
              active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
            <span>{label}</span>
            {active && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-t-full" />}
          </Link>
        );
      })}
    </nav>
  );
}