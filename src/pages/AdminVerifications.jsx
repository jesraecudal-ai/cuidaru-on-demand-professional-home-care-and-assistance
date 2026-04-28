import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useUserProfile } from '@/lib/useUserProfile';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, XCircle, Eye, Filter, User, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const STATUS_CONFIG = {
  unverified: { label: 'Unverified', color: 'bg-gray-100 text-gray-600', icon: User },
  pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const DOC_TYPE_LABELS = {
  cpf: 'CPF',
  rg: 'RG',
  cnh: 'CNH (Driver\'s License)',
  cedula: 'Cédula de Identidad',
  passport: 'Passport',
  resident_card: 'Resident Card',
};

function VerificationCard({ provider, onReview }) {
  const status = STATUS_CONFIG[provider.verification_status] || STATUS_CONFIG.unverified;
  const Icon = status.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex-shrink-0">
            {provider.avatar_url
              ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">{provider.full_name?.[0]}</div>
            }
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{provider.full_name}</h3>
            <p className="text-sm text-gray-500 capitalize">{provider.category?.replace(/_/g, ' ')}</p>
            <p className="text-xs text-gray-400">{provider.user_email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {status.label}
          </span>
          <Button size="sm" variant="outline" onClick={() => onReview(provider)} className="gap-1.5">
            <Eye className="w-4 h-4" /> Review
          </Button>
        </div>
      </div>

      {(provider.id_document_url || provider.id_secondary_url) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {provider.id_document_url && (
            <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
              <FileText className="w-3.5 h-3.5" />
              {DOC_TYPE_LABELS[provider.id_document_type] || 'Document 1'} uploaded
            </div>
          )}
          {provider.id_secondary_url && (
            <div className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
              <FileText className="w-3.5 h-3.5" />
              Secondary doc uploaded
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewModal({ provider, onClose, onUpdated }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!provider) return null;

  const handleDecision = async (decision) => {
    setLoading(true);
    await base44.entities.ServiceProvider.update(provider.id, {
      verification_status: decision,
    });
    toast.success(decision === 'verified' ? 'Provider verified!' : 'Provider rejected.');
    setLoading(false);
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={!!provider} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Identity Review — {provider.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Provider info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
              {provider.avatar_url
                ? <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl bg-gray-100">{provider.full_name?.[0]}</div>
              }
            </div>
            <div>
              <p className="font-semibold text-gray-900">{provider.full_name}</p>
              <p className="text-sm text-gray-500">{provider.user_email}</p>
              <p className="text-sm text-gray-500 capitalize">{provider.category?.replace(/_/g, ' ')} · {provider.country}</p>
              {provider.id_document_number && (
                <p className="text-sm text-gray-700 font-medium mt-1">Doc #: {provider.id_document_number}</p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-3">
            {provider.id_document_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {DOC_TYPE_LABELS[provider.id_document_type] || 'Primary Document'}
                </p>
                <a href={provider.id_document_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={provider.id_document_url}
                    alt="Primary document"
                    className="w-full max-h-72 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
                <p className="text-xs text-blue-600 mt-1">Click to open full size</p>
              </div>
            )}

            {provider.id_secondary_url && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Secondary Document</p>
                <a href={provider.id_secondary_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={provider.id_secondary_url}
                    alt="Secondary document"
                    className="w-full max-h-72 object-contain rounded-lg border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                  />
                </a>
                <p className="text-xs text-blue-600 mt-1">Click to open full size</p>
              </div>
            )}

            {!provider.id_document_url && !provider.id_secondary_url && (
              <div className="text-center py-8 text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No documents uploaded yet.</p>
              </div>
            )}
          </div>

          {/* Current status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Current status:</span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_CONFIG[provider.verification_status]?.color || 'bg-gray-100 text-gray-600'}`}>
              {STATUS_CONFIG[provider.verification_status]?.label || 'Unknown'}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
              disabled={loading || provider.verification_status === 'verified'}
              onClick={() => handleDecision('verified')}
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Verify
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              disabled={loading || provider.verification_status === 'rejected'}
              onClick={() => handleDecision('rejected')}
            >
              <XCircle className="w-4 h-4" /> Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminVerifications() {
  const { user } = useUserProfile();
  const [statusFilter, setStatusFilter] = useState('pending');
  const [reviewing, setReviewing] = useState(null);
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'admin';

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ['providers-verify', statusFilter],
    queryFn: async () => {
      const all = await base44.entities.ServiceProvider.list('-created_date');
      if (statusFilter === 'all') return all;
      return all.filter(p => p.verification_status === statusFilter);
    },
    enabled: !!user,
  });

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
        <p className="text-gray-500">Only administrators can access the verification panel.</p>
      </div>
    );
  }

  const pendingCount = providers.filter(p => p.verification_status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-600" /> Identity Verification
          </h1>
          {pendingCount > 0 && (
            <p className="text-sm text-yellow-700 mt-1 font-medium">{pendingCount} pending review{pendingCount > 1 ? 's' : ''}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(key)}
            className={`p-4 rounded-xl border text-left transition-all ${statusFilter === key ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
          >
            <cfg.icon className="w-5 h-5 mb-1 text-gray-500" />
            <p className="text-lg font-bold text-gray-900">
              —
            </p>
            <p className="text-xs text-gray-500 font-medium">{cfg.label}</p>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No providers in this category</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map(p => (
            <VerificationCard key={p.id} provider={p} onReview={setReviewing} />
          ))}
        </div>
      )}

      <ReviewModal
        provider={reviewing}
        onClose={() => setReviewing(null)}
        onUpdated={() => queryClient.invalidateQueries({ queryKey: ['providers-verify'] })}
      />
    </div>
  );
}