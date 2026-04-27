import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { base44 } from '@/api/base44Client';

export default function Layout() {
  const [user, setUser] = useState(null);

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
              <h4 className="font-semibold mb-3">For Clients</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>How it works</p>
                <p>Find providers</p>
                <p>Safety & Trust</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">For Providers</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Become a provider</p>
                <p>Resources</p>
                <p>Community</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Help center</p>
                <p>Contact us</p>
                <p>Terms of service</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">CareBook</h4>
              <p className="text-sm text-muted-foreground">Trusted marketplace for healthcare & home service professionals.</p>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2026 CareBook. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}