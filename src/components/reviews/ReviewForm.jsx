import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useI18n } from '@/lib/i18n';

function StarPicker({ rating, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(s => (
        <button key={s} type="button" onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => onChange(s)}>
          <Star className={`w-7 h-7 transition-colors ${s <= (hover || rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm({ bookingId, providerId, reviewerName, onSubmitted }) {
  const { t } = useI18n();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error(t('select_rating')); return; }
    setLoading(true);
    const me = await base44.auth.me();
    await base44.entities.Review.create({ booking_id: bookingId, provider_id: providerId, reviewer_email: me.email, reviewer_name: reviewerName || me.full_name, rating, comment });
    const reviews = await base44.entities.Review.filter({ provider_id: providerId });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await base44.entities.ServiceProvider.update(providerId, { average_rating: Math.round(avg * 10) / 10, total_reviews: reviews.length });
    toast.success(t('review_success'));
    setLoading(false);
    onSubmitted?.();
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-gray-800">
          <MessageSquare className="w-4 h-4 text-blue-600" /> {t('leave_review')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">{t('review_question')}</p>
            <StarPicker rating={rating} onChange={setRating} />
          </div>
          <Textarea placeholder={t('review_placeholder')} value={comment} onChange={e => setComment(e.target.value)} rows={3} />
          <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
            {loading ? t('submitting') : t('submit_review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}