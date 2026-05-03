import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const DOC_CONFIG = {
  brazil: {
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
  },
  uruguay: {
    description: 'Upload your Cédula de Identidad (CI) or Passport.',
    primaryDocs: [
      { value: 'cedula', label: 'Cédula de Identidad (CI)' },
      { value: 'passport', label: 'Passport' },
    ],
    secondaryDocs: [],
    requiresSecondary: false,
    primaryLabel: 'Identity Document',
    secondaryLabel: null,
  },
  usa: {
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
  },
  canada: {
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
  },
};

const STRINGS = {
  en: {
    doc_number_label: 'Document Number',
    doc_number_optional: '(optional)',
    doc_upload_btn: 'Upload Photo / PDF',
    doc_replace_btn: 'Replace Document',
    doc_uploading: 'Uploading...',
    doc_hint: 'Accepted: JPG, PNG, PDF. Must be clearly readable.',
    doc_secondary_brazil: 'Both documents required for Brazilian verification.',
    doc_pending_notice: 'Documents submitted. Admin will review within 24 hours.',
    doc_verified_notice: 'Your identity has been verified.',
    doc_rejected_notice: 'Your document was rejected. Please re-upload a clear, valid document.',
    verified: 'Verified',
    pending: 'Under Review',
    rejected: 'Rejected',
    unverified: 'Not Verified',
    client_identity_verification: 'Identity Verification',
    client_identity_verification_desc: "Submit a government-issued ID so service providers know you're verified.",
    upload_photo_label: 'Upload Photo',
    upload_photo_hint: 'JPG, PNG — profile picture',
    full_name_label: 'Full Name',
    full_name_placeholder: 'Your full name',
    position_label: 'Position',
    position_desc: 'Your job title or position at the company',
    position_placeholder: 'e.g., Manager, Director, Founder',
    save_profile: 'Save Profile',
    profile_saved_toast: 'Profile saved!',
    photo_updated_toast: 'Photo updated!',
  },
  pt: {
    doc_number_label: 'Número do Documento',
    doc_number_optional: '(opcional)',
    doc_upload_btn: 'Enviar Foto / PDF',
    doc_replace_btn: 'Substituir Documento',
    doc_uploading: 'Enviando...',
    doc_hint: 'Aceitos: JPG, PNG, PDF. Deve estar legível.',
    doc_secondary_brazil: 'Ambos os documentos são obrigatórios para verificação no Brasil.',
    doc_pending_notice: 'Documentos enviados. O admin irá revisar em até 24 horas.',
    doc_verified_notice: 'Sua identidade foi verificada.',
    doc_rejected_notice: 'Seu documento foi rejeitado. Por favor, envie um documento válido e legível.',
    verified: 'Verificado',
    pending: 'Em Análise',
    rejected: 'Rejeitado',
    unverified: 'Não Verificado',
    client_identity_verification: 'Verificação de Identidade',
    client_identity_verification_desc: 'Envie um documento de identidade para que os prestadores saibam que você é verificado.',
    upload_photo_label: 'Enviar Foto',
    upload_photo_hint: 'JPG, PNG — foto de perfil',
    full_name_label: 'Nome Completo',
    full_name_placeholder: 'Seu nome completo',
    position_label: 'Cargo',
    position_desc: 'Seu título ou cargo na empresa',
    position_placeholder: 'ex: Gerente, Diretor, Fundador',
    save_profile: 'Salvar Perfil',
    profile_saved_toast: 'Perfil salvo!',
    photo_updated_toast: 'Foto atualizada!',
  },
  es: {
    doc_number_label: 'Número de Documento',
    doc_number_optional: '(opcional)',
    doc_upload_btn: 'Subir Foto / PDF',
    doc_replace_btn: 'Reemplazar Documento',
    doc_uploading: 'Subiendo...',
    doc_hint: 'Aceptados: JPG, PNG, PDF. Debe ser legible.',
    doc_secondary_brazil: 'Ambos documentos son requeridos para la verificación en Brasil.',
    doc_pending_notice: 'Documentos enviados. El admin revisará en las próximas 24 horas.',
    doc_verified_notice: 'Tu identidad ha sido verificada.',
    doc_rejected_notice: 'Tu documento fue rechazado. Por favor sube un documento válido y legible.',
    verified: 'Verificado',
    pending: 'En Revisión',
    rejected: 'Rechazado',
    unverified: 'No Verificado',
    client_identity_verification: 'Verificación de Identidad',
    client_identity_verification_desc: 'Envía un documento de identidad para que los proveedores sepan que estás verificado.',
    upload_photo_label: 'Subir Foto',
    upload_photo_hint: 'JPG, PNG — foto de perfil',
    full_name_label: 'Nombre Completo',
    full_name_placeholder: 'Tu nombre completo',
    position_label: 'Cargo',
    position_desc: 'Tu título o cargo en la empresa',
    position_placeholder: 'ej: Gerente, Director, Fundador',
    save_profile: 'Guardar Perfil',
    profile_saved_toast: '¡Perfil guardado!',
    photo_updated_toast: '¡Foto actualizada!',
  },
};

