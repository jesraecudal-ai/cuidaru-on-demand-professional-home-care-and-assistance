import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, ShieldCheck, Star, Award, Clock, Zap } from 'lucide-react';
import BookingForm from '../components/booking/BookingForm';
import ReviewCard from '../components/reviews/ReviewCard';
import StartChatButton from '../components/chat/StartChatButton';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';
import { CATEGORY_BADGE_COLORS, formatDistance, calcDistance } from '@/lib/constants';
import { useUserProfile } from '@/lib/useUserProfile';

export default function ProviderProfile() {
  const { t } = useI18n();
  const { profile: clientProfile } = useUserProfile();
  const pathParts = window.location.pathname.split('/');
  const providerId = pathParts[pathParts.length - 1];

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => base44.entities.ServiceProvider.filter({ id: providerId }),
    enabled: !!providerId,
  });
  const provider = providers[0];

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => base44.entities.Review.filter({ provider_id: providerId }),
    enabled: !!providerId,
  });

  const badgeColor = provider ? CATEGORY_BADGE_COLORS[provider.category] || 'bg-gray-100 text-gray-700 border-gray-200' : '';

  // Distance (if client has location stored)
  let distance = null;
  if (clientProfile?.latitude && clientProfile?.longitude && provider?.latitude && provider?.longitude) {
    distance = calcDistance(clientProfile.latitude, clientProfile.longitude, provider.latitude, provider.longitude);
  }

  if (isLoading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );

  if (!provider) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h2 className="text-2xl font-bold text-gray-700">{t('not_found')}</h2>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {provider.is_premium && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 text-amber-700 text-sm font-medium">
          <Zap className="w-4 h-4" /> Premium Provider — This professional has priority visibility
        </div>
      )}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-blue-600 to-blue-700" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-blue-50 flex items-center justify-center overflow-hidden shadow-lg">
                  {provider.avatar_url ? (
                    <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-blue-600">{provider.full_name?.[0]}</span>
                  )}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-gray-900">{provider.full_name}</h1>
                    {provider.verification_status === 'verified' && (
                      <Badge className="bg-green-50 text-green-700 border-green-200 gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t('verified')}
                      </Badge>
                    )}
                    {provider.verification_status === 'pending' && (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">ID Pending</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <Badge variant="outline" className={`${badgeColor} border text-xs`}>{t(`cat_${provider.category}`)}</Badge>
                    {provider.location_text && <span className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-3.5 h-3.5" />{provider.location_text}</span>}
                    {distance !== null && <span className="flex items-center gap-1 text-sm text-blue-600 font-medium"><MapPin className="w-3.5 h-3.5" />{formatDistance(distance)} away</span>}
                    {provider.experience_years > 0 && <span className="flex items-center gap-1 text-sm text-gray-500"><Briefcase className="w-3.5 h-3.5" />{provider.experience_years} yrs exp</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: <Star className="w-5 h-5 text-amber-400" />, val: provider.average_rating?.toFixed(1) || '—', label: t('rating') },
              { icon: <Award className="w-5 h-5 text-blue-500" />, val: provider.total_jobs || 0, label: t('jobs_done') },
              { icon: <Clock className="w-5 h-5 text-green-500" />, val: provider.total_reviews || 0, label: t('reviews_title') },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-2xl font-bold text-gray-900">{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* About */}
          {provider.bio && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 text-gray-900">{t('about')}</h2>
              <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Skills & Certs */}
          <div className="grid sm:grid-cols-2 gap-4">
            {provider.skills?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">{t('skills')}</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            )}
            {provider.certifications?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">{t('certifications')}</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.certifications.map((c, i) => <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{c}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {/* Rates */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('rates')}</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('per_hour_full'), val: provider.hourly_rate },
                { label: t('per_day'), val: provider.daily_rate || (provider.hourly_rate * 8) },
                { label: t('per_week'), val: provider.weekly_rate || (provider.hourly_rate * 40) },
              ].map((r, i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-blue-50">
                  <p className="text-2xl font-bold text-blue-700">{r.val}</p>
                  <p className="text-sm text-gray-500">{r.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">{t('reviews_title')} ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">{t('no_reviews')}</p>
            ) : reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <StartChatButton provider={provider} />
          <BookingForm provider={provider} clientProfile={clientProfile} />
        </div>
      </div>
    </div>
  );
}