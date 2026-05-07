import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { CATEGORIES } from '@/lib/constants';

export default function PostJobModal({ user, userProfile, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', location_text: '', budget: '', budget_type: 'hourly'
  });
  const [submitting, setSubmitting] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSubmitting(true);
    try {
      await base44.entities.JobOrder.create({
        client_email: user.email,
        client_name: user.full_name,
        title: form.title,
        description: form.description,
        category: form.category || null,
        location_text: form.location_text || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        budget_type: form.budget_type,
        status: 'open',
        country: userProfile?.country || null,
      });
      toast.success('Job posted! Providers can now apply.');
      onSuccess();
    } catch {
      toast.error('Failed to post job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a Job</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Describe what you need — providers will send you proposals.</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label>Job Title *</Label>
            <Input placeholder="e.g. Need a caregiver for elderly parent" value={form.title} onChange={e => set('title', e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea placeholder="Describe the job in detail — schedule, requirements, duration..." value={form.description} onChange={e => set('description', e.target.value)} rows={4} className="mt-1" />
          </div>

          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={v => set('category', v)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select category..." /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.key} value={c.key}>{c.icon} {c.key.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Location</Label>
            <Input placeholder="e.g. São Paulo, SP" value={form.location_text} onChange={e => set('location_text', e.target.value)} className="mt-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Budget</Label>
              <Input type="number" placeholder="e.g. 50" value={form.budget} onChange={e => set('budget', e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Budget Type</Label>
              <Select value={form.budget_type} onValueChange={v => set('budget_type', v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Per Hour</SelectItem>
                  <SelectItem value="daily">Per Day</SelectItem>
                  <SelectItem value="weekly">Per Week</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}