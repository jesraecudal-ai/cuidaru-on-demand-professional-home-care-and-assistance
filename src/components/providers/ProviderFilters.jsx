import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/constants';

export default function ProviderFilters({ filters, onFilterChange }) {
  const { t } = useI18n();

  const hasActive = filters.category !== 'all' || filters.search || filters.availability !== 'all';

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

        {hasActive && (
          <Button variant="ghost" size="sm" className="text-gray-500"
            onClick={() => onFilterChange({ search: '', category: 'all', availability: 'all' })}>
            {t('clear_filters')}
          </Button>
        )}
      </div>
    </div>
  );
}