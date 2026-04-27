import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, ShieldCheck, Star, Award, Clock } from 'lucide-react';
import CategoryBadge from '../components/shared/CategoryBadge';
import StarRating from '../components/shared/StarRating';
import BookingForm from '../components/booking/BookingForm';
import ReviewCard from '../components/reviews/ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/lib/i18n';

export default function ProviderProfile() {
  const { t } = useI18n();
  const pathParts = window.location.pathname.split('/');
  const providerId = pathParts[pathParts.length - 1];

  const { data: provider, isLoading } = useQuery({
    queryKey: ['provider', providerId],
    queryFn: async () => {
      const list = await base44.entities.ServiceProvider.filter({ id: providerId });
      return list[0];
    },
    enabled: !!providerId,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', providerId],
    queryFn: () => base44.entities.Review.filter({ provider_id: providerId }),
    enabled: !!providerId,
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!provider) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold">{t('not_found')}</h2></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Header */}
          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/10 to-secondary/10" />
            <div className="px-6 pb-6 -mt-12">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-card bg-primary/10 flex items-center justify-center overflow-hidden shadow-lg">
                  {provider.avatar_url ? (
                    <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{provider.full_name?.[0]}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold">{provider.full_name}</h1>
                    {provider.identity_verified && (
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> {t('verified')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <CategoryBadge category={provider.category} />
                    {provider.location && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" /> {provider.location}
                      </span>
                    )}
                    {provider.experience_years > 0 && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4" /> {provider.experience_years} {t('years_exp')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="text-2xl font-bold">{provider.average_rating?.toFixed(1) || '—'}</p>
              <p className="text-xs text-muted-foreground">{t('rating')}</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <Award className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{provider.total_jobs || 0}</p>
              <p className="text-xs text-muted-foreground">{t('jobs_done')}</p>
            </div>
            <div className="bg-card rounded-xl border border-border/50 p-4 text-center">
              <Clock className="w-5 h-5 text-secondary mx-auto mb-1" />
              <p className="text-2xl font-bold">{provider.total_reviews || 0}</p>
              <p className="text-xs text-muted-foreground">{t('reviews_title')}</p>
            </div>
          </div>

          {/* About */}
          {provider.bio && (
            <div className="bg-card rounded-xl border border-border/50 p-6">
              <h2 className="text-lg font-semibold mb-3">{t('about')}</h2>
              <p className="text-muted-foreground leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Skills & Certs */}
          <div className="grid sm:grid-cols-2 gap-4">
            {provider.skills?.length > 0 && (
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold mb-3">{t('skills')}</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.skills.map((skill, i) => <Badge key={i} variant="secondary">{skill}</Badge>)}
                </div>
              </div>
            )}
            {provider.certifications?.length > 0 && (
              <div className="bg-card rounded-xl border border-border/50 p-6">
                <h2 className="text-lg font-semibold mb-3">{t('certifications')}</h2>
                <div className="flex flex-wrap gap-2">
                  {provider.certifications.map((cert, i) => <Badge key={i} variant="outline" className="bg-primary/5">{cert}</Badge>)}
                </div>
              </div>
            )}
          </div>

          {/* Rates */}
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('rates')}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">${provider.hourly_rate}</p>
                <p className="text-sm text-muted-foreground">{t('per_hour_full')}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">${provider.daily_rate || (provider.hourly_rate * 8)}</p>
                <p className="text-sm text-muted-foreground">{t('per_day')}</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold text-primary">${provider.weekly_rate || (provider.hourly_rate * 40)}</p>
                <p className="text-sm text-muted-foreground">{t('per_week')}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-card rounded-xl border border-border/50 p-6">
            <h2 className="text-lg font-semibold mb-4">{t('reviews_title')} ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('no_reviews')}</p>
            ) : (
              reviews.map((review) => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <BookingForm provider={provider} />
        </div>
      </div>
    </div>
  );
}