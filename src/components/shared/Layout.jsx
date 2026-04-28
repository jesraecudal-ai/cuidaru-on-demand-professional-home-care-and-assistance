import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Heart } from 'lucide-react';
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
      <footer className="bg-white border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-gray-900">CareBook</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{t('footer_tagline')}</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_clients')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/browse" className="block hover:text-blue-600">{t('footer_find')}</Link>
                <p>{t('footer_how')}</p>
                <p>{t('footer_safety')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_providers')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <Link to="/my-profile" className="block hover:text-blue-600">{t('footer_become')}</Link>
                <Link to="/premium" className="block hover:text-blue-600">Premium</Link>
                <p>{t('footer_resources')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">{t('footer_support')}</h4>
              <div className="space-y-2 text-sm text-gray-500">
                <p>{t('footer_help')}</p>
                <p>{t('footer_contact')}</p>
                <p>{t('footer_terms')}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <span>{t('footer_rights')}</span>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                <span className="text-xs text-gray-400">Powered by</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
              </div>
              <div className="flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-5 object-contain opacity-70" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain opacity-70" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-5 object-contain opacity-70" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" className="h-4 object-contain opacity-70" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="Google Pay" className="h-4 object-contain opacity-70" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}