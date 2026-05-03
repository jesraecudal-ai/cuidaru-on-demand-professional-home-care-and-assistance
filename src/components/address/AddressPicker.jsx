import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  URUGUAY_LOCATIONS,
  BRAZIL_LOCATIONS,
  USA_STATES,
  CANADA_PROVINCES,
} from '@/lib/locationData';

/**
 * AddressPicker — structured address form per country.
 *
 * Props:
 *   country    – 'brazil' | 'uruguay' | 'usa' | 'canada'
 *   value      – current address string (encoded)
 *   onChange   – (addressString) => void
 */

// Encode/decode helpers so the full address is stored as a single string
const encode = (parts) => parts.filter(Boolean).join(' | ');
const decode = (str = '') => {
  const p = str.split(' | ');
  return {
    state: p[0] || '',
    city: p[1] || '',
    street: p[2] || '',
    postal: p[3] || '',
  };
};

export default function AddressPicker({ country, value, onChange }) {
  const decoded = decode(value);
  const [state, setState] = useState(decoded.state);
  const [city, setCity] = useState(decoded.city);
  const [street, setStreet] = useState(decoded.street);
  const [postal, setPostal] = useState(decoded.postal);

  // Sync if value changes externally (e.g. on profile load)
  useEffect(() => {
    const d = decode(value);
    setState(d.state);
    setCity(d.city);
    setStreet(d.street);
    setPostal(d.postal);
  }, [value]);

  const emit = (s, c, st, p) => {
    onChange(encode([s, c, st, p]));
  };

  const handleState = (val) => {
    setState(val);
    setCity('');
    emit(val, '', street, postal);
  };
  const handleCity = (val) => {
    setCity(val);
    emit(state, val, street, postal);
  };
  const handleStreet = (e) => {
    setStreet(e.target.value);
    emit(state, city, e.target.value, postal);
  };
  const handlePostal = (e) => {
    setPostal(e.target.value);
    emit(state, city, street, e.target.value);
  };

  // --- labels per country ---
  const stateLabel = country === 'uruguay' ? 'Department' : country === 'canada' ? 'Province' : 'State';
  const cityLabel = country === 'uruguay' ? 'City / Neighbourhood' : 'City';
  const postalLabel = country === 'brazil' ? 'CEP' : country === 'uruguay' ? 'CP (Postal Code)' : 'Postal Code';
  const streetPlaceholder =
    country === 'uruguay' ? 'e.g. Av. 18 de Julio 1234, Apto 5B'
    : country === 'brazil' ? 'ex: Rua das Flores, 123, Apto 4'
    : 'e.g. 123 Main St, Apt 4B';
  const postalPlaceholder =
    country === 'brazil' ? '00000-000'
    : country === 'usa' ? '10001'
    : country === 'canada' ? 'A1A 1A1'
    : '11000';

  // --- state/region options per country ---
  const stateOptions = (() => {
    if (country === 'uruguay') return Object.keys(URUGUAY_LOCATIONS);
    if (country === 'brazil') return Object.keys(BRAZIL_LOCATIONS);
    if (country === 'usa') return USA_STATES;
    if (country === 'canada') return CANADA_PROVINCES;
    return [];
  })();

  // --- city options (dropdowns only for Uruguay and Brazil) ---
  const cityOptions = (() => {
    if (country === 'uruguay') return state ? (URUGUAY_LOCATIONS[state] || []) : [];
    if (country === 'brazil') return state ? (BRAZIL_LOCATIONS[state] || []) : [];
    return null; // null = use text input
  })();

  return (
    <div className="space-y-3">
      {/* State / Department / Province */}
      <div>
        <Label className="text-sm">{stateLabel} *</Label>
        <Select value={state} onValueChange={handleState}>
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder={`Select ${stateLabel.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {stateOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* City — dropdown for UY/BR, text input for USA/CA */}
      <div>
        <Label className="text-sm">{cityLabel} *</Label>
        {cityOptions !== null ? (
          <Select value={city} onValueChange={handleCity} disabled={!state}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder={state ? `Select ${cityLabel.toLowerCase()}` : `Pick ${stateLabel.toLowerCase()} first`} />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={city}
            onChange={e => handleCity(e.target.value)}
            placeholder={country === 'usa' ? 'e.g. Austin' : 'e.g. Toronto'}
            className="mt-1.5"
          />
        )}
      </div>

      {/* Street address */}
      <div>
        <Label className="text-sm">Street Address</Label>
        <Input
          value={street}
          onChange={handleStreet}
          placeholder={streetPlaceholder}
          className="mt-1.5"
        />
      </div>

      {/* Postal / ZIP code */}
      <div>
        <Label className="text-sm">{postalLabel}</Label>
        <Input
          value={postal}
          onChange={handlePostal}
          placeholder={postalPlaceholder}
          className="mt-1.5 max-w-[160px]"
        />
      </div>
    </div>
  );
}