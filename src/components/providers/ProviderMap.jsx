import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Fix leaflet default icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom avatar pin icon
function createAvatarIcon(avatarUrl, isPremium) {
  const borderColor = isPremium ? '#f59e0b' : '#3b82f6';
  const html = avatarUrl
    ? `<div style="
        width:48px;height:48px;border-radius:50%;border:3px solid ${borderColor};
        overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:#fff;
        position:relative;
      ">
        <img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />
        ${isPremium ? `<div style="position:absolute;bottom:-1px;right:-1px;background:#f59e0b;border-radius:50%;width:14px;height:14px;display:flex;align-items:center;justify-content:center;font-size:8px;">⚡</div>` : ''}
        <div style="
          position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
          width:0;height:0;border-left:6px solid transparent;
          border-right:6px solid transparent;border-top:8px solid ${borderColor};
        "></div>
      </div>`
    : `<div style="
        width:48px;height:48px;border-radius:50%;border:3px solid ${borderColor};
        background:${borderColor};box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        color:white;font-weight:700;font-size:18px;position:relative;
      ">
        ?
        <div style="
          position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);
          width:0;height:0;border-left:6px solid transparent;
          border-right:6px solid transparent;border-top:8px solid ${borderColor};
        "></div>
      </div>`;

  return L.divIcon({
    html,
    className: '',
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
  });
}

// Auto-fit map bounds to markers
function FitBounds({ providers, userLocation }) {
  const map = useMap();
  useEffect(() => {
    const points = providers
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude, p.longitude]);
    if (userLocation) points.push([userLocation.lat, userLocation.lon]);
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 13 });
    }
  }, [providers, userLocation]);
  return null;
}

export default function ProviderMap({ providers, userLocation }) {
  const mappableProviders = providers.filter(p => p.latitude && p.longitude);

  // Default center: South America
  const defaultCenter = [-20, -55];

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <MapContainer
        center={defaultCenter}
        zoom={4}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds providers={mappableProviders} userLocation={userLocation} />

        {/* User location dot */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={L.divIcon({
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3);"></div>`,
              className: '',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup><div className="text-sm font-medium text-blue-600">📍 Your location</div></Popup>
          </Marker>
        )}

        {/* Provider pins */}
        {mappableProviders.map(provider => (
          <Marker
            key={provider.id}
            position={[provider.latitude, provider.longitude]}
            icon={createAvatarIcon(provider.avatar_url, provider.is_premium)}
          >
            <Popup maxWidth={220} minWidth={200}>
              <div className="p-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 flex-shrink-0 bg-blue-50">
                    {provider.avatar_url
                      ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-lg">{provider.full_name?.[0]}</div>
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{provider.full_name}</div>
                    <div className="text-xs text-gray-500 capitalize">{provider.category?.replace('_', ' ')}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {provider.is_premium && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">⚡ Premium</span>}
                      {provider.verification_status === 'verified' && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">✓ Verified</span>}
                    </div>
                  </div>
                </div>

                {provider.average_rating > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{provider.average_rating.toFixed(1)}</span>
                    <span className="text-gray-400">({provider.total_reviews} reviews)</span>
                  </div>
                )}

                {provider.location_text && (
                  <p className="text-xs text-gray-500 mb-2 truncate">📍 {provider.location_text.split(' | ')[0]}</p>
                )}

                <Link to={`/provider/${provider.id}`}>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors">
                    View Profile →
                  </button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}