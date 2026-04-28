import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { I18nProvider } from './lib/i18n';
import { Toaster as SonnerToaster } from 'sonner';
import Home from './pages/Home';
import BrowseProviders from './pages/BrowseProviders';
import ProviderProfile from './pages/ProviderProfile';
import Bookings from './pages/Bookings';
import MyProfile from './pages/MyProfile';
import Onboarding from './pages/Onboarding';
import Premium from './pages/Premium';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import AdminDisputes from './pages/AdminDisputes';
import AdminVerifications from './pages/AdminVerifications';
import AffiliateDashboard from './pages/AffiliateDashboard';
import AdminPricing from './pages/AdminPricing';
import ProviderPayouts from './pages/ProviderPayouts';
import TermsAndConditions from './pages/TermsAndConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Help from './pages/Help';
import Layout from './components/shared/Layout';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading CareBook...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <UserNotRegisteredError />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/help" element={<Help />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseProviders />} />
        <Route path="/provider/:id" element={<ProviderProfile />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin/disputes" element={<AdminDisputes />} />
        <Route path="/admin/pricing" element={<AdminPricing />} />
        <Route path="/admin/verifications" element={<AdminVerifications />} />
        <Route path="/affiliate" element={<AffiliateDashboard />} />
        <Route path="/payouts" element={<ProviderPayouts />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </QueryClientProvider>
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;