import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '../shared/StarRating';
import { MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

export default function ReviewForm({ bookingId, providerId, reviewerName, onSubmitted }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error(t('select_rating')); return; }
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
    const reviews = await base44.entities.Review.filter({ provider_id: providerId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await base44.entities.ServiceProvider.update(providerId, {
      average_rating: Math.round(avgRating * 10) / 10,
      total_reviews: reviews.length,
    });
    toast.success(t('review_success'));
    setLoading(false);
    onSubmitted?.();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" /> {t('leave_review')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('review_question')}</p>
            <StarRating rating={rating} size="lg" showValue={false} interactive onChange={setRating} />
          </div>
          <Textarea placeholder={t('review_placeholder')} value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? t('submitting') : t('submit_review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}