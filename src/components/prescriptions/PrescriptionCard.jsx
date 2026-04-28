import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Lock, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PrescriptionCard({ prescription, userEmail, isPaid = false, onDownload }) {
  const [loading, setLoading] = useState(false);
  const isDoctor = prescription.doctor_email === userEmail;
  const isPatient = prescription.patient_email === userEmail;
  const isExpired = new Date(prescription.expiry_date) < new Date();

  const handleDownload = async () => {
    if (!isPaid && !isDoctor) {
      // Redirect to payment
      onDownload?.(prescription);
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('generatePrescriptionPDF', {
        prescriptionId: prescription.id
      });
      
      const link = document.createElement('a');
      link.href = response.data.pdf_url;
      link.download = `prescription_${prescription.id}.pdf`;
      link.click();
      toast.success('Prescription downloaded');
    } catch (error) {
      toast.error('Failed to download prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-gray-100 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{prescription.patient_name}</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              By Dr. {prescription.doctor_name} • {new Date(prescription.issued_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {prescription.status === 'issued' && !isExpired && (
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Consultation Result */}
        {prescription.consultation_result && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-1">Consultation Result</p>
            <p className="text-sm text-gray-700">{prescription.consultation_result}</p>
          </div>
        )}

        {/* Recommendation */}
        {prescription.recommendation && (
          <div className="bg-amber-50 p-3 rounded-lg">
            <p className="text-xs font-semibold text-gray-700 mb-1">Recommendation</p>
            <p className="text-sm text-gray-700">{prescription.recommendation}</p>
          </div>
        )}

        {/* Medicines */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-3">Medicines</p>
          <div className="space-y-2">
            {prescription.medicines.map((med, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium text-gray-800">{med.name}</div>
                <div className="text-gray-600 text-xs mt-1">
                  {med.dosage} • {med.frequency}
                  {med.duration && ` • ${med.duration}`}
                  {med.instructions && <div className="mt-1">Note: {med.instructions}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Download Button */}
        <div className="flex items-center justify-between pt-2 border-t">
          {!isDoctor && (
            <div className="text-sm">
              {isPaid ? (
                <span className="flex items-center gap-1 text-green-700 font-medium">
                  <CheckCircle className="w-4 h-4" /> Paid
                </span>
              ) : (
                <span className="text-gray-600">
                  Download for <span className="font-semibold text-blue-600">${prescription.download_price}</span>
                </span>
              )}
            </div>
          )}

          <Button
            onClick={handleDownload}
            disabled={loading || isExpired}
            variant={isPaid || isDoctor ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
          >
            {!isPaid && !isDoctor ? (
              <>
                <Lock className="w-4 h-4" /> Pay & Download
              </>
            ) : (
              <>
                <Download className="w-4 h-4" /> Download
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}