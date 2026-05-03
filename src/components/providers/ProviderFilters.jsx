import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/constants';
import { URUGUAY_LOCATIONS, BRAZIL_LOCATIONS, USA_STATES, CANADA_PROVINCES } from '@/lib/locationData';

export default function ProviderFilters({ filters, onFilterChange, country }) {
  const { t } = useI18n();

  const hasActive = filters.category !== 'all' || filters.search || filters.availability !== 'all' || filters.state || filters.city;

  // State options based on country
  const stateOptions = (() => {
    if (country === 'uruguay') return Object.keys(URUGUAY_LOCATIONS);
    if (country === 'brazil') return Object.keys(BRAZIL_LOCATIONS);
    if (country === 'usa') return USA_STATES;
    if (country === 'canada') return CANADA_PROVINCES;
    return [];
  })();

  // City options (only for Uruguay/Brazil with dropdown data)
  const cityOptions = (() => {
    if (country === 'uruguay' && filters.state) return URUGUAY_LOCATIONS[filters.state] || [];
    if (country === 'brazil' && filters.state) return BRAZIL_LOCATIONS[filters.state] || [];
    return null;
  })();

  const stateLabel = country === 'uruguay' ? 'Department' : country === 'canada' ? 'Province' : 'State';

  const handleStateChange = (val) => {
    onFilterChange({ ...filters, state: val === 'all' ? '' : val, city: '' });
  };
  const handleCityChange = (val) => {
    onFilterChange({ ...filters, city: val === 'all' ? '' : val });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder={t('search_placeholder')}
          value={filters.search}
          onChange={e => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 h-12 bg-white border-gray-200"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Select value={filters.category} onValueChange={v => onFilterChange({ ...filters, category: v })}>
          <SelectTrigger className="w-52 bg-white border-gray-200">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-400" />
            <SelectValue placeholder={t('all_categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_categories')}</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.key} value={cat.key}>
                {cat.icon} {t(`cat_${cat.key}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.availability} onValueChange={v => onFilterChange({ ...filters, availability: v })}>
          <SelectTrigger className="w-44 bg-white border-gray-200">
            <SelectValue placeholder={t('availability')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="available">{t('available_now')}</SelectItem>
          </SelectContent>
        </Select>

        {/* State / Department / Province filter */}
        {stateOptions.length > 0 && (
          <Select value={filters.state || 'all'} onValueChange={handleStateChange}>
            <SelectTrigger className="w-48 bg-white border-gray-200">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              <SelectValue placeholder={`All ${stateLabel}s`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {stateLabel}s</SelectItem>
              {stateOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {/* City filter — only when state is selected and city data exists */}
        {cityOptions && filters.state && (
          <Select value={filters.city || 'all'} onValueChange={handleCityChange}>
            <SelectTrigger className="w-44 bg-white border-gray-200">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        {hasActive && (
          <Button variant="ghost" size="sm" className="text-gray-500"
            onClick={() => onFilterChange({ search: '', category: 'all', availability: 'all', state: '', city: '' })}>
            {t('clear_filters')}
          </Button>
        )}
      </div>
    </div>
  );
}