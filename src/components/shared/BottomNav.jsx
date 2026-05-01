import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Calendar, MessageCircle, User, LogIn } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useUserProfile } from '@/lib/useUserProfile';
import { base44 } from '@/api/base44Client';

export default function BottomNav() {
  const location = useLocation();
  const { t } = useI18n();
  const { user } = useUserProfile();

  const tabs = user 
    ? [
        { label: t('nav_find'), path: '/browse', icon: Search },
        { label: t('nav_bookings'), path: '/bookings', icon: Calendar },
        { label: t('messages'), path: '/messages', icon: MessageCircle },
        { label: t('nav_profile'), path: '/my-profile', icon: User },
      ]
    : [
        { label: t('nav_find'), path: '/browse', icon: Search },
        { label: 'Sign In', action: () => base44.auth.redirectToLogin(), icon: LogIn },
      ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ label, path, action, icon: Icon }) => {
        const active = path && location.pathname === path;
        const handleClick = action ? (e) => { e.preventDefault(); action(); } : undefined;
        
        if (action) {
          return (
            <button
              key={label}
              onClick={handleClick}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors min-h-[56px] text-gray-500 hover:text-gray-700`}
            >
              <Icon className="w-5 h-5 text-gray-400" />
              <span>{label}</span>
            </button>
          );
        }
        
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