export default function ClientIdentityVerification({ userProfile, country, onUpdated, t: tProp }) {
  // Detect current language from localStorage
  const lang = localStorage.getItem('cuidaru_lang') || 'en';
  const s = STRINGS[lang] || STRINGS.en;
  const tFn = (key) => (tProp ? tProp(key) : null) || s[key] || key;
  const config = DOC_CONFIG[country] || DOC_CONFIG.brazil;
  const [docType, setDocType] = useState(userProfile?.id_document_type || config.primaryDocs[0]?.value || '');
  const [docNumber, setDocNumber] = useState(userProfile?.id_document_number || '');
  const [uploading, setUploading] = useState(false);
  const [uploadingSecondary, setUploadingSecondary] = useState(false);

  const status = userProfile?.id_verification_status || 'unverified';

  const handleUploadPrimary = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const newStatus = config.requiresSecondary && !userProfile?.id_secondary_url ? 'unverified' : 'pending';
    await base44.entities.UserProfile.update(userProfile.id, {
      id_document_url: file_url,
      id_document_type: docType,
      id_document_number: docNumber,
      id_verification_status: newStatus,
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
    await base44.entities.UserProfile.update(userProfile.id, {
      id_secondary_url: file_url,
      id_verification_status: userProfile?.id_document_url ? 'pending' : 'unverified',
    });
    setUploadingSecondary(false);
    toast.success('Secondary document uploaded! Pending admin review.');
    onUpdated?.();
  };

  const StatusBadge = () => {
    if (status === 'verified') return <Badge className="bg-green-100 text-green-700 border-green-300 gap-1"><CheckCircle className="w-3.5 h-3.5" /> {tProp ? tProp('verified') : 'Verified'}</Badge>;
    if (status === 'pending') return <Badge variant="outline" className="text-amber-600 border-amber-300 gap-1"><Clock className="w-3.5 h-3.5" /> {tProp ? tProp('pending') : 'Under Review'}</Badge>;
    if (status === 'rejected') return <Badge className="bg-red-100 text-red-700 border-red-300 gap-1"><XCircle className="w-3.5 h-3.5" /> {tProp ? tProp('rejected') : 'Rejected'}</Badge>;
    return <Badge variant="outline" className="text-gray-500 gap-1"><AlertCircle className="w-3.5 h-3.5" /> {tProp ? tProp('unverified') : 'Not Verified'}</Badge>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm text-gray-500">{config.description}</p>
        <StatusBadge />
      </div>

      {status === 'verified' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {tFn('doc_verified_notice')}
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 shrink-0" />
          {tFn('doc_rejected_notice')}
        </div>
      )}

      {status !== 'verified' && (
        <>
          <div>
            <Label className="text-sm">{tFn('doc_number_label')} <span className="text-gray-400">{tFn('doc_number_optional')}</span></Label>
            <Input
              value={docNumber}
              onChange={e => setDocNumber(e.target.value)}
              placeholder={tFn('doc_number_label')}
              className="mt-1.5 max-w-sm"
            />
          </div>

          {/* Primary document */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">{config.primaryLabel}</Label>
              {userProfile?.id_document_url && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
            </div>
            {config.primaryDocs.length > 1 && (
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select document type" /></SelectTrigger>
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
            <Label htmlFor="client_primary_doc" className="cursor-pointer block">
              <Button variant="outline" className="gap-2 w-full" asChild disabled={uploading}>
                <span>
                  <Upload className="w-4 h-4" />
                  {uploading ? tFn('doc_uploading') : userProfile?.id_document_url ? tFn('doc_replace_btn') : tFn('doc_upload_btn')}
                </span>
              </Button>
            </Label>
            <input id="client_primary_doc" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadPrimary} />
            <p className="text-xs text-gray-400">{tFn('doc_hint')}</p>
          </div>

          {/* Secondary document (Brazil only) */}
          {config.requiresSecondary && (
            <div className="border border-gray-100 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-gray-700">{config.secondaryLabel}</Label>
                {userProfile?.id_secondary_url && <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>}
              </div>
              <Label htmlFor="client_secondary_doc" className="cursor-pointer block">
                <Button variant="outline" className="gap-2 w-full" asChild disabled={uploadingSecondary}>
                  <span>
                    <Upload className="w-4 h-4" />
                    {uploadingSecondary ? tFn('doc_uploading') : userProfile?.id_secondary_url ? tFn('doc_replace_btn') : tFn('doc_upload_btn')}
                  </span>
                </Button>
              </Label>
              <input id="client_secondary_doc" type="file" accept="image/*,.pdf" className="hidden" onChange={handleUploadSecondary} />
              <p className="text-xs text-gray-400">{tFn('doc_secondary_brazil')}</p>
            </div>
          )}

          {status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              {tFn('doc_pending_notice')}
            </div>
          )}
        </>
      )}
    </div>
  );
}