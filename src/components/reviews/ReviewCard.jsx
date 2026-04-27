import React from 'react';
import StarRating from '../shared/StarRating';
import { format } from 'date-fns';

export default function ReviewCard({ review }) {
  return (
    <div className="py-4 border-b border-border/50 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {review.reviewer_name?.[0] || '?'}
            </span>
          </div>
          <div>
            <p className="font-medium text-sm">{review.reviewer_name}</p>
            <p className="text-xs text-muted-foreground">
              {review.created_date && format(new Date(review.created_date), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" showValue={false} />
      </div>
      {review.comment && (
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      )}
      {review.provider_response && (
        <div className="mt-3 ml-6 pl-4 border-l-2 border-primary/20">
          <p className="text-xs font-medium text-primary mb-1">Provider Response</p>
          <p className="text-sm text-muted-foreground">{review.provider_response}</p>
        </div>
      )}
    </div>
  );
}