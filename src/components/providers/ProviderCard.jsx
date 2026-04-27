import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, ShieldCheck, Briefcase } from 'lucide-react';
import CategoryBadge from '../shared/CategoryBadge';
import StarRating from '../shared/StarRating';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export default function ProviderCard({ provider, index = 0 }) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/provider/${provider.id}`}>
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/50">
          <CardContent className="p-0">
            <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center overflow-hidden">
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.full_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">{provider.full_name?.[0] || '?'}</span>
                </div>
              )}
              {provider.identity_verified && (
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> {t('verified')}
                </div>
              )}
              <div className="absolute top-3 left-3">
                <CategoryBadge category={provider.category} />
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {provider.full_name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  {provider.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {provider.location}
                    </span>
                  )}
                  {provider.experience_years > 0 && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5" /> {provider.experience_years}{t('yr')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <StarRating rating={provider.average_rating || 0} />
                <span className="text-xs text-muted-foreground">
                  {provider.total_reviews || 0} {t('reviews')}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div>
                  <span className="text-2xl font-bold text-primary">${provider.hourly_rate}</span>
                  <span className="text-sm text-muted-foreground">{t('per_hour')}</span>
                </div>
                {provider.availability === 'available' && (
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1">
                    <Clock className="w-3 h-3" /> {t('available')}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}