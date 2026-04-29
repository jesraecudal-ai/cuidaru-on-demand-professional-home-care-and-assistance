import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import AnaChatbot from '@/components/ana/AnaChatbot';
import { Heart, MapPin, Shield, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/i18n';

export default function Layout() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <AnaChatbot />
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                   <Heart className="w-4 h-4 text-white" />
                 </div>
                 <span className="font-bold text-gray-900">Cuidaru</span>
               </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t('footer_tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_clients')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/browse" className="block hover:text-blue-600">{t('footer_find')}</Link>
                <Link to="/help" className="block hover:text-blue-600">How It Works</Link>
                <Link to="/help" className="block hover:text-blue-600">Safety & Reviews</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_providers')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/my-profile" className="block hover:text-blue-600">{t('footer_become')}</Link>
                <Link to="/premium" className="block hover:text-blue-600">Cuidaru+</Link>
                <Link to="/affiliate" className="block hover:text-blue-600">Affiliate Program</Link>
                <Link to="/payouts" className="block hover:text-blue-600">Provider Payouts</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_support')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/help" className="block hover:text-blue-600">{t('footer_help')}</Link>
                <Link to="/help" className="block hover:text-blue-600">Contact Support</Link>
                <Link to="/about" className="block hover:text-blue-600">About Cuidaru</Link>
                <Link to="/terms" className="block hover:text-blue-600">Terms & Conditions</Link>
                <Link to="/privacy" className="block hover:text-blue-600">Privacy Policy</Link>
              </div>
            </div>
          </div>
          {/* Social Media */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <a href="https://www.facebook.com/cuidaru" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors" aria-label="Facebook">
              <svg className="w-4 h-4 text-gray-600 hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/120974023" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors" aria-label="LinkedIn">
              <svg className="w-4 h-4 text-gray-600 hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>

            <a href="https://www.tiktok.com/@cuidaru.official" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors" aria-label="TikTok">
              <svg className="w-4 h-4 text-gray-600 hover:text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
            <a href="https://www.instagram.com/cuidaru.official" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors" aria-label="Instagram">
              <svg className="w-4 h-4 text-gray-600 hover:text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400 mb-4">
              <span>{t('footer_rights')}</span>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-400">Powered by</span>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                </div>
                <div className="flex items-center gap-3">
                  <img src="https://www.svgrepo.com/show/303513/visa-logo.svg" alt="Visa" className="h-4 object-contain opacity-70" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain opacity-70" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-5 object-contain opacity-70" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-4 object-contain opacity-70" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 object-contain opacity-70" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
                <Shield className="w-3.5 h-3.5 text-green-700" />
                <span className="text-xs font-semibold text-green-700">ISO 27001</span>
              </div>
              <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1">
                <Shield className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs font-semibold text-blue-700">SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-1">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                <span className="text-xs font-semibold text-purple-700">GDPR</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}