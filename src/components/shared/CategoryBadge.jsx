import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Heart, Stethoscope, Sparkles, Baby, Shirt, HandHelping, UserCheck, ArrowRightLeft } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const CATEGORY_META = {
  assistant_nurse: { icon: Heart, color: 'bg-pink-100 text-pink-700 border-pink-200' },
  nurse: { icon: Stethoscope, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  doctor: { icon: UserCheck, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  cleaner: { icon: Sparkles, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  nanny: { icon: Baby, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  laundry_worker: { icon: Shirt, color: 'bg-violet-100 text-violet-700 border-violet-200' },
  caregiver: { icon: HandHelping, color: 'bg-teal-100 text-teal-700 border-teal-200' },
  errand_person: { icon: ArrowRightLeft, color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export function getCategoryConfig(category) {
  return CATEGORY_META[category] || { icon: Heart, color: 'bg-muted text-muted-foreground' };
}

export default function CategoryBadge({ category, className = '' }) {
  const { t } = useI18n();
  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} border gap-1 font-medium ${className}`}>
      <Icon className="w-3 h-3" />
      {t(`cat_${category}`) || category}
    </Badge>
  );
}