import React from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';
import { useI18n } from '@/lib/i18n';

export default function ReviewCard({ review }) {
  const { t } = useI18n();
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-bold text-blue-600">{review.reviewer_name?.[0] || '?'}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-gray-900">{review.reviewer_name}</p>
              {review.reviewer_role === 'provider' && (
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Provider</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{review.created_date && format(new Date(review.created_date), 'MMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex">
          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}
        </div>
      </div>
      {review.comment && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
      {review.provider_response && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-200">
          <p className="text-xs font-semibold text-blue-600 mb-1">{t('provider_response')}</p>
          <p className="text-sm text-gray-600">{review.provider_response}</p>
        </div>
      )}
    </div>
  );
}