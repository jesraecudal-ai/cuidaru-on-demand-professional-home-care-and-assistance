import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, X, Award, File } from 'lucide-react';
import { toast } from 'sonner';

const DOCUMENT_TYPES = [
  { key: 'photo', label: 'Photo', icon: '📸' },
  { key: 'diploma', label: 'Diploma', icon: '🎓' },
  { key: 'resume', label: 'Resume', icon: '📄' },
  { key: 'cv', label: 'CV', icon: '📋' },
  { key: 'certificate', label: 'Certificate', icon: '🏆' },
  { key: 'other', label: 'Other', icon: '📁' },
];

export default function DocumentUploadSection({ providerId, userEmail }) {
  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState('photo');
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;
    fetchDocuments();
  }, [providerId]);

  const fetchDocuments = async () => {
    try {
      const docs = await base44.entities.ProviderDocument.filter({ provider_id: providerId });
      setDocuments(docs);
    } catch (e) {
      console.error('Error fetching documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const doc = await base44.entities.ProviderDocument.create({
        provider_id: providerId,
        provider_email: userEmail,
        document_type: selectedType,
        file_url,
        file_name: file.name,
        description: description || '',
      });

      setDocuments(prev => [...prev, doc]);
      setDescription('');
      toast.success(`${DOCUMENT_TYPES.find(d => d.key === selectedType)?.label} uploaded!`);
    } catch (error) {
      toast.error('Upload failed');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    try {
      await base44.entities.ProviderDocument.delete(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      toast.success('Document removed');
    } catch (error) {
      toast.error('Failed to remove document');
    }
  };

  const photoCount = documents.filter(d => d.document_type === 'photo').length;
  const maxPhotos = 5;
  const canAddPhoto = photoCount < maxPhotos && selectedType === 'photo';

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-gray-800">
          <Award className="w-5 h-5 text-blue-600" /> Portfolio & Documents
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">Upload photos, diplomas, resume, CV, and certificates to build trust with clients.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Document Type</Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {DOCUMENT_TYPES.map(type => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedType(type.key)}
                    disabled={type.key === 'photo' && !canAddPhoto}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all text-xs ${
                      selectedType === type.key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${type.key === 'photo' && !canAddPhoto ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span className="text-lg">{type.icon}</span>
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              {selectedType === 'photo' && (
                <p className="text-xs text-gray-500 mt-2">Max {maxPhotos} photos</p>
              )}
            </div>

            {selectedType !== 'photo' && (
              <div>
                <Label htmlFor="description" className="text-sm">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="e.g., Nursing Diploma 2020"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2 cursor-pointer"
                  asChild
                  disabled={uploading}
                >
                  <span>
                    <Upload className="w-3.5 h-3.5" />
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </span>
                </Button>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <p className="text-xs text-gray-400 mt-2">JPG, PNG, or PDF (max 10MB)</p>
            </div>
          </div>
        </div>

        {/* Documents List */}
        {documents.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Uploaded Documents</h3>
            <div className="grid gap-2">
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <div className="flex-shrink-0">
                    {doc.document_type === 'photo' ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200">
                        <img src={doc.file_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {DOCUMENT_TYPES.find(d => d.key === doc.document_type)?.label}
                      </Badge>
                    </div>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{doc.file_name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet. Add documents to boost your credibility.</p>
        )}
      </CardContent>
    </Card>
  );
}