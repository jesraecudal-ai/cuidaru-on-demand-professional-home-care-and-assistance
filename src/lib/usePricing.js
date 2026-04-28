import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { COUNTRY_SETTINGS } from './constants';

/**
 * Returns the effective pricing for a given country.
 * Falls back to COUNTRY_SETTINGS defaults if no admin override exists.
 */
export function usePricing(country = 'brazil') {
  const { data: pricingSettings = [] } = useQuery({
    queryKey: ['pricingSettings'],
    queryFn: () => base44.entities.PricingSettings.list(),
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  const saved = pricingSettings.find(p => p.country === country);
  const defaults = COUNTRY_SETTINGS[country] || COUNTRY_SETTINGS.brazil;

  return {
    ...defaults,
    fee_pct: saved?.fee_pct ?? defaults.fee_pct,
    sub_client: saved?.sub_client ?? defaults.sub_client,
    sub_provider: saved?.sub_provider ?? defaults.sub_provider,
  };
}