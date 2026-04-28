import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProviderCard from '../components/providers/ProviderCard';
import ProviderFilters from '../components/providers/ProviderFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, MapPin } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { calcDistance, CATEGORIES } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';

export default function BrowseProviders() {
  const { t } = useI18n();
  const { profile } = useUserProfile();
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';

  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: initialCategory,
    availability: 'all',
  });

  // Get GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.ServiceProvider.list(),
  });

  const sortedProviders = useMemo(() => {
    let result = providers.filter(p => p.profile_complete !== false);

    // Filter
    if (filters.category !== 'all') result = result.filter(p => p.category === filters.category);
    if (filters.availability === 'available') result = result.filter(p => p.availability === 'available');
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p =>
        p.full_name?.toLowerCase().includes(q) ||
        p.location_text?.toLowerCase().includes(q) ||
        p.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Compute distances
    result = result.map(p => {
      let distance = null;
      if (userLocation && p.latitude && p.longitude) {
        distance = calcDistance(userLocation.lat, userLocation.lon, p.latitude, p.longitude);
      }
      return { ...p, _distance: distance };
    });

    // Smart sort: Premium first (by distance), then non-premium (by distance)
    const premium = result.filter(p => p.is_premium).sort((a, b) => {
      if (a._distance !== null && b._distance !== null) return a._distance - b._distance;
      return (b.average_rating || 0) - (a.average_rating || 0);
    });
    const nonPremium = result.filter(p => !p.is_premium).sort((a, b) => {
      if (a._distance !== null && b._distance !== null) return a._distance - b._distance;
      return (b.average_rating || 0) - (a.average_rating || 0);
    });

    return [...premium, ...nonPremium];
  }, [providers, filters, userLocation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('find_providers')}</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-1.5">
          {userLocation ? (
            <><MapPin className="w-4 h-4 text-blue-500" /> Showing nearest providers first</>
          ) : t('browse_verified')}
        </p>
      </div>

      <ProviderFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
        <Users className="w-4 h-4" />
        {sortedProviders.length} {sortedProviders.length === 1 ? t('provider_found') : t('providers_found')}
        {!userLocation && (
          <span className="text-xs text-blue-600 ml-2 cursor-pointer underline" onClick={() => navigator.geolocation?.getCurrentPosition(pos => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }))}>
            Enable location for distance sorting
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-80 rounded-xl" />)}
        </div>
      ) : sortedProviders.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700">{t('no_providers')}</h3>
          <p className="text-gray-400 mt-1">{t('no_providers_sub')}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {sortedProviders.map((provider, i) => (
            <ProviderCard key={provider.id} provider={provider} index={i} userLocation={userLocation} />
          ))}
        </div>
      )}
    </div>
  );
}