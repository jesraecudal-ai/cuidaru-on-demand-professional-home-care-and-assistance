import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

function StarPicker({ rating, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        >
          <Star className={`w-8 h-8 transition-colors ${s <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 hover:text-amber-200'}`} />
        </button>
      ))}
    </div>
  );
}

/**
 * Props:
 *  - bookingId
 *  - providerId
 *  - reviewerName
 *  - reviewerRole: 'client' | 'provider'  (default: 'client')
 *  - revieweeEmail: email of the person being reviewed
 *  - revieweeName: name of the person being reviewed
 *  - onSubmitted
 */
export default function ReviewForm({ bookingId, providerId, reviewerName, reviewerRole = 'client', revieweeEmail, revieweeName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    setLoading(true);
    const me = await base44.auth.me();

    await base44.entities.Review.create({
      booking_id: bookingId,
      provider_id: providerId,
      reviewer_email: me.email,
      reviewer_name: reviewerName || me.full_name,
      reviewer_role: reviewerRole,
      reviewee_email: revieweeEmail,
      reviewee_name: revieweeName,
      rating,
      comment: comment.trim() || '',
    });

    // Update aggregate rating for the reviewee
    if (reviewerRole === 'client') {
      // Client reviewing provider — update ServiceProvider record
      const reviews = await base44.entities.Review.filter({ provider_id: providerId, reviewer_role: 'client' });
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await base44.entities.ServiceProvider.update(providerId, {
        average_rating: Math.round(avg * 10) / 10,
        total_reviews: reviews.length,
      });
    } else {
      // Provider reviewing client — update UserProfile record
      if (revieweeEmail) {
        const allReviews = await base44.entities.Review.filter({ reviewee_email: revieweeEmail, reviewer_role: 'provider' });
        const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
        const profiles = await base44.entities.UserProfile.filter({ user_email: revieweeEmail });
        if (profiles.length > 0) {
          await base44.entities.UserProfile.update(profiles[0].id, {
            average_rating: Math.round(avg * 10) / 10,
            total_reviews: allReviews.length,
          });
        }
      }
    }

    toast.success('Review submitted!');
    setLoading(false);
    onSubmitted?.();
  };

  const subjectLabel = reviewerRole === 'client'
    ? `Rate your experience with ${revieweeName || 'the provider'}`
    : `Rate this client (${revieweeName || 'client'})`;

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <MessageSquare className="w-4 h-4 text-blue-600" />
          {reviewerRole === 'client' ? 'Leave a Review' : 'Rate this Client'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">{subjectLabel}</p>
            <StarPicker rating={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-amber-600 mt-1.5 font-medium">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </p>
            )}
          </div>
          <div>
            <Textarea
              placeholder="Write a comment (optional)"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          </div>
          <Button type="submit" disabled={loading || rating === 0} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}