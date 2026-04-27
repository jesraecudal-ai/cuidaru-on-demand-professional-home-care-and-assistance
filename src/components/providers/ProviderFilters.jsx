import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

const CATEGORIES = [
  'assistant_nurse', 'nurse', 'doctor', 'cleaner',
  'nanny', 'laundry_worker', 'caregiver', 'errand_person'
];

export default function ProviderFilters({ filters, onFilterChange }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t('search_placeholder')}
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 h-12 bg-card"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.category} onValueChange={(v) => onFilterChange({ ...filters, category: v })}>
          <SelectTrigger className="w-48 bg-card">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t('all_categories')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_categories')}</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{t(`cat_${cat}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(v) => onFilterChange({ ...filters, sortBy: v })}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder={t('sort_by')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">{t('sort_rating')}</SelectItem>
            <SelectItem value="price_low">{t('sort_price_low')}</SelectItem>
            <SelectItem value="price_high">{t('sort_price_high')}</SelectItem>
            <SelectItem value="experience">{t('sort_experience')}</SelectItem>
            <SelectItem value="reviews">{t('sort_reviews')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.availability} onValueChange={(v) => onFilterChange({ ...filters, availability: v })}>
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder={t('availability')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all')}</SelectItem>
            <SelectItem value="available">{t('available_now')}</SelectItem>
          </SelectContent>
        </Select>

        {(filters.category !== 'all' || filters.search || filters.availability !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ search: '', category: 'all', sortBy: 'rating', availability: 'all' })}
          >
            {t('clear_filters')}
          </Button>
        )}
      </div>
    </div>
  );
}