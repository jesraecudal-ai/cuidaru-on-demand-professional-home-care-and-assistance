import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Save, RefreshCw, DollarSign, Percent, Users, Briefcase } from 'lucide-react';
import { COUNTRY_SETTINGS } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';

const COUNTRIES = [
  { key: 'brazil', label: 'Brazil 🇧🇷', currency: 'BRL', symbol: 'R$' },
  { key: 'uruguay', label: 'Uruguay 🇺🇾', currency: 'UYU', symbol: '$U' },
  { key: 'usa', label: 'United States 🇺🇸', currency: 'USD', symbol: '$' },
  { key: 'canada', label: 'Canada 🇨🇦', currency: 'CAD', symbol: 'C$' },
];

function CountryPricingCard({ country, existing, onSave, saving }) {
  const defaults = COUNTRY_SETTINGS[country.key];
  const [values, setValues] = useState({
    fee_pct: existing?.fee_pct ?? defaults.fee_pct,
    sub_client: existing?.sub_client ?? defaults.sub_client,
    sub_provider: existing?.sub_provider ?? defaults.sub_provider,
  });

  // Sync when existing changes
  React.useEffect(() => {
    if (existing) {
      setValues({
        fee_pct: existing.fee_pct,
        sub_client: existing.sub_client,
        sub_provider: existing.sub_provider,
      });
    }
  }, [existing?.id]);

  const handleSave = () => {
    const parsed = {
      fee_pct: parseFloat(values.fee_pct),
      sub_client: parseFloat(values.sub_client),
      sub_provider: parseFloat(values.sub_provider),
    };
    if (Object.values(parsed).some(isNaN)) {
      toast.error('All fields must be valid numbers');
      return;
    }
    onSave(country.key, existing?.id, { ...parsed, country: country.key, currency: country.currency, symbol: country.symbol });
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">{country.label.split(' ')[1]}</span>
          <div>
            <p className="text-base font-bold text-gray-900">{country.label.split(' ')[0]}</p>
            <p className="text-xs font-normal text-gray-400">{country.currency} · {country.symbol}</p>
          </div>
          {existing && <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Saved</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1.5"><Percent className="w-3.5 h-3.5 text-blue-500" /> Platform Fee (%)</Label>
          <Input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={values.fee_pct}
            onChange={e => setValues(v => ({ ...v, fee_pct: e.target.value }))}
            className="h-9"
          />
          <p className="text-xs text-gray-400 mt-1">Deducted from provider payout on each completed booking</p>
        </div>

        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1.5"><Users className="w-3.5 h-3.5 text-purple-500" /> Client Premium ({country.symbol}/month)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={values.sub_client}
            onChange={e => setValues(v => ({ ...v, sub_client: e.target.value }))}
            className="h-9"
          />
          <p className="text-xs text-gray-400 mt-1">Subscription for clients (priority provider access)</p>
        </div>

        <div>
          <Label className="flex items-center gap-1.5 text-sm mb-1.5"><Briefcase className="w-3.5 h-3.5 text-amber-500" /> Provider Premium ({country.symbol}/month)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={values.sub_provider}
            onChange={e => setValues(v => ({ ...v, sub_provider: e.target.value }))}
            className="h-9"
          />
          <p className="text-xs text-gray-400 mt-1">Subscription for providers (priority listing)</p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full h-9 bg-blue-600 hover:bg-blue-700 gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Pricing'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminPricing() {
  const { user, loading: userLoading } = useUserProfile();
  const queryClient = useQueryClient();
  const [savingCountry, setSavingCountry] = useState(null);

  const { data: pricingSettings = [], isLoading } = useQuery({
    queryKey: ['pricingSettings'],
    queryFn: () => base44.entities.PricingSettings.list(),
  });

  if (userLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-lg">Access denied. Admins only.</p>
      </div>
    );
  }

  const handleSave = async (countryKey, existingId, data) => {
    setSavingCountry(countryKey);
    try {
      if (existingId) {
        await base44.entities.PricingSettings.update(existingId, data);
      } else {
        await base44.entities.PricingSettings.create(data);
      }
      await queryClient.invalidateQueries({ queryKey: ['pricingSettings'] });
      toast.success(`Pricing for ${countryKey} saved!`);
    } catch (e) {
      toast.error('Failed to save: ' + e.message);
    } finally {
      setSavingCountry(null);
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Reset all countries to default values?')) return;
    setSavingCountry('all');
    try {
      const existing = await base44.entities.PricingSettings.list();
      await Promise.all(existing.map(r => base44.entities.PricingSettings.delete(r.id)));
      await queryClient.invalidateQueries({ queryKey: ['pricingSettings'] });
      toast.success('All pricing reset to defaults');
    } finally {
      setSavingCountry(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Pricing Management</h1>
          </div>
          <p className="text-gray-500 text-sm">Configure platform fees and subscription prices per country. Changes apply immediately across the app.</p>
        </div>
        <Button variant="outline" onClick={handleResetAll} disabled={!!savingCountry} className="gap-2 text-red-600 border-red-200 hover:bg-red-50">
          <RefreshCw className="w-4 h-4" /> Reset to Defaults
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {COUNTRIES.map(c => {
          const saved = pricingSettings.find(p => p.country === c.key);
          const data = saved || COUNTRY_SETTINGS[c.key];
          return (
            <div key={c.key} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-400 mb-1">{c.label}</p>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-gray-900 text-sm">{data.fee_pct}% fee</span>
              </div>
              <p className="text-xs text-gray-500">Provider sub: {c.symbol}{data.sub_provider}/mo</p>
              {saved && <span className="text-[10px] text-green-600 font-medium">● Custom</span>}
              {!saved && <span className="text-[10px] text-gray-400">● Default</span>}
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-72 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {COUNTRIES.map(country => (
            <CountryPricingCard
              key={country.key}
              country={country}
              existing={pricingSettings.find(p => p.country === country.key)}
              onSave={handleSave}
              saving={savingCountry === country.key || savingCountry === 'all'}
            />
          ))}
        </div>
      )}
    </div>
  );
}