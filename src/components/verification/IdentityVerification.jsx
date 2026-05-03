import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// Country-specific document config
const DOC_CONFIG = {
  brazil: {
    label: '🇧🇷 Brazil',
    description: 'Upload your RG, CNH, or CPF. A Passport is also accepted.',
    primaryDocs: [
      { value: 'rg', label: 'RG (Registro Geral)' },
      { value: 'cnh', label: 'CNH (Carteira Nacional de Habilitação)' },
      { value: 'cpf', label: 'CPF (Cadastro de Pessoa Física)' },
      { value: 'passport', label: 'Passport' },
    ],
    secondaryDocs: [],
    requiresSecondary: false,
    primaryLabel: 'Identity Document',
    secondaryLabel: null,
    numberPlaceholder: 'Document number',
  },
  uruguay: {
    label: '🇺🇾 Uruguay',
    description: 'Upload your Cédula de Identidad (CI) or Passport.',
    primaryDocs: [
      { value: 'cedula', label: 'Cédula de Identidad (CI)' },
      { value: 'passport', label: 'Passport' },
    ],
    secondaryDocs: [],
    requiresSecondary: false,
    primaryLabel: 'Identity Document',
    secondaryLabel: null,
    numberPlaceholder: 'Document number',
  },
  usa: {
    label: '🇺🇸 United States',
    description: 'Upload a government-issued ID: Temporary ID, Permanent ID, Passport, or VISA.',
    primaryDocs: [
      { value: 'temp_id', label: 'Temporary ID' },
      { value: 'resident_card', label: 'Permanent ID / Green Card' },
      { value: 'passport', label: 'Passport' },
      { value: 'visa', label: 'VISA' },
    ],
    secondaryDocs: [],
    requiresSecondary: false,
    primaryLabel: 'Government-issued Document',
    secondaryLabel: null,
    numberPlaceholder: 'Document number',
  },
  canada: {
    label: '🇨🇦 Canada',
    description: 'Upload a government-issued ID: Temporary ID, Permanent ID, Passport, or VISA.',
    primaryDocs: [
      { value: 'temp_id', label: 'Temporary ID' },
      { value: 'resident_card', label: 'Permanent ID / PR Card' },
      { value: 'passport', label: 'Passport' },
      { value: 'visa', label: 'VISA' },
    ],
    secondaryDocs: [],
    requiresSecondary: false,
    primaryLabel: 'Government-issued Document',
    secondaryLabel: null,
    numberPlaceholder: 'Document number',
  },
};

export default function IdentityVerification({ provider, country, onUpdated }) {
  const config = DOC_CONFIG[country] || DOC_CONFIG.brazil;
  const [docType, setDocType] = useState(provider?.id_document_type || config.primaryDocs[0]?.value || '');
  const [secondaryDocType, setSecondaryDocType] = useState(provider?.id_secondary_url ? (config.secondaryDocs[0]?.value || '') : '');
  const [docNumber, setDocNumber] = useState(provider?.id_document_number || '');
  const [uploading, setUploading] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);

  const status = provider?.verification_status || 'unverified';

  const handleUploadPrimary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ServiceProvider.update(provider.id, {
      id_document_url: file_url,
      id_document_type: docType,
      id_document_number: docNumber,
      verification_status: config.requiresSecondary && !provider?.id_secondary_url ? 'unverified' : 'pending',
    });
    setUploading(false);
    toast.success('Primary document uploaded!');
    onUpdated?.();
  };

  const handleUploadSecondary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingSecondary(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.ServiceProvider.update(provider.id, {
      id_secondary_url: file_url,
      verification_status: provider?.id_document_url ? 'pending' : 'unverified',
    });
    setUploadingSecondary(false);
    toast.success('Secondary document uploaded! Verification pending admin review.');
    onUpdated?.();
  };

  const StatusBadge = () => {
    if (status === 'verified') return <Badge className="bg-green-100 text-green-700 border-green-300 gap-1"><CheckCircle className="w-3.5 h-3.5" /> Verified</Badge>;
    if (status === 'pending') return <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1"><Clock className="w-3.5 h-3.5" /> Under Review</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-300 gap-1"><XCircle className="w-3.5 h-3.5" /> Rejected</Badge>;
    return <Badge variant="outline" className="text-gray-500 gap-1"><AlertCircle className="w-3.5 h-3.5" /> Not Verified</Badge>;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{config.description}</p>
        <StatusBadge />
      </div>

      {status === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Your identity has been verified. Your profile shows a verified badge to clients.
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          Your document was rejected. Please re-upload a clear, valid document.
        </div>
      )}

      {status !== 'verified' && (
        <>
          {/* Document number */}
          <div>
            <Label className="text-sm">Document Number <span className="text-gray-400">(optional)</span></Label>
            <Input
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder={config.numberPlaceholder}
              className="mt-1.5 max-w-sm"
            />
          </div>

          {/* Primary document */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">{config.primaryLabel}</Label>
              {provider?.id_document_url && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
            </div>

            {config.primaryDocs.length > 1 && (
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {config.primaryDocs.map(d => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {config.primaryDocs.length === 1 && (
              <p className="text-sm text-gray-600 font-medium">{config.primaryDocs[0].label}</p>
            )}

            <Label htmlFor="primary_doc" className="cursor-pointer block">
              <Button variant="outline" className="gap-2 w-full" asChild disabled={uploading}>
                <span>
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : provider?.id_document_url ? 'Replace Document' : 'Upload Photo / PDF'}
                </span>
              </Button>
            </Label>
            <input id="primary_doc" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadPrimary} />
            <p className="text-xs text-gray-400">Accepted: JPG, PNG, PDF. Max 10MB. Must be clearly readable.</p>
          </div>

          {/* Secondary document (Brazil only) */}
          {config.requiresSecondary && (
            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">{config.secondaryLabel}</Label>
                {provider?.id_secondary_url && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
              </div>

              {config.secondaryDocs.length > 1 && (
                <Select value={secondaryDocType} onValueChange={setSecondaryDocType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {config.secondaryDocs.map(d => (
                      <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Label htmlFor="secondary_doc" className="cursor-pointer block">
                <Button variant="outline" className="gap-2 w-full" asChild disabled={uploadingSecondary}>
                  <span>
                    <Upload className="w-4 h-4" />
                    {uploadingSecondary ? 'Uploading...' : provider?.id_secondary_url ? 'Replace Document' : 'Upload Photo / PDF'}
                  </span>
                </Button>
              </Label>
              <input id="secondary_doc" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadSecondary} />
              <p className="text-xs text-gray-400">Both documents required for Brazilian verification.</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              Documents submitted. Admin will review within 24 hours.
            </div>
          )}
        </>
      )}
    </div>
  );
}