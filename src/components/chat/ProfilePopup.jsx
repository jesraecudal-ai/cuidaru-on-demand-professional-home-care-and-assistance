import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Briefcase, Star, Award, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_BADGE_COLORS, formatDistance, calcDistance } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';

export default function ProfilePopup({ isOpen, onClose, senderEmail, senderRole, senderName }) {
  const navigate = useNavigate();
  const { profile: currentUserProfile } = useUserProfile();
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading] = useState(true);
  let distance = null;

  useEffect(() => {
    if (!isOpen || !senderEmail) { setLoading(false); return; }
    
    const loadProfile = async () => {
      try {
        setLoading(true);
        
        // If sender is a provider, fetch their ServiceProvider profile
        if (senderRole === 'provider') {
          const providers = await base44.entities.ServiceProvider.filter({ user_email: senderEmail });
          if (providers.length > 0) {
            setProviderData(providers[0]);
            // Calculate distance if both have location
            if (currentUserProfile?.latitude && currentUserProfile?.longitude && 
                providers[0]?.latitude && providers[0]?.longitude) {
              distance = calcDistance(currentUserProfile.latitude, currentUserProfile.longitude, 
                                     providers[0].latitude, providers[0].longitude);
            }
          }
        } else {
          // For clients, we just show basic info (no ServiceProvider data)
          setProviderData(null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isOpen, senderEmail, senderRole]);

  const isClient = senderRole === 'client';
  const badgeColor = providerData ? CATEGORY_BADGE_COLORS[providerData.category] || 'bg-gray-100 text-gray-700 border-gray-200' : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-400 text-sm">Loading profile...</div>
          </div>
        ) : isClient ? (
          // Client profile - read-only
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Client Profile</DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
                {senderName?.[0] || '?'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{senderName}</h3>
                <p className="text-xs text-gray-500">{senderEmail}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 text-center py-4 bg-gray-50 rounded-lg">
              Client profile information is limited for privacy.
            </p>
          </div>
        ) : providerData ? (
          // Provider profile - with booking button
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Provider Profile</DialogTitle>
            </DialogHeader>
            
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden flex-shrink-0">
                {providerData.avatar_url ? (
                  <img src={providerData.avatar_url} alt={providerData.full_name} className="w-full h-full object-cover" />
                ) : (
                  providerData.full_name?.[0]
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{providerData.full_name}</h3>
                {providerData.category && (
                  <Badge variant="outline" className={`text-xs mt-1 ${badgeColor}`}>
                    {providerData.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Location & Experience */}
            <div className="space-y-2">
              {providerData.location_text && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {providerData.location_text}
                </div>
              )}
              {distance !== null && (
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <MapPin className="w-4 h-4" />
                  {formatDistance(distance)} away
                </div>
              )}
              {providerData.experience_years > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {providerData.experience_years} years experience
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-0.5">
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-sm font-bold text-gray-900">{providerData.average_rating?.toFixed(1) || '—'}</p>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-0.5">
                  <Award className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-sm font-bold text-gray-900">{providerData.total_jobs || 0}</p>
                <p className="text-xs text-gray-500">Jobs</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <div className="flex justify-center mb-0.5">
                  <Clock className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-sm font-bold text-gray-900">{providerData.total_reviews || 0}</p>
                <p className="text-xs text-gray-500">Reviews</p>
              </div>
            </div>

            {/* Bio */}
            {providerData.bio && (
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                {providerData.bio}
              </div>
            )}

            {/* Skills */}
            {providerData.skills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-700 mb-2">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {providerData.skills.slice(0, 4).map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rates */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Hourly</p>
                <p className="text-sm font-bold text-blue-700">${providerData.hourly_rate || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Daily</p>
                <p className="text-sm font-bold text-blue-700">${providerData.daily_rate || '—'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Weekly</p>
                <p className="text-sm font-bold text-blue-700">${providerData.weekly_rate || '—'}</p>
              </div>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => {
                onClose();
                navigate(`/provider/${providerData.id}`);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Full Profile & Book
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="text-gray-400 text-sm">Profile not found</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}