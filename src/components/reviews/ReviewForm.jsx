import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '../shared/StarRating';
import { MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ReviewForm({ bookingId, providerId, reviewerName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setLoading(true);

    const user = await base44.auth.me();
    await base44.entities.Review.create({
      booking_id: bookingId,
      provider_id: providerId,
      reviewer_email: user.email,
      reviewer_name: reviewerName || user.full_name,
      rating,
      comment,
    });

    // Update provider average rating
    const reviews = await base44.entities.Review.filter({ provider_id: providerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await base44.entities.ServiceProvider.update(providerId, {
      average_rating: Math.round(avgRating * 10) / 10,
      total_reviews: reviews.length,
    });

    toast.success('Review submitted!');
    setLoading(false);
    onSubmitted?.();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" /> Leave a Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">How was your experience?</p>
            <StarRating rating={rating} size="lg" showValue={false} interactive onChange={setRating} />
          </div>
          <Textarea
            placeholder="Share your experience..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}