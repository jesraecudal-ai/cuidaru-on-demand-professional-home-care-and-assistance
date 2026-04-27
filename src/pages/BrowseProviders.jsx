import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ProviderCard from '../components/providers/ProviderCard';
import ProviderFilters from '../components/providers/ProviderFilters';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';

export default function BrowseProviders() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';

  const [filters, setFilters] = useState({
    search: '',
    category: initialCategory,
    sortBy: 'rating',
    availability: 'all',
  });

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: () => base44.entities.ServiceProvider.list(),
  });

  const filteredProviders = useMemo(() => {
    let result = [...providers];

    if (filters.category !== 'all') {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters.availability === 'available') {
      result = result.filter((p) => p.availability === 'available');
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.location?.toLowerCase().includes(q) ||
          p.skills?.some((s) => s.toLowerCase().includes(q)) ||
          p.bio?.toLowerCase().includes(q)
      );
    }

    switch (filters.sortBy) {
      case 'rating':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'price_low':
        result.sort((a, b) => (a.hourly_rate || 0) - (b.hourly_rate || 0));
        break;
      case 'price_high':
        result.sort((a, b) => (b.hourly_rate || 0) - (a.hourly_rate || 0));
        break;
      case 'experience':
        result.sort((a, b) => (b.experience_years || 0) - (a.experience_years || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.total_reviews || 0) - (a.total_reviews || 0));
        break;
    }

    return result;
  }, [providers, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Find Service Providers</h1>
        <p className="text-muted-foreground mt-1">
          Browse verified professionals for your needs
        </p>
      </div>

      <ProviderFilters filters={filters} onFilterChange={setFilters} />

      <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No providers found</h3>
          <p className="text-muted-foreground mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredProviders.map((provider, i) => (
            <ProviderCard key={provider.id} provider={provider} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}