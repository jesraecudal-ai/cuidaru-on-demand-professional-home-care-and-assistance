import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Search, User, Calendar, LogOut, Zap, Heart, Wallet, MessageCircle, AlertTriangle, Settings, ArrowDownCircle, ShieldCheck, GitBranch, Users, Briefcase, Info, HelpCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LanguagePicker from './LanguagePicker';
import { useI18n } from '@/lib/i18n';
import { useUserProfile } from '@/lib/useUserProfile';
import { Badge } from '@/components/ui/badge';
import NotificationBell from '@/components/notifications/NotificationBell';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useI18n();
  const { user, profile } = useUserProfile();

  const publicNavLinks = [
    { label: t('nav_find'), path: '/browse', icon: Search },
    { label: 'Job Board', path: '/jobs', icon: Briefcase },
  ];

  const authNavLinks = [
    { label: t('nav_find'), path: '/browse', icon: Search },
    { label: t('nav_bookings'), path: '/bookings', icon: Calendar },
    { label: 'Job Board', path: '/jobs', icon: Briefcase },
    { label: t('messages'), path: '/messages', icon: MessageCircle },
    { label: t('payments'), path: '/payments', icon: Wallet },
  ];

  const navLinks = user ? authNavLinks : publicNavLinks;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top)', paddingLeft: 'env(safe-area-inset-left)', paddingRight: 'env(safe-area-inset-right)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Cuidaru</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'} size="sm"
                className={isActive('/') ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900'}>
                Home
              </Button>
            </Link>
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}>
                <Button variant={isActive(link.path) ? 'default' : 'ghost'} size="sm"
                  className={isActive(link.path) ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900'}>
                  <link.icon className="w-4 h-4 mr-1.5" /> {link.label}
                </Button>
              </Link>
            ))}
            <Link to="/premium">
              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                <Zap className="w-4 h-4 mr-1.5" /> Cuidaru+
              </Button>
            </Link>
            <Link to="/about">
              <Button variant={isActive('/about') ? 'default' : 'ghost'} size="sm"
                className={isActive('/about') ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900'}>
                <Info className="w-4 h-4 mr-1.5" /> About
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant={isActive('/how-it-works') ? 'default' : 'ghost'} size="sm"
                className={isActive('/how-it-works') ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900'}>
                <HelpCircle className="w-4 h-4 mr-1.5" /> How It Works
              </Button>
            </Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            <LanguagePicker />
            {user && <NotificationBell />}
            {profile?.is_premium && <Badge className="bg-amber-100 text-amber-700 border-amber-300 text-xs gap-1"><Zap className="w-3 h-3" />Cuidaru+</Badge>}
            {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                    {user?.full_name?.[0] || 'U'}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user && <div className="px-3 py-2 text-xs text-gray-500 border-b">{user.email}</div>}
                <DropdownMenuItem asChild><Link to="/my-profile" className="gap-2"><User className="w-4 h-4" /> {t('my_profile')}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/bookings" className="gap-2"><Calendar className="w-4 h-4" /> {t('nav_bookings')}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/messages" className="gap-2"><MessageCircle className="w-4 h-4" /> {t('messages')}</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/payments" className="gap-2"><Wallet className="w-4 h-4" /> {t('payments')}</Link></DropdownMenuItem>
                {(profile?.role === 'provider' || profile?.role === 'both') && (
                  <DropdownMenuItem asChild><Link to="/payouts" className="gap-2 text-green-700"><ArrowDownCircle className="w-4 h-4" /> {t('payout_history')}</Link></DropdownMenuItem>
                )}
                <DropdownMenuItem asChild><Link to="/premium" className="gap-2 text-amber-600"><Zap className="w-4 h-4" /> Cuidaru+</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/affiliate" className="gap-2 text-purple-600"><GitBranch className="w-4 h-4" /> {t('affiliate')}</Link></DropdownMenuItem>
                {user?.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin/verifications" className="gap-2 text-blue-600"><ShieldCheck className="w-4 h-4" /> {t('verify_providers')}</Link></DropdownMenuItem>}
                {user?.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin/disputes" className="gap-2 text-orange-600"><AlertTriangle className="w-4 h-4" /> {t('disputes')}</Link></DropdownMenuItem>}
                {user?.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin/pricing" className="gap-2 text-blue-600"><Settings className="w-4 h-4" /> {t('manage_pricing')}</Link></DropdownMenuItem>}
                {user?.role === 'admin' && <DropdownMenuItem asChild><Link to="/admin/users" className="gap-2 text-indigo-600"><Users className="w-4 h-4" /> {t('admin')}</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()} className="gap-2 text-red-600">
                  <LogOut className="w-4 h-4" /> {t('nav_logout')}
                </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
                ) : (
                <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => base44.auth.redirectToLogin()} className="text-gray-600">
                  Login
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => base44.auth.redirectToLogin()}>
                  Sign Up
                </Button>
                </div>
                )}
                </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <LanguagePicker />
            {user && <NotificationBell />}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-gray-600">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {user ? (
            <>
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}>
                  <Button variant={isActive(link.path) ? 'default' : 'ghost'} className="w-full justify-start gap-2 text-sm">
                    <link.icon className="w-4 h-4" /> {link.label}
                  </Button>
                </Link>
              ))}
              <Link to="/premium" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-amber-600">
                  <Zap className="w-4 h-4" /> Cuidaru+
                </Button>
              </Link>
              <Link to="/messages" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm"><MessageCircle className="w-4 h-4" /> {t('messages')}</Button>
              </Link>
              <Link to="/payments" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm"><Wallet className="w-4 h-4" /> {t('payments')}</Button>
              </Link>
              {(profile?.role === 'provider' || profile?.role === 'both') && (
                <Link to="/payouts" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-green-700"><ArrowDownCircle className="w-4 h-4" /> {t('payout_history')}</Button>
                </Link>
              )}
              <Link to="/affiliate" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-purple-600"><GitBranch className="w-4 h-4" /> {t('affiliate')}</Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/verifications" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-blue-600"><ShieldCheck className="w-4 h-4" /> {t('verify_providers')}</Button>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/disputes" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-orange-600"><AlertTriangle className="w-4 h-4" /> {t('disputes')}</Button>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/pricing" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-blue-600"><Settings className="w-4 h-4" /> {t('manage_pricing')}</Button>
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin/users" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-indigo-600"><Users className="w-4 h-4" /> {t('admin')}</Button>
                </Link>
              )}
              <Link to="/my-profile" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm"><User className="w-4 h-4" /> {t('my_profile')}</Button>
              </Link>
              <Button variant="ghost" onClick={() => base44.auth.logout()} className="w-full justify-start gap-2 text-sm text-red-600">
                <LogOut className="w-4 h-4" /> {t('nav_logout')}
              </Button>
            </>
          ) : (
            <>
              <Link to="/browse" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/browse') ? 'default' : 'ghost'} className="w-full justify-start gap-2 text-sm">
                  <Search className="w-4 h-4" /> {t('nav_find')}
                </Button>
              </Link>
              <Link to="/premium" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-amber-600">
                  <Zap className="w-4 h-4" /> Cuidaru+
                </Button>
              </Link>
              <Link to="/about" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                  About
                </Button>
              </Link>
              <Link to="/careers" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2 text-sm">
                  {t('become_provider')}
                </Button>
              </Link>
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => { base44.auth.redirectToLogin(); setMobileOpen(false); }}>
                  Login
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { base44.auth.redirectToLogin(); setMobileOpen(false); }}>
                  Sign Up
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}