import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCategoryConfig } from '../shared/CategoryBadge';

const CATEGORIES = [
  'assistant_nurse', 'nurse', 'doctor', 'cleaner',
  'nanny', 'laundry_worker', 'caregiver', 'errand_person'
];

export default function ProviderFilters({ filters, onFilterChange }) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, skill, or location..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="pl-10 h-12 bg-card"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.category}
          onValueChange={(v) => onFilterChange({ ...filters, category: v })}
        >
          <SelectTrigger className="w-48 bg-card">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => {
              const config = getCategoryConfig(cat);
              return (
                <SelectItem key={cat} value={cat}>
                  {config.label}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        <Select
          value={filters.sortBy}
          onValueChange={(v) => onFilterChange({ ...filters, sortBy: v })}
        >
          <SelectTrigger className="w-44 bg-card">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="experience">Most Experienced</SelectItem>
            <SelectItem value="reviews">Most Reviews</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.availability}
          onValueChange={(v) => onFilterChange({ ...filters, availability: v })}
        >
          <SelectTrigger className="w-40 bg-card">
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="available">Available Now</SelectItem>
          </SelectContent>
        </Select>

        {(filters.category !== 'all' || filters.search || filters.availability !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFilterChange({ search: '', category: 'all', sortBy: 'rating', availability: 'all' })}
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}