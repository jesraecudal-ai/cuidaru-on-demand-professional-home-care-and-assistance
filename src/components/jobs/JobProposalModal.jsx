import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Paperclip, X, Upload } from 'lucide-react';

export default function JobProposalModal({ job, providerProfile, user, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [rateType, setRateType] = useState('hourly');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => [...prev, { name: file.name, url: file_url }]);
      }
      toast.success('File(s) uploaded');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!coverLetter.trim()) { toast.error('Please write a cover letter'); return; }
    setSubmitting(true);
    try {
      await base44.entities.JobProposal.create({
        job_order_id: job.id,
        job_title: job.title,
        client_email: job.client_email,
        client_name: job.client_name,
        provider_id: providerProfile.id,
        provider_email: user.email,
        provider_name: providerProfile.full_name,
        cover_letter: coverLetter,
        proposed_rate: proposedRate ? parseFloat(proposedRate) : null,
        rate_type: rateType,
        attachments: attachments.map(a => a.url),
        status: 'pending',
      });
      toast.success('Proposal sent! The client will contact you via messages.');
      onSuccess();
    } catch {
      toast.error('Failed to send proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for: {job.title}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">Send a proposal to the client. They will contact you through messages if interested.</p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div>
            <Label>Cover Letter *</Label>
            <Textarea
              placeholder="Introduce yourself and explain why you're a great fit for this job..."
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              rows={5}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Your Proposed Rate</Label>
              <Input
                type="number"
                placeholder="e.g. 25"
                value={proposedRate}
                onChange={e => setProposedRate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Rate Type</Label>
              <Select value={rateType} onValueChange={setRateType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Per Hour</SelectItem>
                  <SelectItem value="daily">Per Day</SelectItem>
                  <SelectItem value="weekly">Per Week</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Attachments (optional)</Label>
            <div className="mt-1 space-y-2">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 truncate text-gray-700">{a.name}</span>
                  <button onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}>
                    <X className="w-4 h-4 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Add file (CV, certificate, photo...)'}
                <input type="file" multiple className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting || uploading}>
              {submitting ? 'Sending...' : 'Send Proposal'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}