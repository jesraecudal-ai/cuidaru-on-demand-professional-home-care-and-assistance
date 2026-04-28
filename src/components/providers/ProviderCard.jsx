import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ShieldCheck, Zap, Star } from 'lucide-react';
import { CATEGORY_BADGE_COLORS, formatDistance } from '@/lib/constants';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

export default function ProviderCard({ provider, index = 0, userLocation }) {
  const { t } = useI18n();
  const badgeColor = CATEGORY_BADGE_COLORS[provider.category] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link to={`/provider/${provider.id}`}>
        <Card className={`group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border ${provider.is_premium ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'}`}>
          {provider.is_premium && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-white">
              <Zap className="w-3 h-3" /> PREMIUM — Appears first in searches
            </div>
          )}
          <CardContent className="p-0">
            <div className="relative h-44 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center overflow-hidden">
              {provider.avatar_url ? (
                <img src={provider.avatar_url} alt={provider.full_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">{provider.full_name?.[0] || '?'}</span>
                </div>
              )}
              {provider.verification_status === 'verified' && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur rounded-full px-2 py-1 flex items-center gap-1 text-xs font-medium text-green-600 shadow">
                  <ShieldCheck className="w-3 h-3" /> {t('verified')}
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className={`${badgeColor} border text-xs font-medium`}>
                  {t(`cat_${provider.category}`) || provider.category}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{provider.full_name}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-1 flex-wrap">
                  {provider.location_text && (
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {provider.location_text}</span>
                  )}
                  {provider._distance != null && (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <MapPin className="w-3 h-3" /> {formatDistance(provider._distance)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(provider.average_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-xs text-gray-400 ml-1">({provider.total_reviews || 0})</span>
                </div>
                {provider.availability === 'available' && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">{t('available')}</span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div>
                  <span className="text-xl font-bold text-blue-700">{provider.hourly_rate}</span>
                  <span className="text-xs text-gray-400">{t('per_hour')}</span>
                </div>
                <span className="text-xs text-gray-500">{provider.experience_years}+ {t('yr')} exp</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}