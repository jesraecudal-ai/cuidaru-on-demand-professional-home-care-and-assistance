import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';

export default function Layout() {
  const [user, setUser] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-3">{t('footer_clients')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t('footer_how')}</p>
                <p>{t('footer_find')}</p>
                <p>{t('footer_safety')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('footer_providers')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t('footer_become')}</p>
                <p>{t('footer_resources')}</p>
                <p>{t('footer_community')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">{t('footer_support')}</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t('footer_help')}</p>
                <p>{t('footer_contact')}</p>
                <p>{t('footer_terms')}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">CareBook</h4>
              <p className="text-sm text-muted-foreground">{t('footer_tagline')}</p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            {t('footer_rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}