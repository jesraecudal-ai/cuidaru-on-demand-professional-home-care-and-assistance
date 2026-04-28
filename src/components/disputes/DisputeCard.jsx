import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  under_review: 'bg-amber-100 text-amber-700',
  resolved_client: 'bg-blue-100 text-blue-700',
  resolved_provider: 'bg-green-100 text-green-700',
  resolved_split: 'bg-purple-100 text-purple-700',
  closed: 'bg-gray-100 text-gray-600',
};

export default function DisputeCard({ dispute, isAdmin, onUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(dispute.admin_notes || '');
  const [resolution, setResolution] = useState(dispute.resolution_details || '');
  const [status, setStatus] = useState(dispute.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Dispute.update(dispute.id, { status, admin_notes: adminNotes, resolution_details: resolution });
    toast.success('Dispute updated');
    setSaving(false);
    onUpdated?.();
  };

  return (
    <Card className="border border-orange-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-900">Booking #{dispute.booking_id?.slice(-6)}</span>
            <Badge className={`text-xs ${STATUS_COLORS[dispute.status]}`}>{dispute.status.replace('_', ' ')}</Badge>
            <Badge variant="outline" className="text-xs">{dispute.filed_by_role === 'client' ? '👤 Client filed' : '🔧 Provider filed'}</Badge>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Filed by <strong>{dispute.filed_by_name}</strong> · {format(new Date(dispute.created_date), 'MMM d, yyyy')}
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Dispute Reason</p>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{dispute.reason}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
            <div><span className="font-medium">Client:</span> {dispute.client_name} ({dispute.client_email})</div>
            <div><span className="font-medium">Provider:</span> {dispute.provider_name} ({dispute.provider_email})</div>
          </div>

          {isAdmin && (
            <div className="border-t pt-4 space-y-3">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Admin Resolution</p>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Update Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved_client">Resolved — Favor Client</SelectItem>
                    <SelectItem value="resolved_provider">Resolved — Favor Provider</SelectItem>
                    <SelectItem value="resolved_split">Resolved — Split</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Admin Notes (internal)</label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Resolution Details (shown to parties)</label>
                <Textarea value={resolution} onChange={e => setResolution(e.target.value)} rows={2} className="text-sm" />
              </div>
              <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
                {saving ? 'Saving...' : 'Save Resolution'}
              </Button>
            </div>
          )}

          {!isAdmin && dispute.resolution_details && (
            <div className="border-t pt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Admin Resolution</p>
              <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">{dispute.resolution_details}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}