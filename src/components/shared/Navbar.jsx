import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, Calendar, Briefcase, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguagePicker from './LanguagePicker';
import { useI18n } from '@/lib/i18n';

export default function Navbar({ user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();

  const navLinks = [
    { label: t('nav_find'), path: '/browse', icon: Search },
    { label: t('nav_bookings'), path: '/bookings', icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">CareBook</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <Button
                  variant={isActive(link.path) ? 'default' : 'ghost'}
                  size="sm"
                  className="gap-2"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguagePicker />
            <Link to="/my-profile">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="w-4 h-4" />
                {user?.full_name || t('nav_profile')}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {user?.full_name?.[0] || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/my-profile" className="gap-2">
                    <User className="w-4 h-4" /> {t('my_profile')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/bookings" className="gap-2">
                    <Calendar className="w-4 h-4" /> {t('nav_bookings')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="gap-2 text-destructive">
                  <LogOut className="w-4 h-4" /> {t('nav_logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguagePicker />
            <button onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2 space-y-2">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
              <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="w-full justify-start gap-2">
                <link.icon className="w-4 h-4" /> {link.label}
              </Button>
            </Link>
          ))}
          <Link to="/my-profile" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <User className="w-4 h-4" /> {t('my_profile')}
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => base44.auth.logout()} className="w-full justify-start gap-2 text-destructive">
            <LogOut className="w-4 h-4" /> {t('nav_logout')}
          </Button>
        </div>
      )}
    </nav>
  );
}