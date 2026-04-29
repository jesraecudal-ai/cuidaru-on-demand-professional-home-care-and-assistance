import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  URUGUAY_LOCATIONS,
  BRAZIL_LOCATIONS,
  USA_STATES,
  CANADA_PROVINCES,
  PHILIPPINES_REGIONS,
} from '@/lib/locationData';

/**
 * Props:
 *  country       – 'brazil' | 'uruguay' | 'usa' | 'canada'
 *  locationText  – current text value
 *  latitude      – current lat
 *  longitude     – current lng
 *  onChange      – ({ location_text, latitude, longitude }) => void
 */
export default function LocationPicker({ country, locationText, latitude, longitude, onChange }) {
  const [geoLoading, setGeoLoading] = useState(false);

  // ---- Uruguay ----
  const uruguayDepts = Object.keys(URUGUAY_LOCATIONS);
  const [uyDept, setUyDept] = useState(() => {
    if (country !== 'uruguay' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return uruguayDepts.find(d => parts.includes(d)) || '';
  });
  const [uyCity, setUyCity] = useState(() => {
    if (country !== 'uruguay' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return parts[0] || '';
  });

  // ---- Brazil ----
  const brazilStates = Object.keys(BRAZIL_LOCATIONS);
  const [brState, setBrState] = useState(() => {
    if (country !== 'brazil' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return brazilStates.find(s => parts.some(p => s.includes(p))) || '';
  });
  const [brCity, setBrCity] = useState(() => {
    if (country !== 'brazil' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return parts[0] || '';
  });

  // ---- Philippines ----
  const philippineRegions = Object.keys(PHILIPPINES_REGIONS);
  const [phRegion, setPhRegion] = useState(() => {
    if (country !== 'philippines' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return philippineRegions.find(r => parts.includes(r)) || '';
  });
  const [phCity, setPhCity] = useState(() => {
    if (country !== 'philippines' || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return parts[0] || '';
  });

  // ---- USA / Canada ----
  const [regionValue, setRegionValue] = useState(() => {
    if (!['usa', 'canada'].includes(country) || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return parts[1] || '';
  });
  const [cityText, setCityText] = useState(() => {
    if (!['usa', 'canada'].includes(country) || !locationText) return '';
    const parts = locationText.split(',').map(s => s.trim());
    return parts[0] || '';
  });

  // ---- Extra / exact address ----
  const [exactAddress, setExactAddress] = useState(() => {
    if (!locationText) return '';
    // The exact address is stored after the first comma-separated structured part
    const parts = locationText.split(' | ');
    return parts[1] || '';
  });

  const buildText = ({ dept, city, state, region, ctCity, exact } = {}) => {
    let base = '';
    if (country === 'uruguay') {
      const d = dept ?? uyDept;
      const c = city ?? uyCity;
      base = [c, d].filter(Boolean).join(', ');
    } else if (country === 'brazil') {
      const s = state ?? brState;
      const c = city ?? brCity;
      base = [c, s].filter(Boolean).join(', ');
    } else if (country === 'philippines') {
      const r = region ?? phRegion;
      const c = ctCity ?? phCity;
      base = [c, r].filter(Boolean).join(', ');
    } else {
      const r = region ?? regionValue;
      const c = ctCity ?? cityText;
      base = [c, r].filter(Boolean).join(', ');
    }
    const ex = exact ?? exactAddress;
    return ex ? `${base} | ${ex}` : base;
  };

  const handleUyDept = (val) => {
    setUyDept(val);
    setUyCity('');
    onChange({ location_text: buildText({ dept: val, city: '' }), latitude, longitude });
  };
  const handleUyCity = (val) => {
    setUyCity(val);
    onChange({ location_text: buildText({ city: val }), latitude, longitude });
  };
  const handleBrState = (val) => {
    setBrState(val);
    setBrCity('');
    onChange({ location_text: buildText({ state: val, city: '' }), latitude, longitude });
  };
  const handleBrCity = (val) => {
    setBrCity(val);
    onChange({ location_text: buildText({ city: val }), latitude, longitude });
  };
  const handlePhRegion = (val) => {
    setPhRegion(val);
    setPhCity('');
    onChange({ location_text: buildText({ region: val, ctCity: '' }), latitude, longitude });
  };
  const handlePhCity = (val) => {
    setPhCity(val);
    onChange({ location_text: buildText({ ctCity: val }), latitude, longitude });
  };

  const handleRegion = (val) => {
    setRegionValue(val);
    onChange({ location_text: buildText({ region: val }), latitude, longitude });
  };
  const handleCtCity = (e) => {
    setCityText(e.target.value);
    onChange({ location_text: buildText({ ctCity: e.target.value }), latitude, longitude });
  };
  const handleExact = (e) => {
    setExactAddress(e.target.value);
    onChange({ location_text: buildText({ exact: e.target.value }), latitude, longitude });
  };

  const detectGPS = () => {
    setGeoLoading(true);
    navigator.geolocation?.getCurrentPosition(
      pos => {
        setGeoLoading(false);
        onChange({ location_text: locationText, latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast.success('GPS location saved!');
      },
      () => { setGeoLoading(false); toast.error('Location access denied'); }
    );
  };

  return (
    <div className="space-y-3">

      {/* ---- Uruguay ---- */}
      {country === 'uruguay' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Department *</Label>
            <Select value={uyDept} onValueChange={handleUyDept}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {uruguayDepts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">City / Neighbourhood *</Label>
            <Select value={uyCity} onValueChange={handleUyCity} disabled={!uyDept}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder={uyDept ? 'Select city' : 'Pick department first'} /></SelectTrigger>
              <SelectContent>
                {(URUGUAY_LOCATIONS[uyDept] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ---- Brazil ---- */}
      {country === 'brazil' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">State *</Label>
            <Select value={brState} onValueChange={handleBrState}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {brazilStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">City / Neighbourhood *</Label>
            <Select value={brCity} onValueChange={handleBrCity} disabled={!brState}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder={brState ? 'Select city' : 'Pick state first'} /></SelectTrigger>
              <SelectContent>
                {(BRAZIL_LOCATIONS[brState] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ---- USA ---- */}
      {country === 'usa' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">State *</Label>
            <Select value={regionValue} onValueChange={handleRegion}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent>
                {USA_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">City *</Label>
            <Input value={cityText} onChange={handleCtCity} placeholder="e.g. Austin" className="mt-1.5" />
          </div>
        </div>
      )}

      {/* ---- Canada ---- */}
      {country === 'canada' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Province *</Label>
            <Select value={regionValue} onValueChange={handleRegion}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select province" /></SelectTrigger>
              <SelectContent>
                {CANADA_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">City *</Label>
            <Input value={cityText} onChange={handleCtCity} placeholder="e.g. Toronto" className="mt-1.5" />
          </div>
        </div>
      )}

      {/* ---- Philippines ---- */}
      {country === 'philippines' && (
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label className="text-sm">Region *</Label>
            <Select value={phRegion} onValueChange={handlePhRegion}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select region" /></SelectTrigger>
              <SelectContent>
                {philippineRegions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">City *</Label>
            <Select value={phCity} onValueChange={handlePhCity} disabled={!phRegion}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder={phRegion ? 'Select city' : 'Pick region first'} /></SelectTrigger>
              <SelectContent>
                {(PHILIPPINES_REGIONS[phRegion] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* ---- Exact address (all countries) ---- */}
      <div>
        <Label className="text-sm">Exact address or reference <span className="text-gray-400">(optional)</span></Label>
        <Input
          value={exactAddress}
          onChange={handleExact}
          placeholder="e.g. Av. 18 de Julio 1234, Apt 5B"
          className="mt-1.5"
        />
      </div>

      {/* ---- GPS ---- */}
      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={detectGPS} disabled={geoLoading} className="gap-2">
          <MapPin className="w-3.5 h-3.5" />
          {geoLoading ? 'Getting GPS...' : 'Use GPS'}
        </Button>
        {latitude && (
          <span className="text-xs text-green-600">✓ GPS coordinates saved — helps clients find you by distance</span>
        )}
      </div>
    </div>
  );
}