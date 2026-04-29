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
                <p>{t('footer_resources')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_support')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/help" className="block hover:text-blue-600">{t('footer_help')}</Link>
                <Link to="/help" className="block hover:text-blue-600">Contact Support</Link>
                <Link to="/terms" className="block hover:text-blue-600">Terms & Conditions</Link>
                <Link to="/privacy" className="block hover:text-blue-600">Privacy Policy</Link>
              </div>
            </div>
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